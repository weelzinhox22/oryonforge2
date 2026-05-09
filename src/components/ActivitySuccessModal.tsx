'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Zap, Star, ChevronRight, Share2, Flame, Moon, Sun, Sunrise } from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';

interface ActivitySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    is_first: boolean;
    period: 'morning' | 'afternoon' | 'night';
    period_percent: number;
    user_period_count: number;
    hour: number;
    points: number;
  } | null;
}

export default function ActivitySuccessModal({ isOpen, onClose, data }: ActivitySuccessModalProps) {
  if (!data) return null;

  const getPeriodInfo = () => {
    switch (data.period) {
      case 'morning':
        return {
          title: 'Madrugador',
          label: 'Pioneiro do Dia',
          icon: Sunrise,
          color: '#CCCC00',
          desc: 'Você começou enquanto a maioria ainda dorme.'
        };
      case 'afternoon':
        return {
          title: 'Alta Performance',
          label: 'Ritmo de Pico',
          icon: Sun,
          color: '#FFB800',
          desc: 'Aproveitando o auge do metabolismo.'
        };
      case 'night':
        return {
          title: 'Coruja Noturna',
          label: 'Foco no Escuro',
          icon: Moon,
          color: '#8A2BE2',
          desc: 'Treinando quando o mundo silencia.'
        };
    }
  };

  const period = getPeriodInfo();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(204,204,0,0.1)]"
          >
            {/* Success Animation Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
              <DotLottiePlayer
                src="/Fire.lottie"
                autoplay
                loop
                className="w-full h-full scale-150"
              />
            </div>

            <div className="relative p-8 md:p-12 flex flex-col items-center text-center">
              {/* Header Icon */}
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 rounded-[2.5rem] bg-[#CCCC00] flex items-center justify-center shadow-[0_0_50px_rgba(204,204,0,0.3)] mb-8"
              >
                <Trophy size={40} className="text-black" />
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2"
              >
                Atividade Validada!
              </motion.h2>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 mb-10"
              >
                <span className="text-sm font-bold text-[#606070] uppercase tracking-widest">Você conquistou</span>
                <span className="text-xl font-black text-[#CCCC00] italic">+{data.points.toFixed(2)} XP</span>
              </motion.div>

              {/* Dynamic Stats Grid */}
              <div className="w-full grid grid-cols-1 gap-4 mb-10">
                {data.is_first && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4 bg-white/[0.03] border border-[#CCCC00]/30 rounded-2xl p-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#CCCC00]/10 flex items-center justify-center">
                      <Zap size={20} className="text-[#CCCC00]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#CCCC00] uppercase tracking-widest leading-none mb-1">Pioneiro</p>
                      <p className="text-sm font-bold text-white uppercase italic tracking-tight">Primeiro a registrar hoje!</p>
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <period.icon size={20} style={{ color: period.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#606070] uppercase tracking-widest leading-none mb-1">{period.label}</p>
                    <p className="text-sm font-bold text-white uppercase italic tracking-tight">
                      Você está entre os <span style={{ color: period.color }}>{data.period_percent}%</span> que treinam neste horário.
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Flame size={20} className="text-[#CCCC00]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#606070] uppercase tracking-widest leading-none mb-1">Consistência</p>
                    <p className="text-sm font-bold text-white uppercase italic tracking-tight">
                      {data.user_period_count}º treino nesta faixa de horário esta semana.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="w-full py-5 rounded-2xl bg-[#CCCC00] text-black font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-[#CCCC00]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Continuar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
