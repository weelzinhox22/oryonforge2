'use client';

import { motion } from 'framer-motion';
import { Sora } from 'next/font/google';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });

interface ActivityHeatmapProps {
  activities: { activity_date: string; activity_count: number }[];
}

export default function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  // Generate last 120 days for a mobile-friendly view, or last year for desktop
  const today = new Date();
  const startDate = subDays(today, 119); // 4 months approx
  const days = eachDayOfInterval({ start: startDate, end: today });

  const getActivityForDay = (day: Date) => {
    return activities.find(a => isSameDay(new Date(a.activity_date + 'T00:00:00'), day));
  };

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-white/5 border-white/5';
    if (count === 1) return 'bg-[#CCCC00]/20 border-[#CCCC00]/20';
    if (count === 2) return 'bg-[#CCCC00]/50 border-[#CCCC00]/40';
    return 'bg-[#CCCC00] border-[#CCCC00]';
  };

  // Group days by week for the grid
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  days.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#CCCC00] animate-pulse" />
          <span className="text-[10px] font-black text-[#CCCC00] uppercase tracking-widest">Atividade Recente</span>
        </div>
      </div>

      <h3 className={`text-lg font-black text-white uppercase tracking-tighter mb-8 ${sora.className}`}>
        Frequência de Treino
      </h3>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-2 shrink-0">
            {week.map((day, dIdx) => {
              const activity = getActivityForDay(day);
              const count = activity ? Number(activity.activity_count) : 0;
              
              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (wIdx * 7 + dIdx) * 0.002 }}
                  className={`w-4 h-4 rounded-md border transition-all duration-500 relative group/day ${getIntensity(count)}`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[9px] font-black rounded opacity-0 group-hover/day:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {format(day, "dd 'de' MMMM", { locale: ptBR })}: {count} {count === 1 ? 'atividade' : 'atividades'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#303035]">
        <div className="flex items-center gap-4">
          <span>Menos</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-white/5" />
            <div className="w-3 h-3 rounded-sm bg-[#CCCC00]/20" />
            <div className="w-3 h-3 rounded-sm bg-[#CCCC00]/50" />
            <div className="w-3 h-3 rounded-sm bg-[#CCCC00]" />
          </div>
          <span>Mais</span>
        </div>
        <span>Últimos 4 meses</span>
      </div>
    </div>
  );
}
