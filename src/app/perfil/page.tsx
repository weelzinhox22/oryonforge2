'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Camera, User, 
  Settings, LogOut, Check,
  ShieldCheck, ArrowRight, LayoutGrid, AlignLeft
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

const AVAILABLE_AVATARS = [
  'avatar_01_01.png', 'avatar_01_02.png', 'avatar_01_03.png', 'avatar_01_04.png', 'avatar_01_05.png', 'avatar_01_06.png', 'avatar_01_07.png',
  'avatar_02_01.png', 'avatar_02_02.png', 'avatar_02_03.png', 'avatar_02_04.png', 'avatar_02_05.png', 'avatar_02_06.png', 'avatar_02_07.png',
  'avatar_03_01.png', 'avatar_03_02.png', 'avatar_03_03.png', 'avatar_03_04.png', 'avatar_03_05.png', 'avatar_03_06.png', 'avatar_03_07.png',
  'avatar_04_01.png', 'avatar_04_02.png', 'avatar_04_03.png', 'avatar_04_04.png', 'avatar_04_05.png', 'avatar_04_06.png', 'avatar_04_07.png',
  'avatar_05_01.png', 'avatar_05_02.png', 'avatar_05_03.png', 'avatar_05_04.png', 'avatar_05_05.png', 'avatar_05_06.png', 'avatar_05_07.png',
];

const AVAILABLE_FEMALE_AVATARS = Array.from({ length: 35 }, (_, i) => `asset${i + 1}.png`);


