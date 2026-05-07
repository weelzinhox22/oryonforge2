'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Key, ChevronRight, Users, LogOut, Search, 
  Activity, Trophy, Clock, ChevronLeft, Calendar, 
  Hash, AlignLeft, Send, Sparkles, Flame, Image as ImageIcon,
  Lock, Globe, ShieldCheck, Check, Info, Settings, LayoutGrid,
  Zap, CheckCircle2, User, ArrowRight, HelpCircle, BarChart3, Target
} from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { DotLottiePlayer } from '@dotlottie/react-player';
import NotificationCenter from './NotificationCenter';

const pjs = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

interface LobbyViewProps {
  userProfile: any;
  userGroups: any[];
  activityFeed: any[];
  streak: number;
  session: any;
  supabase: SupabaseClient;
  onSelectGroup: (idx: number) => void;
  onRefresh: () => Promise<any>;
  toast: { isVisible: boolean; message: string; type: 'error' | 'success' };
  setToast: (toast: { isVisible: boolean; message: string; type: 'error' | 'success' }) => void;
  onSignOut?: () => void;
  dailyPoints?: number;
  userAchievements?: any[];
  totalXP?: number;
}

export default function LobbyView({
  userProfile,
  userGroups,
  activityFeed,
  streak,
  supabase,
  onSelectGroup,
  onRefresh,
  setToast,
  onSignOut,
  dailyPoints = 0,
  userAchievements = [],
  totalXP = 0,
}: LobbyViewProps) {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'create' | 'join'>('list');
  
  // Create Group State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupDays, setNewGroupDays] = useState('30');
  const [newGroupLimit, setNewGroupLimit] = useState('4');
  const [newGroupVisibility, setNewGroupVisibility] = useState<'public' | 'private'>('public');
  const [newGroupApproval, setNewGroupApproval] = useState(false);
  const [newGroupType, setNewGroupType] = useState('geral');
  const [newGroupAvatar, setNewGroupAvatar] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Join State
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navStyle, setNavStyle] = useState<'standard' | 'hamburger'>(userProfile?.ui_preferences?.nav_style || 'standard');

  const toggleNavStyle = async () => {
    const newStyle = navStyle === 'standard' ? 'hamburger' : 'standard';
    setNavStyle(newStyle);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          ui_preferences: { 
            ...userProfile?.ui_preferences, 
            nav_style: newStyle 
          } 
        })
        .eq('id', userProfile?.id);
      
      if (error) throw error;
      setToast({ isVisible: true, message: 'Preferência de navegação atualizada.', type: 'success' });
    } catch (err: any) {
      console.error('Erro ao salvar preferência:', err);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    try {
      const { data: groupId, error } = await supabase.rpc('join_group_by_code', {
        invite_code_param: joinCode.trim().toUpperCase(),
      });
      if (error) throw error;
      setToast({ isVisible: true, message: 'Grupo acessado com sucesso.', type: 'success' });
      setJoinCode('');
      setView('list');

      await new Promise((r) => setTimeout(r, 2500));
      const groups = await onRefresh();
      if (groups && groups.length > 0) {
        const idx = groups.findIndex((g: any) => g.group_id === groupId);
        onSelectGroup(idx !== -1 ? idx : 0);
      }
    } catch (err: any) {
      setToast({ isVisible: true, message: err.message || 'Código inválido.', type: 'error' });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setIsCreating(true);
    try {
      const { data: groupId, error } = await supabase.rpc('create_group_v2', {
        group_name: newGroupName.trim(),
        group_description: newGroupDescription.trim() || null,
        group_period_days: parseInt(newGroupDays) || 30,
        group_visibility: newGroupVisibility,
        group_requires_approval: newGroupApproval,
        group_daily_points_limit: parseInt(newGroupLimit) || 4,
        group_challenge_type: newGroupType,
        group_avatar_url: newGroupAvatar || null
      });
      
      if (error) throw error;
      
      setToast({ isVisible: true, message: 'Grupo criado com sucesso.', type: 'success' });
      setView('list');

      await new Promise((r) => setTimeout(r, 2500));
      const groups = await onRefresh();
      if (groups && groups.length > 0) {
        const idx = groups.findIndex((g: any) => g.group_id === groupId);
        onSelectGroup(idx !== -1 ? idx : 0);
      }
    } catch (err: any) {
      setToast({ isVisible: true, message: err.message || 'Erro ao criar grupo.', type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
  };

  if (view === 'list') {
    return (
      <motion.div 
        key="list-view"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`min-h-full bg-[#000000] text-[#F0F0F6] relative overflow-x-hidden ${pjs.className}`}
      >
        {/* Subtle Background Depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-gradient-to-b from-[#CCCC00]/[0.02] to-transparent pointer-events-none" />

        {/* Header */}
        <header className="px-6 md:px-12 pt-16 pb-10 border-b border-white/[0.04] relative z-[60]">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {navStyle === 'hamburger' && (
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                >
                  <AlignLeft size={20} className="text-[#CCCC00]" />
                </button>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic">
                  Visão Geral
                </h1>
                <div className="flex items-center gap-3 text-[#606070] text-sm font-medium">
                  <span className="flex items-center gap-2">
                    Olá, {userProfile?.username || 'Usuário'}
                    <span className="px-1.5 py-0.5 bg-[#CCCC00]/10 border border-[#CCCC00]/20 rounded text-[8px] font-black text-[#CCCC00] uppercase">
                      LVL {userProfile?.level || 1}
                    </span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <NotificationCenter />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                <div className="w-7 h-7 -my-2">
                  <DotLottiePlayer
                    src={dailyPoints > 0 ? "/Fire.lottie" : "/Grey Fire.lottie"}
                    autoplay
                    loop
                  />
                </div>
                <span className={`font-black tracking-tight ${dailyPoints > 0 ? 'text-[#CCCC00]' : 'text-[#606070]'}`}>
                  {streak} Dias
                </span>
              </div>
              
              {onSignOut && (
                <button 
                  onClick={onSignOut}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/20 group transition-all"
                >
                  <LogOut size={16} className="text-[#606070] group-hover:text-red-500" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* FULL SCREEN MENU OVERLAY */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col p-8 md:p-20"
            >
              <div className="flex items-center justify-between mb-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#CCCC00] flex items-center justify-center font-black text-black text-xl">O</div>
                  <span className="text-xl font-black uppercase italic tracking-tighter">Oryon</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>

              <nav className="flex-1 space-y-4">
                {[
                  { label: 'Painel Principal', icon: LayoutGrid, href: '/dashboard' },
                  { label: 'Conquistas', icon: Trophy, href: '/perfil/conquistas' },
                  { label: 'Ranking Global', icon: ShieldCheck, href: '/ranking' },
                  { label: 'Registrar Atividade', icon: Zap, href: '/registro' },
                  { label: 'Perfil', icon: User, href: '/perfil' },
                  { label: 'Configurações', icon: Settings, href: '/perfil/configuracoes' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push(item.href);
                      }}
                      className="flex items-center gap-5 group py-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-[#CCCC00]/10 group-hover:border-[#CCCC00]/20 transition-all">
                        <item.icon size={18} className="text-[#606070] group-hover:text-[#CCCC00]" />
                      </div>
                      <span className="text-lg md:text-xl font-bold text-[#606070] group-hover:text-white uppercase tracking-wider transition-all">
                        {item.label}
                      </span>
                    </button>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <p className="text-[10px] font-black text-[#303035] uppercase tracking-widest">Configurações de Navegação</p>
                    <button 
                      onClick={toggleNavStyle}
                      className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <span className="text-xs font-bold uppercase tracking-tight">
                        {navStyle === 'standard' ? 'Barra de Navegação' : 'Menu Lateral'}
                      </span>
                      <div className={`w-10 h-5 rounded-full p-1 transition-all ${navStyle === 'hamburger' ? 'bg-[#CCCC00]' : 'bg-white/10'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-all ${navStyle === 'hamburger' ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[#303035]">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Oryon v2.0</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="px-6 md:px-12 py-10 max-w-[1400px] mx-auto relative z-10 space-y-20">
          
          {/* PERFORMANCE HUB (HERO) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div id="tutorial-xp" className="lg:col-span-7 bg-[#0A0A0A]/60 backdrop-blur-3xl border border-white/[0.05] rounded-[3rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
               {/* Ambient Glow */}
               <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#CCCC00]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#CCCC00]/10 transition-all duration-700" />
               
               <div className="flex-1 w-full space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                     <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight leading-tight">
                          Seu Progresso
                        </h2>
                     </div>
                     <div className="text-left md:text-right">
                        <div className="text-[10px] font-black text-[#606070] uppercase tracking-[0.2em] mb-1">Status de Evolução</div>
                        <div className="flex items-center gap-2">
                           <span className="text-2xl font-black text-white italic tracking-tighter">LVL {userProfile?.level || 1}</span>
                           <div className="w-[1px] h-4 bg-white/10" />
                           <span className="text-sm font-black text-[#CCCC00] italic tracking-tighter">{totalXP} XP TOTAL</span>
                        </div>
                     </div>
                  </div>

                  {/* XP PROGRESS BAR */}
                  <div className="space-y-3">
                     <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-[#303035] uppercase tracking-[0.3em]">Próximo Nível</span>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{totalXP % 500} / 500 XP</span>
                     </div>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(totalXP % 500) / 500 * 100}%` }}
                           transition={{ duration: 1, ease: "easeOut" }}
                           className="h-full bg-gradient-to-r from-[#CCCC00] to-[#888800] rounded-full shadow-[0_0_10px_rgba(204,204,0,0.3)]"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* QUICK ACHIEVEMENTS SCROLL */}
            <div className="lg:col-span-5 bg-[#0A0A0A]/40 backdrop-blur-2xl border border-white/[0.05] rounded-[3rem] p-8 flex flex-col justify-between">
               <div className="flex items-center justify-between mb-6 px-2">
                  <h3 className="text-[10px] font-black text-[#303035] uppercase tracking-[0.3em]">Últimas Conquistas</h3>
                  <button className="text-[9px] font-black text-[#CCCC00] uppercase tracking-widest hover:underline transition-all">Ver Todas</button>
               </div>

               <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {userAchievements.length > 0 ? (
                    userAchievements.map((ua, i) => (
                      <motion.div 
                        key={ua.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-24 shrink-0 flex flex-col items-center gap-3"
                      >
                         <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center p-3 group relative cursor-pointer">
                            <img 
                              src={ua.achievements?.icon_url} 
                              alt={ua.achievements?.title} 
                              className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500" 
                            />
                            {/* Hover Tooltip Placeholder */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 rounded-2xl">
                               <span className="text-[7px] font-black text-white uppercase text-center tracking-tighter">{ua.achievements?.title}</span>
                            </div>
                         </div>
                         <span className="text-[8px] font-black text-[#606070] uppercase text-center leading-tight truncate w-full">{ua.achievements?.title}</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-4 text-center opacity-30">
                       <Sparkles size={32} className="mb-2 text-[#303035]" />
                       <p className="text-[9px] font-black uppercase tracking-widest">Nenhuma conquista desbloqueada ainda</p>
                    </div>
                  )}
                  {/* Empty States / Example Achievements if user has none */}
                  {userAchievements.length === 0 && [
                    { title: 'Projeto Verão', icon: '/conquistas/projetoverao.png' },
                    { title: 'Modo Caverna', icon: '/conquistas/modocaverna.png' }
                  ].map((ex, i) => (
                    <div key={i} className="w-24 shrink-0 flex flex-col items-center gap-3 opacity-20 filter grayscale">
                       <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center p-4">
                          <img src={ex.icon} className="w-full h-full object-contain" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </section>
          
          {/* Two-Column Layout for Groups & Activity (Moved to Top) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Groups Section */}
            <section id="tutorial-groups" className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                    <Users size={16} className="text-[#606070]" />
                  </div>
                  <h2 className="text-[10px] font-black text-[#303035] uppercase tracking-[0.3em]">Comunidades Ativas</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline-block text-[10px] font-black text-[#CCCC00] bg-[#CCCC00]/5 px-4 py-1.5 rounded-full border border-[#CCCC00]/10 uppercase tracking-widest">{userGroups.length} Conexões</span>
                  <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#606070] hover:text-[#CCCC00] hover:border-[#CCCC00]/30 transition-all">
                    <AlignLeft size={16} />
                  </button>
                </div>
              </div>
              
              {userGroups.length > 0 ? (
                <div className={`grid gap-5 ${userProfile?.dashboard_style === 'minimalist' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {userGroups.map((ug, i) => (
                    userProfile?.dashboard_style === 'minimalist' ? (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={ug.group_id}
                        onClick={() => onSelectGroup(i)}
                        className="flex items-center gap-4 bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/[0.04] rounded-2xl p-4 hover:bg-white/[0.02] hover:border-[#CCCC00]/30 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden border border-white/5 group-hover:border-[#CCCC00]/20 transition-all">
                          {ug.groups.avatar_url ? (
                            <img src={ug.groups.avatar_url} alt="Group" className="w-full h-full object-cover" />
                          ) : (
                            <Users size={18} className="text-[#303035] group-hover:text-[#CCCC00]" />
                          )}
                        </div>
                        <div className="min-w-0 text-left">
                          <h3 className="text-sm font-black text-white truncate uppercase tracking-tight italic group-hover:text-[#CCCC00] transition-colors">{ug.groups.name}</h3>
                          <p className="text-[9px] text-[#606070] font-black uppercase tracking-widest mt-0.5">{ug.groups.period_days} DIAS</p>
                        </div>
                        <ChevronRight size={14} className="ml-auto text-[#202025] group-hover:text-[#CCCC00] group-hover:translate-x-1 transition-all" />
                      </motion.button>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={ug.group_id}
                        onClick={() => onSelectGroup(i)}
                        className="text-left bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/[0.04] rounded-[2.5rem] p-8 hover:bg-white/[0.02] hover:border-white/10 transition-all group flex flex-col justify-between min-h-[200px]"
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center group-hover:bg-[#CCCC00]/10 transition-all group-hover:rotate-6 border border-white/5 group-hover:border-[#CCCC00]/20 overflow-hidden">
                            {ug.groups.avatar_url ? (
                              <img src={ug.groups.avatar_url} alt="Group" className="w-full h-full object-cover" />
                            ) : (
                              <Users size={24} className="text-[#303035] group-hover:text-[#CCCC00]" />
                            )}
                          </div>
                          {ug.role === 'admin' && (
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-[#CCCC00] uppercase tracking-widest bg-[#CCCC00]/5 px-3 py-1.5 rounded-full border border-[#CCCC00]/10">
                              <ShieldCheck size={10} /> Admin
                            </div>
                          )}
                        </div>
                        <div className="mt-8">
                          <h3 className="text-xl font-black text-white group-hover:text-[#CCCC00] transition-colors truncate mb-2 uppercase tracking-tight italic">{ug.groups.name}</h3>
                          <div className="flex items-center gap-4">
                            <p className="text-[10px] text-[#606070] font-black uppercase tracking-widest flex items-center gap-2">
                              Ciclo: {ug.groups.period_days} Dias
                            </p>
                            {ug.last_activity_at && (
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-[#CCCC00] shadow-[0_0_8px_#CCCC00]" />
                                <span className="text-[9px] font-black text-[#CCCC00] uppercase tracking-tighter italic">
                                  Ativo {formatDistanceToNow(new Date(ug.last_activity_at), { addSuffix: true, locale: ptBR })}
                                </span>
                              </div>
                            )}
                            <ChevronRight size={14} className="text-[#303035] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </div>
                        </div>
                      </motion.button>
                    )
                  ))}
                </div>
              ) : (
                <div className="bg-[#0A0A0A]/40 backdrop-blur-2xl border border-white/[0.04] rounded-[3rem] p-20 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5">
                    <Search size={32} className="text-[#202025]" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 uppercase italic tracking-tight">Nenhum grupo encontrado</h3>
                  <p className="text-sm text-[#606070] max-w-xs leading-relaxed font-medium">Você ainda não faz parte de nenhuma comunidade. Comece criando uma ou use um código de acesso.</p>
                </div>
              )}
            </section>

            {/* Global Activity */}
            <section className="lg:col-span-4 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                  <Clock size={16} className="text-[#606070]" />
                </div>
                <h2 className="text-[10px] font-black text-[#303035] uppercase tracking-[0.3em]">Feed de Atividade</h2>
              </div>
              <div className="bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/[0.04] rounded-[2.5rem] p-8 space-y-10">
                {activityFeed && activityFeed.length > 0 ? (
                  activityFeed.map((activity, i) => (
                    <motion.div 
                      key={activity.id} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-5 group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#CCCC00]/10 transition-colors">
                        <span className="text-sm font-black text-[#303035] group-hover:text-[#CCCC00] transition-colors">
                          {activity.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1.5">
                          <p className="text-[13px] text-[#F0F0F6] leading-tight">
                            <span className="font-black uppercase italic tracking-tighter">{activity.username}</span> 
                            <span className="text-[#606070] ml-1">registrou</span> 
                            <span className="text-[#CCCC00] font-black ml-1 uppercase italic tracking-tighter"> {activity.activity_type}</span>
                          </p>
                          <span className="text-[10px] font-black text-[#CCCC00] bg-[#CCCC00]/5 px-2 py-0.5 rounded border border-[#CCCC00]/10">+{activity.points}</span>
                        </div>
                        <p className="text-[10px] text-[#303035] font-black uppercase tracking-widest">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })} • {activity.group_name}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-10">
                    <Activity size={40} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem atualizações</p>
                  </div>
                )}
                
                {activityFeed && activityFeed.length > 0 && (
                  <div className="pt-8 border-t border-white/[0.04] text-center">
                    <button className="text-[10px] font-black text-[#606070] hover:text-white uppercase tracking-[0.3em] transition-all">Ver Histórico Global</button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Quick Actions Grid (Updated) */}
          <section>
            <h2 className="text-[10px] font-black text-[#303035] uppercase tracking-[0.3em] mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: 'Criar Grupo', icon: Plus, onClick: () => setView('create'), primary: true },
                { label: 'Entrar com Código', icon: Key, onClick: () => setView('join') },
              ].map((action, i) => (
                <button 
                  key={action.label}
                  onClick={action.onClick} 
                  className={`flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 group ${
                    action.primary 
                      ? 'bg-[#0A0A0A] border-white/5 hover:border-[#CCCC00]/40' 
                      : 'bg-[#0A0A0A] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                    action.primary ? 'bg-[#CCCC00]/10 text-[#CCCC00]' : 'bg-white/5 text-[#606070]'
                  }`}>
                    <action.icon size={16} />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* WHY ORYON? (MARKETING) */}
          <section className="space-y-12">
             <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">O Ecossistema <span className="text-[#CCCC00]">Oryon Forge</span></h2>
                <p className="text-[#606070] text-sm font-medium max-w-2xl mx-auto">Mais que um rastreador. Uma rede neural de performance onde cada movimento conta.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { 
                    title: 'Treine com Propósito', 
                    desc: 'Registre suas atividades com provas visuais e converta esforço em métricas reais de XP.', 
                    icon: Activity,
                    color: '#CCCC00'
                  },
                  { 
                    title: 'Domine o Ranking', 
                    desc: 'Compita em tempo real com sua unidade e prove quem é o atleta mais consistente.', 
                    icon: Trophy,
                    color: '#F0F0F6'
                  },
                  { 
                    title: 'Desbloqueie Legado', 
                    desc: 'Colecione medalhas raras e evolua seu nível para desbloquear títulos exclusivos na rede.', 
                    icon: Sparkles,
                    color: '#606070'
                  }
                ].map((item, i) => (
                  <div key={i} className="bg-[#0A0A0A]/40 border border-white/[0.04] rounded-[2.5rem] p-10 hover:border-[#CCCC00]/20 transition-all group">
                     <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <item.icon size={24} style={{ color: item.color }} />
                     </div>
                     <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-4">{item.title}</h3>
                     <p className="text-xs text-[#606070] font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
             </div>
          </section>

          {/* SPECIAL MODALITIES SECTION (Updated to 3 columns on mobile) */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCCC00]" />
                <h2 className="text-[10px] font-black text-[#606070] uppercase tracking-[0.3em]">Modalidades em Destaque</h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {[
                { id: 'bike-rua', title: 'Bike', lottie: '/Cycling.lottie', desc: 'Outdoor' },
                { id: 'esteira', title: 'Treadmill', lottie: '/esteira.lottie', desc: 'Indoor' },
                { id: 'corrida', title: 'Running', lottie: '/runing.lottie', desc: 'Pace' },
              ].map((mod) => (
                <motion.div
                  key={mod.id}
                  whileHover={{ y: -8 }}
                  className="group relative bg-[#0A0A0A] border border-white/[0.04] rounded-[24px] p-4 md:p-8 overflow-hidden hover:border-[#CCCC00]/30 transition-all duration-500 flex flex-col items-center text-center"
                >
                  <div className="w-full aspect-square mb-4 relative">
                    <DotLottiePlayer
                      src={mod.lottie}
                      autoplay
                      loop
                      className="w-full h-full"
                    />
                  </div>
                  
                  <h3 className="text-[10px] md:text-xl font-bold text-white uppercase italic tracking-tight mb-1">{mod.title}</h3>
                  <p className="hidden md:block text-xs text-[#606070] font-medium leading-relaxed">{mod.desc}</p>

                  <button 
                    onClick={() => router.push(`/registro?activity=${mod.id}`)}
                    className="mt-4 md:mt-8 w-full py-2 md:py-4 rounded-xl bg-white/5 border border-white/5 text-[8px] md:text-[10px] font-black text-[#808090] uppercase tracking-widest group-hover:bg-[#CCCC00] group-hover:text-black transition-all"
                  >
                    Bora
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ACHIEVEMENT SHOWCASE */}
          <section className="space-y-10">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                   <Sparkles size={16} className="text-[#CCCC00]" />
                </div>
                <h2 className="text-[10px] font-black text-[#303035] uppercase tracking-[0.3em]">Catálogo de Honra</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Projeto Verão', desc: 'Registre 20 atividades físicas.', icon: '/conquistas/projetoverao.png', points: 50 },
                  { title: 'Modo Caverna', desc: '7 dias seguidos sem faltar.', icon: '/conquistas/modocaverna.png', points: 100 },
                  { title: 'Tanque de Guerra', desc: 'Acumule 100 pontos totais.', icon: '/conquistas/tanquedeguerra.png', points: 150 },
                  { title: 'CEO da Academia', desc: 'Crie seu primeiro grupo.', icon: '/conquistas/CEOdaacademia.png', points: 30 }
                ].map((ach, i) => (
                  <div key={i} className="bg-[#0A0A0A] border border-white/[0.04] rounded-[2rem] p-6 flex flex-col items-center text-center group hover:bg-white/[0.02] transition-all">
                     <div className="w-24 h-24 mb-6 relative">
                        <img src={ach.icon} alt={ach.title} className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500" />
                     </div>
                     <h3 className="text-sm font-black text-white uppercase italic tracking-tight mb-2">{ach.title}</h3>
                     <p className="text-[10px] text-[#606070] font-medium leading-relaxed mb-6">{ach.desc}</p>
                     <div className="mt-auto px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-[#CCCC00] uppercase tracking-widest">
                        +{ach.points} XP
                     </div>
                  </div>
                ))}
             </div>
          </section>
        </main>
      </motion.div>
    );
  }

  // ────────────── JOIN VIEW (NEW PREMIUM FLOW) ──────────────
  if (view === 'join') {
    return (
      <motion.div 
        key="join-view"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`min-h-full bg-[#000000] text-[#F0F0F6] ${pjs.className}`}
      >
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#CCCC00]/[0.03] rounded-full blur-[120px]" />
        </div>

        <header className="px-6 md:px-12 py-10 border-b border-white/[0.04] relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('list')}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
            >
              <ChevronLeft size={20} className="text-[#606070]" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight uppercase italic">Entrar em Grupo</h1>
              <p className="text-xs text-[#606070] font-medium">Acesse uma comunidade existente</p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
          
          {/* Left: Input Form */}
          <div className="lg:col-span-6 space-y-12">
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#CCCC00]/10 flex items-center justify-center">
                  <Key size={16} className="text-[#CCCC00]" />
                </div>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">Código de Convite</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#606070] uppercase tracking-wider ml-1">Insira o código</label>
                  <div className="relative">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-[#303035]" size={20} />
                    <input 
                      type="text" 
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Ex: AB12CD"
                      maxLength={6}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-xl text-white placeholder:text-[#202025] focus:border-[#CCCC00]/50 focus:bg-[#CCCC00]/5 transition-all outline-none font-black tracking-[0.3em]"
                    />
                  </div>
                  <p className="text-[11px] text-[#606070] ml-1 leading-relaxed">
                    O código deve conter 6 caracteres alfanuméricos. Solicite ao administrador do grupo se ainda não possui um.
                  </p>
                </div>

                <button
                  onClick={handleJoinGroup}
                  disabled={!joinCode.trim() || isJoining}
                  className="w-full py-6 rounded-2xl font-extrabold text-sm uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-20 mt-8 overflow-hidden"
                >
                  {isJoining ? (
                    <div className="w-12 h-12 -my-4">
                      <DotLottiePlayer
                        src="/Loading.lottie"
                        autoplay
                        loop
                      />
                    </div>
                  ) : (
                    <>Acessar Grupo <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* Right: Info/Benefits Panel */}
          <div className="lg:col-span-6 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                <HelpCircle size={16} className="text-[#606070]" />
              </div>
              <h2 className="text-xs font-extrabold text-[#606070] uppercase tracking-widest">Como funciona</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                    <Activity size={24} className="text-[#606070]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-tight mb-1">Registro de Atividades</h3>
                    <p className="text-xs text-[#606070] leading-relaxed">Ao entrar, você poderá registrar seus treinos e converter esforço em pontuação para o grupo.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                    <BarChart3 size={24} className="text-[#606070]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-tight mb-1">Ranking de Performance</h3>
                    <p className="text-xs text-[#606070] leading-relaxed">Sua posição no ranking é atualizada em tempo real conforme você e seus colegas evoluem.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                    <Sparkles size={24} className="text-[#CCCC00]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-tight mb-1">Conquistas & Streaks</h3>
                    <p className="text-xs text-[#606070] leading-relaxed">Mantenha a constância para aumentar seu streak e desbloquear novas métricas de performance.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#CCCC00]/5 border border-[#CCCC00]/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <Info size={18} className="text-[#CCCC00] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#606070] font-medium leading-relaxed">
                    Se o grupo for <span className="text-[#CCCC00] font-bold">privado</span>, sua solicitação será enviada para o administrador e você será notificado assim que for aprovado.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </main>
      </motion.div>
    );
  }

  // ────────────── CREATE VIEW (NEW PREMIUM FLOW) ──────────────
  return (
    <motion.div 
      key="create-view"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`min-h-full bg-[#000000] text-[#F0F0F6] ${pjs.className}`}
    >
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#CCCC00]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-[#CCCC00]/[0.01] rounded-full blur-[100px]" />
      </div>

      <header className="px-6 md:px-12 py-10 border-b border-white/[0.04] relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('list')}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
          >
            <ChevronLeft size={20} className="text-[#606070]" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight uppercase italic">Novo Grupo</h1>
            <p className="text-xs text-[#606070] font-medium">Configuração de desafio e comunidade</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 space-y-12 pb-20">
          
          {/* Section: Informações Básicas */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#CCCC00]/10 flex items-center justify-center">
                <Users size={16} className="text-[#CCCC00]" />
              </div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">Informações Básicas</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-[#606070] uppercase tracking-wider ml-1">Icone do Grupo</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'group_icon_1_1.png', 'group_icon_1_2.png', 'group_icon_2_1.png', 'group_icon_2_2.png',
                    'group_icon_3_1.png', 'group_icon_3_2.png', 'group_icon_4_1.png', 'group_icon_5_1.png'
                  ].map(avatar => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setNewGroupAvatar(`/avatars_group/${avatar}`)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                        newGroupAvatar === `/avatars_group/${avatar}` 
                          ? 'border-[#CCCC00] scale-110 shadow-[0_0_15px_rgba(204,204,0,0.3)]' 
                          : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img src={`/avatars_group/${avatar}`} alt="Icon" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
          <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#606070] uppercase tracking-wider ml-1">Nome do Grupo</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Time de Elite 2026"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-[#303035] focus:border-[#CCCC00]/50 focus:bg-white/[0.02] transition-all outline-none"
                />
              </div>
                <textarea 
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Descreva o propósito e as regras do seu grupo..."
                  rows={3}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-[#303035] focus:border-[#CCCC00]/50 focus:bg-white/[0.02] transition-all outline-none resize-none"
                />
              </div>
            </div>
          </section>

          {/* Section: Configurações do Desafio */}
          <section className="space-y-8 pt-8 border-t border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#CCCC00]/10 flex items-center justify-center">
                <Trophy size={16} className="text-[#CCCC00]" />
              </div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">Configurações do Desafio</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#606070] uppercase tracking-wider ml-1">Duração (Dias)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#303035]" size={16} />
                  <input 
                    type="number" 
                    value={newGroupDays}
                    onChange={(e) => setNewGroupDays(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:border-[#CCCC00]/50 transition-all outline-none font-bold"
                  />
                </div>
                <p className="text-[10px] text-[#606070] ml-1">Tempo total da competição antes do reset.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#606070] uppercase tracking-wider ml-1">Limite Diário (Pontos)</label>
                <div className="relative">
                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-[#303035]" size={16} />
                  <input 
                    type="number" 
                    value={newGroupLimit}
                    onChange={(e) => setNewGroupLimit(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:border-[#CCCC00]/50 transition-all outline-none font-bold"
                  />
                </div>
                <p className="text-[10px] text-[#606070] ml-1">Pontuação máxima permitida por dia.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="text-[11px] font-bold text-[#606070] uppercase tracking-wider ml-1 mb-2 block">Tipo de Desafio</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['geral', 'academia', 'corrida', 'outros'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewGroupType(type)}
                    className={`px-4 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${
                      newGroupType === type 
                        ? 'bg-[#CCCC00] text-black border-[#CCCC00]' 
                        : 'bg-[#0A0A0A] border-white/5 text-[#606070] hover:border-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Privacidade & Moderação */}
          <section className="space-y-8 pt-8 border-t border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#CCCC00]/10 flex items-center justify-center">
                <ShieldCheck size={16} className="text-[#CCCC00]" />
              </div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">Privacidade & Moderação</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setNewGroupVisibility(newGroupVisibility === 'public' ? 'private' : 'public')}
                className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                  newGroupVisibility === 'public' 
                    ? 'bg-white/[0.02] border-white/10' 
                    : 'bg-[#CCCC00]/5 border-[#CCCC00]/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${newGroupVisibility === 'public' ? 'bg-white/5 text-[#606070]' : 'bg-[#CCCC00] text-black'}`}>
                    {newGroupVisibility === 'public' ? <Globe size={18} /> : <Lock size={18} />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white uppercase">Visibilidade</p>
                    <p className="text-[10px] text-[#606070] font-medium">{newGroupVisibility === 'public' ? 'Aberto a todos' : 'Apenas convidados'}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newGroupVisibility === 'private' ? 'border-[#CCCC00] bg-[#CCCC00]' : 'border-white/10'}`}>
                  {newGroupVisibility === 'private' && <Check size={12} className="text-black" />}
                </div>
              </button>

              <button 
                onClick={() => setNewGroupApproval(!newGroupApproval)}
                className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                  !newGroupApproval 
                    ? 'bg-white/[0.02] border-white/10' 
                    : 'bg-[#CCCC00]/5 border-[#CCCC00]/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!newGroupApproval ? 'bg-white/5 text-[#606070]' : 'bg-[#CCCC00] text-black'}`}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white uppercase">Aprovação</p>
                    <p className="text-[10px] text-[#606070] font-medium">{newGroupApproval ? 'Moderado' : 'Entrada Livre'}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newGroupApproval ? 'border-[#CCCC00] bg-[#CCCC00]' : 'border-white/10'}`}>
                  {newGroupApproval && <Check size={12} className="text-black" />}
                </div>
              </button>
            </div>
          </section>

          <div className="pt-8">
            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || isCreating}
              className="w-full py-6 rounded-2xl font-extrabold text-sm uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.05)] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-20 overflow-hidden"
            >
              {isCreating ? (
                <div className="w-12 h-12 -my-4">
                  <DotLottiePlayer
                    src="/Loading.lottie"
                    autoplay
                    loop
                  />
                </div>
              ) : 'Criar Grupo'}
            </button>
          </div>

        </div>

        {/* Right: Live Preview Panel */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                <LayoutGrid size={16} className="text-[#606070]" />
              </div>
              <h2 className="text-xs font-extrabold text-[#606070] uppercase tracking-widest">Prévia do Grupo</h2>
            </div>

            <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-[2.5rem] overflow-hidden shadow-2xl">
              {/* Fake Cover */}
              <div className="h-40 bg-gradient-to-br from-[#111] to-[#000] relative flex items-center justify-center overflow-hidden border-b border-white/[0.04]">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#CCCC00,transparent_70%)]" />
                </div>
                {newGroupAvatar ? (
                  <img src={newGroupAvatar} alt="Avatar" className="w-full h-full object-cover relative z-10 opacity-60" />
                ) : (
                  <Users size={48} className="text-[#202025] relative z-10" />
                )}
                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-widest">
                  Preview
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-[#CCCC00]/10 border border-[#CCCC00]/20 text-[9px] font-black text-[#CCCC00] uppercase tracking-widest">
                      {newGroupType}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[9px] font-bold text-[#606070] uppercase tracking-widest flex items-center gap-1">
                      {newGroupVisibility === 'public' ? <Globe size={10} /> : <Lock size={10} />} {newGroupVisibility}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight uppercase italic">
                    {newGroupName || 'Nome do Grupo'}
                  </h3>
                  <p className="text-sm text-[#606070] mt-3 leading-relaxed line-clamp-3">
                    {newGroupDescription || 'A descrição do seu grupo aparecerá aqui. Use este espaço para definir o espírito da comunidade.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold text-[#606070] uppercase tracking-widest mb-1">Duração</p>
                    <p className="text-sm font-black text-white">{newGroupDays} Dias</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-bold text-[#606070] uppercase tracking-widest mb-1">Limite Diário</p>
                    <p className="text-sm font-black text-white">{newGroupLimit} Pontos</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full bg-[#151515] border-2 border-[#0A0A0A] flex items-center justify-center">
                        <User size={12} className="text-[#303035]" />
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full bg-[#151515] border-2 border-[#0A0A0A] flex items-center justify-center text-[8px] font-bold text-[#606070]">
                      +0
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#606070] uppercase tracking-widest">
                    <Info size={12} /> Moderado: {newGroupApproval ? 'Sim' : 'Não'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

    </motion.div>
  );
}
