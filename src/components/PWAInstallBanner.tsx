'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, X, Share } from 'lucide-react';

export default function PWAInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Detect Platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');

    // Android/Chrome Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 5 seconds
      setTimeout(() => setIsVisible(true), 5000);
    };

    // iOS Show banner after 5 seconds (since we can't trigger native prompt)
    if (isIOS) {
      setTimeout(() => setIsVisible(true), 5000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 md:bottom-8 left-4 right-4 z-[9999] md:left-auto md:right-8 md:w-[400px]"
      >
        <div className="bg-[#0A0A0A] border border-[#CCCC00]/30 rounded-3xl p-6 shadow-2xl shadow-[#CCCC00]/5 backdrop-blur-xl relative overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#CCCC00]/10 rounded-full blur-2xl" />
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-[#303035] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#CCCC00] flex items-center justify-center shrink-0 shadow-lg shadow-[#CCCC00]/20">
              <Smartphone size={28} className="text-black" />
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">Instalar Oryon Forge</h3>
              <p className="text-[11px] text-[#606070] font-medium leading-relaxed">
                {platform === 'ios' 
                  ? 'Toque no ícone de compartilhar e selecione "Adicionar à Tela de Início" para ter a experiência de App nativo.'
                  : 'Instale nossa plataforma na sua tela inicial para acesso rápido e uma experiência fluida de App.'}
              </p>
              
              <div className="pt-2">
                {platform === 'android' ? (
                  <button
                    onClick={handleInstall}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-[#CCCC00] uppercase tracking-widest hover:bg-[#CCCC00] hover:text-black transition-all"
                  >
                    <Download size={14} />
                    Instalar Agora
                  </button>
                ) : platform === 'ios' ? (
                  <div className="flex items-center gap-2 text-[10px] font-black text-[#CCCC00] uppercase tracking-widest">
                    <Share size={14} />
                    Siga as instruções acima
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
