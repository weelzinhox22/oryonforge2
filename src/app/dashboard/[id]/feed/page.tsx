'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { ChevronLeft, Camera, User, Heart, MessageCircle } from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { DotLottiePlayer } from '@dotlottie/react-player';

const sora = Sora({ subsets: ['latin'], weight: ['700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '700', '900'] });

export default function GroupFeedPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [socialMap, setSocialMap] = useState<Record<string, { likes: number; hasLiked: boolean; comments: number }>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const min = new Promise(r => setTimeout(r, 1200));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const [{ data: groupData }, { data: items }] = await Promise.all([
        supabase.from('groups').select('name, avatar_url').eq('id', groupId).single(),
        supabase
          .from('activity_logs')
          .select('*, profiles:profiles(username, avatar_url, title)')
          .eq('group_id', groupId)
          .not('proof_url', 'is', null)
          .order('created_at', { ascending: false }),
      ]);

      if (groupData) setActiveGroup(groupData);
      if (items) {
        setFeedItems(items);

        // Load social counts in parallel
        const userId = session.user.id;
        const results = await Promise.all(
          items.map(async (item: any) => {
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

      await min;
      setIsLoading(false);
    };
    fetchData();
  }, [groupId]);

  

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className}`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-24 md:pb-0 h-screen overflow-y-auto">
        <div className="max-w-[1000px] mx-auto px-4 py-8 md:py-14">

          {/* Header */}
          <div className="flex items-center gap-5 mb-10">
            <button
              onClick={() => router.back()}
              className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
            >
              <ChevronLeft size={20} className="text-[#808090]" />
            </button>
            <div className="flex-1">
              <h1 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                Feed Social
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCCC00]" />
                <p className="text-[#606070] text-[10px] font-black uppercase tracking-[0.2em]">{activeGroup?.name}</p>
              </div>
            </div>
            <div className="px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-2.5">
              <Camera size={15} className="text-[#CCCC00]" />
              <div>
                <p className="text-[7px] font-black text-[#303035] uppercase tracking-widest leading-none">Evidências</p>
                <p className="text-sm font-black text-white tracking-tighter">{feedItems.length}</p>
              </div>
            </div>
          </div>

          {/* ── Masonry grid — cards link to post detail pages ── */}
          {feedItems.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {feedItems.map((item, idx) => {
                const s = socialMap[item.id];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="break-inside-avoid cursor-pointer group overflow-hidden rounded-2xl bg-[#0A0A0A] border border-white/[0.04] hover:border-[#CCCC00]/20 transition-all relative"
                    onClick={() => router.push(`/dashboard/${groupId}/feed/${item.id}`)}
                  >
                    {/* Image — full aspect ratio, no crop */}
                    <img
                      src={item.proof_url}
                      alt="Treino"
                      className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="lazy"
                    />

                    {/* Overlay on hover (desktop) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-300 flex flex-col justify-end p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-white/10 border border-white/10 overflow-hidden shrink-0">
                          {item.profiles?.avatar_url
                            ? <img src={item.profiles.avatar_url} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-[#202020]" />}
                        </div>
                        <span className="text-[9px] font-black text-white uppercase tracking-tight truncate flex-1">
                          {item.profiles?.username}
                        </span>
                        <span className="text-[8px] font-black text-[#CCCC00] shrink-0">+{item.points}pts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 text-[9px] font-black ${s?.hasLiked ? 'text-[#CCCC00]' : 'text-white/60'}`}>
                          <Heart size={10} fill={s?.hasLiked ? 'currentColor' : 'none'} /> {s?.likes ?? 0}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-black text-white/50">
                          <MessageCircle size={10} /> {s?.comments ?? 0}
                        </span>
                        <span className="ml-auto text-[7px] text-white/30 font-bold">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    {/* Mobile: always-visible social bar */}
                    <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 text-[9px] font-black ${s?.hasLiked ? 'text-[#CCCC00]' : 'text-white/70'}`}>
                          <Heart size={10} fill={s?.hasLiked ? 'currentColor' : 'none'} /> {s?.likes ?? 0}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-black text-white/50">
                          <MessageCircle size={10} /> {s?.comments ?? 0}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center gap-6 bg-white/[0.01] border border-white/5 rounded-[3rem]">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#303035]">
                <Camera size={36} />
              </div>
              <div className="space-y-2 text-center px-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Nenhuma evidência</h3>
                <p className="text-[#606070] text-xs max-w-xs mx-auto font-medium leading-relaxed">
                  Seja o primeiro a postar uma comprovação neste grupo.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
