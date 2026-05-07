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
import ImageCropEditor from '@/components/ImageCropEditor';
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
          transition: { duration: 0.4, repeat: Infinity, ease: "linear" as const }
        };
      case 'musculacao':
        return {
          animate: { y: [0, -5, 0], scale: [1, 1.05, 1] },
          transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const }
        };
      case 'corrida':
      case 'esteira':
        return {
          animate: { 
            x: [0, 3, 0],
            y: [0, -2, 0],
            skewX: [0, -5, 0]
          },
          transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const }
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
          transition: { duration: 1, repeat: Infinity, ease: "easeInOut" as const }
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
  const [sportValues, setSportValues] = useState<Record<string, string>>({});
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageOffsets, setImageOffsets] = useState<{x: number, y: number}[]>([]); // 0 to 100 for X/Y axis
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'error' | 'success' }>({
    isVisible: false, message: '', type: 'error'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalFiles = proofFiles.length + files.length;
    if (totalFiles > 4) {
      setToast({ isVisible: true, message: 'MÃƒÂ¡ximo de 4 fotos permitido.', type: 'error' });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ isVisible: true, message: `O arquivo ${file.name} ÃƒÂ© muito grande (MÃƒÂ¡x: 5MB).`, type: 'error' });
        return false;
      }
      return true;
    });

    const newProofFiles = [...proofFiles, ...validFiles];
    setProofFiles(newProofFiles);
    setPreviewUrls(newProofFiles.map(file => URL.createObjectURL(file)));
    setImageOffsets([...imageOffsets, ...validFiles.map(() => ({ x: 50, y: 50 }))]); // Default to center (50%)
  };

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const newFiles = [...proofFiles];
    newFiles.splice(index, 1);
    setProofFiles(newFiles);
    
    // Revoke old URL to avoid memory leak
    URL.revokeObjectURL(previewUrls[index]);
    const newUrls = [...previewUrls];
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);

    const newOffsets = [...imageOffsets];
    newOffsets.splice(index, 1);
    setImageOffsets(newOffsets);
  };

  const generateGridImage = async (files: File[]): Promise<Blob> => {
    if (files.length === 1) return files[0];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Falha ao inicializar canvas');

    // Load all images
    const images = await Promise.all(files.map(file => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    }));

    // Target size for the grid (square)
    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    const drawImageCover = (img: HTMLImageElement, x: number, y: number, w: number, h: number, offset: {x: number, y: number} = {x: 50, y: 50}) => {
      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let sx, sy, sw, sh;

      if (imgRatio > targetRatio) {
        // Image is wider than target
        sh = img.height;
        sw = sh * targetRatio;
        const totalSlack = img.width - sw;
        sx = (totalSlack * offset.x) / 100;
        sy = 0;
      } else {
        // Image is taller than target
        sw = img.width;
        sh = sw / targetRatio;
        sx = 0;
        const totalSlack = img.height - sh;
        sy = (totalSlack * offset.y) / 100;
      }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    };

    if (images.length === 2) {
      // 2 images: Side by side (vertical split)
      drawImageCover(images[0], 0, 0, size / 2 - 2, size, imageOffsets[0]);
      drawImageCover(images[1], size / 2 + 2, 0, size / 2 - 2, size, imageOffsets[1]);
      // Divider
      ctx.fillStyle = '#000000';
      ctx.fillRect(size / 2 - 2, 0, 4, size);
    } else {
      // 3 or 4 images: 2x2 grid
      const half = size / 2;
      const gap = 2;
      
      drawImageCover(images[0], 0, 0, half - gap, half - gap, imageOffsets[0]);
      drawImageCover(images[1], half + gap, 0, half - gap, half - gap, imageOffsets[1]);
      drawImageCover(images[2], 0, half + gap, half - gap, half - gap, imageOffsets[2]);
      
      if (images.length === 4) {
        drawImageCover(images[3], half + gap, half + gap, half - gap, half - gap, imageOffsets[3]);
      } else {
        ctx.fillStyle = '#050505';
        ctx.fillRect(half + gap, half + gap, half - gap, half - gap);
      }

      // Dividers
      ctx.fillStyle = '#000000';
      ctx.fillRect(half - gap, 0, gap * 2, size);
      ctx.fillRect(0, half - gap, size, gap * 2);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSubmit = async () => {
    if (selectedSports.length === 0) {
      setToast({ isVisible: true, message: 'Selecione pelo menos uma atividade.', type: 'error' });
      return;
    }
    if (proofFiles.length === 0) {
      setToast({ isVisible: true, message: 'A ComprovaÃ§Ã£o visual ÃƒÂ© obrigatÃƒÂ³ria.', type: 'error' });
      return;
    }
    if (!groupId) {
      setToast({ isVisible: true, message: 'ID do grupo nÃƒÂ£o identificado.', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('SessÃ£o expirada.');

      // 0. Check Daily Limit and Time Constraints
      const now = new Date();
      const hour = now.getHours();
      
      if (hour === 0) {
        setToast({ isVisible: true, message: 'HorÃƒÂ¡rio bloqueado! Nada de treinos ÃƒÂ  meia-noite.', type: 'error' });
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
          setToast({ isVisible: true, message: 'O desafio de 45 dias jÃƒÂ¡ encerrou para este grupo.', type: 'error' });
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
      
      // 1. Detect Device Info
      const deviceInfo = (navigator as any).userAgentData?.platform || navigator.platform || 'Unknown Device';

      // 2. Generate Grid Image
      const finalBlob = await generateGridImage(proofFiles);
      const fileExt = proofFiles[0].name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const filePath = `activity-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, finalBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(filePath);

      // 3. Calculate points per activity and combine them
      let totalPointsToAward = 0;
      const activityNames: string[] = [];

      selectedSports.forEach(sportId => {
        const activity = ACTIVITIES.find(a => a.id === sportId);
        const value = parseFloat(sportValues[sportId] || '0');
        let points = 1;

        if (activity) {
          points = value / activity.factor;
          activityNames.push(activity.name);
        }
        totalPointsToAward += points;
      });

      let combinedActivityType = "";
      if (activityNames.length === 1) {
        combinedActivityType = activityNames[0];
      } else if (activityNames.length === 2) {
        combinedActivityType = `${activityNames[0]} e ${activityNames[1]}`;
      } else if (activityNames.length > 2) {
        const last = activityNames.pop();
        combinedActivityType = `${activityNames.join(', ')} e ${last}`;
      }

      const logInsert = {
        user_id: session.user.id,
        group_id: groupId,
        activity_type: combinedActivityType,
        points: Number(totalPointsToAward.toFixed(2)),
        proof_url: publicUrl,
        device_info: deviceInfo,
      };

      if (currentPoints + totalPointsToAward > 4.01) { // Small buffer for float precision
        setToast({ 
          isVisible: true, 
          message: `Limite excedido! Você só pode registrar mais ${(4 - currentPoints).toFixed(2)} pontos hoje. Esta atividade soma ${totalPointsToAward.toFixed(2)} pts.`, 
          type: 'error' 
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from('activity_logs').insert([logInsert]);

      if (error) throw error;

      setToast({ isVisible: true, message: `${selectedSports.length} atividades registradas! Total: ${totalPointsToAward.toFixed(2)} pts`, type: 'success' });
      
      await new Promise(r => setTimeout(r, 1500));
      router.push(`/dashboard/${groupId}`);
      
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
                Selecione sua modalidade e anexe a ComprovaÃ§Ã£o para validar seu esforÃƒÂ§o diÃƒÂ¡rio.
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

            {/* Step 1: Activity Selection */}
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

            {selectedSports.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-xs font-black text-[#606070] uppercase tracking-[0.3em]">Passo 2: Detalhes do EsforÃƒÂ§o</h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedSports.map((sportId) => {
                    const activity = ACTIVITIES.find(a => a.id === sportId);
                    return (
                      <div key={sportId} className="bg-[#050505] border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            {activity && ICON_MAP[activity.id] && (() => {
                              const Icon = ICON_MAP[activity.id];
                              return <Icon size={18} className="text-[#CCCC00]" />;
                            })()}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-wider">{activity?.name}</p>
                            <p className="text-[10px] text-[#606070] font-bold uppercase tracking-widest">{activity?.description}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <input 
                            type="number"
                            placeholder={`Qtd em ${activity?.unit}`}
                            value={sportValues[sportId] || ''}
                            onChange={(e) => setSportValues({ ...sportValues, [sportId]: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#CCCC00]/50 outline-none transition-all font-black"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#303035] uppercase tracking-widest">
                            {activity?.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Action / Upload Area */}
          <div className="lg:col-span-4 space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-xs font-black text-[#606070] uppercase tracking-[0.3em]">Passo 3: ComprovaÃ§Ã£o</h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Ã¢â€â‚¬Ã¢â€â‚¬ Empty drop zone (no files yet) Ã¢â€â‚¬Ã¢â€â‚¬ */}
              {previewUrls.length === 0 && (
                <label className="block w-full rounded-[2.5rem] border-2 border-dashed border-white/5 bg-[#050505] hover:border-[#CCCC00]/30 hover:bg-[#CCCC00]/[0.02] transition-all duration-500 cursor-pointer overflow-hidden aspect-square flex flex-col items-center justify-center group shadow-2xl">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#CCCC00]/10 group-hover:border-[#CCCC00]/30 transition-all duration-700">
                    <UploadCloud size={40} strokeWidth={1} className="text-[#606070] group-hover:text-[#CCCC00] group-hover:animate-bounce" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">Enviar EvidÃªncias</h3>
                  <p className="text-xs text-[#606070] font-medium leading-relaxed max-w-[200px] text-center">
                    Selecione atÃ© 4 fotos para criar um grid automÃ¡tico de treino.
                  </p>
                </label>
              )}

              {/* Ã¢â€â‚¬Ã¢â€â‚¬ Image cards (visible once files are added) Ã¢â€â‚¬Ã¢â€â‚¬ */}
              <AnimatePresence>
                {previewUrls.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="space-y-4"
                  >
                    {previewUrls.map((url, idx) => (
                      <motion.div
                        key={url}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <ImageCropEditor
                          src={url}
                          offsetX={imageOffsets[idx]?.x ?? 50}
                          offsetY={imageOffsets[idx]?.y ?? 50}
                          index={idx}
                          onRemove={(e) => removeFile(idx, e)}
                          onChange={(x, y) => {
                            const newOffsets = [...imageOffsets];
                            newOffsets[idx] = { x, y };
                            setImageOffsets(newOffsets);
                          }}
                        />
                      </motion.div>
                    ))}

                    {/* Add more button */}
                    {proofFiles.length < 4 && (
                      <label className="flex items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl p-4 cursor-pointer hover:border-[#CCCC00]/30 hover:bg-[#CCCC00]/[0.02] transition-all group">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#606070] group-hover:text-[#CCCC00] group-hover:bg-[#CCCC00]/10 group-hover:border-[#CCCC00]/20 transition-all">
                          <Camera size={15} />
                        </div>
                        <span className="text-[10px] font-black text-[#606070] uppercase tracking-widest group-hover:text-white transition-colors">
                          Adicionar foto ({proofFiles.length}/4)
                        </span>
                      </label>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <div className="space-y-8">
              <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 flex items-start gap-4 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-[#CCCC00]/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="text-[#CCCC00]" size={20} />
                </div>
                <p className="text-[11px] text-[#606070] leading-relaxed font-medium">
                  A pontuaÃ§Ã£o <span className="text-white font-bold">Ã© automÃ¡tica</span>. Auditorias periÃ³dicas sÃ£o realizadas; em caso de fraude, o administrador poderÃ¡ remover os pontos retroativamente.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={selectedSports.length === 0 || proofFiles.length === 0 || isSubmitting || !groupId}
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

