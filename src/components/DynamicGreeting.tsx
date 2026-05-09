'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

interface DynamicGreetingProps {
  username?: string;
  avatarUrl?: string;
  streak: number;
  dailyPoints: number;
  dailyGoal: number;
  ranking: { username: string; points: number }[];
  activeGroupId?: string;
}

/**
 * Loaded with dynamic({ ssr: false }) — never renders on server,
 * so there is zero risk of hydration mismatch.
 */
export default function DynamicGreeting({
  username,
  avatarUrl,
  streak,
  dailyPoints,
  dailyGoal,
  ranking,
  activeGroupId,
}: DynamicGreetingProps) {
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !username || !activeGroupId || ranking.length === 0) return;

    let cancelled = false;

    const fetchGreeting = async () => {
      try {
        console.log('[DynamicGreeting] Fetching for:', username, 'with ranking:', ranking.length, 'entries');
        const res = await fetch('/api/generate-greeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            avatarUrl,
            streak,
            dailyPoints,
            dailyGoal,
            ranking: ranking.map((r) => ({ username: r.username, points: r.points })),
          }),
        });

        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.message && !cancelled) setMessage(data.message);
      } catch {
        // silent — placeholder stays visible
      }
    };

    fetchGreeting();
    return () => { cancelled = true; };
  }, [mounted, username, streak, dailyPoints, activeGroupId, ranking]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  if (!message) {
    return (
      <span className="opacity-40 animate-pulse flex items-center gap-2 italic">
        <Activity size={14} />
        Analisando seu desempenho...
      </span>
    );
  }

  return <>{message}</>;
}
