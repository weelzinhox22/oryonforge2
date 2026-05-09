'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Activity, Trophy,
  Plus, Target, Medal, UserPlus,
  Image as ImageIcon, Edit2, Save, X, Settings, Clock, BellRing
} from 'lucide-react';
import { Sora } from 'next/font/google';
import { formatDistanceToNow, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';

const sora = Sora({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

interface DashboardViewProps {
  userProfile: any;
  activeGroup: any;
  userRole?: string;
  ranking: { username: string; points: number; userId: string; adjustment: number; avatarUrl?: string; level?: number; title?: string }[];
  dailyPoints: number;
  streak: number;
  activityFeed?: any[];
  gallery?: any[];
  onBackToLobby: () => void;
  onCopyInvite?: () => void;
  onUpdatePoints?: (userId: string, newPoints: number, currentLogPoints: number) => void;
}

export default function DashboardView({
  userProfile,
  activeGroup,
  userRole = 'member',
  ranking,
  dailyPoints,
  streak,
  activityFeed = [],
  gallery = [],
  onBackToLobby,
  onCopyInvite,
  onUpdatePoints
}: DashboardViewProps) {
  const router = useRouter();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [dynamicMessage, setDynamicMessage] = useState<string>('');

  useEffect(() => {
    const fetchGreeting = async () => {
      console.log('[Dashboard] Fetching AI greeting...');
      try {
        const response = await fetch('/api/generate-greeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userProfile?.username,
            avatarUrl: userProfile?.avatar_url,
            streak,
            dailyPoints,
            dailyGoal,
            ranking
          })
        });
        
        if (!response.ok) {
          const errData = await response.json();
          console.error('[Dashboard] API Error:', errData);
          return;
        }

        const data = await response.json();
        console.log('[Dashboard] AI Greeting Received:', data.message);
        if (data.message) setDynamicMessage(data.message);
      } catch (err) {
        console.error('[Dashboard] Fetch Error:', err);
      }
    };

    if (userProfile?.username && activeGroup) {
      fetchGreeting();
    }
  }, [userProfile?.username, streak, dailyPoints, activeGroup?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushEnabled(Notification.permission === 'granted' || Notification.permission === 'denied');
    }
  }, []);

  const requestNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushEnabled(permission === 'granted' || permission === 'denied');
    }
  };

  const handleSavePoints = (user: any) => {
    if (onUpdatePoints && editingUserId) {
      const newValue = parseInt(editValue);
      if (!isNaN(newValue)) {
        const currentLogPoints = user.points - user.adjustment;
        onUpdatePoints(user.userId, newValue, currentLogPoints);
      }
      setEditingUserId(null);
    }
  };

  const dailyGoal = activeGroup?.daily_points_limit || 4;
  const progressPercent = Math.min((dailyPoints / dailyGoal) * 100, 100);
  const topUser = ranking.length > 0 ? ranking[0] : null;
  const isMinimalist = userProfile?.dashboard_style === 'minimalist';

  return (
    <div className={`min-h-full bg-[#000000] text-[#F0F0F6] font-sans relative overflow-x-hidden ${sora.className}`}>
      
      {/* Top Navigation */}
      <header className={`px-6 md:px-12 pt-8 pb-4 relative z-[60] flex items-center justify-between max-w-[1400px] mx-auto ${isMinimalist ? 'border-b border-white/5' : ''}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToLobby}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={18} className="text-[#808090] pr-0.5" />
          </button>
          
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-bold text-[#606070] uppercase tracking-widest">Plataforma</span>
            <span className="text-sm font-bold text-white tracking-tight">Oryon Forge</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Streak Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-lg">
            <div className="w-7 h-7 -my-2">
              <DotLottiePlayer
                src={dailyPoints > 0 ? "/Fire.lottie" : "/Grey Fire.lottie"}
                autoplay
                loop
              />
            </div>
            <span className={`text-sm font-black ${dailyPoints > 0 ? 'text-[#CCCC00]' : 'text-[#606070]'}`}>{streak}</span>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-xl">
            {activeGroup?.avatar_url ? (
              <div className="w-5 h-5 rounded-lg overflow-hidden border border-white/10">
                <img src={activeGroup.avatar_url} alt="Group" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-[#CCCC00] animate-pulse" />
            )}
            <span className="text-[10px] font-black text-white tracking-widest uppercase">{activeGroup?.name || 'Grupo'}</span>
          </div>

          <NotificationCenter />

          {['admin', 'manager'].includes(userRole) && (
            <button
              onClick={() => router.push(`/dashboard/${activeGroup.id}/configuracoes`)}
              className="flex md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-[#808090] active:scale-90"
            >
              <Settings size={18} />
            </button>
          )}

          <button
            onClick={() => router.push(`/dashboard/${activeGroup.id}/conquistas`)}
            className="hidden md:flex p-2 rounded-full bg-white/5 border border-white/10 text-[#808090] hover:text-[#CCCC00] hover:bg-[#CCCC00]/10 transition-all active:scale-90"
            title="Conquistas do Grupo"
          >
            <Trophy size={18} />
          </button>

          {['admin', 'manager'].includes(userRole) && (
            <button
              onClick={() => router.push(`/dashboard/${activeGroup.id}/configuracoes`)}
              className="hidden md:flex p-2 rounded-full bg-white/5 border border-white/10 text-[#808090] hover:text-[#CCCC00] hover:bg-[#CCCC00]/10 transition-all active:scale-90"
              title="Configurações do Grupo"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      </header>

      <main className={`px-6 md:px-12 pb-24 max-w-[1400px] mx-auto relative z-10 ${isMinimalist ? 'space-y-10 mt-10' : 'space-y-16'}`}>
        {!pushEnabled && (
          <div className="bg-[#CCCC00]/10 border border-[#CCCC00]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full shadow-lg">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-full bg-[#CCCC00]/20 flex items-center justify-center shrink-0">
                <BellRing size={18} className="text-[#CCCC00] animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Ative as Notificações</p>
                <p className="text-xs text-[#CCCC00]/70 font-medium">Não perca as atualizações do seu grupo.</p>
              </div>
            </div>
            <button 
              onClick={requestNotification}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#CCCC00] text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#ebd600] transition-all whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(204,204,0,0.3)]"
            >
              Ativar Push
            </button>
          </div>
        )}
        
        {/* HERO SECTION */}
        {isMinimalist ? (
          <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">Olá, {userProfile?.username || 'Atleta'}</h1>
              <p className="text-xs text-[#606070] font-medium uppercase tracking-[0.2em]">{streak} DIAS DE CONSISTÊNCIA NO GRUPO</p>
            </div>
            
            <div className="flex-1 max-w-md w-full">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-[#606070] uppercase tracking-widest">Progresso Diário</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{dailyPoints} / {dailyGoal} PTS</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-[#CCCC00]"
                />
              </div>
            </div>

            <button
              onClick={() => router.push(`/registro?groupId=${activeGroup?.id}`)}
              className="px-8 py-4 bg-[#CCCC00] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#ebd600] transition-all flex items-center gap-3"
            >
              <Plus size={16} strokeWidth={3} /> Registrar Treino
            </button>
          </section>
        ) : (
          <section className="relative rounded-[32px] overflow-hidden bg-[#0A0A0A] border border-white/[0.03] min-h-[420px] flex items-center shadow-2xl">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/90 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-[#000000]/30 z-10" />
              <div className="absolute top-0 right-0 w-3/4 h-full bg-[#CCCC00]/10 blur-[100px] z-10 pointer-events-none mix-blend-screen" />
              <Image 
                src="/imginicial2.webp" 
                alt="Athlete" 
                fill 
                className="object-cover object-[75%_25%] opacity-[0.35] mix-blend-luminosity"
                priority
              />
            </div>
            
            <div className="relative z-20 w-full p-10 md:p-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
              <div className="space-y-10 flex-1 w-full max-w-xl">
                <div>
                  <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour >= 5 && hour < 12) return 'Bom dia';
                      if (hour >= 12 && hour < 18) return 'Boa tarde';
                      return 'Boa noite';
                    })()},<br />
                    <span className="font-semibold text-white">{userProfile?.username || 'Atleta'}</span>
                  </h1>
                  <p className="text-[#808090] text-sm md:text-base mt-4 max-w-md font-light leading-relaxed min-h-[3em]">
                    {dynamicMessage ? (
                      dynamicMessage
                    ) : (
                      <span className="opacity-40 animate-pulse flex items-center gap-2 italic">
                        <Activity size={14} />
                        Analisando seu desempenho...
                      </span>
                    )}
                  </p>
                </div>

                <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-md">
                  <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-[#CCCC00]" />
                      <span className="text-xs font-medium text-[#808090] tracking-wider uppercase">Meta Diária</span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {dailyPoints} <span className="text-[#606070]">/ {dailyGoal} pts</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-[#CCCC00] rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                {/* Challenge Info Card */}
                {activeGroup?.created_at && (
                  <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex flex-col items-center md:items-start gap-1">
                    <div className="flex items-center gap-2 text-[#606070]">
                      <Clock size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Término do Desafio</span>
                    </div>
                    <span className="text-xs font-black text-[#CCCC00] uppercase italic">
                      {format(addDays(new Date(activeGroup.created_at), activeGroup.period_days || 45), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                )}

                {(userRole === 'admin' || userRole === 'moderator') && (
                  <button
                    onClick={onCopyInvite}
                    className="group relative px-6 py-5 bg-white/5 text-white font-semibold rounded-full flex items-center justify-center gap-3 hover:bg-white/10 transition-all w-full md:w-auto border border-white/10"
                  >
                    <UserPlus size={20} className="text-[#808090] group-hover:text-white transition-colors" />
                    <span>Convidar</span>
                  </button>
                )}
                <button
                  id="tutorial-registro"
                  onClick={() => router.push(`/registro?groupId=${activeGroup?.id}`)}
                  className="hidden md:flex group relative px-10 py-5 bg-[#CCCC00] text-[#000000] font-semibold rounded-full items-center justify-center gap-3 hover:bg-[#ebd600] active:scale-[0.98] transition-all w-full md:w-auto shadow-[0_0_40px_rgba(214,208,0,0.15)]"
                >
                  <Plus size={20} className="transition-transform group-hover:rotate-90" />
                  <span>Registrar Treino</span>
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: RANKING */}
          <div id="tutorial-ranking" className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black text-[#303035] uppercase tracking-[0.3em]">Classificação</h2>
              <span className="text-[10px] font-medium text-[#606070]">{ranking.length} membros</span>
            </div>

            {ranking.length === 0 ? (
              <div className="p-12 text-center text-[#606070] text-sm font-light border border-white/[0.03] rounded-[32px] bg-white/[0.01]">
                Nenhum registro encontrado.
              </div>
            ) : (
              <div className="space-y-2">
                {ranking.map((user, idx) => {
                  const position = idx + 1;
                  const isMe = user.username === userProfile?.username;
                  const isTop3 = position <= 3;

                  return (
                    <motion.div
                      key={user.username}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => router.push(`/membros/${user.userId}`)}
                      className={`group flex items-center justify-between transition-all duration-300 cursor-pointer ${
                        isMinimalist 
                          ? `p-3 rounded-xl border ${isMe ? 'bg-[#CCCC00]/5 border-[#CCCC00]/20' : 'bg-transparent border-white/5 hover:border-white/20'}`
                          : `p-4 md:p-5 rounded-[24px] border ${isMe ? 'bg-[#CCCC00]/5 border-[#CCCC00]/20 shadow-[0_0_20px_rgba(204,204,0,0.05)]' : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03] hover:border-white/10'}`
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-6 flex justify-center">
                          {isTop3 && !isMinimalist ? (
                            <Medal size={16} className={
                              position === 1 ? 'text-[#CCCC00]' : 
                              position === 2 ? 'text-[#C0C0C0]' : 'text-[#CD7F32]'
                            } />
                          ) : (
                            <span className={`text-[11px] font-black ${position === 1 ? 'text-[#CCCC00]' : 'text-[#606070]'}`}>{position}</span>
                          )}
                        </div>
                        
                        <div className="relative shrink-0">
                          {position === 1 && (
                            <div className="absolute inset-[-20%] z-20 pointer-events-none">
                              <img src="/molduratop1.png" className="w-full h-full object-contain" alt="Moldura Top 1" />
                            </div>
                          )}
                          <div className={`rounded-full flex items-center justify-center border transition-transform group-hover:scale-105 overflow-hidden ${
                            isMinimalist ? 'w-8 h-8' : 'w-10 h-10 md:w-12 md:h-12'
                          } ${isMe ? 'bg-[#CCCC00]/10 border-[#CCCC00]/30' : 'bg-white/5 border-white/10'}`}>
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className={`font-black ${isMinimalist ? 'text-xs' : 'text-sm md:text-base'} ${isMe ? 'text-[#CCCC00]' : 'text-[#808090]'}`}>
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
 
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className={`font-black tracking-tight text-white ${isMinimalist ? 'text-xs' : 'text-sm'}`}>
                              {user.username}
                            </span>
                            <span className="px-1 py-0.5 bg-[#CCCC00]/10 border border-[#CCCC00]/20 rounded text-[7px] font-black text-[#CCCC00] uppercase">
                              LVL {user.level || 1}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#606070] font-black uppercase tracking-[0.1em]">{user.title || 'Recruta'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <div className="text-right">
                          {editingUserId === user.userId ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-16 bg-white/10 border border-[#CCCC00]/30 rounded-lg px-2 py-1 text-white text-xs font-bold focus:outline-none focus:border-[#CCCC00]"
                                autoFocus
                              />
                              <button onClick={() => handleSavePoints(user)} className="p-1.5 bg-[#CCCC00] text-black rounded-lg">
                                <Save size={12} strokeWidth={3} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1">
                                <span className={`font-black tracking-tighter ${isMinimalist ? 'text-sm' : 'text-base md:text-lg'} ${isTop3 ? 'text-white' : 'text-[#808090]'}`}>
                                  {user.points}
                                </span>
                                <span className="text-[9px] font-black text-[#303035] uppercase">pts</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {userRole === 'admin' && editingUserId !== user.userId && (
                          <button onClick={() => { setEditingUserId(user.userId); setEditValue(user.points.toString()); }} className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={10} className="text-[#303035] hover:text-[#CCCC00]" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: HIGHLIGHT & ACTIVITY FEED */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            {/* ACTIVITY FEED */}
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-[#303035] uppercase tracking-[0.3em] mb-6">Atividade Recente</h2>
              <div className="space-y-2">
                {activityFeed.length > 0 ? (
                  <>
                    {activityFeed.slice(0, isMinimalist ? 5 : 3).map((activity, idx) => (
                      <motion.div 
                        key={activity.id} 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex gap-3 items-center p-3 border transition-colors ${
                          isMinimalist 
                            ? 'bg-transparent border-white/5 rounded-xl hover:bg-white/[0.02]' 
                            : 'bg-white/[0.01] border-white/[0.03] rounded-[24px] hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {activity.avatar_url ? (
                            <img src={activity.avatar_url} alt={activity.username} className="w-full h-full object-cover" />
                          ) : (
                            <Activity size={12} className="text-[#303035]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-[#F0F0F6] truncate">
                            <span className="font-black text-white">{activity.username}</span> • <span className="text-[#606070]">{activity.activity_type}</span>
                          </p>
                          <p className="text-[9px] text-[#303035] font-black uppercase tracking-widest mt-0.5">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                            <span className="mx-2 text-[#CCCC00]">+{activity.points}PTS</span>
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <div className="p-10 text-center text-[#606070] text-xs border border-white/[0.03] rounded-3xl">
                    Nenhuma atividade registrada.
                  </div>
                )}
              </div>
            </div>

            {/* SOCIAL FEED SECTION */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-[#303035] uppercase tracking-[0.3em]">Feed Social</h2>
              <button 
                onClick={() => router.push(`/dashboard/${activeGroup?.id}/feed`)}
                className={`w-full group relative overflow-hidden transition-all duration-500 border border-white/5 ${
                  isMinimalist ? 'rounded-2xl bg-white/[0.02] p-6' : 'rounded-[2rem] bg-[#0A0A0A] p-8 md:p-12'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                  <div className={`${isMinimalist ? 'w-10 h-10' : 'w-16 h-16'} rounded-2xl bg-[#CCCC00]/10 border border-[#CCCC00]/20 flex items-center justify-center`}>
                    <Activity size={isMinimalist ? 18 : 28} className="text-[#CCCC00]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-black text-white uppercase tracking-tighter ${isMinimalist ? 'text-sm' : 'text-lg'}`}>Feed Social</h3>
                    <p className="text-[#606070] text-[10px] font-medium uppercase tracking-widest">Ver fotos e técnica</p>
                  </div>
                </div>
              </button>
            </section>
          </div>
        </div>

        {/* Brand Credit Footer */}
        <footer className="px-6 md:px-12 py-12 flex flex-col items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
          <a 
            href="https://studiooryon.pro" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group/footer"
          >
            <span className="text-[8px] font-black text-[#606070] uppercase tracking-[0.3em] group-hover/footer:text-[#CCCC00] transition-colors">Desenvolvido por</span>
            <span className="text-xs font-black text-white uppercase tracking-tighter italic group-hover/footer:scale-105 transition-transform">Studio Oryon</span>
          </a>
          <p className="text-[8px] text-[#303035] font-bold uppercase tracking-widest">© 2026 Oryon Forge</p>
        </footer>
      </main>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-28 right-6 z-50">
        <motion.button
          onClick={() => router.push(`/registro?groupId=${activeGroup?.id}`)}
          className={`w-14 h-14 bg-[#CCCC00] text-black flex items-center justify-center shadow-2xl relative overflow-hidden ${
            isMinimalist ? 'rounded-2xl' : 'rounded-full'
          }`}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={28} strokeWidth={3} />
          {!isMinimalist && (
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border-2 border-[#CCCC00] rounded-full"
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}
