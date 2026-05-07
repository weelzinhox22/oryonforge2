'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, User, ShieldCheck, 
  Trophy, Activity, Calendar
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function MemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile with active title
        const { data: profileData } = await supabase
          .from('profile_display_with_titles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }

        // Fetch heatmap data
        const { data: heatmap } = await supabase.rpc('get_user_activity_heatmap', { target_user_id: userId });
        setHeatmapData(heatmap || []);

        // Fetch recent activities
        const { data: activities } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentActivities(activities || []);

      } catch (error) {
        console.error('Error fetching member data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-6">
        <div className="w-32 h-32">
          <DotLottiePlayer src="/Loading.lottie" autoplay loop />
        </div>
        <p className="text-[#303035] text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Identidade...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-black text-white uppercase mb-2">Usuário não encontrado</h2>
        <button onClick={() => router.back()} className="text-[#CCCC00] text-sm font-bold uppercase tracking-widest">Voltar</button>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className}`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-24 md:pb-0 h-screen overflow-y-auto">
        <div className="max-w-[900px] mx-auto px-6 py-10 md:py-16">
          
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <button
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
            >
              <ChevronLeft size={20} className="text-[#808090]" />
            </button>
            <div>
              <h1 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                Perfil do Membro
              </h1>
              <p className="text-[#606070] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Status e Performance</p>
            </div>
          </div>

          {/* Profile Card */}
          <section className="mb-12">
            <div className="p-8 md:p-12 bg-white/[0.02] border border-white/5 rounded-[3.5rem] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(204,204,0,0.08),transparent)]" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="w-40 h-40 rounded-[3rem] bg-white/5 border-2 border-white/10 overflow-hidden shadow-2xl shadow-black">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#303035]">
                      <User size={64} />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
                      {profile?.username}
                      {profile?.active_title && (
                        <span className="text-[#606070] font-light text-2xl lowercase ml-3">, {profile.active_title}</span>
                      )}
                    </h2>
                    <div className="px-3 py-1 bg-[#CCCC00] text-black rounded-xl text-[10px] font-black uppercase mb-2">
                      LVL {profile?.level || 1}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                      <ShieldCheck size={14} className="text-[#CCCC00]" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{profile?.title || 'Recruta'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                      <Trophy size={14} className="text-[#CCCC00]" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{profile?.total_xp || 0} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Activity Heatmap */}
          <section className="mb-12">
            <ActivityHeatmap activities={heatmapData} />
          </section>

          {/* Recent Activity Feed */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCCC00]" />
                <h2 className="text-[10px] font-black text-[#606070] uppercase tracking-[0.3em]">Registros Recentes</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#CCCC00]/30 transition-all">
                        <Activity size={20} className="text-[#606070] group-hover:text-[#CCCC00]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{activity.activity_type}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-[#606070] uppercase">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-black text-[#CCCC00] uppercase">+{activity.points} Pts</span>
                        </div>
                      </div>
                    </div>
                    {activity.duration_minutes && (
                      <div className="text-right">
                        <span className="text-lg font-black text-white tracking-tighter">{activity.duration_minutes}</span>
                        <span className="text-[9px] font-black text-[#303035] uppercase ml-1">min</span>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center border border-white/5 border-dashed rounded-3xl">
                  <p className="text-[#303035] text-[10px] font-black uppercase tracking-widest">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
