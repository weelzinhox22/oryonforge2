'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Camera, User, 
  Clock, Smartphone, MapPin, 
  Plus, Calendar, Activity,
  Maximize2, X, Info, Heart, MessageCircle, Send
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { DotLottiePlayer } from '@dotlottie/react-player';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

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
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from('profiles').select('dashboard_style').eq('id', session.user.id).single();
      if (data) setUserProfile(data);
    };
    fetchProfile();
  }, []);

  const isMinimalist = userProfile?.dashboard_style === 'minimalist';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

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
        
        if (data) setFeedItems(data);

      } catch (error) {
        console.error('Erro ao buscar feed:', error);
      } finally {
        await minLoadingTime;
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId, router, supabase]);

  const fetchSocialData = async (activityId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch Likes
    const { count: lCount } = await supabase
      .from('activity_likes')
      .select('*', { count: 'exact', head: true })
      .eq('activity_log_id', activityId);
    
    const { data: userLike } = await supabase
      .from('activity_likes')
      .select('id')
      .eq('activity_log_id', activityId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    setLikesCount(lCount || 0);
    setHasLiked(!!userLike);

    // Fetch Comments
    const { data: comms } = await supabase
      .from('activity_comments')
      .select('*, profiles:profile_display_with_titles(username, avatar_url, active_title)')
      .eq('activity_log_id', activityId)
      .order('created_at', { ascending: true });
    
    setComments(comms || []);
  };

  const handleToggleLike = async () => {
    if (!selectedItem) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      if (hasLiked) {
        await supabase
          .from('activity_likes')
          .delete()
          .eq('activity_log_id', selectedItem.id)
          .eq('user_id', session.user.id);
        setLikesCount(prev => Math.max(0, prev - 1));
        setHasLiked(false);
      } else {
        const { error } = await supabase
          .from('activity_likes')
          .insert({
            activity_log_id: selectedItem.id,
            user_id: session.user.id
          });
        
        if (error) throw error;

        setLikesCount(prev => prev + 1);
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Erro ao processar like:', error);
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
        .insert({
          activity_log_id: selectedItem.id,
          user_id: session?.user.id,
          content: newComment.trim()
        })
        .select('*, profiles:profile_display_with_titles(username, avatar_url, active_title)')
        .single();

      if (data) {
        setComments(prev => [...prev, data]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      fetchSocialData(selectedItem.id);
    }
  }, [selectedItem]);

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
        <div className="max-w-[1000px] mx-auto px-4 py-8 md:py-16">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.back()}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
              >
                <ChevronLeft size={20} className="text-[#808090]" />
              </button>
              <div>
                <h1 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                  Feed Social
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1 h-1 rounded-full bg-[#CCCC00] shadow-[0_0_8px_#CCCC00]" />
                  <p className="text-[#606070] text-[10px] font-black uppercase tracking-[0.2em]">{activeGroup?.name}</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="text-right">
                <p className="text-[10px] font-black text-[#303035] uppercase tracking-widest leading-none">Registros Visuais</p>
                <p className="text-lg font-black text-white tracking-tighter">{feedItems.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#CCCC00]/10 border border-[#CCCC00]/20 flex items-center justify-center text-[#CCCC00]">
                <Camera size={20} />
              </div>
            </div>
          </div>

          {/* Grid Layout (Instagram Style) */}
          {feedItems.length > 0 ? (
            <div className={`grid ${isMinimalist ? 'grid-cols-4 md:grid-cols-6 gap-0.5 md:gap-1' : 'grid-cols-3 gap-1 md:gap-4'}`}>
              {feedItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={isMinimalist ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.01 }}
                  className={`relative aspect-square cursor-pointer group overflow-hidden bg-white/5 ${isMinimalist ? '' : 'rounded-lg md:rounded-3xl'}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <img
                    src={item.proof_url}
                    alt="Treino"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {!isMinimalist && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                      <div className="flex items-center gap-1.5">
                        <Activity size={12} className="text-[#CCCC00]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">+{item.points} pts</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full overflow-hidden border border-white/20">
                          {item.profiles?.avatar_url ? (
                            <img src={item.profiles.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <User size={8} className="text-white" />
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-white/80">{item.profiles?.username}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center flex flex-col items-center gap-6 bg-white/[0.01] border border-white/5 rounded-[3rem]">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#303035]">
                <Camera size={40} />
              </div>
              <div className="space-y-2 px-6">
                <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Nenhuma evidência capturada</h3>
                <p className="text-[#606070] text-xs max-w-xs mx-auto font-medium leading-relaxed uppercase">Sua unidade ainda não possui registros visuais. Seja o primeiro a postar uma prova.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Modal Detail View */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
          >
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-5xl bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-3xl max-h-[90dvh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Side */}
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px]">
                <img
                  src={selectedItem.proof_url}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info Side */}
              <div className="w-full lg:w-[400px] border-l border-white/5 p-8 flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <div 
                    className="flex items-center gap-4 cursor-pointer group/user"
                    onClick={() => router.push(`/membros/${selectedItem.user_id}`)}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center group-hover/user:border-[#CCCC00]/50 transition-all">
                      {selectedItem.profiles?.avatar_url ? (
                        <img src={selectedItem.profiles.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-[#303035]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover/user:text-[#CCCC00] transition-colors">
                        {selectedItem.profiles?.username}
                        {selectedItem.profiles?.active_title && (
                          <span className="text-[#606070] font-light text-[10px] lowercase ml-1">, {selectedItem.profiles.active_title}</span>
                        )}
                      </h3>
                      <p className="text-[9px] font-black text-[#CCCC00] uppercase tracking-widest">{selectedItem.activity_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white tracking-tighter">+{selectedItem.points}</div>
                    <div className="text-[8px] font-black text-[#606070] uppercase tracking-[0.2em]">pontos obtidos</div>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={handleToggleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                          hasLiked 
                            ? 'bg-[#CCCC00]/10 border-[#CCCC00]/30 text-[#CCCC00]' 
                            : 'bg-white/5 border-white/10 text-[#808090] hover:bg-white/10'
                        }`}
                      >
                        <Heart size={18} fill={hasLiked ? "currentColor" : "none"} />
                        <span className="text-xs font-black uppercase tracking-widest">{likesCount} Kudos</span>
                      </button>
                      <div className="flex items-center gap-2 text-[#606070]">
                        <MessageCircle size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">{comments.length} Comentários</span>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {comment.profiles?.avatar_url ? (
                              <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <User size={12} className="text-[#303035]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-[10px] font-black text-white uppercase tracking-tight">{comment.profiles?.username}</span>
                              <span className="text-[8px] text-[#606070] font-medium uppercase tracking-widest">
                                {format(new Date(comment.created_at), "HH:mm")}
                              </span>
                            </div>
                            <p className="text-xs text-[#808090] font-medium leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-center py-4 text-[9px] font-black text-[#303035] uppercase tracking-widest">Seja o primeiro a comentar</p>
                      )}
                    </div>

                    {/* Comment Input */}
                    <form onSubmit={handleSendComment} className="relative">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escreva um incentivo..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-xs text-white placeholder:text-[#303035] focus:outline-none focus:border-[#CCCC00]/50 transition-all pr-12"
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#CCCC00] hover:scale-110 transition-transform disabled:opacity-30 disabled:hover:scale-100"
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </div>

                  <div className="p-6 border border-white/[0.03] rounded-3xl">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-[8px] font-black text-[#303035] uppercase tracking-widest">Protocolo de Verificação</span>
                     </div>
                     <p className="text-[10px] font-mono text-[#404045] break-all leading-relaxed uppercase">
                        {selectedItem.id}
                     </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-3">
                  <Info size={14} className="text-[#303035]" />
                  <span className="text-[8px] font-black text-[#303035] uppercase tracking-[0.3em]">Oryon Forge Neural Network</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