export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarCategory, setAvatarCategory] = useState<'male' | 'female'>('male');
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' as 'error' | 'success' });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profile_display_with_titles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        setUserProfile(data);
        setSelectedAvatar(data.avatar_url);
        if (data.avatar_url?.includes('avatarsfemininos')) {
          setAvatarCategory('female');
        } else {
          setAvatarCategory('male');
        }
      }

      // Fetch unlocked achievements that have titles
      const { data: unlocked } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          achievements (*)
        `)
        .eq('user_id', session.user.id);
      
      if (unlocked) {
        const uniqueAchs = Array.from(new Map(
          unlocked
            .map((u: any) => u.achievements)
            .filter((a: any) => a?.title_name)
            .map(a => [a.id, a])
        ).values());
        setUnlockedAchievements(uniqueAchs);
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [supabase, router]);

  const handleUpdateTitle = async (achievementId: string | null) => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({ selected_achievement_id: achievementId })
        .eq('id', session.user.id);

      if (error) throw error;

      setToast({ isVisible: true, message: 'Título atualizado com sucesso!', type: 'success' });
      setUserProfile({ ...userProfile, selected_achievement_id: achievementId });
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      setToast({ isVisible: true, message: 'Erro ao atualizar título.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAvatar = async (avatarPath: string) => {
    setSelectedAvatar(avatarPath);
    setIsUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarPath })
        .eq('id', session.user.id);

      if (error) throw error;

      setToast({ isVisible: true, message: 'Avatar atualizado com sucesso!', type: 'success' });
      setUserProfile({ ...userProfile, avatar_url: avatarPath });
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      setToast({ isVisible: true, message: 'Erro ao atualizar avatar.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStyle = async (style: 'premium' | 'minimalist') => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_style: style })
        .eq('id', session.user.id);

      if (error) throw error;

      setToast({ isVisible: true, message: 'Preferência de visual atualizada!', type: 'success' });
      setUserProfile({ ...userProfile, dashboard_style: style });
    } catch (error) {
      console.error('Erro ao atualizar estilo:', error);
      setToast({ isVisible: true, message: 'Erro ao salvar preferência.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#CCCC00]/20 border-t-[#CCCC00] animate-spin" />
        <p className="text-[#303035] text-[10px] font-black uppercase tracking-[0.3em]">Carregando Perfil...</p>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className}`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-24 md:pb-0 h-screen overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-6 py-10 md:py-16">
          
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
                Meu Perfil
              </h1>
              <p className="text-[#606070] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Configurações de Identidade</p>
            </div>
          </div>

          {/* Profile Card */}
          <section className="mb-12">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(204,204,0,0.05),transparent)]" />
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative group/avatar">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 border-2 border-white/10 overflow-hidden group-hover/avatar:border-[#CCCC00]/50 transition-all duration-500">
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#303035]">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#CCCC00] text-black flex items-center justify-center shadow-xl">
                    <Camera size={18} />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                      {userProfile?.username}
                      {userProfile?.active_title && (
                        <span className="text-[#606070] font-light text-xl lowercase ml-2">, {userProfile.active_title}</span>
                      )}
                    </h2>
                    <span className="px-2 py-1 bg-[#CCCC00]/10 border border-[#CCCC00]/20 rounded-lg text-[10px] font-black text-[#CCCC00] uppercase mb-1">
                      LVL {userProfile?.level || 1}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-[#404045] uppercase tracking-widest mb-4">
                    {userProfile?.email}
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 bg-white/5 text-[#F0F0F6] text-[9px] font-black uppercase tracking-widest rounded-full border border-white/10 flex items-center gap-1.5">
                      <ShieldCheck size={10} className="text-[#CCCC00]" /> {userProfile?.title || 'Recruta'}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[#606070] text-[10px] font-bold uppercase tracking-wider">Membro desde {new Date(userProfile?.created_at).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Avatar Selection */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCCC00]" />
                <h2 className="text-[10px] font-black text-[#606070] uppercase tracking-[0.3em]">Selecione seu Avatar</h2>
              </div>
              <div className="flex bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setAvatarCategory('male')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    avatarCategory === 'male' ? 'bg-[#CCCC00] text-black shadow-lg' : 'text-[#606070] hover:text-white'
                  }`}
                >
                  Masculino
                </button>
                <button
                  onClick={() => setAvatarCategory('female')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    avatarCategory === 'female' ? 'bg-[#CCCC00] text-black shadow-lg' : 'text-[#606070] hover:text-white'
                  }`}
                >
                  Feminino
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
              {(avatarCategory === 'male' ? AVAILABLE_AVATARS : AVAILABLE_FEMALE_AVATARS).map((avatar) => {
                const avatarPath = avatarCategory === 'male' ? `/avatars/${avatar}` : `/avatarsfemininos/${avatar}`;
                const isSelected = selectedAvatar === avatarPath;
                return (
                  <button
                    key={avatarPath}
                    onClick={() => handleUpdateAvatar(avatarPath)}
                    className={`relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all duration-300 active:scale-95 group ${
                      isSelected 
                        ? 'border-[#CCCC00] shadow-[0_0_20px_rgba(204,204,0,0.2)]' 
                        : 'border-white/5 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    <img src={avatarPath} alt="Avatar Option" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#CCCC00]/10 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-[#CCCC00] text-black flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Title Selection */}
          <section className="space-y-6 mt-16">
            <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#CCCC00]" />
              <h2 className="text-[10px] font-black text-[#606070] uppercase tracking-[0.3em]">Título de Honra</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unlockedAchievements.map((ach) => (
                <button
                  key={ach.id}
                  onClick={() => handleUpdateTitle(ach.id)}
                  className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-300 group ${
                    userProfile?.selected_achievement_id === ach.id 
                      ? 'bg-[#CCCC00]/5 border-[#CCCC00]/30 shadow-[0_0_30px_rgba(204,204,0,0.05)]' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
                    userProfile?.selected_achievement_id === ach.id ? 'bg-[#CCCC00] shadow-lg shadow-[#CCCC00]/20' : 'bg-white/5'
                  }`}>
                    <img src={ach.icon_url} alt="" className={`w-full h-full object-contain p-1.5 ${userProfile?.selected_achievement_id === ach.id ? 'brightness-0' : 'opacity-40'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <span className={`block text-[11px] font-black uppercase tracking-widest ${userProfile?.selected_achievement_id === ach.id ? 'text-[#CCCC00]' : 'text-white'}`}>
                      {ach.title_name || ach.title}
                    </span>
                    <span className="text-[9px] font-bold text-[#404045] uppercase tracking-wider mt-0.5">Desbloqueado em {ach.title}</span>
                  </div>
                  {userProfile?.selected_achievement_id === ach.id && (
                    <div className="w-6 h-6 rounded-full bg-[#CCCC00] text-black flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}

              {/* Default Level Title */}
              <button
                onClick={() => handleUpdateTitle(null)}
                className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-300 group ${
                  !userProfile?.selected_achievement_id 
                    ? 'bg-[#CCCC00]/5 border-[#CCCC00]/30 shadow-[0_0_30px_rgba(204,204,0,0.05)]' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  !userProfile?.selected_achievement_id ? 'bg-[#CCCC00] text-black shadow-lg shadow-[#CCCC00]/20' : 'bg-white/5 text-[#303035]'
                }`}>
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left flex-1">
                  <span className={`block text-[11px] font-black uppercase tracking-widest ${!userProfile?.selected_achievement_id ? 'text-[#CCCC00]' : 'text-white'}`}>
                    Título de Nível ({userProfile?.title})
                  </span>
                  <span className="text-[9px] font-bold text-[#404045] uppercase tracking-wider mt-0.5">Padrão por XP</span>
                </div>
                {!userProfile?.selected_achievement_id && (
                  <div className="w-6 h-6 rounded-full bg-[#CCCC00] text-black flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={4} />
                  </div>
                )}
              </button>
            </div>
          </section>

          {/* UI Preferences */}
          <section className="space-y-6 mt-16">
            <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#CCCC00]" />
              <h2 className="text-[10px] font-black text-[#606070] uppercase tracking-[0.3em]">Preferências de Interface</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Dashboard Style (Visual) */}
              <div id="tutorial-visual" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'premium', label: 'Premium', icon: LayoutGrid, desc: 'Cards visuais e imersivos.' },
                  { id: 'minimalist', label: 'Minimalista', icon: AlignLeft, desc: 'Foco em dados e simplicidade.' },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleUpdateStyle(style.id as any)}
                    className={`flex items-center gap-5 p-6 rounded-[2rem] border transition-all duration-300 group ${
                      userProfile?.dashboard_style === style.id 
                        ? 'bg-[#CCCC00]/5 border-[#CCCC00]/30 shadow-[0_0_30px_rgba(204,204,0,0.05)]' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      userProfile?.dashboard_style === style.id ? 'bg-[#CCCC00] text-black shadow-lg shadow-[#CCCC00]/20' : 'bg-white/5 text-[#606070]'
                    }`}>
                      <style.icon size={20} />
                    </div>
                    <div className="text-left">
                      <span className={`block text-[13px] font-black uppercase tracking-widest ${userProfile?.dashboard_style === style.id ? 'text-[#CCCC00]' : 'text-white'}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] font-bold text-[#606070] uppercase tracking-wider mt-0.5">{style.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation Style (UI) */}
              <button
                id="tutorial-nav"
                onClick={async () => {
                  const currentNav = userProfile?.ui_preferences?.nav_style || 'standard';
                  const newNav = currentNav === 'hamburger' ? 'standard' : 'hamburger';
                  try {
                    const { error } = await supabase
                      .from('profiles')
                      .update({ 
                        ui_preferences: { 
                          ...userProfile?.ui_preferences, 
                          nav_style: newNav 
                        } 
                      })
                      .eq('id', userProfile?.id);
                    if (error) throw error;
                    setUserProfile({ 
                      ...userProfile, 
                      ui_preferences: { ...userProfile?.ui_preferences, nav_style: newNav } 
                    });
                    setToast({ isVisible: true, message: 'Navegação atualizada!', type: 'success' });
                  } catch (e) {
                    setToast({ isVisible: true, message: 'Erro ao salvar.', type: 'error' });
                  }
                }}
                className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#606070] group-hover:text-[#CCCC00] transition-colors">
                    {userProfile?.ui_preferences?.nav_style === 'hamburger' ? <AlignLeft size={20} /> : <LayoutGrid size={20} />}
                  </div>
                  <div className="text-left">
                    <span className="block text-[13px] font-black uppercase tracking-widest text-white">Menu de Navegação</span>
                    <span className="text-[10px] font-bold text-[#606070] uppercase tracking-wider mt-0.5">
                      Atual: {userProfile?.ui_preferences?.nav_style === 'hamburger' ? 'Hambúrguer' : 'Barra Inferior'}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-all ${userProfile?.ui_preferences?.nav_style === 'hamburger' ? 'bg-[#CCCC00]' : 'bg-white/10'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${userProfile?.ui_preferences?.nav_style === 'hamburger' ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      {(userProfile?.ui_preferences?.nav_style === 'standard' || !userProfile?.ui_preferences?.nav_style) && (
        <BottomNav />
      )}

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
