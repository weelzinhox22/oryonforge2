'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DotLottiePlayer } from '@dotlottie/react-player';

export default function InviteCodePage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  useEffect(() => {
    if (inviteCode) {
      // Save the code to sessionStorage so the dashboard/lobby can pick it up
      sessionStorage.setItem('oryon_pending_invite_code', inviteCode.toUpperCase());
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      router.push('/dashboard');
    }
  }, [inviteCode, router]);

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-6">
      <div className="w-48 h-48">
        <DotLottiePlayer
          src="/Loading.lottie"
          autoplay
          loop
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-[#CCCC00] font-black uppercase tracking-[0.3em] text-sm animate-pulse">Sincronizando Convite</h2>
        <p className="text-[#303035] text-[10px] font-bold uppercase tracking-widest">Validando código de acesso...</p>
      </div>
    </div>
  );
}
