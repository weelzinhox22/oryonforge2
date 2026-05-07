'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  ChevronLeft, User, Heart, MessageCircle, Send, Clock, Activity
} from 'lucide-react';
import { Sora, Outfit } from 'next/font/google';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { DotLottiePlayer } from '@dotlottie/react-player';

const sora = Sora({ subsets: ['latin'], weight: ['700', '800'] });
const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '700', '900'] });

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const postId = params.postId as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setCurrentUserId(session.user.id);

      const [{ data: postData }, { data: comms }, { count: lCount }, { data: userLike }] = await Promise.all([
        supabase
          .from('activity_logs')
          .select('*, profiles:profile_display_with_titles(username, avatar_url, active_title)')
          .eq('id', postId)
          .single(),
        supabase
          .from('activity_comments')
          .select('*, profiles:profile_display_with_titles(username, avatar_url, active_title)')
          .eq('activity_log_id', postId)
          .order('created_at', { ascending: true }),
        supabase
          .from('activity_likes')
          .select('*', { count: 'exact', head: true })
          .eq('activity_log_id', postId),
        supabase
          .from('activity_likes')
          .select('id')
          .eq('activity_log_id', postId)
          .eq('user_id', session.user.id)
          .maybeSingle(),
      ]);

      if (postData) setPost(postData);
      setComments(comms || []);
      setLikesCount(lCount ?? 0);
      setHasLiked(!!userLike);
      setIsLoading(false);
    };
    load();
  }, [postId]);

  const handleToggleLike = async () => {
    if (!currentUserId) return;
    if (hasLiked) {
      await supabase.from('activity_likes').delete()
        .eq('activity_log_id', postId).eq('user_id', currentUserId);
      setLikesCount(p => Math.max(0, p - 1));
      setHasLiked(false);
    } else {
      const { error } = await supabase.from('activity_likes')
        .insert({ activity_log_id: postId, user_id: currentUserId });
      if (!error) { setLikesCount(p => p + 1); setHasLiked(true); }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('activity_comments')
      .insert({ activity_log_id: postId, user_id: session?.user.id, content: newComment.trim() })
      .select('*, profiles:profile_display_with_titles(username, avatar_url, active_title)')
      .single();
    if (data && !error) {
      setComments(prev => [...prev, data]);
      setNewComment('');
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
    setIsSubmitting(false);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-36 h-36"><DotLottiePlayer src="/Loading.lottie" autoplay loop /></div>
      <p className="text-[#CCCC00] text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Carregando Post</p>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-[#606070] text-sm font-bold">Post não encontrado.</p>
    </div>
  );

  return (
    <div className={`flex min-h-screen bg-[#000000] text-[#F0F0F6] ${outfit.className}`}>
      <Sidebar onSignOut={() => supabase.auth.signOut()} />

      <main className="flex-1 pb-24 md:pb-0 h-screen overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">

          {/* ── Back ── */}
          <button
            onClick={() => router.push(`/dashboard/${groupId}/feed`)}
            className="flex items-center gap-2 text-[#606070] hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Voltar ao Feed</span>
          </button>

          {/* ── Post card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#080808] border border-white/[0.06] rounded-3xl overflow-hidden"
          >
            {/* User header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
              <div
                className="flex items-center gap-3 cursor-pointer group/u"
                onClick={() => router.push(`/membros/${post.user_id}`)}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center group-hover/u:border-[#CCCC00]/40 transition-all">
                  {post.profiles?.avatar_url
                    ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />
                    : <User size={18} className="text-[#303035]" />}
                </div>
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-tight group-hover/u:text-[#CCCC00] transition-colors">
                    {post.profiles?.username}
                    {post.profiles?.active_title && (
                      <span className="text-[#606070] font-normal text-[9px] normal-case ml-1">, {post.profiles.active_title}</span>
                    )}
                  </p>
                  <p className="text-[9px] font-black text-[#CCCC00] uppercase tracking-widest">{post.activity_type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-white tracking-tighter">+{post.points}</div>
                <div className="text-[8px] font-black text-[#606070] uppercase tracking-widest">pontos</div>
              </div>
            </div>

            {/* ── Full image — no crop, no layout ── */}
            <div className="w-full bg-black">
              <img
                src={post.proof_url}
                alt="Evidência de treino"
                className="w-full h-auto block"
              />
            </div>

            {/* ── Social bar ── */}
            <div className="px-5 py-3 border-t border-white/[0.06] flex items-center gap-4">
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${
                  hasLiked
                    ? 'bg-[#CCCC00]/10 border-[#CCCC00]/30 text-[#CCCC00]'
                    : 'bg-white/5 border-white/10 text-[#808090] hover:bg-white/10'
                }`}
              >
                <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />
                {likesCount} Kudos
              </button>
              <div className="flex items-center gap-2 text-[#606070] text-xs font-black uppercase tracking-widest">
                <MessageCircle size={14} />
                {comments.length}
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-[#303035]">
                <Clock size={11} />
                <span className="text-[9px] font-bold">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            </div>

            {/* ── Comments ── */}
            <div className="px-5 py-4 border-t border-white/[0.06] space-y-4">
              {comments.length === 0 && (
                <p className="text-center py-4 text-[9px] font-black text-[#303035] uppercase tracking-widest">
                  Seja o primeiro a comentar
                </p>
              )}
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {c.profiles?.avatar_url
                      ? <img src={c.profiles.avatar_url} className="w-full h-full object-cover" />
                      : <User size={11} className="text-[#303035]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">{c.profiles?.username}</span>
                      <span className="text-[8px] text-[#606070]">{format(new Date(c.created_at), 'HH:mm')}</span>
                    </div>
                    <p className="text-xs text-[#808090] font-medium leading-relaxed mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            {/* Comment input */}
            <form onSubmit={handleComment} className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Escreva um incentivo..."
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#303035] focus:outline-none focus:border-[#CCCC00]/50 transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="w-9 h-9 rounded-xl bg-[#CCCC00] text-black flex items-center justify-center hover:bg-[#b3b300] transition-all disabled:opacity-30 active:scale-95"
              >
                <Send size={14} strokeWidth={2.5} />
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
