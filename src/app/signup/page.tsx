'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, ShieldCheck, UserPlus, Activity } from 'lucide-react';
import Link from 'next/link';
import Toast from '@/components/Toast';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'error' | 'success' }>({
    isVisible: false,
    message: '',
    type: 'error',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (username.length < 3) {
      setToast({ isVisible: true, message: 'O código de agente deve ter pelo menos 3 caracteres.', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        setToast({ isVisible: true, message: 'Código de agente já em uso.', type: 'error' });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (error) {
        throw new Error(error.message === 'User already registered'
          ? 'Email já cadastrado no sistema.'
          : 'Erro ao gerar credenciais.');
      }

      if (data.user) {
        setToast({ isVisible: true, message: 'Credenciais geradas com sucesso. Acessando...', type: 'success' });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setToast({ isVisible: true, message: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* ValidaJus Background Ambient Glows */}
      <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-shield-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="w-full max-w-sm mb-10 relative z-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-ocean-900/50 backdrop-blur-md border border-ocean-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-50" />
          <UserPlus size={36} className="text-blue-400 relative z-10" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-blue-400" />
          <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Cadastro Biométrica</p>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Novo Agente</h1>
        <p className="text-ocean-300 text-sm">Gere suas credenciais de acesso ao monitoramento.</p>
      </div>

      {/* Signup Form Glassmorphism */}
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4 relative z-10">
        <div>
          <label className="text-[10px] font-mono text-ocean-400 uppercase tracking-widest mb-2 block">
            Código de Agente (Username)
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
            className="w-full bg-ocean-900/40 backdrop-blur-sm border border-ocean-800 rounded-2xl px-5 py-4 text-white placeholder:text-ocean-700 focus:border-blue-500 focus:bg-ocean-900/80 transition-all outline-none"
            placeholder="ex: agente_alpha"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-ocean-400 uppercase tracking-widest mb-2 block">
            Email Corporativo
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-ocean-900/40 backdrop-blur-sm border border-ocean-800 rounded-2xl px-5 py-4 text-white placeholder:text-ocean-700 focus:border-blue-500 focus:bg-ocean-900/80 transition-all outline-none"
            placeholder="agente@validajus.com"
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-ocean-400 uppercase tracking-widest mb-2 block">
            Chave de Acesso (Mín. 6)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ocean-900/40 backdrop-blur-sm border border-ocean-800 rounded-2xl px-5 py-4 pr-12 text-white placeholder:text-ocean-700 focus:border-blue-500 focus:bg-ocean-900/80 transition-all outline-none"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ocean-500 hover:text-ocean-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-5 mt-6 rounded-2xl font-black text-sm uppercase tracking-widest bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-30 disabled:shadow-none hover:bg-blue-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? 'Gerando...' : <><ShieldCheck size={18} /> Validar Cadastro</>}
        </button>

        <p className="text-center text-sm text-ocean-400 mt-8">
          Já possui credenciais?{' '}
          <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 underline underline-offset-4">
            Acessar Painel
          </Link>
        </p>
      </form>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
