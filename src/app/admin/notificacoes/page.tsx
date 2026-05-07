'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Send, Sparkles, Megaphone, 
  Users, Info, Bell, Target, Calendar, User
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function AdminNotificationsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' as 'error' | 'success' });

  // Broadcast Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        setUserProfile(data);
        // Only allow specific IDs for now, or check for a role column if you have one
        // If you don't have roles, you can gate by email or UUID
        // const isAdmin = data.role === 'admin'; 
      }
      setIsLoading(false);
    };

    checkAdmin();
  }, [router, supabase]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('send_admin_broadcast', {
        msg_title: title.trim(),
        msg_content: content.trim(),
        target_link: link.trim() || null
      });

      if (error) throw error;

      setToast({ isVisible: true, message: 'Broadcast enviado para todos os membros!', type: 'success' });
      setTitle('');
      setContent('');
      setLink('');
    } catch (err: any) {
      console.error(err);
      setToast({ isVisible: true, message: 'Erro ao enviar broadcast.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#CCCC00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className} selection:bg-[#CCCC00] selection:text-black`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-24 md:pb-0 h-screen overflow-y-auto scroll-smooth">
        <div className="max-w-[800px] mx-auto px-4 py-8 md:py-16">
          
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <button
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
            >
              <ChevronLeft size={20} className="text-[#808090]" />
            </button>
            <div>
              <h1 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                Central de Mensagens
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1 h-1 rounded-full bg-[#CCCC00] shadow-[0_0_8px_#CCCC00]" />
                <p className="text-[#606070] text-[10px] font-black uppercase tracking-[0.2em]">Painel de Broadcast Global</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                <Megaphone size={120} />
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-[#CCCC00]/10 border border-[#CCCC00]/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-[#CCCC00]" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Nova Transmissão</h2>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#606070] uppercase tracking-widest ml-1">Título da Notificação</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Treino Coletivo Amanhã! 🔥"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-[#303035] focus:outline-none focus:border-[#CCCC00]/50 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#606070] uppercase tracking-widest ml-1">Conteúdo da Mensagem</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Descreva o anúncio para todos os membros..."
                      rows={4}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-[#303035] focus:outline-none focus:border-[#CCCC00]/50 transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#606070] uppercase tracking-widest ml-1">Link de Destino (Opcional)</label>
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="Ex: /dashboard ou https://..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-[#303035] focus:outline-none focus:border-[#CCCC00]/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[#CCCC00] rounded-2xl flex items-center justify-center gap-3 group hover:bg-[#DDDD00] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-xs font-black text-black uppercase tracking-[0.2em]">Disparar Notificações</span>
                      <Send size={16} className="text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Users Management Section */}
            <UserList supabase={supabase} />

            {/* Tips Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
                <div className="flex items-center gap-3 mb-4 text-[#CCCC00]">
                  <Users size={18} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Público-alvo</h3>
                </div>
                <p className="text-xs text-[#606070] leading-relaxed font-medium">
                  Esta mensagem será enviada instantaneamente para **todos os usuários** cadastrados na plataforma Oryon Forge.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
                <div className="flex items-center gap-3 mb-4 text-[#CCCC00]">
                  <Bell size={18} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Push Browser</h3>
                </div>
                <p className="text-xs text-[#606070] leading-relaxed font-medium">
                  Usuários que permitiram notificações no navegador receberão um alerta visual mesmo com a aba fechada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
      
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

function UserList({ supabase }: { supabase: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [supabase]);

  if (loading) return null;

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 md:p-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#CCCC00]/10 border border-[#CCCC00]/20 flex items-center justify-center">
            <Users size={16} className="text-[#CCCC00]" />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Membros Ativos ({users.length})</h2>
        </div>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div 
            key={user.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={14} className="text-[#606070]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{user.username || 'Sem nome'}</span>
                  {user.role === 'admin' && (
                    <span className="px-1.5 py-0.5 bg-[#CCCC00] text-black text-[7px] font-black rounded uppercase">Admin</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[9px] text-[#606070] font-black uppercase tracking-widest">
                  <span>LVL {user.level || 1}</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span>{user.title || 'Recruta'}</span>
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[9px] text-[#303035] font-black uppercase tracking-widest">Registrado em</div>
              <div className="text-[10px] text-[#606070] font-bold">
                {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
