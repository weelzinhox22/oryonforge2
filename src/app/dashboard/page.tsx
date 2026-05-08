'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import LobbyView from '@/components/LobbyView';
import { Outfit } from 'next/font/google';
import { DotLottiePlayer } from '@dotlottie/react-player';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '700', '900'] });

export default function DashboardIndexPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [dailyPoints, setDailyPoints] = useState(0);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' as 'error' | 'success' });

  useEffect(() => {
    setIsMounted(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session && isMounted) {
        router.push('/login');
      } else if (session) {
        // Track app open for achievements
        try {
          await supabase.from('user_logins').insert({ user_id: session.user.id });
          // Process achievements check for login-based ones
          await supabase.rpc('process_user_achievements_logic', { u_id: session.user.id });
        } catch (e) {
          console.error('Error tracking login:', e);
        }
        
        await fetchUserData(session.user.id);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        router.push('/login');
      } else if (session) {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const fetchUserData = async (userId: string, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) setUserProfile(profile);

      const { data: streakValue } = await supabase.rpc('get_user_streak', { user_id_param: userId });
      setStreak(streakValue || 0);

      const { data: groupsData } = await supabase
        .from('group_members')
        .select('group_id, role, groups (*)')
        .eq('user_id', userId);

      // Fetch last activity date for each group to sort
      const { data: lastActivities } = await supabase
        .from('activity_logs')
        .select('group_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const lastActivityMap: Record<string, string> = {};
      lastActivities?.forEach(log => {
        if (!lastActivityMap[log.group_id]) {
          lastActivityMap[log.group_id] = log.created_at;
        }
      });

      const groups = (groupsData || []).map(ug => ({
        ...ug,
        last_activity_at: lastActivityMap[ug.group_id] || null
      })).sort((a, b) => {
        if (!a.last_activity_at) return 1;
        if (!b.last_activity_at) return -1;
        return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime();
      });

      setUserGroups(groups);

      // Fetch User Achievements
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })
        .limit(5);
      
      if (achievements) setUserAchievements(achievements);

      const { data: totalPointsData } = await supabase
        .from('activity_logs')
        .select('points')
        .eq('user_id', userId);
      
      const totalXP = totalPointsData?.reduce((acc, log) => acc + log.points, 0) || 0;
      setTotalXP(totalXP);

      // Activity Feed filtered to groups the user belongs to
      const userGroupIds = (groupsData || []).map((ug: any) => ug.group_id);

      if (userGroupIds.length > 0) {
        const { data: feedData } = await supabase
          .from('activity_feed')
          .select('*')
          .in('group_id', userGroupIds)
          .order('created_at', { ascending: false })
          .limit(15);
        
        if (feedData) {
          setActivityFeed(feedData);
        }
      } else {
        setActivityFeed([]);
      }

      // Calculate Daily Points (Total across all groups for today)
      const { data: todayLogs } = await supabase
        .from('activity_logs')
        .select('points')
        .eq('user_id', userId)
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (todayLogs) {
        const totalToday = todayLogs.reduce((acc, log) => acc + log.points, 0);
        setDailyPoints(totalToday);
      }

      return { groups, achievements, totalXP };
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return null;
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    router.push('/login');
    await supabase.auth.signOut();
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
          <h2 className="text-[#CCCC00] font-black uppercase tracking-[0.3em] text-sm animate-pulse">Iniciando Sistemas</h2>
          <p className="text-[#303035] text-[10px] font-bold uppercase tracking-widest">Aguarde a sincronização neural...</p>
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
        <LobbyView
          userProfile={userProfile}
          userGroups={userGroups}
          activityFeed={activityFeed}
          streak={streak}
          session={session}
          supabase={supabase}
          onSelectGroup={(idx) => {
            setIsLoading(true);
            const groupId = userGroups[idx].group_id;
            localStorage.setItem('oryon_active_group_id', groupId);
            router.push(`/dashboard/${groupId}`);
          }}
          onRefresh={async () => {
            if (session) {
              const groups = await fetchUserData(session.user.id, true);
              return groups;
            }
            return null;
          }}
          toast={toast}
          setToast={setToast}
          onSignOut={handleSignOut}
          dailyPoints={dailyPoints}
          userAchievements={userAchievements}
          totalXP={totalXP}
        />
      </div>

      {/* Mobile Bottom Nav */}
      {(userProfile?.ui_preferences?.nav_style === 'standard' || !userProfile?.ui_preferences?.nav_style) && (
        <BottomNav />
      )}

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
