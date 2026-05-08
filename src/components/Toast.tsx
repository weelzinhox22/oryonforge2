'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Outfit, Sora } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '700', '900'] });
const sora = Sora({ subsets: ['latin'], weight: ['700'] });

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = 'error', isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className={`fixed top-8 left-4 right-4 z-[9999] flex justify-center pointer-events-none ${outfit.className}`}
        >
          <div
            className={`pointer-events-auto px-6 py-4 rounded-3xl flex items-center gap-4 max-w-md w-full border backdrop-blur-2xl shadow-2xl relative overflow-hidden ${
              type === 'error'
                ? 'bg-red-950/20 border-red-500/30 shadow-red-900/10'
                : 'bg-black/60 border-[#CCCC00]/30 shadow-[#CCCC00]/10'
            }`}
          >
            {/* Background Accent */}
            <div className={`absolute top-0 left-0 w-1 h-full ${type === 'error' ? 'bg-red-500' : 'bg-[#CCCC00]'}`} />

            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-[#CCCC00]/10 text-[#CCCC00]'
            }`}>
              {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            </div>

            <div className="flex-1">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${
                type === 'error' ? 'text-red-400' : 'text-[#CCCC00]'
              }`}>
                {type === 'error' ? 'Sistema / Alerta' : 'Oryon / Sucesso'}
              </h4>
              <p className="text-sm font-bold text-[#F0F0F6] leading-tight">{message}</p>
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={16} />
            </button>

            {/* Progress Bar */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-[2px] opacity-50 ${
                type === 'error' ? 'bg-red-500' : 'bg-[#CCCC00]'
              }`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
