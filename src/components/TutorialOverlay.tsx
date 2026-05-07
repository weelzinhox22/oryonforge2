'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, X, MousePointer2, Settings, User, LayoutGrid, Info } from 'lucide-react';

interface TutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function TutorialOverlay({ isVisible, onComplete }: TutorialOverlayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, width: 0, height: 0, opacity: 0 });
  const [tooltipPos, setTooltipPos] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  const steps = [
    {
      targetId: '',
      title: "Bem-vindo ao Oryon",
      desc: "Vamos fazer um tour rápido pelas funcionalidades principais da plataforma para você começar da melhor forma.",
      icon: LayoutGrid,
      path: '/dashboard'
    },
    {
      targetId: 'tutorial-xp',
      title: "Seu Desempenho",
      desc: "Aqui você acompanha seu nível e o quanto falta para o próximo objetivo. Seus pontos são atualizados conforme suas atividades.",
      icon: MousePointer2,
      path: '/dashboard'
    },
    {
      targetId: 'tutorial-groups',
      title: "Grupos e Comunidades",
      desc: "Nesta seção você gerencia seus grupos, entra em novos desafios e interage com outros membros.",
      icon: User,
      path: '/dashboard'
    },
    {
      targetId: 'tutorial-visual',
      title: "Estilo Visual",
      desc: "Você pode personalizar como os dados são exibidos. Escolha entre uma interface imersiva ou algo mais direto e minimalista.",
      icon: Settings,
      path: '/perfil'
    },
    {
      targetId: 'tutorial-nav',
      title: "Preferências de Navegação",
      desc: "Escolha o estilo de navegação que melhor se adapta ao seu uso: Barra Inferior ou Menu Lateral.",
      icon: Settings,
      path: '/perfil'
    }
  ];

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!show) return;

    const currentStep = steps[step];

    // Se mudar de página, aguarda o carregamento
    if (pathname !== currentStep.path) {
      router.push(currentStep.path);
      return;
    }

    const updateSpotlight = () => {
      if (!currentStep.targetId) {
        setSpotlight({ x: 0, y: 0, width: 0, height: 0, opacity: 0 });
        setTooltipPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
        return;
      }

      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Aguarda o scroll terminar para pegar a posição final
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          const padding = 15;
          
          setSpotlight({
            x: rect.left - padding,
            y: rect.top - padding,
            width: rect.width + (padding * 2),
            height: rect.height + (padding * 2),
            opacity: 1
          });

          // Posiciona o tooltip acima ou abaixo do elemento
          const isAtBottom = rect.top > window.innerHeight / 2;
          if (isAtBottom) {
            setTooltipPos({
              top: `${rect.top - 20}px`,
              left: `${rect.left + rect.width / 2}px`,
              transform: 'translate(-50%, -100%)'
            });
          } else {
            setTooltipPos({
              top: `${rect.bottom + 20}px`,
              left: `${rect.left + rect.width / 2}px`,
              transform: 'translate(-50%, 0)'
            });
          }
        }, 600);
      } else {
        // Se o elemento não for encontrado (ex: carregando), tenta de novo em breve
        setTimeout(updateSpotlight, 300);
      }
    };

    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [step, show, router, pathname]);

  if (!show) return null;

  const currentStep = steps[step];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
        {/* Overlay with Spotlight Cutout */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <motion.rect
                animate={{
                  x: spotlight.x,
                  y: spotlight.y,
                  width: spotlight.width,
                  height: spotlight.height,
                  opacity: spotlight.opacity
                }}
                rx="32"
                ry="32"
                fill="black"
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.9)" mask="url(#spotlight-mask)" className="pointer-events-auto" />
        </svg>

        {/* Tooltip Content */}
        <motion.div 
          key={step}
          style={tooltipPos}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          className="absolute w-[calc(100%-48px)] max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-2xl pointer-events-auto overflow-hidden z-[210]"
        >
          <div className="p-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#CCCC00]/10 border border-[#CCCC00]/20 flex items-center justify-center">
                  <currentStep.icon size={16} className="text-[#CCCC00]" />
                </div>
                <span className="text-[10px] font-black text-[#606070] uppercase tracking-widest">Dica {step + 1} de {steps.length}</span>
              </div>
              <button 
                onClick={() => {
                  setShow(false);
                  onComplete();
                }}
                className="text-[#303035] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{currentStep.title}</h3>
              <p className="text-sm text-[#606070] font-medium leading-relaxed">{currentStep.desc}</p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4">
              <button 
                onClick={() => {
                  setShow(false);
                  onComplete();
                }}
                className="text-[10px] font-bold text-[#303035] uppercase tracking-widest hover:text-[#606070] transition-colors"
              >
                Pular
              </button>
              <button 
                onClick={() => {
                  if (step < steps.length - 1) {
                    setStep(s => s + 1);
                  } else {
                    setShow(false);
                    onComplete();
                  }
                }}
                className="h-11 px-6 rounded-xl bg-[#CCCC00] text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#E6E600] transition-all flex items-center gap-2 shadow-lg shadow-[#CCCC00]/20"
              >
                {step === steps.length - 1 ? "Entendido" : "Continuar"}
                {step < steps.length - 1 && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
