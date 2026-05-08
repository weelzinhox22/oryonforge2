'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Activity, Trophy, ScrollText } from 'lucide-react';
import { motion } from 'framer-motion';
import { sounds } from '@/lib/sounds';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
    { href: '/perfil/conquistas', icon: Trophy, label: 'Conquistas' },
    { href: '/regras', icon: ScrollText, label: 'Regras' },
    { href: '/registro', icon: Activity, label: 'Registro' },
    { href: '/perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-40 px-4 pb-safe bg-black/80 backdrop-blur-xl border-t border-white/10">
      <nav className="flex items-center justify-between max-w-md mx-auto pt-3 pb-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => sounds.playTap()}
              className="relative flex flex-col items-center justify-center w-16 h-12"
            >
              <div
                className={`flex flex-col items-center transition-colors duration-300 ${
                  isActive ? 'text-[#CCCC00]' : 'text-[#606070] hover:text-white'
                }`}
              >
                <Icon size={22} className="mb-1" />
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-3 w-8 h-1 bg-[#CCCC00] rounded-b-full shadow-[0_0_10px_rgba(204,204,0,0.5)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
