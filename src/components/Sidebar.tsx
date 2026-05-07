'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, User, ScrollText, Activity, LogOut, 
  ChevronLeft, ChevronRight, Settings, Shield, Trophy,
  Zap, Calendar, HelpCircle, Megaphone
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [supabase]);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
    { href: '/perfil/conquistas', icon: Trophy, label: 'Conquistas' },
    { href: '/ranking', icon: Shield, label: 'Rankings' },
    { href: '/registro', icon: Activity, label: 'Atividades' },
    { href: '/perfil', icon: User, label: 'Perfil' },
    ...(profile?.role === 'admin' ? [{ href: '/admin/notificacoes', icon: Megaphone, label: 'Admin' }] : []),
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col bg-[#000000] border-r border-white/[0.04] h-screen sticky top-0 z-50 group/sidebar"
    >
      {/* Brand Header */}
      <div className={`px-6 py-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-24`}>
        <Link href="/" className="flex items-center gap-3.5 group/logo">
          <div className="w-9 h-9 min-w-[36px] bg-gradient-to-br from-white/[0.08] to-transparent rounded-xl flex items-center justify-center border border-white/[0.05] group-hover/logo:border-[#CCCC00]/30 group-hover/logo:bg-[#CCCC00]/5 transition-all duration-500">
            <Image src="/oryonforgeico.png" alt="Oryon" width={18} height={18} className="opacity-80 group-hover/logo:opacity-100 transition-opacity" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-extrabold text-[13px] text-white tracking-[0.15em] uppercase leading-none">
                ORYON
              </span>
              <span className="text-[10px] text-[#606070] font-bold uppercase tracking-widest mt-1">
                FORGE
              </span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none">
        <div className={`mb-4 px-3 ${isCollapsed ? 'hidden' : 'block'}`}>
          <span className="text-[10px] font-black text-[#303035] uppercase tracking-[0.2em]">Menu</span>
        </div>
        
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard'));
          const Icon = item.icon;

          return (
            <Link
              key={`${item.label}-${idx}`}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 relative group ${
                isActive 
                  ? 'text-white bg-white/[0.05] border border-white/[0.05]' 
                  : 'text-[#606070] hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Icon size={18} className={`shrink-0 transition-colors duration-300 ${isActive ? 'text-[#CCCC00]' : 'group-hover:text-white'}`} />
              {!isCollapsed && (
                <span className="text-[13px] font-semibold tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="absolute right-4 w-1 h-1 rounded-full bg-[#CCCC00]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/[0.04] space-y-2">
        {/* Profile Quick Access */}
        <Link 
          href="/perfil"
          className={`flex items-center gap-3.5 px-3 py-3 w-full rounded-2xl hover:bg-white/[0.02] transition-all group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-[#606070]" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-black text-white truncate">{profile?.username || 'Membro'}</span>
                <span className="px-1.5 py-0.5 bg-[#CCCC00]/10 border border-[#CCCC00]/20 rounded text-[7px] font-black text-[#CCCC00] uppercase">
                  LVL {profile?.level || 1}
                </span>
              </div>
              <span className="text-[9px] font-bold text-[#606070] uppercase tracking-widest">{profile?.title || 'Recruta'}</span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center gap-3.5 px-4 py-3 w-full rounded-2xl text-[13px] font-semibold text-[#606070] hover:bg-white/[0.02] hover:text-white transition-all group ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span className="whitespace-nowrap">Recolher Menu</span>}
        </button>

        <button
          onClick={onSignOut}
          className={`flex items-center gap-3.5 px-4 py-3 w-full rounded-2xl text-[13px] font-semibold text-[#606070] hover:bg-red-500/10 hover:text-red-500 transition-all group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="whitespace-nowrap">Encerrar Sessão</span>}
        </button>
      </div>
    </motion.aside>
  );
}
