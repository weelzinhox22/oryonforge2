'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Trophy, Medal, 
  Star, Lock, CheckCircle2,
  Trophy as TrophyIcon
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { DotLottiePlayer } from '@dotlottie/react-player';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function IndividualAchievementsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        // Fetch all individual achievements
        const { data: allAchievements, error: allErr } = await supabase
          .from('achievements')
          .select('*')
          .eq('category', 'individual');
        
        if (allErr) throw allErr;
        
        // Fetch user unlocked achievements
        const { data: unlocked, error: unlErr } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', session.user.id);
        
        if (unlErr) throw unlErr;
        
        const ids = new Set(unlocked?.map(u => u.achievement_id) || []);
        
        setAchievements(allAchievements || []);
        setUnlockedIds(ids);
      } catch (err) {
        console.error('Erro ao buscar conquistas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-32 h-32">
          <DotLottiePlayer src="/Loading.lottie" autoplay loop />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className}`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-32 md:pb-0 h-screen overflow-y-auto">
        {/* Background glow */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#CCCC00]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-[1000px] mx-auto px-6 py-12 md:py-20 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-6 mb-16">
            <button
              onClick={() => router.back()}
              className="w-14 h-14 rounded-[22px] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
            >
              <ChevronLeft size={24} className="text-[#808090]" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Trophy size={14} className="text-[#CCCC00]" />
                <h2 className="text-[10px] font-black text-[#606070] uppercase tracking-[0.4em]">Personal Records</h2>
              </div>
              <h1 className={`text-3xl md:text-4xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                Minhas Conquistas
              </h1>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-[#303035] uppercase tracking-widest mb-4">Total Desbloqueado</span>
              <span className="text-4xl font-black text-white tracking-tighter mb-1">{unlockedIds.size}</span>
              <span className="text-[10px] font-bold text-[#CCCC00] uppercase tracking-widest">de {achievements.length} Badges</span>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-[#303035] uppercase tracking-widest mb-4">Nível de Honra</span>
              <span className="text-2xl font-black text-white uppercase tracking-tight mb-1 italic">Membro</span>
              <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className="w-[45%] h-full bg-[#CCCC00]" />
              </div>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-[#303035] uppercase tracking-widest mb-4">Próximo Marco</span>
              <span className="text-sm font-bold text-[#808090] uppercase tracking-tighter">Elite Trooper</span>
              <p className="text-[9px] text-[#404045] font-bold mt-1 uppercase tracking-widest">Faltam 3 badges</p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, idx) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden group ${
                    isUnlocked 
                      ? 'bg-white/[0.03] border-white/10 hover:border-[#CCCC00]/40' 
                      : 'bg-white/[0.01] border-white/5 grayscale opacity-60'
                  }`}
                >


                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-all duration-500 relative overflow-hidden ${
                      isUnlocked 
                        ? 'bg-[#CCCC00]/10 border border-[#CCCC00]/20 shadow-[0_0_30px_rgba(204,204,0,0.15)] group-hover:scale-110 group-hover:rotate-3' 
                        : 'bg-white/[0.02] border border-white/5'
                    }`}>
                      <img 
                        src={achievement.icon_url} 
                        alt={achievement.title} 
                        className={`w-full h-full object-contain p-2 transition-all duration-700 ${
                          isUnlocked ? 'scale-110' : 'grayscale opacity-40 group-hover:opacity-60'
                        }`}
                      />
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm border border-white/10">
                          <Lock size={10} className="text-[#606070]" />
                        </div>
                      )}
                    </div>

                    <h3 className={`text-lg font-black uppercase tracking-tight mb-2 ${isUnlocked ? 'text-white' : 'text-[#303035]'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-[#606070] font-medium leading-relaxed mb-4">
                      {achievement.description}
                    </p>
                    
                    {!isUnlocked && (
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/5 rounded-xl mb-6">
                        <span className="text-[9px] font-bold text-[#808090] uppercase">
                          Alvo: {achievement.requirement_value} {achievement.requirement_type === 'points' ? 'Pts' : achievement.requirement_type === 'streak' ? 'Dias' : 'Treinos'}
                        </span>
                      </div>
                    )}

                    {isUnlocked ? (
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-[#CCCC00]/5 border border-[#CCCC00]/10 rounded-full">
                        <CheckCircle2 size={12} className="text-[#CCCC00]" />
                        <span className="text-[9px] font-black text-[#CCCC00] uppercase tracking-widest">Conquistado</span>
                      </div>
                    ) : (
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-[#CCCC00]" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-20 py-12 border-t border-white/5 text-center">
             <p className="text-[10px] font-black text-[#303035] uppercase tracking-[0.4em]">Oryon Forge Recognition System</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
