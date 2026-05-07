'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { createClient } from '@/lib/supabase/client';
import { Activity, Trophy, Users, ChevronRight, Target, Sparkles, Menu, X, Flame, Medal, Swords, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient();
  const heroRef = useRef<HTMLDivElement>(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-reveal',
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out', delay: 0.1 }
      );
      
      gsap.to('.gsap-glow-organic', {
        boxShadow: '0 0 30px rgba(204, 204, 0, 0.4)',
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut'
      });
    }, heroRef);

    return () => ctx.revert();
  }, [router, supabase]);

  // Bloqueia o scroll do body quando o menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isMobileMenuOpen]);

  const features = [
    {
      icon: <Users className="w-7 h-7 text-[#CCCC00]" />,
      title: "Comunidade de Elite",
      description: "Conecte-se com atletas de alto nível. Forme grupos, guilds ou equipes e evolua em conjunto."
    },
    {
      icon: <Target className="w-7 h-7 text-[#CCCC00]" />,
      title: "Metas Implacáveis",
      description: "Defina seus objetivos e ultrapasse seus limites diariamente com tracking focado."
    },
    {
      icon: <Activity className="w-7 h-7 text-[#CCCC00]" />,
      title: "Track Inteligente",
      description: "Monitoramento contínuo de performance. Cada KM, repetição e suor conta para o seu progresso."
    },
    {
      icon: <Trophy className="w-7 h-7 text-[#CCCC00]" />,
      title: "Pódios em Tempo Real",
      description: "Ranking vivo e pulsante. A cada treino finalizado, uma nova posição disputada na tabela."
    },
    {
      icon: <Flame className="w-7 h-7 text-[#CCCC00]" />,
      title: "Gamificação Extrema",
      description: "Sistema de XP, níveis e badges para recompensar a consistência e a superação."
    },
    {
      icon: <Swords className="w-7 h-7 text-[#CCCC00]" />,
      title: "Duelos & Desafios",
      description: "Crie combates diretos contra amigos ou enfrente eventos globais da comunidade."
    }
  ];

  const navLinks = [
    { name: 'Funcionalidades', href: '#features' },
    { name: 'Ecossistema', href: '#ecosystem' },
    { name: 'Entrar', href: '/login', isLogin: true }
  ];

  return (
    <div className={`min-h-screen bg-black text-[#F0F0F6] overflow-x-hidden selection:bg-[#CCCC00] selection:text-black ${outfit.className}`}>
      
      {/* Navbar Desktop & Mobile Header */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed w-full z-50 top-6 px-4 md:px-6"
      >
        <div className="max-w-6xl mx-auto h-20 bg-black/50 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-between px-6 md:px-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          
          <Link href="/" className="flex items-center gap-3 group relative z-50" onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
              <Image 
                src="/oryonforgeico.png" 
                alt="Oryon Forge Logo" 
                width={36} 
                height={36}
                className="drop-shadow-[0_0_10px_rgba(204,204,0,0.5)]"
              />
            </motion.div>
            <span className="text-xl font-bold tracking-wide group-hover:text-[#CCCC00] transition-colors">
              Oryon
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-8 text-sm font-medium text-[#606070]">
              {navLinks.filter(l => !l.isLogin).map((link) => (
                <motion.a 
                  key={link.name}
                  whileHover={{ y: -2, color: "#CCCC00" }} 
                  href={link.href} 
                  className="transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-semibold text-white hover:text-[#CCCC00] transition-colors px-4">
                Entrar
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/register" 
                  className="px-6 py-2.5 bg-[#CCCC00] text-black font-bold text-sm rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(204,204,0,0.3)] hover:shadow-[0_0_25px_rgba(204,204,0,0.6)] transition-all"
                >
                  Começar
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden relative z-50 text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%', transition: { duration: 0.3 } }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center pt-20 px-6"
          >
            <div className="flex flex-col gap-8 text-center w-full max-w-sm">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-3xl font-black tracking-tight block py-4 border-b border-white/5 ${link.isLogin ? 'text-white' : 'text-[#606070] hover:text-[#CCCC00]'}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-5 bg-[#CCCC00] text-black font-black text-xl rounded-full shadow-[0_0_30px_rgba(204,204,0,0.3)] active:scale-95 transition-transform"
                >
                  Começar Agora <Zap className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
            </div>
            
            {/* Background elements in mobile menu */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#CCCC00]/10 to-transparent pointer-events-none" />
            <Image 
              src="/oryonforgevertical.webp" 
              alt="Oryon Vertical" 
              width={100} 
              height={160}
              className="absolute bottom-10 opacity-20 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[100dvh] pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: yParallax, opacity: opacityFade }} className="absolute inset-0 z-0 pointer-events-none">
          <Image 
            src="/imginicial.webp" 
            alt="Hero Background" 
            fill
            priority
            className="object-cover opacity-40 mix-blend-lighten"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-transparent" />
        </motion.div>

        <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col items-center text-center mt-12">
          
          <div className="gsap-reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-[#CCCC00] mb-8">
            <Sparkles className="w-4 h-4" /> Evolução Constante
          </div>
          
          <h1 className="gsap-reveal text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6">
            Eleve seu nível.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#CCCC00] to-[#888800]">
              Domine o placar.
            </span>
          </h1>
          
          <p className="gsap-reveal text-lg md:text-xl text-[#606070] max-w-2xl leading-relaxed mb-10">
            A plataforma social fitness definitiva. Transforme cada gota de suor em progresso, domine o ranking do seu grupo e alcance o topo.
          </p>

          <div className="gsap-reveal flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link 
              href="/register" 
              className="gsap-glow-organic flex items-center justify-center gap-2 px-10 py-5 bg-[#CCCC00] text-black font-black text-lg rounded-full hover:bg-white transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
            >
              Criar Conta <ChevronRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="flex items-center justify-center px-10 py-5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md font-bold text-lg hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
            >
              Acessar Conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative z-10 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-6"
            >
              A Mecânica da <span className="text-[#CCCC00]">Excelência</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-[#606070]"
            >
              Oryon não é apenas um tracker. É um ecossistema focado em resultado, disciplina e competição saudável.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#CCCC00]/40 hover:bg-white/[0.05] transition-all duration-500 group flex flex-col h-full"
              >
                <div className="w-16 h-16 rounded-full bg-[#CCCC00]/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#CCCC00]/20 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-base text-[#606070] leading-relaxed flex-grow">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Achievements Showcase on Landing */}
      <section className="py-32 px-6 relative bg-black overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20">
             <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 uppercase italic">
                  Legado <span className="text-[#CCCC00]">Imortalizado</span>
                </h2>
                <p className="text-lg text-[#606070] font-medium leading-relaxed">
                  Suas vitórias merecem mais que um log. No Oryon Forge, cada grande marco é transformado em uma medalha de honra.
                </p>
             </div>
             <div className="flex items-center gap-4">
                <div className="text-right">
                   <p className="text-3xl font-black text-white">50+</p>
                   <p className="text-xs font-black text-[#CCCC00] uppercase tracking-widest">Achievements</p>
                </div>
                <div className="w-[1px] h-12 bg-white/10" />
                <div>
                   <p className="text-3xl font-black text-white">12</p>
                   <p className="text-xs font-black text-[#606070] uppercase tracking-widest">Níveis de Evolução</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
             {[
               { title: 'Projeto Verão', icon: '/conquistas/projetoverao.png', rarity: 'Comum' },
               { title: 'Modo Caverna', icon: '/conquistas/modocaverna.png', rarity: 'Raro' },
               { title: 'Tanque de Guerra', icon: '/conquistas/tanquedeguerra.png', rarity: 'Épico' },
               { title: 'Modo Insano', icon: '/conquistas/modoinsano.png', rarity: 'Lendário' }
             ].map((ach, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-[#0A0A0A] border border-white/[0.04] rounded-[2.5rem] p-6 md:p-10 flex flex-col items-center text-center group hover:border-[#CCCC00]/30 transition-all duration-500"
               >
                  <div className="w-20 h-20 md:w-32 md:h-32 mb-6 relative">
                     <img 
                       src={ach.icon} 
                       alt={ach.title} 
                       className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-700" 
                     />
                  </div>
                  <h3 className="text-xs md:text-sm font-black text-white uppercase italic tracking-tight mb-2">{ach.title}</h3>
                  <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                    ach.rarity === 'Lendário' ? 'bg-[#CCCC00]/10 border-[#CCCC00]/30 text-[#CCCC00]' : 'bg-white/5 border-white/10 text-[#606070]'
                  }`}>
                    {ach.rarity}
                  </span>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* NEW: Live Feed Section on Landing */}
      <section className="py-32 px-6 relative bg-[#050505]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
           <div className="lg:col-span-5 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic leading-[1.1]">
                A Rede <span className="text-[#CCCC00]">Pulsante</span> de Performance
              </h2>
              <p className="text-lg text-[#606070] font-medium leading-relaxed">
                Acompanhe a evolução da comunidade em tempo real. Veja o que os atletas estão forjando agora mesmo e sinta o peso da competição.
              </p>
              <div className="space-y-4 pt-4">
                 {[
                   { label: 'Validação por Provas', desc: 'Nada de "treinei" sem foto. Aqui a evidência é a regra.' },
                   { label: 'Social Interativo', desc: 'Comente, curta e incentive sua unidade.' }
                 ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="w-6 h-6 rounded-full bg-[#CCCC00] flex items-center justify-center shrink-0">
                          <ChevronRight size={14} className="text-black" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-black text-white uppercase italic tracking-tight">{item.label}</p>
                          <p className="text-xs text-[#606070]">{item.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="lg:col-span-7 relative">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-8 shadow-3xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#CCCC00]/[0.03] to-transparent" />
                 
                 <div className="space-y-8 relative z-10">
                    {[
                      { user: 'Marcus V.', act: 'MUSCULAÇÃO', pts: 4, group: 'Elite Alpha', time: 'Há 2 min' },
                      { user: 'Ana Paula', act: 'CORRIDA 10KM', pts: 6, group: 'Maratonistas SP', time: 'Há 12 min' },
                      { user: 'Rodrigo S.', act: 'CROSSFIT', pts: 4, group: 'Forja 99', time: 'Há 25 min' }
                    ].map((f, i) => (
                       <motion.div 
                         key={i}
                         initial={{ opacity: 0, x: 20 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.1 }}
                         className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-[#CCCC00]/20 transition-all"
                       >
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-[#606070] group-hover:text-[#CCCC00] transition-colors">
                                {f.user.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-black text-white uppercase italic tracking-tight">{f.user}</p>
                                <p className="text-[10px] text-[#606070] font-black uppercase tracking-widest">{f.act} • {f.group}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-lg font-black text-[#CCCC00]">+{f.pts} PTS</div>
                             <div className="text-[9px] font-bold text-[#303035] uppercase">{f.time}</div>
                          </div>
                       </motion.div>
                    ))}
                 </div>

                 {/* Decorative elements */}
                 <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-black text-[#303035] uppercase tracking-[0.4em]">Live Connection Secured</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Ecossistema & Integração */}
      <section id="ecosystem" className="py-32 px-6 relative overflow-hidden">
        {/* Fundo Decorativo */}
        <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-[#CCCC00]/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          
          <div className="w-full lg:w-1/2 relative z-10 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square max-w-md mx-auto"
            >
              <Image 
                src="/imginicial2.webp" 
                alt="Oryon Ecosystem" 
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(204,204,0,0.2)]"
              />
              
              {/* Floating badges animation */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-0 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-[#CCCC00] flex items-center justify-center text-black font-black">1º</div>
                <div>
                  <p className="text-sm font-bold text-white">Nível Elite</p>
                  <p className="text-xs text-[#CCCC00]">Top 1% Global</p>
                </div>
              </motion.div>
              
              <motion.div 
                animate={{ y: [10, -10, 10] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-0 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-3"
              >
                <Medal className="w-8 h-8 text-[#CCCC00]" />
                <div>
                  <p className="text-sm font-bold text-white">+500 XP Hoje</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-2 border border-[#CCCC00]/30 bg-[#CCCC00]/10 rounded-full text-[#CCCC00] text-sm font-bold tracking-wide mb-6">
                O Flow Perfeito
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Treine. Registre.<br/>
                <span className="text-[#CCCC00]">Domine.</span>
              </h2>
              <p className="text-lg text-[#606070] leading-relaxed mb-8">
                O nosso ecossistema funciona como um motor de consistência. Você entra, escolhe seu esporte, registra suas metas e a plataforma calcula seu impacto no grupo. 
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Múltiplas Modalidades", desc: "Suporte para Musculação, Corrida, CrossFit, Natação e muito mais." },
                  { title: "Score Híbrido", desc: "Seu suor é convertido em XP através de cálculos algorítmicos justos." },
                  { title: "Telas de Vitória", desc: "Compartilhe seus recordes diretamente nas suas redes sociais." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-[#CCCC00] flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-black font-bold" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{item.title}</h4>
                      <p className="text-sm text-[#606070]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Massive CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-black" />
        
        <div className="max-w-5xl mx-auto relative z-10 bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-[3rem] p-10 md:p-20 text-center overflow-hidden">
          
          {/* Brilho interno */}
          <div className="absolute inset-0 bg-[#CCCC00]/5 mix-blend-overlay" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-[#CCCC00]/20 blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-center"
          >
            <Image 
              src="/oryonforgevertical.webp" 
              alt="Oryon Vertical" 
              width={80} 
              height={140}
              className="mb-10 drop-shadow-[0_0_15px_rgba(204,204,0,0.4)]"
            />
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
              A Plataforma Aguarda.
            </h2>
            
            <p className="text-xl md:text-2xl text-[#606070] max-w-2xl mx-auto mb-12">
              Junte-se a milhares de atletas que já transformaram seus treinos em uma jornada lendária. O pódio é apenas o começo.
            </p>

            <Link 
              href="/register" 
              className="group relative inline-flex items-center justify-center px-12 py-6 bg-[#CCCC00] text-black font-black text-xl rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(204,204,0,0.3)] hover:shadow-[0_0_60px_rgba(204,204,0,0.6)]"
            >
              Criar Conta e Começar
              <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="py-12 border-t border-white/5 bg-black text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Image src="/oryonforgeico.png" alt="Oryon" width={32} height={32} className="opacity-50" />
          <p className="text-[#606070] text-sm font-medium">
            © {new Date().getFullYear()} ORYON. Plataforma de Alta Performance.
          </p>
        </div>
      </footer>
    </div>
  );
}
