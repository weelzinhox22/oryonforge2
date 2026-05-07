'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Activity, Users, Zap, 
  ChevronRight, X, Sparkles, Target, 
  Flame, ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Sora } from 'next/font/google';

const sora = Sora({ subsets: ['latin'], weight: ['700', '800'] });

const slides = [
  {
    icon: <Flame className="text-[#CCCC00]" size={32} />,
    title: "BEM-VINDO AO ORYON FORGE",
    description: "Sua jornada para a elite fitness começa aqui. Transforme cada treino em progresso real e conquiste seu lugar no topo.",
    tag: "STARTING"
  },
  {
    icon: <Activity className="text-[#CCCC00]" size={32} />,
    title: "REGISTRE SUA EVOLUÇÃO",
    description: "Poste fotos dos seus treinos, acumule pontos e mantenha sua consistência. Cada atividade conta para sua evolução e ranking.",
    tag: "TRACKING"
  },
  {
    icon: <Trophy className="text-[#CCCC00]" size={32} />,
    title: "DESBLOQUEIE CONQUISTAS",
    description: "Complete desafios específicos para ganhar emblemas e títulos exclusivos que aparecerão no seu perfil para todos verem.",
    tag: "REWARDS"
  },
  {
    icon: <ShieldCheck className="text-[#CCCC00]" size={32} />,
    title: "DOMINE OS RANKINGS",
    description: "Participe de comunidades, compita com amigos e suba de nível. Mostre que você é o membro mais dedicado da sua unidade.",
    tag: "COMPETITION"
  }
];

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('ui_preferences')
        .eq('id', session.user.id)
        .single();

      // If tutorial_completed is false or missing, show modal
      if (!profile?.ui_preferences?.tutorial_completed) {
        setIsOpen(true);
      }
    };

    checkOnboarding();
  }, [supabase]);

  const handleComplete = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Update profile preference to not show again
    await supabase
      .from('profiles')
      .update({
        ui_preferences: { tutorial_completed: true }
      })
      .eq('id', session.user.id);

    setIsOpen(false);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[440px] bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
        >
          {/* Header Progress */}
          <div className="absolute top-0 left-0 right-0 h-1 flex gap-1 p-1">
            {slides.map((_, idx) => (
              <div 
                key={idx}
                className={`h-full flex-1 rounded-full transition-all duration-500 ${
                  idx <= currentSlide ? 'bg-[#CCCC00]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={handleComplete}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#606070] hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8 pt-16 md:p-12 md:pt-20 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-[2rem] bg-[#CCCC00]/5 border border-[#CCCC00]/20 flex items-center justify-center shadow-[0_0_40px_rgba(204,204,0,0.1)]">
                    {slides[currentSlide].icon}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles size={12} className="text-[#CCCC00]" />
                    <span className="text-[10px] font-black text-[#CCCC00] uppercase tracking-[0.3em] italic">
                      {slides[currentSlide].tag}
                    </span>
                  </div>
                  <h2 className={`text-2xl font-black text-white leading-none uppercase tracking-tighter ${sora.className}`}>
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-[#606070] text-sm leading-relaxed font-medium px-4">
                    {slides[currentSlide].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 space-y-4">
              <button
                onClick={nextSlide}
                className="w-full py-5 bg-[#CCCC00] rounded-2xl flex items-center justify-center gap-3 group hover:bg-[#DDDD00] transition-all active:scale-[0.98]"
              >
                <span className="text-xs font-black text-black uppercase tracking-[0.2em]">
                  {currentSlide === slides.length - 1 ? 'COMEÇAR AGORA' : 'PRÓXIMO'}
                </span>
                <ChevronRight size={18} className="text-black group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex justify-center gap-2">
                <span className="text-[9px] font-black text-[#202025] uppercase tracking-[0.4em]">Oryon Intelligence System</span>
              </div>
            </div>
          </div>

          {/* Background Gradient */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#CCCC00]/5 rounded-full blur-[100px] pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
