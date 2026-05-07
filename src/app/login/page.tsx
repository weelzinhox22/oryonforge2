'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, ChevronLeft, ArrowRight, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Toast from '@/components/Toast';
import { Outfit } from 'next/font/google';
import { motion } from 'framer-motion';
import { DotLottiePlayer } from '@dotlottie/react-player';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 400, damping: 30 } }
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'error' | 'success' }>({
    isVisible: false,
    message: '',
    type: 'error',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message === 'Invalid login credentials' 
          ? 'Credenciais inválidas.' 
          : 'Erro ao autenticar.');
      }

      if (data.session) {
        // Delay cinematico
        await new Promise(r => setTimeout(r, 2500));
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setToast({ isVisible: true, message: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#050505] text-[#F0F0F6] flex flex-col md:flex-row overflow-hidden ${outfit.className}`}>
      
      <Link href="/" className="absolute top-8 left-8 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all hidden md:flex hover:-translate-x-1 group">
        <ChevronLeft className="w-5 h-5 text-[#606070] group-hover:text-white transition-colors" />
      </Link>

      {/* Seção da Imagem / Branding Centrada (Esquerda no Desktop) */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/imginicial2.webp" 
            alt="Oryon Branding" 
            fill
            className="object-cover opacity-40 mix-blend-screen"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-[#050505]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-12 max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="w-16 h-16 bg-[#CCCC00]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#CCCC00]/20">
            <Image src="/oryonforgeico.png" alt="Oryon Logo" width={32} height={32} />
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-4 leading-tight">
            Bem-vindo à <br/><span className="text-[#CCCC00]">Plataforma.</span>
          </h2>
          <p className="text-[#606070] text-lg leading-relaxed">
            Acesse seu painel para continuar acompanhando sua performance e participando dos grupos ativos.
          </p>
        </motion.div>
      </div>

      {/* Formulário de Login (Direita) */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 relative bg-[#050505]">
        <div className="absolute inset-0 z-0 md:hidden">
          <Image 
            src="/imginicial.webp" 
            alt="Mobile BG" 
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-[400px] relative z-10"
        >
          <motion.div variants={itemVariants} className="md:hidden flex flex-col items-center text-center mb-10">
            <Link href="/" className="mb-6">
              <div className="w-16 h-16 bg-[#CCCC00]/10 rounded-2xl flex items-center justify-center border border-[#CCCC00]/20">
                <Image src="/oryonforgeico.png" alt="Oryon Logo" width={32} height={32} />
              </div>
            </Link>
            <h1 className="text-3xl font-black tracking-tight mb-2">Acessar Conta</h1>
            <p className="text-[#606070] text-sm">Insira seus dados para continuar.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="hidden md:block mb-10">
            <h1 className="text-4xl font-black tracking-tight mb-2">Login</h1>
            <p className="text-[#606070]">Insira suas credenciais de acesso.</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email' || email ? 'text-[#CCCC00]' : 'text-[#606070]'}`} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-14 pr-5 pt-7 pb-3 text-white outline-none focus:border-[#CCCC00]/50 focus:bg-white/[0.04] transition-all hover:border-white/20"
                required
              />
              <label className={`absolute left-14 transition-all duration-300 pointer-events-none font-medium
                ${focusedField === 'email' || email 
                  ? 'top-2.5 text-[10px] text-[#CCCC00] uppercase tracking-wider' 
                  : 'top-1/2 -translate-y-1/2 text-sm text-[#606070]'}`}
              >
                Endereço de E-mail
              </label>
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'password' || password ? 'text-[#CCCC00]' : 'text-[#606070]'}`} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-14 pr-14 pt-7 pb-3 text-white outline-none focus:border-[#CCCC00]/50 focus:bg-white/[0.04] transition-all hover:border-white/20"
                required
              />
              <label className={`absolute left-14 transition-all duration-300 pointer-events-none font-medium
                ${focusedField === 'password' || password 
                  ? 'top-2.5 text-[10px] text-[#CCCC00] uppercase tracking-wider' 
                  : 'top-1/2 -translate-y-1/2 text-sm text-[#606070]'}`}
              >
                Senha
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#606070] hover:text-[#CCCC00] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl font-bold text-[15px] bg-[#CCCC00] text-black disabled:opacity-50 hover:bg-[#b3b300] hover:shadow-[0_0_20px_rgba(204,204,0,0.3)] transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-12 h-12 -my-4">
                    <DotLottiePlayer
                      src="/Loading.lottie"
                      autoplay
                      loop
                    />
                  </div>
                ) : <><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> Acessar Painel</>}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center pt-6">
              <p className="text-[#606070] text-sm">
                Ainda não possui acesso?{' '}
                <Link href="/register" className="text-white font-semibold hover:text-[#CCCC00] transition-colors">
                  Criar conta
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
