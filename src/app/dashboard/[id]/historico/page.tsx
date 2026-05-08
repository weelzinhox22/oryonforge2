'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Activity, Calendar, 
  User, MapPin, Clock 
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { DotLottiePlayer } from '@dotlottie/react-player';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function GroupHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<any>(null);
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
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch Group Name
        const { data: groupData } = await supabase
          .from('groups')
          .select('name')
          .eq('id', groupId)
          .single();
        
        if (groupData) setActiveGroup(groupData);

        // Fetch Full History
        const { data } = await supabase
          .from('activity_feed')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });
        
        if (data) setActivities(data);

      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      } finally {
        await minLoadingTime;
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId, router, supabase]);

  

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className}`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-24 md:pb-0 h-screen overflow-y-auto">
        <div className="max-w-[1000px] mx-auto px-6 py-10 md:py-16">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
              >
                <ChevronLeft size={20} className="text-[#808090]" />
              </button>
              <div>
                <h1 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                  Histórico de Atividades
                </h1>
                <p className="text-[#606070] text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#CCCC00]" />
                  {activeGroup?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline / List */}
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: isMinimalist ? 5 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * (isMinimalist ? 0.01 : 0.03) }}
                  className={`group ${isMinimalist ? 'p-4 rounded-xl border-white/5' : 'p-6 rounded-[2rem] border-white/5 bg-white/[0.02]'} border hover:bg-white/[0.04] hover:border-white/10 transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 md:gap-5">
                      <div className={`shrink-0 flex items-center justify-center transition-all ${isMinimalist ? 'w-10 h-10 rounded-lg bg-white/5' : 'w-14 h-14 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-[#CCCC00]/10 group-hover:border-[#CCCC00]/30'}`}>
                        <Activity size={isMinimalist ? 18 : 24} className={`text-[#808090] ${!isMinimalist ? 'group-hover:text-[#CCCC00]' : ''}`} />
                      </div>
                        <div className="flex flex-col gap-0.5 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{activity.username}</span>
                            {!isMinimalist && (
                              <>
                                <span className="px-1 py-0.5 bg-[#CCCC00]/10 border border-[#CCCC00]/20 rounded text-[7px] font-black text-[#CCCC00] uppercase">
                                  LVL {activity.level || 1}
                                </span>
                                <span className="text-[9px] font-bold text-[#606070] uppercase tracking-widest">— {activity.user_title || 'Recruta'}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#CCCC00] uppercase tracking-widest">{activity.activity_type}</span>
                          </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] text-[#606070] font-bold uppercase tracking-wider">
                            <Clock size={12} strokeWidth={2.5} />
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                          </div>
                          {activity.proof_url && !isMinimalist && (
                             <div className="flex items-center gap-1.5 text-[10px] text-[#606070] font-bold uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                Comprovação anexada
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-black text-white tracking-tighter">+{activity.points}</div>
                      {!isMinimalist && <div className="text-[8px] font-black text-[#606070] uppercase tracking-widest">pontos</div>}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                  <Calendar size={32} className="text-[#303035]" />
                </div>
                <p className="text-[#606070] text-sm font-medium">Nenhuma atividade registrada neste grupo.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
