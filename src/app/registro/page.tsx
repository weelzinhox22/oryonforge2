'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, Suspense, useEffect } from 'react';
import { 
  ChevronLeft, Activity, Image as ImageIcon, CheckCircle2, 
  UploadCloud, Trash2, ArrowRight, Dumbbell, Flame, Target, 
  Swords, CircleDot, Timer, Bike, ArrowUpRight, Footprints, Zap,
  AlertCircle, Camera, Wind, Trophy, Heart, Timer as TimerIcon
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Toast from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import ShareCard from '@/components/ShareCard';
import { ACTIVITIES } from '@/lib/activities';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { DotLottiePlayer } from '@dotlottie/react-player';

const ICON_MAP: Record<string, any> = {
  musculacao: Dumbbell,
  crossfit: Flame,
  funcional: Target,
  'artes-marciais': Swords,
  esportes: CircleDot,
  esteira: TimerIcon,
  'bike-ergometrica': Bike,
  escada: ArrowUpRight,
  eliptico: Activity,
  caminhada: Footprints,
  corrida: Wind,
  'bike-rua': Bike,
};

function ActivityCard({ act, isSelected, onSelect, index, isMinimalist }: { act: any, isSelected: boolean, onSelect: () => void, index: number, isMinimalist?: boolean }) {
  const Icon = ICON_MAP[act.id] || Activity;
  
  // Custom animations per activity type
  const getIconAnimation = () => {
    if (!isSelected || isMinimalist) return {};
    
    switch (act.id) {
      case 'bike-ergometrica':
      case 'bike-rua':
        return {
          animate: { 
            rotate: [0, -2, 2, 0],
            x: [0, 1, -1, 0],
            y: [0, -1, 1, 0]
          },
          transition: { duration: 0.4, repeat: Infinity, ease: "linear" }
        };
      case 'musculacao':
        return {
          animate: { y: [0, -5, 0], scale: [1, 1.05, 1] },
          transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
        };
      case 'corrida':
      case 'esteira':
        return {
          animate: { 
            x: [0, 3, 0],
            y: [0, -2, 0],
            skewX: [0, -5, 0]
          },
          transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
        };
      case 'crossfit':
      case 'funcional':
        return {
          animate: { scale: [1, 1.2, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] },
          transition: { duration: 0.8, repeat: Infinity }
        };
      default:
        return {
          animate: { y: [0, -3, 0] },
          transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        };
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative p-6 rounded-3xl border transition-all duration-500 flex flex-col items-start gap-4 overflow-hidden ${
        isSelected 
          ? 'bg-[#CCCC00]/10 border-[#CCCC00]/40 shadow-[0_20px_50px_rgba(204,204,0,0.15)]' 
          : 'bg-[#050505] border-white/5 hover:border-[#CCCC00]/20 hover:bg-[#0A0A0A]'
      }`}
    >
      {/* Background Glow on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#CCCC00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      
      <motion.div 
        {...getIconAnimation()}
        className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
          isSelected 
            ? 'bg-[#CCCC00] text-black shadow-[0_0_25px_rgba(204,204,0,0.4)]' 
            : 'bg-white/[0.03] text-[#606070] group-hover:bg-white/[0.08] group-hover:text-[#F0F0F6] group-hover:scale-110 group-hover:rotate-3'
        }`}
      >
        <Icon size={24} strokeWidth={1.5} />
      </motion.div>

      <div className="relative z-10 text-left">
        <p className={`text-sm font-black tracking-tight mb-1 transition-colors ${isSelected ? 'text-white' : 'text-[#F0F0F6]'}`}>
          {act.name}
        </p>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-[#CCCC00]' : 'text-[#606070]'}`}>
          {act.description.split('=')[0]}
        </p>
      </div>

      {isSelected && (
        <motion.div 
          layoutId={`active-marker-${act.id}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 text-[#CCCC00]"
        >
          <CheckCircle2 size={18} className="fill-[#CCCC00] text-[#0A0A0A]" />
        </motion.div>
      )}
    </motion.button>
  );
}

function RegistroActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [groupId, setGroupId] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: groups } = await supabase
        .from('group_members')
        .select('group_id, groups (name, id)')
        .eq('user_id', session.user.id);
      
      if (groups) setUserGroups(groups);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) setUserProfile(profile);
    };
    fetchData();
  }, []);

  const isMinimalist = userProfile?.dashboard_style === 'minimalist';

  useEffect(() => {
    const activityParam = searchParams.get('activity');
    if (activityParam && !selectedSports.includes(activityParam)) {
      setSelectedSports([activityParam]);
    }
  }, [searchParams]);

  useEffect(() => {
    const urlGroupId = searchParams.get('groupId');
    if (urlGroupId) {
      setGroupId(urlGroupId);
      localStorage.setItem('oryon_active_group_id', urlGroupId);
    } else {
      const storedGroupId = localStorage.getItem('oryon_active_group_id');
      setGroupId(storedGroupId);
    }
  }, [searchParams]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'error' | 'success' }>({
    isVisible: false, message: '', type: 'error'
  });
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareData, setShareData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ isVisible: true, message: 'Arquivo muito grande (Máx: 5MB).', type: 'error' });
        return;
      }
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setProofFile(null);
    setPreviewUrl(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSubmit = async () => {
    if (selectedSports.length === 0) {
      setToast({ isVisible: true, message: 'Selecione pelo menos uma atividade.', type: 'error' });
      return;
    }
    if (!proofFile) {
      setToast({ isVisible: true, message: 'A comprovação visual é obrigatória.', type: 'error' });
      return;
    }
    if (!groupId) {
      setToast({ isVisible: true, message: 'ID do grupo não identificado.', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada.');

      // 0. Check Daily Limit and Time Constraints
      const now = new Date();
      const hour = now.getHours();
      
      if (hour === 0) {
        setToast({ isVisible: true, message: 'Horário bloqueado! Nada de treinos à meia-noite.', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      const today = new Date();
      today.setHours(0,0,0,0);
      
      const { data: groupData } = await supabase
        .from('groups')
        .select('created_at')
        .eq('id', groupId)
        .single();

      if (groupData) {
        const startDate = new Date(groupData.created_at);
        const diffTime = Math.abs(now.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 45) {
          setToast({ isVisible: true, message: 'O desafio de 45 dias já encerrou para este grupo.', type: 'error' });
          setIsSubmitting(false);
          return;
        }
      }

      const { data: todayLogs } = await supabase
        .from('activity_logs')
        .select('points')
        .eq('user_id', session.user.id)
        .eq('group_id', groupId)
        .gte('created_at', today.toISOString());
        
      const currentPoints = todayLogs?.reduce((sum, log) => sum + (log.points || 0), 0) || 0;
      
      if (currentPoints >= 4) {
        setToast({ isVisible: true, message: 'Você já atingiu o limite de 4 pontos hoje!', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      if (currentPoints + selectedSports.length > 4) {
        setToast({ 
          isVisible: true, 
          message: `Limite excedido! Você só pode registrar mais ${4 - currentPoints} pontos hoje.`, 
          type: 'error' 
        });
        setIsSubmitting(false);
        return;
      }

      // 1. Detect Device Info
      const deviceInfo = (navigator as any).userAgentData?.platform || navigator.platform || 'Unknown Device';

      // 2. Upload File
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const filePath = `activity-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, proofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(filePath);

      // 3. Insert Records for each selected sport
      const inserts = selectedSports.map(sportId => ({
        user_id: session.user.id,
        group_id: groupId,
        activity_type: sportId,
        points: 1,
        proof_url: publicUrl,
        device_info: deviceInfo,
      }));
      const { error } = await supabase.from('activity_logs').insert(inserts);

      if (error) throw error;

      setToast({ isVisible: true, message: `${selectedSports.length} atividades registradas!`, type: 'success' });
      
      setShareData({
        type: 'activity',
        title: selectedSports.length > 1 ? 'Múltiplas Atividades' : ACTIVITIES.find(a => a.id === selectedSports[0])?.name || 'Atividade',
        subtitle: 'Esforço Validado',
        value: selectedSports.length,
        imageUrl: publicUrl,
        username: userProfile?.username || 'Guerreiro',
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()
      });

      // Delay cinematico para a animação de sucesso completar
      await new Promise(r => setTimeout(r, 1500));
      setShowShareCard(true);
      
    } catch (err: any) {
      setToast({ isVisible: true, message: err.message || 'Erro ao registrar.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#000000]">
      <Sidebar onSignOut={handleSignOut} />

      <main className="flex-1 pb-24 md:pb-12 h-screen overflow-y-auto overflow-x-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#CCCC00]/[0.02] to-transparent pointer-events-none" />

        <header className="px-6 md:px-12 pt-12 pb-10 relative z-10 max-w-7xl mx-auto flex flex-col gap-6">
          <button
            onClick={() => router.back()}
            className="text-[11px] font-black text-[#606070] hover:text-white transition-all flex items-center gap-2 w-fit bg-white/5 border border-white/5 px-4 py-2 rounded-xl uppercase tracking-widest"
          >
            <ChevronLeft size={14} /> Voltar ao Painel
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2 uppercase">
                Registro de Atividade
              </h1>
              <p className="text-[#606070] text-sm md:text-base font-medium max-w-xl">
                Selecione sua modalidade e anexe a comprovação para validar seu esforço diário.
              </p>
            </div>
          </div>
        </header>

        <div className="px-6 md:px-12 py-4 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          {/* Group & Activity Selection Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Step 0: Group Selection */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-xs font-black text-[#606070] uppercase tracking-[0.3em]">Passo 0: Destino</h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userGroups.map((ug) => (
                  <button
                    key={ug.group_id}
                    onClick={() => setGroupId(ug.group_id)}
                    className={`p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                      groupId === ug.group_id 
                        ? 'bg-[#CCCC00]/10 border-[#CCCC00]/40' 
                        : 'bg-[#050505] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        groupId === ug.group_id ? 'bg-[#CCCC00] text-black' : 'bg-white/5 text-[#606070]'
                      }`}>
                        <Target size={16} />
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${
                        groupId === ug.group_id ? 'text-[#CCCC00]' : 'text-[#F0F0F6]'
                      }`}>
                        {ug.groups.name}
                      </span>
                    </div>
                    {groupId === ug.group_id && <CheckCircle2 size={16} className="text-[#CCCC00]" />}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-xs font-black text-[#606070] uppercase tracking-[0.3em]">Passo 1: Modalidade</h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {ACTIVITIES.map((act, i) => (
                  <ActivityCard 
                    key={act.id} 
                    act={act} 
                    index={i}
                    isMinimalist={isMinimalist}
                    isSelected={selectedSports.includes(act.id)} 
                    onSelect={() => {
                      if (selectedSports.includes(act.id)) {
                        setSelectedSports(selectedSports.filter(s => s !== act.id));
                      } else if (selectedSports.length < 4) {
                        setSelectedSports([...selectedSports, act.id]);
                      } else {
                        setToast({ isVisible: true, message: 'Limite de 4 atividades atingido.', type: 'error' });
                      }
                    }} 
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Action / Upload Area */}
          <div className="lg:col-span-4 space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-xs font-black text-[#606070] uppercase tracking-[0.3em]">Passo 2: Comprovação</h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <div className="relative group">
                <label className={`block w-full rounded-[2.5rem] border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden aspect-square flex flex-col items-center justify-center relative ${
                  previewUrl 
                    ? 'border-[#CCCC00]/40 bg-[#050505]' 
                    : 'border-white/5 bg-[#050505] hover:border-[#CCCC00]/30 hover:bg-[#CCCC00]/[0.02] shadow-2xl'
                }`}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  
                  <AnimatePresence mode="wait">
                    {previewUrl ? (
                      <motion.div 
                        key="preview"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="relative w-full h-full"
                      >
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-md">
                          <div className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/20">
                            <Camera size={28} />
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-widest">Alterar Foto</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center p-8"
                      >
                        <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#CCCC00]/10 group-hover:border-[#CCCC00]/30 transition-all duration-700">
                          <UploadCloud size={40} strokeWidth={1} className="text-[#606070] group-hover:text-[#CCCC00] group-hover:animate-bounce" />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2">Enviar Evidência</h3>
                        <p className="text-xs text-[#606070] font-medium leading-relaxed max-w-[200px]">
                          Anexe o print do seu treino ou foto do painel (Máximo 5MB)
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </label>

                {previewUrl && (
                  <button 
                    onClick={removeFile}
                    className="absolute -top-3 -right-3 w-12 h-12 rounded-2xl bg-[#050505] border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-2xl z-20 group"
                  >
                    <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
                  </button>
                )}
              </div>
            </section>

            <div className="space-y-8">
              <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 flex items-start gap-4 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-[#CCCC00]/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="text-[#CCCC00]" size={20} />
                </div>
                <p className="text-[11px] text-[#606070] leading-relaxed font-medium">
                  A pontuação <span className="text-white font-bold">é automática</span>. Auditorias periódicas são realizadas; em caso de fraude, o administrador poderá remover os pontos retroativamente.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={selectedSports.length === 0 || !proofFile || isSubmitting || !groupId}
                className="w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.4em] bg-[#CCCC00] text-black shadow-[0_20px_40px_rgba(204,204,0,0.2)] disabled:opacity-10 disabled:shadow-none hover:bg-[#b3b300] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
              >
                {isSubmitting ? (
                  <div className="w-16 h-16 -my-4">
                    <DotLottiePlayer
                      src="/Loading.lottie"
                      autoplay
                      loop
                    />
                  </div>
                ) : (
                  <>
                    <span>Validar</span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {shareData && (
        <ShareCard 
          isOpen={showShareCard}
          onClose={() => {
            setShowShareCard(false);
            router.push('/dashboard');
          }}
          data={shareData}
        />
      )}
    </div>
  );
}

export default function RegistroActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="w-40 h-40">
          <DotLottiePlayer
            src="/Loading.lottie"
            autoplay
            loop
          />
        </div>
        <p className="text-[#CCCC00] text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Atividades</p>
      </div>
    }>
      <RegistroActivityContent />
    </Suspense>
  );
}
