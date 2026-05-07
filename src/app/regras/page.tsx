'use client';

import {
  Dumbbell, Flame, Target, Swords, CircleDot, Timer, Bike,
  ArrowUpRight, Activity, Footprints, Zap, Info, ChevronLeft,
  CheckCircle2, Camera, Calendar, AlertCircle
} from 'lucide-react';
import { ACTIVITIES } from '@/lib/activities';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const ICON_MAP: Record<string, any> = {
  Dumbbell, Flame, Target, Swords, CircleDot, Timer, Bike,
  ArrowUpRight, Activity, Footprints, Zap,
};

const CATEGORIES = [
  {
    name: 'Resistência & Força',
    activities: ['musculacao', 'crossfit', 'funcional', 'artes-marciais']
  },
  {
    name: 'Cardio (Equipamentos)',
    activities: ['esteira', 'bike-ergometrica', 'escada', 'eliptico']
  },
  {
    name: 'Esportes & Outros',
    activities: ['esportes']
  },
  {
    name: 'Rua / Distância',
    activities: ['caminhada', 'corrida', 'bike-rua']
  }
];

export default function RegrasPage() {
  const router = useRouter();

  const handleSignOut = () => {
    // Logic placeholder if needed
  };

  return (
    <div className="flex min-h-screen bg-[#000000]">
      {/* Desktop Sidebar */}
      <Sidebar onSignOut={handleSignOut} />

      <main className="flex-1 pb-24 md:pb-12 h-screen overflow-y-auto overflow-x-hidden relative">
        {/* Subtle Depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-gradient-to-b from-[#CCCC00]/[0.02] to-transparent pointer-events-none" />

        {/* Header */}
        <div className="px-6 md:px-12 pt-12 pb-8 border-b border-white/5 relative z-10 flex flex-col gap-4">
          <button 
            onClick={() => router.back()}
            className="text-xs font-medium text-[#606070] hover:text-white transition-colors flex items-center gap-1 w-fit"
          >
            <ChevronLeft size={14} /> Voltar
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 uppercase tracking-widest">
              Regras
            </h1>
            <p className="text-[#606070] text-sm md:text-base max-w-2xl font-medium">
              Entenda como funciona o sistema de pontuação, as validações de atividades e as diretrizes gerais da plataforma.
            </p>
          </div>
        </div>

        <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto space-y-12 relative z-10">
          
          {/* Section: General Rules */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-6 bg-[#CCCC00] rounded-full" />
              <h2 className="text-xs font-bold text-[#606070] uppercase tracking-widest">Diretrizes Gerais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: CheckCircle2, title: 'Sem Pontuação Parcial', text: 'O mínimo completo de cada atividade vale exatamente 1 ponto.' },
                { icon: Zap, title: 'Limite Diário', text: 'Máximo de 4 pontos acumulados por dia, independentemente do grupo.' },
                { icon: Camera, title: 'Comprovação Obrigatória', text: 'Foto do painel ou screenshot do app de monitoramento é indispensável.' },
                { icon: Calendar, title: 'Registros do Dia', text: 'Atividades devem ser registradas apenas no dia em que foram realizadas.' }
              ].map((item, i) => (
                <div key={i} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 flex gap-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#CCCC00]/10 transition-colors">
                    <item.icon size={20} className="text-[#606070] group-hover:text-[#CCCC00] transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-[#606070] leading-relaxed font-medium">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Activity Scoring */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-6 bg-[#CCCC00] rounded-full" />
              <h2 className="text-xs font-bold text-[#606070] uppercase tracking-widest">Tabela de Pontuação</h2>
            </div>

            <div className="space-y-10">
              {CATEGORIES.map((cat, catIdx) => (
                <div key={catIdx}>
                  <h3 className="text-[11px] font-bold text-[#606070] uppercase tracking-[0.2em] mb-4 pl-1">{cat.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                    {cat.activities.map((actId, actIdx) => {
                      const act = ACTIVITIES.find(a => a.id === actId);
                      if (!act) return null;
                      const Icon = ICON_MAP[act.icon] || Activity;
                      return (
                        <div key={actId} className="bg-[#0A0A0A] p-4 flex items-center justify-between group hover:bg-[#0E0E0E] transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Icon size={16} className="text-[#606070] group-hover:text-white transition-colors" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{act.name}</p>
                              <p className="text-[10px] text-[#606070] font-bold uppercase tracking-tighter">Requisito Mínimo</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-[#CCCC00] bg-[#CCCC00]/5 px-3 py-1.5 rounded-lg border border-[#CCCC00]/10">
                              {act.description.replace(' = ', ' • ')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tips / Important info */}
          <div className="bg-[#CCCC00]/5 border border-[#CCCC00]/10 rounded-2xl p-6 md:p-8 flex items-start gap-4">
            <AlertCircle className="text-[#CCCC00] shrink-0" size={24} />
            <div>
              <h4 className="text-sm font-bold text-white mb-2">Nota sobre Moderação</h4>
              <p className="text-xs text-[#606070] leading-relaxed font-medium">
                Todas as atividades estão sujeitas à revisão pelos administradores do grupo. Registros sem comprovação visual clara ou com informações inconsistentes poderão ser invalidados. Mantenha seu histórico organizado para garantir sua posição no ranking.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
