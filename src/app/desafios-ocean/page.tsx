'use client';

import { Activity, Dumbbell, HeartPulse, Trophy, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ValidaJusGymChallenges() {
  const challenges = [
    {
      id: 1,
      title: "Resistência Cardiovascular",
      subtitle: "Correr 15km na semana",
      progress: 65,
      current: "9.7 km",
      total: "15 km",
      status: "active",
      icon: <HeartPulse size={24} className="text-shield-400" />,
      color: "shield",
      daysLeft: 2
    },
    {
      id: 2,
      title: "Hipertrofia Elite",
      subtitle: "Treinar 5 dias seguidos",
      progress: 80,
      current: "4 dias",
      total: "5 dias",
      status: "warning",
      icon: <Dumbbell size={24} className="text-amber-400" />,
      color: "amber",
      daysLeft: 1
    },
    {
      id: 3,
      title: "Monitoramento Metabólico",
      subtitle: "Queimar 3000 kcal ativas",
      progress: 100,
      current: "3150 kcal",
      total: "3000 kcal",
      status: "completed",
      icon: <Activity size={24} className="text-gold-400" />,
      color: "gold",
      daysLeft: 0
    }
  ];

  return (
    <div className="min-h-screen bg-ocean-950 text-white font-sans relative overflow-hidden pb-20">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-shield-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="px-6 pt-16 pb-6 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-shield-500" />
          <p className="text-[10px] font-mono text-shield-400 uppercase tracking-widest">Painel Biométrico</p>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">Central de Desafios</h1>
        <p className="text-ocean-300 text-sm">Monitoramento de alta performance e cumprimento de metas.</p>
      </header>

      {/* Hero Tracker Card */}
      <main className="px-6 relative z-10 space-y-6">
        <section className="bg-ocean-900/40 backdrop-blur-md border border-ocean-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-shield-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy size={100} className="text-shield-500" />
          </div>
          
          <div className="relative z-10">
            <p className="text-[10px] font-mono text-ocean-400 uppercase tracking-widest mb-1">Status Global</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-ocean-300">Nível 42</span>
              <span className="text-sm font-bold text-shield-500">Elite</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-ocean-400 uppercase tracking-widest">XP de Validação</span>
                <span className="text-white">8.450 / 10.000</span>
              </div>
              <div className="h-2 w-full bg-ocean-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '84.5%' }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-shield-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Challenges */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-ocean-400">Rastreamento Ativo</h2>
            <span className="bg-shield-500/10 border border-shield-500/20 text-shield-400 text-[10px] uppercase font-mono px-2 py-1 rounded-full tracking-wider">
              3 Em Andamento
            </span>
          </div>

          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-ocean-900/40 backdrop-blur-sm border border-ocean-800 rounded-[2rem] p-5 shadow-lg group hover:border-shield-500/50 hover:shadow-2xl hover:shadow-shield-500/10 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-2xl bg-${challenge.color}-500/10 flex items-center justify-center border border-${challenge.color}-500/20`}>
                      {challenge.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">{challenge.title}</h3>
                      <p className="text-xs text-ocean-400 mt-0.5">{challenge.subtitle}</p>
                    </div>
                  </div>
                  {challenge.status === 'completed' ? (
                    <CheckCircle2 size={20} className="text-gold-500" />
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      <Clock size={12} /> {challenge.daysLeft}d
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-ocean-400">Progresso</span>
                    <span className="text-white">{challenge.current} / {challenge.total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-ocean-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${challenge.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        challenge.status === 'completed' ? 'bg-gold-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
                        challenge.status === 'warning' ? 'bg-amber-500' : 'bg-shield-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
