'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Settings, Users, 
  Target, Shield, Trash2, 
  Check, Save, AlertTriangle,
  ChevronDown, Activity, Info
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function GroupSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [group, setGroup] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    daily_points_limit: 4,
    status: 'active'
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' as 'error' | 'success' });
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: membership } = await supabase
        .from('group_members')
        .select('role, groups (*)')
        .eq('group_id', groupId)
        .eq('user_id', session.user.id)
        .single();

      if (!membership || !['admin', 'manager'].includes(membership.role)) {
        router.push(`/dashboard/${groupId}`);
        return;
      }

      setIsAdmin(membership.role === 'admin');
      setGroup(membership.groups);
      setFormData({
        name: membership.groups.name,
        description: membership.groups.description || '',
        daily_points_limit: membership.groups.daily_points_limit || 4,
        status: membership.groups.status || 'active',
        avatar_url: membership.groups.avatar_url || ''
      });
      setIsLoading(false);
    };

    fetchGroupData();
  }, [groupId, supabase, router]);

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('groups')
        .update(formData)
        .eq('id', groupId);

      if (error) throw error;

      setToast({ isVisible: true, message: 'Configurações sincronizadas!', type: 'success' });
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      setToast({ isVisible: true, message: 'Falha na sincronização neural.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-6">
        <div className="w-32 h-32">
          <DotLottiePlayer src="/Loading.lottie" autoplay loop />
        </div>
      </div>
    );
  }

  const AVAILABLE_GROUP_AVATARS = [
    'group_icon_1_1.png', 'group_icon_1_2.png', 'group_icon_1_3.png', 'group_icon_1_4.png', 'group_icon_1_5.png', 'group_icon_1_6.png', 'group_icon_1_7.png',
    'group_icon_2_1.png', 'group_icon_2_2.png', 'group_icon_2_3.png', 'group_icon_2_4.png', 'group_icon_2_5.png', 'group_icon_2_6.png', 'group_icon_2_7.png',
    'group_icon_3_1.png', 'group_icon_3_2.png', 'group_icon_3_3.png', 'group_icon_3_4.png', 'group_icon_3_5.png', 'group_icon_3_6.png', 'group_icon_3_7.png',
    'group_icon_4_1.png', 'group_icon_4_2.png', 'group_icon_4_3.png', 'group_icon_4_4.png', 'group_icon_4_5.png', 'group_icon_4_6.png', 'group_icon_4_7.png',
    'group_icon_5_1.png', 'group_icon_5_2.png', 'group_icon_5_3.png', 'group_icon_5_4.png', 'group_icon_5_5.png', 'group_icon_5_6.png', 'group_icon_5_7.png',
  ];

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className} selection:bg-[#CCCC00] selection:text-black`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-32 md:pb-0 h-screen overflow-y-auto scroll-smooth">
        {/* Cinematic Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#CCCC00]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[100px] rounded-full" />
        </div>

        <div className="max-w-[850px] mx-auto px-6 py-12 md:py-20 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push(`/dashboard/${groupId}`)}
                className="w-14 h-14 rounded-[22px] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all active:scale-90 shadow-2xl group"
              >
                <ChevronLeft size={24} className="text-[#808090] group-hover:text-white transition-colors" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#CCCC00] shadow-[0_0_10px_#CCCC00]" />
                  <h2 className="text-[10px] font-black text-[#606070] uppercase tracking-[0.4em]">Configurações</h2>
                </div>
                <h1 className={`text-3xl md:text-4xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                  Gestão do Grupo
                </h1>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="text-[10px] font-bold text-[#303035] uppercase tracking-widest">ID do Grupo</span>
              <span className="text-xs font-mono text-[#606070] bg-white/5 px-3 py-1 rounded-lg border border-white/5">{groupId.split('-')[0].toUpperCase()}</span>
            </div>
          </div>

          <form onSubmit={handleUpdateGroup} className="space-y-10">
            
            {/* Section: Identity */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-10 bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <Info size={120} />
              </div>

              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-2xl bg-[#CCCC00]/10 border border-[#CCCC00]/20 flex items-center justify-center">
                  <Settings size={18} className="text-[#CCCC00]" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Identidade Visual</h3>
              </div>

              <div className="space-y-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                  <div className="relative group/group-avatar">
                    <div className="w-28 h-28 rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center group-hover/group-avatar:border-[#CCCC00]/40 transition-all">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Group Icon" className="w-full h-full object-cover" />
                      ) : (
                        <Users size={32} className="text-[#303035]" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-[#606070] uppercase tracking-widest ml-1">Icone do Grupo</label>
                      <p className="text-[9px] text-[#404045] font-bold uppercase">Escolha um símbolo que represente sua unidade</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_GROUP_AVATARS.slice(0, 7).map(avatar => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar_url: `/avatars_group/${avatar}` })}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                            formData.avatar_url === `/avatars_group/${avatar}` 
                              ? 'border-[#CCCC00] scale-110 shadow-[0_0_15px_rgba(204,204,0,0.3)]' 
                              : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          <img src={`/avatars_group/${avatar}`} alt="Icon" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <button 
                        type="button"
                        onClick={() => {
                          const randomAvatar = AVAILABLE_GROUP_AVATARS[Math.floor(Math.random() * AVAILABLE_GROUP_AVATARS.length)];
                          setFormData({ ...formData, avatar_url: `/avatars_group/${randomAvatar}` });
                        }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#606070] hover:text-[#CCCC00] hover:border-[#CCCC00]/40 transition-all"
                      >
                        ALT
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-[#606070] uppercase tracking-widest">Nome da Unidade</label>
                      {formData.name.length > 0 && <span className="text-[9px] font-bold text-[#303035]">{formData.name.length}/40</span>}
                    </div>
                    <input
                      type="text"
                      maxLength={40}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-5 text-lg text-white font-bold placeholder:text-[#202025] focus:outline-none focus:border-[#CCCC00]/40 focus:bg-white/[0.05] transition-all"
                      placeholder="Ex: Elite Training Club"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#606070] uppercase tracking-widest ml-1">Descrição & Missão</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-white font-medium placeholder:text-[#202025] focus:outline-none focus:border-[#CCCC00]/40 focus:bg-white/[0.05] transition-all h-40 resize-none leading-relaxed"
                      placeholder="Qual o objetivo principal deste grupo?"
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section: Dynamics */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-10 bg-white/[0.01] border border-white/5 rounded-[3rem] relative"
            >
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-2xl bg-[#CCCC00]/10 border border-[#CCCC00]/20 flex items-center justify-center">
                  <Target size={18} className="text-[#CCCC00]" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Dinâmica de Progresso</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-[#606070] uppercase tracking-widest ml-1">Limite Diário</label>
                    <p className="text-[9px] text-[#404045] font-bold uppercase mb-2">Máximo de pontos por usuário/dia</p>
                  </div>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#CCCC00]">
                      <Activity size={18} />
                    </div>
                    <input
                      type="number"
                      value={formData.daily_points_limit}
                      onChange={(e) => setFormData({ ...formData, daily_points_limit: parseInt(e.target.value) })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] pl-16 pr-24 py-5 text-xl text-white font-black focus:outline-none focus:border-[#CCCC00]/40 transition-all"
                      min="1"
                      max="10"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#303035] uppercase tracking-widest">Pontos</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-[#606070] uppercase tracking-widest ml-1">Status Operacional</label>
                    <p className="text-[9px] text-[#404045] font-bold uppercase mb-2">Visibilidade e acesso ao grupo</p>
                  </div>
                  
                  {/* Custom Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-5 flex items-center justify-between group hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-[#CCCC00] shadow-[0_0_8px_#CCCC00]' : 'bg-[#606070]'}`} />
                        <span className="font-bold text-white uppercase tracking-tight text-sm">
                          {formData.status === 'active' ? 'Grupo Ativo' : 'Grupo Arquivado'}
                        </span>
                      </div>
                      <ChevronDown size={18} className={`text-[#404045] transition-transform duration-300 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showStatusDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 mt-3 p-3 bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => { setFormData({ ...formData, status: 'active' }); setShowStatusDropdown(false); }}
                              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${formData.status === 'active' ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                            >
                              <div className="w-2 h-2 rounded-full bg-[#CCCC00] shrink-0" />
                              <div className="text-left">
                                <p className="text-xs font-bold text-white uppercase tracking-tight">Ativo</p>
                                <p className="text-[9px] text-[#606070] font-medium">Todos os membros podem postar e interagir.</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setFormData({ ...formData, status: 'archived' }); setShowStatusDropdown(false); }}
                              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all mt-1 ${formData.status === 'archived' ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                            >
                              <div className="w-2 h-2 rounded-full bg-[#606070] shrink-0" />
                              <div className="text-left">
                                <p className="text-xs font-bold text-white uppercase tracking-tight">Arquivado</p>
                                <p className="text-[9px] text-[#606070] font-medium">Somente leitura. Ninguém pode postar treinos.</p>
                              </div>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section: Danger Zone */}
            {isAdmin && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-10 bg-red-500/[0.01] border border-red-500/10 rounded-[3rem] space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle size={18} className="text-red-500" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Procedimentos de Exclusão</h3>
                </div>
                
                <div className="p-6 bg-red-500/[0.03] border border-red-500/10 rounded-[2rem] space-y-4">
                  <p className="text-[11px] text-red-500/60 font-bold uppercase leading-relaxed tracking-wider">
                    Atenção: A exclusão do grupo apagará permanentemente todos os logs de atividade, fotos e rankings de todos os membros vinculados.
                  </p>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg"
                  >
                    <Trash2 size={16} /> Excluir Unidade Permanentemente
                  </button>
                </div>
              </motion.section>
            )}

            {/* Floating Save Action */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-6 bg-[#CCCC00] text-black rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(204,204,0,0.2)] hover:shadow-[0_25px_60px_rgba(204,204,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50 disabled:scale-100 group"
              >
                {isUpdating ? (
                  <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={20} className="group-hover:rotate-12 transition-transform" /> 
                    Confirmar Sincronização
                  </>
                )}
              </button>
            </div>
          </form>
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
