'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, LayoutGrid, AlignLeft, 
  Settings, Check, Smartphone, 
  Monitor, Bell, Shield, Palette, User
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
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
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        setUserProfile(data);
        setFullName(data.full_name || '');
        setUsername(data.username || '');
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [supabase, router]);

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

      setToast({ isVisible: true, message: `Visual ${style === 'premium' ? 'Premium' : 'Minimalista'} ativado!`, type: 'success' });
      setUserProfile({ ...userProfile, dashboard_style: style });
    } catch (error) {
      console.error('Erro ao atualizar estilo:', error);
      setToast({ isVisible: true, message: 'Erro ao salvar preferência.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateNav = async () => {
    const currentNav = userProfile?.ui_preferences?.nav_style || 'standard';
    const newNav = currentNav === 'hamburger' ? 'standard' : 'hamburger';
    setIsUpdating(true);
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
      setToast({ isVisible: true, message: 'Estilo de navegação atualizado!', type: 'success' });
    } catch (e) {
      setToast({ isVisible: true, message: 'Erro ao salvar preferência.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setToast({ isVisible: true, message: 'O nome não pode estar vazio.', type: 'error' });
      return;
    }

    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          username: username 
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setUserProfile({ ...userProfile, full_name: fullName, username: username });
      setToast({ isVisible: true, message: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setToast({ isVisible: true, message: 'Erro ao salvar alterações.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

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
                Configurações
              </h1>
              <p className="text-[#606070] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Personalize sua experiência</p>
            </div>
          </div>

          <div className="space-y-12">
            
            {/* Personal Info Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <User size={18} className="text-[#CCCC00]" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Dados Pessoais</h2>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#606070] uppercase tracking-widest ml-1">Nome Completo</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[#CCCC00]/50 outline-none transition-all font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#606070] uppercase tracking-widest ml-1">Username / Nome de Exibição</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@usuario"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[#CCCC00]/50 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] bg-[#CCCC00] text-black hover:bg-[#b3b300] transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>
            </section>
            
            {/* Visual Style Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <Palette size={18} className="text-[#CCCC00]" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Estilo do Dashboard</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { 
                    id: 'premium', 
                    label: 'Versão Premium', 
                    icon: LayoutGrid, 
                    desc: 'Layout imersivo com imagens atmosféricas e cards sofisticados.' 
                  },
                  { 
                    id: 'minimalist', 
                    label: 'Versão Minimalista', 
                    icon: AlignLeft, 
                    desc: 'Foco total em dados e legibilidade com interface limpa.' 
                  },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleUpdateStyle(style.id as any)}
                    className={`flex flex-col gap-5 p-8 rounded-[2.5rem] border transition-all duration-500 text-left relative overflow-hidden group ${
                      userProfile?.dashboard_style === style.id 
                        ? 'bg-[#CCCC00]/5 border-[#CCCC00]/30 shadow-[0_0_40px_rgba(204,204,0,0.05)]' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      userProfile?.dashboard_style === style.id ? 'bg-[#CCCC00] text-black shadow-xl shadow-[#CCCC00]/20' : 'bg-white/5 text-[#606070]'
                    }`}>
                      <style.icon size={24} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black uppercase tracking-tight italic ${userProfile?.dashboard_style === style.id ? 'text-[#CCCC00]' : 'text-white'}`}>
                          {style.label}
                        </span>
                        {userProfile?.dashboard_style === style.id && (
                          <div className="w-5 h-5 rounded-full bg-[#CCCC00] text-black flex items-center justify-center">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#606070] font-medium leading-relaxed">{style.desc}</p>
                    </div>

                    {/* Active State Background Glow */}
                    {userProfile?.dashboard_style === style.id && (
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#CCCC00]/10 blur-[40px] rounded-full pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Navigation Section */}
            <section className="space-y-6 pt-6 border-t border-white/[0.05]">
              <div className="flex items-center gap-3 px-2">
                <Smartphone size={18} className="text-[#CCCC00]" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Interface de Navegação</h2>
              </div>

              <button
                onClick={handleUpdateNav}
                className="w-full flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    userProfile?.ui_preferences?.nav_style === 'hamburger' ? 'bg-[#CCCC00] text-black shadow-xl' : 'bg-white/5 text-[#606070]'
                  }`}>
                    {userProfile?.ui_preferences?.nav_style === 'hamburger' ? <AlignLeft size={24} /> : <LayoutGrid size={24} />}
                  </div>
                  <div className="text-left">
                    <span className="block text-lg font-black uppercase tracking-tight text-white italic">Menu Lateral vs Barra</span>
                    <span className="text-xs font-bold text-[#606070] uppercase tracking-widest mt-1">
                      Modo Atual: {userProfile?.ui_preferences?.nav_style === 'hamburger' ? 'Menu Hambúrguer' : 'Barra Fixa Inferior'}
                    </span>
                  </div>
                </div>
                
                <div className={`w-14 h-7 rounded-full p-1 transition-all relative z-10 ${userProfile?.ui_preferences?.nav_style === 'hamburger' ? 'bg-[#CCCC00]' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-all ${userProfile?.ui_preferences?.nav_style === 'hamburger' ? 'translate-x-7' : 'translate-x-0'}`} />
                </div>
              </button>
            </section>

            {/* Notifications (Placeholder for now) */}
            <section className="space-y-6 pt-6 border-t border-white/[0.05] opacity-50">
              <div className="flex items-center gap-3 px-2">
                <Bell size={18} className="text-[#606070]" />
                <h2 className="text-sm font-black text-[#606070] uppercase tracking-widest text-white/40">Notificações Push</h2>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-2xl bg-white/[0.02] flex items-center justify-center text-[#303035]">
                      <Monitor size={24} />
                   </div>
                   <div className="text-left">
                      <span className="block text-lg font-black uppercase tracking-tight text-[#303035]">Alertas de Atividade</span>
                      <span className="text-[10px] font-bold text-[#303035] uppercase tracking-widest mt-1">Em breve nesta plataforma</span>
                   </div>
                </div>
                <div className="w-14 h-7 rounded-full bg-white/[0.01] border border-white/[0.05]" />
              </div>
            </section>

          </div>

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

