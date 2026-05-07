'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, Trophy, Heart, MessageCircle, TrendingUp, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || unreadCount === 0) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) return;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Permissão concedida para notificações push.');
      // Here you would normally register a service worker and save the subscription
      // to the push_subscriptions table in Supabase.
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy size={14} className="text-[#CCCC00]" />;
      case 'like': return <Heart size={14} className="text-[#CCCC00]" />;
      case 'comment': return <MessageCircle size={14} className="text-[#CCCC00]" />;
      case 'ranking_loss': return <TrendingUp size={14} className="text-red-500" />;
      case 'broadcast': return <Sparkles size={14} className="text-[#CCCC00]" />;
      default: return <Bell size={14} className="text-[#808090]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAsRead();
        }}
        className="p-2 rounded-full bg-white/5 border border-white/10 text-[#808090] hover:text-[#CCCC00] hover:bg-[#CCCC00]/10 transition-all active:scale-90 relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-[#CCCC00] text-black text-[8px] font-black rounded-full flex items-center justify-center border-2 border-black">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[999] bg-black/20" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed right-4 top-20 md:right-8 md:top-24 w-[calc(100vw-32px)] md:w-[380px] bg-[#0A0A0A]/95 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden z-[1000] backdrop-blur-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Notificações</h3>
                <div className="flex items-center gap-4">
                  {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
                    <button 
                      onClick={requestPushPermission}
                      className="text-[8px] font-black text-[#CCCC00] uppercase tracking-widest hover:underline"
                    >
                      Ativar Push
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-[#303035] hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-6 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors flex gap-5 ${!n.is_read ? 'bg-[#CCCC00]/5' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <p className="text-[12px] font-bold text-white leading-tight">{n.title}</p>
                        <p className="text-[11px] text-[#606070] font-medium leading-relaxed">{n.content}</p>
                        <p className="text-[9px] text-[#303035] font-black uppercase tracking-[0.1em] pt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <Bell size={24} className="text-[#1A1A1A]" />
                    <p className="text-[9px] font-black text-[#303035] uppercase tracking-widest">Nenhuma notificação</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/[0.01] text-center">
                <span className="text-[8px] font-black text-[#202025] uppercase tracking-[0.3em]">Oryon Intelligence</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
