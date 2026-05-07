'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ChevronLeft, Search, Medal, Sparkles, 
  Target, Flame, Activity, TrendingUp, Info, Share2, User
} from 'lucide-react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import ShareCard from '@/components/ShareCard';
import { useRouter } from 'next/navigation';
import { DotLottiePlayer } from '@dotlottie/react-player';

const pjs = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export default function GlobalRankingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (isMounted) router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setUserProfile(profile);
      
      const { data, error } = await supabase.rpc('get_global_ranking');
      if (!error && data) {
        setRanking(data);
      }

      const { data: streakValue } = await supabase.rpc('get_user_streak', { user_id_param: session.user.id });
      setStreak(streakValue || 0);
      
      // Delay de 2s para animação
      await new Promise(r => setTimeout(r, 2000));
      setLoading(false);
    }
    fetchData();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const myRankIdx = ranking.findIndex(r => r.username === userProfile?.username);
  const myRank = myRankIdx + 1;

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  const handleShareRank = () => {
    if (!userProfile || myRank === 0) return;
    
    setShareData({
      type: 'activity', // Usando estilo de atividade para o rank
      title: `RANKING GLOBAL`,
      subtitle: `POSIO #${myRank}`,
      value: userProfile.total_points || ranking[myRankIdx]?.total_points || 0,
      username: userProfile.username,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()
    });
    setShowShareCard(true);
  };

  return (
    <div className={`flex min-h-screen bg-black text-[#F0F0F6] ${pjs.className}`}>
      <Sidebar onSignOut={handleSignOut} />
      
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#CCCC00]/[0.04] to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 relative z-10">
          
          {/* Header */}
          <header className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#CCCC00]" />
              <span className="text-[10px] font-black text-[#CCCC00] uppercase tracking-[0.3em]">Performance Mundial</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 uppercase italic">
                  Ranking Global
                </h1>
                <p className="text-[#606070] text-sm font-medium">Os melhores atletas da rede Oryon Forge em tempo real.</p>
              </div>
              
              {userProfile && (
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-[#303035] uppercase tracking-widest mb-1">Sua Posição</p>
                    <p className="text-xl font-black text-white">{myRank > 0 ? `#${myRank}` : '—'}</p>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-[#303035] uppercase tracking-widest mb-1">Seu Streak</p>
                    <p className="text-xl font-black text-[#CCCC00]">{streak}</p>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <button 
                    onClick={handleShareRank}
                    className="w-10 h-10 rounded-xl bg-[#CCCC00]/10 border border-[#CCCC00]/20 flex items-center justify-center text-[#CCCC00] hover:bg-[#CCCC00]/20 transition-all active:scale-90"
                    title="Compartilhar Rank"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#CCCC00]/20 border-t-[#CCCC00] animate-spin" />
              <p className="text-[#303035] text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Rank...</p>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* Podium View */}
              {top3.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {top3.map((user, idx) => {
                    const position = idx + 1;
                    const isMe = user.username === userProfile?.username;
                    
                    return (
                      <motion.div
                        key={user.username}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative p-8 rounded-[3rem] border overflow-hidden group ${
                          position === 1 
                            ? 'bg-gradient-to-br from-[#CCCC00]/10 to-transparent border-[#CCCC00]/30 md:scale-110 md:z-10' 
                            : 'bg-[#0A0A0A]/40 border-white/5'
                        }`}
                      >
                        {position === 1 && (
                          <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#CCCC00]/10 blur-[40px] rounded-full" />
                        )}
                        
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-6">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 group-hover:scale-110 overflow-hidden ${
                              position === 1 ? 'bg-[#CCCC00] border-[#CCCC00]/20' : 'bg-white/5 border-white/10'
                            }`}>
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className={`text-2xl font-black ${position === 1 ? 'text-black' : 'text-[#606070]'}`}>
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-4 border-black ${
                              position === 1 ? 'bg-[#CCCC00] text-black' : 
                              position === 2 ? 'bg-gray-400 text-black' : 'bg-amber-700 text-black'
                            }`}>
                              {position}
                            </div>
                          </div>
                          
                          <h3 className={`text-lg font-black uppercase tracking-tight mb-1 truncate w-full ${isMe ? 'text-[#CCCC00]' : 'text-white'}`}>
                            {user.username}
                          </h3>
                          <div className="flex items-center gap-2 mb-6">
                            <span className="px-1.5 py-0.5 bg-[#CCCC00]/10 border border-[#CCCC00]/20 rounded text-[8px] font-black text-[#CCCC00] uppercase">
                              LVL {user.level || 1}
                            </span>
                            <p className="text-[10px] font-black text-[#606070] uppercase tracking-widest">{user.title || 'Recruta'}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-white/5">
                            <div>
                              <p className="text-[9px] font-black text-[#303035] uppercase tracking-widest mb-1">Pontos</p>
                              <p className="text-md font-black text-white">{user.total_points}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-[#303035] uppercase tracking-widest mb-1">Treinos</p>
                              <p className="text-md font-black text-white">{user.activities_count}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* List View for the rest */}
              <div className="bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-[10px] font-black text-[#606070] uppercase tracking-[0.2em]">Todos os Atletas</h2>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#303035] uppercase">
                    <Activity size={12} /> Atualizado agora
                  </div>
                </div>
                
                <div className="divide-y divide-white/5">
                  {rest.length > 0 ? (
                    rest.map((user, idx) => {
                      const position = idx + 4;
                      const isMe = user.username === userProfile?.username;
                      
                      return (
                        <motion.div
                          key={user.username}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                          className={`flex items-center justify-between px-8 py-6 transition-all group ${
                            isMe ? 'bg-[#CCCC00]/[0.03]' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-center gap-8">
                            <span className="w-6 text-center text-xs font-black italic tracking-tighter text-[#303035]">
                              {position.toString().padStart(2, '0')}
                            </span>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 bg-white/5 overflow-hidden`}>
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-black text-[#606070]">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className={`text-sm font-black uppercase tracking-tight ${isMe ? 'text-[#CCCC00]' : 'text-white'}`}>
                                {user.username}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[8px] font-black text-[#CCCC00] uppercase tracking-widest bg-[#CCCC00]/5 px-1 rounded border border-[#CCCC00]/10">LVL {user.level || 1}</span>
                                <p className="text-[10px] font-bold text-[#606070] uppercase tracking-widest">{user.title || 'Recruta'}</p>
                                <span className="w-1 h-1 rounded-full bg-white/5" />
                                <div className="flex items-center gap-1 text-[9px] font-black text-[#CCCC00] uppercase tracking-widest">
                                  <TrendingUp size={10} /> Em Alta
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-black text-white tracking-tighter">
                              {user.total_points} <span className="text-[10px] font-black text-[#303035] uppercase tracking-widest">PTS</span>
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="p-12 text-center text-[#606070] text-sm uppercase tracking-widest font-black opacity-20">
                      Nenhum atleta adicional
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
                <div className="bg-[#CCCC00]/5 border border-[#CCCC00]/10 rounded-3xl p-8 flex items-start gap-5">
                  <Medal className="text-[#CCCC00] shrink-0" size={24} />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Sistema de Pontuação</h3>
                    <p className="text-xs text-[#606070] leading-relaxed">
                      Sua pontuação global é a soma de todos os seus logs aprovados em todos os grupos que você participa. Logs rejeitados ou pendentes não contam para o rank.
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex items-start gap-5">
                  <Sparkles className="text-[#606070] shrink-0" size={24} />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Próximo Reset</h3>
                    <p className="text-xs text-[#606070] leading-relaxed">
                      O ranking global nunca é resetado, servindo como seu histórico vitalício de performance na plataforma. O rank de grupos individuais reseta a cada ciclo.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

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
