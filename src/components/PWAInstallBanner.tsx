'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, X, Share } from 'lucide-react';

export default function PWAInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // 1. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // 2. Check if user dismissed permanently (LocalStorage)
    const isPermanentlyDismissed = localStorage.getItem('oryon_pwa_dismissed');
    if (isPermanentlyDismissed) return;

    // 3. Check if user dismissed for this session (SessionStorage)
    const isSessionDismissed = sessionStorage.getItem('oryon_pwa_session_dismissed');
    if (isSessionDismissed) return;

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
      // Show banner after 5 seconds if not dismissed
      setTimeout(() => {
        if (!sessionStorage.getItem('oryon_pwa_session_dismissed')) {
          setIsVisible(true);
        }
      }, 5000);
    };

    // iOS Show banner after 5 seconds
    if (isIOS) {
      setTimeout(() => {
        if (!sessionStorage.getItem('oryon_pwa_session_dismissed')) {
          setIsVisible(true);
        }
      }, 5000);
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
      sessionStorage.setItem('oryon_pwa_session_dismissed', 'true');
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Hide for this session
    sessionStorage.setItem('oryon_pwa_session_dismissed', 'true');
  };

  const handlePermanentDismiss = () => {
    localStorage.setItem('oryon_pwa_dismissed', 'true');
    setIsVisible(false);
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
        <div className="bg-[#0A0A0A] border border-[#CCCC00]/30 rounded-3xl p-6 shadow-2xl shadow-[#CCCC00]/10 backdrop-blur-xl relative overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#CCCC00]/10 rounded-full blur-2xl" />
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#303035] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          {!showExplanation ? (
            <div className="flex gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#CCCC00] flex items-center justify-center shrink-0 shadow-lg shadow-[#CCCC00]/20">
                <Smartphone size={28} className="text-black" />
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">Instalar Oryon Forge</h3>
                  <p className="text-[11px] text-[#606070] font-medium leading-relaxed mt-1">
                    {platform === 'ios' 
                      ? 'Adicione à Tela de Início para ter a experiência de App nativo e acesso instantâneo.'
                      : 'Instale na sua tela inicial para acesso rápido e uma experiência fluida de App.'}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {platform === 'android' ? (
                    <button
                      onClick={handleInstall}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#CCCC00] rounded-xl text-[10px] font-black text-black uppercase tracking-widest hover:bg-[#ebd600] transition-all shadow-lg shadow-[#CCCC00]/10"
                    >
                      <Download size={14} />
                      Instalar
                    </button>
                  ) : platform === 'ios' ? (
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#CCCC00] uppercase tracking-widest">
                      <Share size={14} />
                      Compartilhar {'>'} Tela de Início
                    </div>
                  ) : null}
                  
                  <button
                    onClick={() => setShowExplanation(true)}
                    className="text-[9px] font-black text-[#303035] hover:text-[#606070] uppercase tracking-widest transition-colors"
                  >
                    Não exibir novamente
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#CCCC00]/10 flex items-center justify-center">
                  <Smartphone size={16} className="text-[#CCCC00]" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Por que instalar?</h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-[11px] text-[#606070] font-medium leading-relaxed">
                  A versão App oferece <span className="text-white">carregamento instantâneo</span>, <span className="text-white">notificações push</span> estáveis e <span className="text-white">mais espaço</span> de tela sem as barras do navegador.
                </p>
                
                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() => setShowExplanation(false)}
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Quero Instalar
                  </button>
                  <button
                    onClick={handlePermanentDismiss}
                    className="flex-1 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    Não quero
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
