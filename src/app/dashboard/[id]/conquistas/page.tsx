'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Trophy, Medal, 
  Lock, CheckCircle2, Users,
  Target, Zap, Star, Share2, User
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import ShareCard from '@/components/ShareCard';
import { DotLottiePlayer } from '@dotlottie/react-player';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function GroupAchievementsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareData, setShareData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch Group Data
      const { data: group } = await supabase
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single();
      
      if (group) setActiveGroup(group);

      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) setUserProfile(profile);

      try {
        // Fetch all group achievements
        const { data: allAchievements, error: allErr } = await supabase
          .from('achievements')
          .select('*')
          .eq('category', 'group');
        
        if (allErr) throw allErr;
        
        // Fetch user unlocked achievements in this group
        const { data: unlocked, error: unlErr } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', session.user.id)
          .eq('group_id', groupId);
        
        if (unlErr) throw unlErr;
        
        const ids = new Set(unlocked?.map(u => u.achievement_id) || []);
        
        setAchievements(allAchievements || []);
        setUnlockedIds(ids);
      } catch (err) {
        console.error('Erro ao carregar conquistas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId, supabase, router]);

  const handleShare = (achievement: any) => {
    setShareData({
      type: 'achievement',
      title: achievement.title,
      subtitle: 'Conquista Desbloqueada',
      value: achievement.points_reward || '',
      imageUrl: achievement.icon_url,
      username: userProfile?.username || 'Membro',
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()
    });
    setShowShareCard(true);
  };

  

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className}`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-32 md:pb-0 h-screen overflow-y-auto scroll-smooth">
        {/* Atmospheric Glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#CCCC00]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[100px] rounded-full" />
        </div>

        <div className="max-w-[1000px] mx-auto px-6 py-12 md:py-20 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.back()}
                className="w-14 h-14 rounded-[22px] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
              >
                <ChevronLeft size={24} className="text-[#808090]" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Star size={14} className="text-[#CCCC00]" />
                  <h2 className="text-[10px] font-black text-[#606070] uppercase tracking-[0.4em]">Honor & Glory</h2>
                </div>
                <h1 className={`text-3xl md:text-4xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                  Glórias da Unidade
                </h1>
                <p className="text-[#606070] text-[10px] font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                   <Users size={12} /> {activeGroup?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.02] border border-white/5 rounded-3xl">
               <div className="text-right">
                  <p className="text-[9px] font-black text-[#303035] uppercase tracking-widest leading-none">Domínio do Grupo</p>
                  <p className="text-lg font-black text-white tracking-tighter">{Math.round((unlockedIds.size / achievements.length) * 100 || 0)}%</p>
               </div>
               <div className="w-10 h-10 rounded-2xl bg-[#CCCC00]/10 border border-[#CCCC00]/20 flex items-center justify-center text-[#CCCC00]">
                  <Trophy size={18} />
               </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {achievements.map((achievement, idx) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-10 rounded-[3rem] border transition-all duration-700 relative overflow-hidden group ${
                    isUnlocked 
                      ? 'bg-white/[0.02] border-[#CCCC00]/20 hover:border-[#CCCC00]/40' 
                      : 'bg-white/[0.01] border-white/5 grayscale-[0.8] opacity-60'
                  }`}
                >


                  <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl transition-all duration-500 relative overflow-hidden ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-[#CCCC00]/20 to-black border border-[#CCCC00]/30 group-hover:rotate-3' 
                        : 'bg-white/[0.02] border border-white/5'
                    }`}>
                      <img 
                        src={achievement.icon_url} 
                        alt={achievement.title} 
                        className={`w-full h-full object-contain p-3 transition-all duration-700 ${
                          isUnlocked ? 'scale-110' : 'grayscale opacity-40 group-hover:opacity-60'
                        }`}
                      />
                      {!isUnlocked && (
                        <div className="absolute top-3 right-3 p-2 bg-black/60 rounded-xl backdrop-blur-sm border border-white/10">
                          <Lock size={12} className="text-[#606070]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                      <div>
                        <h3 className={`text-xl font-black uppercase tracking-tight mb-2 ${isUnlocked ? 'text-white' : 'text-[#303035]'}`}>
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-[#606070] font-medium leading-relaxed mb-3">
                          {achievement.description}
                        </p>
                        {!isUnlocked && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-lg">
                            <span className="text-[8px] font-black text-[#CCCC00] uppercase tracking-widest">Objetivo:</span>
                            <span className="text-[9px] font-bold text-[#808090] uppercase">
                              {achievement.requirement_value} {achievement.requirement_type === 'points' ? 'Pontos' : achievement.requirement_type === 'streak' ? 'Dias de Streak' : 'Treinos'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                        {isUnlocked ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#CCCC00] text-black rounded-xl">
                              <CheckCircle2 size={12} strokeWidth={3} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Concluído</span>
                            </div>
                            <button
                              onClick={() => handleShare(achievement)}
                              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCCC00] hover:bg-[#CCCC00]/10 hover:border-[#CCCC00]/30 transition-all active:scale-90"
                              title="Compartilhar"
                            >
                              <Share2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[#404045] rounded-xl">
                            <Target size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Bloqueado</span>
                          </div>
                        )}
                        <div className="px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl">
                          <span className="text-[9px] font-black text-[#606070] uppercase tracking-widest">Raridade: Épica</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-20 p-12 bg-white/[0.01] border border-white/5 rounded-[3rem] text-center space-y-4">
             <div className="w-12 h-12 bg-white/5 rounded-2xl mx-auto flex items-center justify-center text-[#303035]">
                <Zap size={24} />
             </div>
             <div className="space-y-1">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Em Busca da Perfeição</h4>
                <p className="text-[10px] text-[#606070] font-bold uppercase tracking-widest">Continue treinando para desbloquear medalhas lendárias</p>
             </div>
          </div>
        </div>
      </main>

      <BottomNav />

      {shareData && (
        <ShareCard 
          isOpen={showShareCard}
          onClose={() => setShowShareCard(false)}
          data={shareData}
        />
      )}
    </div>
  );
}
