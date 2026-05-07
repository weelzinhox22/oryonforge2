'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ChevronLeft, Calendar, Trophy, 
  Users, Save, AlertTriangle, Clock,
  UserCheck, Shield, ShieldAlert,
  Image as ImageIcon
} from 'lucide-react';
import { Outfit, Sora } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';
import { addDays, format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });
const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'] });

const GROUP_AVATARS = [
  'group_icon_1_1.png', 'group_icon_1_2.png', 'group_icon_2_1.png', 'group_icon_2_2.png',
  'group_icon_3_1.png', 'group_icon_3_2.png', 'group_icon_4_1.png', 'group_icon_5_1.png'
];

export default function GroupSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('member');
  const [members, setMembers] = useState<any[]>([]);
  
  // Form State
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [periodDays, setPeriodDays] = useState<number>(45);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' as 'error' | 'success' });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch group and current user role
      const { data: membership } = await supabase
        .from('group_members')
        .select('role, groups (*)')
        .eq('user_id', session.user.id)
        .eq('group_id', groupId)
        .single();

      if (!membership || !['admin', 'manager'].includes(membership.role)) {
        router.push(`/dashboard/${groupId}`);
        return;
      }

      const group = Array.isArray(membership.groups) ? membership.groups[0] : (membership.groups as any);
      
      if (!group) {
        router.push(`/dashboard`);
        return;
      }

      setActiveGroup(group);
      setUserRole(membership.role);
      setGroupName(group.name);
      setGroupDescription(group.description || '');
      setGroupAvatar(group.avatar_url || '');
      setPeriodDays(group.period_days || 45);

      // Fetch all members
      const { data: allMembers } = await supabase
        .from('group_members')
        .select('user_id, role, joined_at, profiles(username, avatar_url)')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      setMembers(allMembers || []);
      setIsLoading(false);
    };

    fetchData();
  }, [groupId, router, supabase]);

  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: groupName,
          description: groupDescription,
          period_days: periodDays,
          avatar_url: groupAvatar
        })
        .eq('id', groupId);

      if (error) throw error;

      setToast({ isVisible: true, message: 'Configurações atualizadas com sucesso!', type: 'success' });
      
      setActiveGroup({
        ...activeGroup,
        name: groupName,
        description: groupDescription,
        period_days: periodDays,
        avatar_url: groupAvatar
      });
    } catch (error: any) {
      setToast({ isVisible: true, message: error.message || 'Erro ao atualizar.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAdmin = async (targetUserId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('group_id', groupId)
        .eq('user_id', targetUserId);

      if (error) throw error;

      setMembers(members.map(m => m.user_id === targetUserId ? { ...m, role: newRole } : m));
      setToast({ isVisible: true, message: `Membro atualizado para ${newRole}!`, type: 'success' });
    } catch (error: any) {
      setToast({ isVisible: true, message: 'Erro ao alterar cargo.', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#CCCC00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const startDate = new Date(activeGroup.created_at);
  const endDate = addDays(startDate, periodDays);
  const daysLeft = differenceInDays(endDate, new Date());

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className}`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-24 md:pb-12 h-screen overflow-y-auto overflow-x-hidden relative">
        <div className="max-w-4xl mx-auto px-6 py-10 md:py-16">
          
          <header className="flex items-center gap-6 mb-12">
            <button
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
            >
              <ChevronLeft size={20} className="text-[#808090]" />
            </button>
            <div>
              <h1 className={`text-2xl md:text-3xl font-black text-white uppercase tracking-tighter ${sora.className}`}>
                Gestão do Grupo
              </h1>
              <p className="text-[#606070] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Configurações de Identidade e Moderação</p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-12">
            
            {/* Status do Desafio */}
            <section className="bg-[#CCCC00]/5 border border-[#CCCC00]/20 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Clock size={80} className="text-[#CCCC00]" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <Trophy size={20} className="text-[#CCCC00]" />
                  <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Status do Desafio</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-[#606070] uppercase tracking-widest mb-1">Início</p>
                    <p className="text-lg font-black text-white italic">{format(startDate, "dd 'de' MMM", { locale: ptBR })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#606070] uppercase tracking-widest mb-1">Término Previsto</p>
                    <p className="text-lg font-black text-[#CCCC00] italic">{format(endDate, "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#606070] uppercase tracking-widest mb-1">Status</p>
                    <p className="text-lg font-black text-white italic">{daysLeft > 0 ? `${daysLeft} dias restantes` : 'Finalizado'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Configurações Editáveis */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-12">
              
              {/* Identidade Visual */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <ImageIcon size={18} className="text-[#606070]" />
                  <h3 className="text-[11px] font-black text-[#606070] uppercase tracking-[0.3em]">Identidade Visual</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#404045] uppercase tracking-widest ml-1">Ícone do Grupo</label>
                    <div className="flex flex-wrap gap-3">
                      {GROUP_AVATARS.map(avatar => {
                        const url = `/avatars_group/${avatar}`;
                        const isSelected = groupAvatar === url;
                        return (
                          <button
                            key={avatar}
                            onClick={() => setGroupAvatar(url)}
                            className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${
                              isSelected 
                                ? 'border-[#CCCC00] scale-110 shadow-[0_0_20px_rgba(204,204,0,0.4)]' 
                                : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'
                            }`}
                          >
                            <img src={url} alt="Icon" className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#404045] uppercase tracking-widest ml-1">Nome do Grupo</label>
                      <input 
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[#CCCC00]/50 outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#404045] uppercase tracking-widest ml-1">Duração (Dias)</label>
                      <input 
                        type="number"
                        value={periodDays}
                        onChange={(e) => setPeriodDays(parseInt(e.target.value) || 0)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[#CCCC00]/50 outline-none transition-all font-black text-lg italic"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#404045] uppercase tracking-widest ml-1">Descrição / Regras</label>
                    <textarea 
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[#CCCC00]/50 outline-none transition-all font-medium text-sm resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateSettings}
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-10 py-5 bg-[#CCCC00] text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-[#ebd600] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  <Save size={16} strokeWidth={3} />
                  {isUpdating ? 'Salvando...' : 'Salvar Alterações de Identidade'}
                </button>
              </div>

              {/* Gestão de Membros */}
              <div className="space-y-8 pt-12 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-[#606070]" />
                  <h3 className="text-[11px] font-black text-[#606070] uppercase tracking-[0.3em]">Gestão de Equipe ({members.length})</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {members.map((member) => {
                    const profile = Array.isArray(member.profiles) ? member.profiles[0] : (member.profiles as any);
                    const isAdmin = member.role === 'admin';
                    const isManager = member.role === 'manager';
                    
                    return (
                      <div 
                        key={member.user_id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                              <Users size={16} className="text-[#303035]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{profile?.username || 'Membro'}</span>
                              {isAdmin && (
                                <span className="px-1.5 py-0.5 rounded-md bg-[#CCCC00]/10 border border-[#CCCC00]/20 text-[8px] font-black text-[#CCCC00] uppercase tracking-tighter">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#606070] font-medium">Entrou em {format(new Date(member.joined_at), "dd/MM/yy")}</p>
                          </div>
                        </div>

                        {/* Ações de Moderador */}
                        {!isManager && (
                          <button
                            onClick={() => handleToggleAdmin(member.user_id, member.role)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              isAdmin 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'
                                : 'bg-[#CCCC00]/10 text-[#CCCC00] border border-[#CCCC00]/20 hover:bg-[#CCCC00] hover:text-black'
                            }`}
                          >
                            {isAdmin ? <ShieldAlert size={14} /> : <Shield size={14} />}
                            {isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </section>
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
