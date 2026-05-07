'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Camera, MessageCircle, Trophy, Activity, Zap, User } from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import Image from 'next/image';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    type: 'activity' | 'achievement';
    title: string;
    subtitle: string;
    value?: string | number;
    imageUrl?: string;
    username: string;
    date: string;
  };
}

export default function ShareCard({ isOpen, onClose, data }: ShareCardProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
      >
        {/* Background Decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#CCCC00]/[0.05] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#CCCC00]/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute -top-12 md:top-0 md:-right-16 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90 z-20"
          >
            <X size={24} />
          </button>

          {/* Card Preview (9:16 Aspect Ratio) */}
          <div className="relative w-full max-w-[360px] aspect-[9/16] bg-[#000000] border border-[#CCCC00]/20 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8),0_0_50px_rgba(204,204,0,0.1)] group">
            
            {/* Visual Proof / Background Image */}
            {data.imageUrl ? (
              <div className="absolute inset-0">
                <img src={data.imageUrl} className="w-full h-full object-cover" alt="Proof" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-[#050505]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,204,0,0.03),transparent)]" />
              </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              
              {/* Top: Branding */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center">
                    <img src="/oryonforgeico.png" alt="Oryon" className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none">Oryon</span>
                    <span className="text-[8px] font-bold text-[#606070] uppercase tracking-widest mt-0.5">Forge</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                  <span className="text-[8px] font-black text-[#CCCC00] uppercase tracking-widest">{data.date}</span>
                </div>
              </div>

              {/* Middle: Main Stat */}
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="w-20 h-20 rounded-[2rem] bg-[#CCCC00] text-black flex items-center justify-center shadow-[0_0_40px_rgba(204,204,0,0.4)] mb-6"
                >
                  {data.type === 'achievement' ? <Trophy size={36} strokeWidth={2.5} /> : <Activity size={36} strokeWidth={2.5} />}
                </motion.div>
                
                <h2 className={`text-4xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none ${sora.className}`}>
                  {data.title}
                </h2>
                <p className="text-[#CCCC00] text-sm font-black uppercase tracking-[0.2em]">
                  {data.subtitle}
                </p>

                {data.value && (
                  <div className="mt-8">
                    <span className="text-6xl font-black text-white tracking-tighter">{data.value}</span>
                    <span className="text-xs font-black text-[#606070] uppercase tracking-widest ml-2">pts</span>
                  </div>
                )}
              </div>

              {/* Bottom: User Info */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-full h-px bg-white/10" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-[#CCCC00]/50 overflow-hidden">
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <User size={20} className="text-[#606070]" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-white uppercase tracking-tight leading-none">{data.username}</p>
                    <p className="text-[8px] font-bold text-[#606070] uppercase tracking-[0.2em] mt-1">Guerreiro Oryon Forge</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Corner Decorative */}
            <div className="absolute top-[-20px] left-[-20px] w-20 h-20 bg-[#CCCC00]/20 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Control Panel */}
          <div className="flex-1 w-full max-w-sm space-y-8">
            <div className="space-y-4">
              <h3 className={`text-3xl font-black text-white uppercase tracking-tighter italic ${sora.className}`}>
                Compartilhar <br />Conquista
              </h3>
              <p className="text-[#606070] text-sm font-medium leading-relaxed uppercase">
                Gere um card estilizado para postar nos seus stories e mostrar sua evolução para a comunidade.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                onClick={() => {
                  // Em um app real, aqui usaríamos html-to-image para gerar o arquivo
                  alert('DICA: Tire um print da tela para compartilhar no seu Story!');
                }}
              >
                <Camera size={20} />
                <span>Stories do Instagram</span>
              </button>

              <button 
                className="w-full py-5 rounded-2xl bg-green-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                onClick={() => {
                   alert('DICA: Tire um print da tela para compartilhar no WhatsApp!');
                }}
              >
                <MessageCircle size={20} />
                <span>WhatsApp Status</span>
              </button>

              <button 
                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white/10 transition-all"
                onClick={() => {
                   alert('DICA: O card está pronto para o print!');
                }}
              >
                <Download size={20} />
                <span>Salvar Imagem</span>
              </button>
            </div>

            <div className="p-6 bg-[#CCCC00]/5 border border-[#CCCC00]/10 rounded-2xl flex items-start gap-4">
              <Zap className="text-[#CCCC00] shrink-0" size={20} />
              <p className="text-[10px] text-[#606070] font-medium leading-relaxed uppercase">
                O card foi otimizado para a proporção <span className="text-white font-bold">9:16</span>, ideal para dispositivos móveis e redes sociais.
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
