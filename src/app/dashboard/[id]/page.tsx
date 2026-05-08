'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import DashboardView from '@/components/DashboardView';
import { Outfit } from 'next/font/google';
import { DotLottiePlayer } from '@dotlottie/react-player';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function GroupDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const supabase = createClient();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('member');
  const [ranking, setRanking] = useState<any[]>([]);
  const [dailyPoints, setDailyPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' as 'error' | 'success' });

  useEffect(() => {
    setIsMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && isMounted) {
        router.push('/login');
      } else if (session) {
        fetchGroupData(session.user.id, groupId);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase, groupId]);

  const fetchGroupData = async (userId: string, targetGroupId: string) => {
    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profile) setUserProfile(profile);

      const { data: streakValue } = await supabase.rpc('get_user_streak', { user_id_param: userId });
      setStreak(streakValue || 0);

      if (!targetGroupId) {
        console.error('Target Group ID is missing');
        router.push('/dashboard');
        return;
      }

      // Verify if user is in this group and get group details
      const { data: membershipData, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id, role, adjustment_points, groups (*)')
        .eq('user_id', userId)
        .eq('group_id', targetGroupId)
        .maybeSingle();

      if (membershipError) {
        console.error('Membership Error:', membershipError);
        // Fallback for older schema if adjustment_points is missing
        if (membershipError.message?.includes('adjustment_points')) {
          const { data: fallbackData } = await supabase
            .from('group_members')
            .select('group_id, role, groups (*)')
            .eq('user_id', userId)
            .eq('group_id', targetGroupId)
            .single();
          if (fallbackData) {
            setActiveGroup(fallbackData.groups);
            setUserRole(fallbackData.role);
          } else {
            router.push('/dashboard');
            return;
          }
        } else {
          router.push('/dashboard');
          return;
        }
      } else if (!membershipData) {
        console.warn('No membership found for user in group:', targetGroupId);
        router.push('/dashboard');
        return;
      } else {
        setActiveGroup(membershipData.groups);
        setUserRole(membershipData.role);
      }

      // Fetch all members to get adjustments and titles
      const { data: allMembers, error: allMembersError } = await supabase
        .from('group_members')
        .select('user_id, adjustment_points, profile_display_with_titles(username, level, title, avatar_url, active_title)')
        .eq('group_id', targetGroupId);

      const scores: Record<string, { username: string; points: number; userId: string; adjustment: number; level: number; title: string; avatarUrl: string }> = {};
      
      // Handle members even if adjustment_points is missing
      const processedMembers = allMembersError?.message?.includes('adjustment_points') 
        ? (await supabase.from('group_members').select('user_id, profiles(username)').eq('group_id', targetGroupId)).data
        : allMembers;

      if (processedMembers) {
        processedMembers.forEach((m: any) => {
          const profile = m.profile_display_with_titles as any;
          scores[m.user_id] = { 
            username: profile?.username || 'Usuário', 
            points: m.adjustment_points || 0,
            userId: m.user_id,
            adjustment: m.adjustment_points || 0,
            level: Math.floor((m.adjustment_points || 0) / 10) + 1,
            title: profile?.active_title || profile?.title || 'Recruta',
            avatarUrl: profile?.avatar_url
          };
        });
      }

      const { data: logsData } = await supabase
        .from('activity_logs')
        .select('user_id, points, created_at')
        .eq('group_id', targetGroupId);

      if (logsData) {
        let myTodayPoints = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        logsData.forEach((log: any) => {
          if (scores[log.user_id]) {
            scores[log.user_id].points += log.points;
            // Update level dynamically based on new points (10 pts per level)
            scores[log.user_id].level = Math.floor(scores[log.user_id].points / 10) + 1;
          }
          
          const logDate = new Date(log.created_at);
          if (log.user_id === userId && logDate >= today) {
            myTodayPoints += log.points;
          }
        });

        setDailyPoints(myTodayPoints);
        setRanking(Object.values(scores).sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return a.username.localeCompare(b.username); // Tie-breaker: Ange (A) stays before Welzinho (W)
        }));
      }

      // Group Activity Feed
      const { data: feedData } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('group_id', targetGroupId)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (feedData) {
        setActivityFeed(feedData);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do grupo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePoints = async (userIdToUpdate: string, newTotalPoints: number, currentLogPoints: number) => {
    try {
      const adjustment = newTotalPoints - currentLogPoints;
      const { error } = await supabase
        .from('group_members')
        .update({ adjustment_points: adjustment })
        .eq('group_id', groupId)
        .eq('user_id', userIdToUpdate);

      if (error) throw error;
      
      setToast({ isVisible: true, message: 'Pontuação atualizada!', type: 'success' });
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchGroupData(session.user.id, groupId);
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
      setToast({ isVisible: true, message: 'Erro ao atualizar pontos.', type: 'error' });
    }
  };

  const handleSignOut = async () => {
    router.push('/login');
    await supabase.auth.signOut();
  };

  const handleCopyInvite = () => {
    if (activeGroup?.invite_code) {
      const inviteUrl = `${window.location.origin}/code/${activeGroup.invite_code}`;
      navigator.clipboard.writeText(inviteUrl);
      setToast({ isVisible: true, message: 'Link de convite copiado!', type: 'success' });
      setTimeout(() => setToast({ isVisible: false, message: '', type: 'success' }), 3000);
    }
  };

  if (isLoading) {
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
          <h2 className="text-[#CCCC00] font-black uppercase tracking-[0.3em] text-sm animate-pulse">Sincronizando Grupo</h2>
          <p className="text-[#303035] text-[10px] font-bold uppercase tracking-widest">Preparando seu dashboard de performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-[#050505] ${outfit.className}`}>
      {/* Desktop Sidebar */}
      <Sidebar onSignOut={handleSignOut} />

      {/* Main Content Area */}
      <div className="flex-1 pb-20 md:pb-0 h-screen overflow-y-auto overflow-x-hidden relative">
        <DashboardView
          userProfile={userProfile}
          activeGroup={activeGroup}
          userRole={userRole}
          ranking={ranking}
          dailyPoints={dailyPoints}
          streak={streak}
          activityFeed={activityFeed}
          gallery={gallery}
          onBackToLobby={() => router.push('/dashboard')}
          onCopyInvite={handleCopyInvite}
          onUpdatePoints={handleUpdatePoints}
        />
      </div>

      {/* Mobile Bottom Nav */}
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
