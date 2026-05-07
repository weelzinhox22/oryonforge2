'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Camera, User, 
  Clock, Plus,
  X, Heart, MessageCircle, Send,
  Activity
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { DotLottiePlayer } from '@dotlottie/react-player';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

// ── Helpers ───────────────────────────────────────────────────────────────────
function getItemLikesCount(socialMap: Record<string, { likes: number; hasLiked: boolean; comments: number }>, id: string) {
  return socialMap[id]?.likes ?? 0;
}
function getItemCommentsCount(socialMap: Record<string, { likes: number; hasLiked: boolean; comments: number }>, id: string) {
  return socialMap[id]?.comments ?? 0;
}
function getItemHasLiked(socialMap: Record<string, { likes: number; hasLiked: boolean; comments: number }>, id: string) {
  return socialMap[id]?.hasLiked ?? false;
}

export default function GroupFeedPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Stores lightweight social data for all cards (likes count, comments count, hasLiked)
  const [socialMap, setSocialMap] = useState<Record<string, { likes: number; hasLiked: boolean; comments: number }>>({});

  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUserId(session.user.id);
      const { data } = await supabase.from('profiles').select('dashboard_style').eq('id', session.user.id).single();
      if (data) setUserProfile(data);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        const { data: groupData } = await supabase
          .from('groups')
          .select('name, avatar_url')
          .eq('id', groupId)
          .single();
        if (groupData) setActiveGroup(groupData);

        const { data } = await supabase
          .from('activity_logs')
          .select('*, profiles:profile_display_with_titles(username, avatar_url, active_title)')
          .eq('group_id', groupId)
          .not('proof_url', 'is', null)
          .order('created_at', { ascending: false });

        if (data) {
          setFeedItems(data);

          // Fetch lightweight social counts for each item in parallel
          const userId = session.user.id;
          const results = await Promise.all(
            data.map(async (item: any) => {
              const [{ count: likes }, { data: userLike }, { count: cCount }] = await Promise.all([
                supabase.from('activity_likes').select('*', { count: 'exact', head: true }).eq('activity_log_id', item.id),
                supabase.from('activity_likes').select('id').eq('activity_log_id', item.id).eq('user_id', userId).maybeSingle(),
                supabase.from('activity_comments').select('*', { count: 'exact', head: true }).eq('activity_log_id', item.id),
              ]);
              return { id: item.id, likes: likes ?? 0, hasLiked: !!userLike, comments: cCount ?? 0 };
            })
          );

          const map: Record<string, any> = {};
          results.forEach(r => { map[r.id] = r; });
          setSocialMap(map);
        }

      } catch (error) {
        console.error('Erro ao buscar feed:', error);
      } finally {
        await minLoadingTime;
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId, router]);

  const openItem = async (item: any) => {
    setSelectedItem(item);
    setHasLiked(socialMap[item.id]?.hasLiked ?? false);

    // Fetch full comments
    const { data: comms } = await supabase
      .from('activity_comments')
      .select('*, profiles:profile_display_with_titles(username, avatar_url, active_title)')
      .eq('activity_log_id', item.id)
      .order('created_at', { ascending: true });
    setComments(comms || []);
  };

  const handleToggleLike = async () => {
    if (!selectedItem || !currentUserId) return;

    const current = socialMap[selectedItem.id] ?? { likes: 0, hasLiked: false, comments: 0 };

    if (hasLiked) {
      await supabase.from('activity_likes').delete()
        .eq('activity_log_id', selectedItem.id).eq('user_id', currentUserId);
      const newCount = Math.max(0, current.likes - 1);
      setHasLiked(false);
      setSocialMap(prev => ({ ...prev, [selectedItem.id]: { ...current, likes: newCount, hasLiked: false } }));
    } else {
      const { error } = await supabase.from('activity_likes').insert({
        activity_log_id: selectedItem.id,
        user_id: currentUserId,
      });
      if (!error) {
        const newCount = current.likes + 1;
        setHasLiked(true);
        setSocialMap(prev => ({ ...prev, [selectedItem.id]: { ...current, likes: newCount, hasLiked: true } }));
      }
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !newComment.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);

    const { data: { session } } = await supabase.auth.getSession();
    try {
      const { data, error } = await supabase
        .from('activity_comments')
        .insert({ activity_log_id: selectedItem.id, user_id: session?.user.id, content: newComment.trim() })
        .select('*, profiles:profile_display_with_titles(username, avatar_url, active_title)')
        .single();

      if (data && !error) {
        setComments(prev => [...prev, data]);
        setNewComment('');
        setSocialMap(prev => {
          const cur = prev[selectedItem.id] ?? { likes: 0, hasLiked: false, comments: 0 };
          return { ...prev, [selectedItem.id]: { ...cur, comments: cur.comments + 1 } };
        });
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-6">
        <div className="w-40 h-40">
          <DotLottiePlayer src="/Loading.lottie" autoplay loop />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-[#CCCC00] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando Feed Visual</h2>
          <p className="text-[#303035] text-[8px] font-bold uppercase tracking-widest">Acessando registros da comunidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className} selection:bg-[#CCCC00] selection:text-black`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-24 md:pb-0 h-screen overflow-y-auto scroll-smooth">
        <div className="max-w-[1000px] mx-auto px-4 py-8 md:py-14">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
              <button
                onClick={() => router.back()}
                className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
              >
                <ChevronLeft size={20} className="text-[#808090]" />
              </button>
              <div>
                <h1 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                  Feed Social
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CCCC00] shadow-[0_0_8px_#CCCC00]" />
                  <p className="text-[#606070] text-[10px] font-black uppercase tracking-[0.2em]">{activeGroup?.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
                <Camera size={16} className="text-[#CCCC00]" />
                <div>
                  <p className="text-[8px] font-black text-[#303035] uppercase tracking-widest leading-none">Evidências</p>
                  <p className="text-base font-black text-white tracking-tighter leading-tight">{feedItems.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Feed Grid ── */}
          {feedItems.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {feedItems.map((item, idx) => {
                const likes = getItemLikesCount(socialMap, item.id);
                const commentsCount = getItemCommentsCount(socialMap, item.id);
                const liked = getItemHasLiked(socialMap, item.id);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.35 }}
                    className="relative break-inside-avoid cursor-pointer group overflow-hidden rounded-2xl bg-[#0A0A0A] border border-white/[0.04] hover:border-white/10 transition-all"
                    onClick={() => openItem(item)}
                  >
                    {/* Full image — no crop */}
                    <img
                      src={item.proof_url}
                      alt="Treino"
                      className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="lazy"
                    />

                    {/* Overlay — always visible on mobile, hover on desktop */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 translate-y-0 md:translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {/* User info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {item.profiles?.avatar_url
                            ? <img src={item.profiles.avatar_url} className="w-full h-full object-cover" />
                            : <User size={10} className="text-white/50" />
                          }
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-tight truncate">{item.profiles?.username}</span>
                        <span className="ml-auto text-[9px] font-black text-[#CCCC00] bg-[#CCCC00]/10 px-1.5 py-0.5 rounded">+{item.points}pts</span>
                      </div>

                      {/* Social counts */}
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 text-[10px] font-black ${liked ? 'text-[#CCCC00]' : 'text-white/60'}`}>
                          <Heart size={11} fill={liked ? 'currentColor' : 'none'} />
                          {likes}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-white/60">
                          <MessageCircle size={11} />
                          {commentsCount}
                        </span>
                        <span className="ml-auto text-[8px] font-bold text-white/30 uppercase">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    {/* Mobile static bar (always visible, small) */}
                    <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 text-[10px] font-black ${liked ? 'text-[#CCCC00]' : 'text-white/70'}`}>
                          <Heart size={11} fill={liked ? 'currentColor' : 'none'} /> {likes}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-white/50">
                          <MessageCircle size={11} /> {commentsCount}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center flex flex-col items-center gap-6 bg-white/[0.01] border border-white/5 rounded-[3rem]">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#303035]">
                <Camera size={40} />
              </div>
              <div className="space-y-2 px-6">
                <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Nenhuma evidência capturada</h3>
                <p className="text-[#606070] text-xs max-w-xs mx-auto font-medium leading-relaxed">Sua unidade ainda não possui registros visuais. Seja o primeiro a postar uma prova.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 md:p-6"
            onClick={() => setSelectedItem(null)}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 200 }}
              className="w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl max-h-[92dvh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Image pane — object-contain so the whole photo shows ── */}
              <div className="w-full lg:flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[220px] lg:min-h-0">
                <img
                  src={selectedItem.proof_url}
                  alt="Treino"
                  className="w-full h-full object-contain max-h-[50vh] lg:max-h-[90dvh]"
                />
              </div>

              {/* ── Info pane ── */}
              <div className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-l border-white/[0.06] flex flex-col overflow-hidden bg-[#0A0A0A]">
                {/* User header */}
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                  <div
                    className="flex items-center gap-3 cursor-pointer group/user"
                    onClick={() => router.push(`/membros/${selectedItem.user_id}`)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center group-hover/user:border-[#CCCC00]/50 transition-all">
                      {selectedItem.profiles?.avatar_url
                        ? <img src={selectedItem.profiles.avatar_url} className="w-full h-full object-cover" />
                        : <User size={18} className="text-[#303035]" />
                      }
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-tight group-hover/user:text-[#CCCC00] transition-colors">
                        {selectedItem.profiles?.username}
                        {selectedItem.profiles?.active_title && (
                          <span className="text-[#606070] font-normal text-[9px] normal-case ml-1">, {selectedItem.profiles.active_title}</span>
                        )}
                      </p>
                      <p className="text-[9px] font-black text-[#CCCC00] uppercase tracking-widest">{selectedItem.activity_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-white tracking-tighter">+{selectedItem.points}</div>
                    <div className="text-[8px] font-black text-[#606070] uppercase tracking-widest">pontos</div>
                  </div>
                </div>

                {/* Like / comment bar */}
                <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-4 shrink-0">
                  <button
                    onClick={handleToggleLike}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${
                      hasLiked
                        ? 'bg-[#CCCC00]/10 border-[#CCCC00]/30 text-[#CCCC00]'
                        : 'bg-white/5 border-white/10 text-[#808090] hover:bg-white/10'
                    }`}
                  >
                    <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />
                    {(socialMap[selectedItem.id]?.likes ?? 0)} Kudos
                  </button>
                  <div className="flex items-center gap-2 text-[#606070] text-xs font-black uppercase tracking-widest">
                    <MessageCircle size={14} />
                    {comments.length} comentários
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-[#303035]">
                    <Clock size={11} />
                    <span className="text-[9px] font-bold">{formatDistanceToNow(new Date(selectedItem.created_at), { addSuffix: true, locale: ptBR })}</span>
                  </div>
                </div>

                {/* Comments list */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
                  {comments.length === 0 && (
                    <p className="text-center py-6 text-[9px] font-black text-[#303035] uppercase tracking-widest">Seja o primeiro a comentar</p>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {comment.profiles?.avatar_url
                          ? <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />
                          : <User size={11} className="text-[#303035]" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-black text-white uppercase tracking-tight">{comment.profiles?.username}</span>
                          <span className="text-[8px] text-[#606070] font-medium">{format(new Date(comment.created_at), 'HH:mm')}</span>
                        </div>
                        <p className="text-xs text-[#808090] font-medium leading-relaxed mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>

                {/* Comment input */}
                <form onSubmit={handleSendComment} className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um incentivo..."
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#303035] focus:outline-none focus:border-[#CCCC00]/50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="w-9 h-9 rounded-xl bg-[#CCCC00] text-black flex items-center justify-center hover:bg-[#b3b300] transition-all disabled:opacity-30 active:scale-95"
                  >
                    <Send size={14} strokeWidth={2.5} />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
