'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import TutorialOverlay from '@/components/TutorialOverlay';
import { usePathname } from 'next/navigation';

export default function GlobalTutorial() {
  const supabase = createClient();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkTutorial() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, ui_preferences')
        .eq('id', session.user.id)
        .single();

      if (profile) setUserProfile(profile);
      setLoading(false);
    }

    checkTutorial();
  }, [supabase]);

  if (loading || !userProfile || userProfile.ui_preferences?.has_seen_tutorial) return null;

  // Only show tutorial on dashboard or profile
  const validPaths = ['/dashboard', '/perfil'];
  if (!validPaths.some(p => pathname.startsWith(p))) return null;

  return (
    <TutorialOverlay 
      isVisible={true}
      onComplete={async (dontShowAgain: boolean) => {
        try {
          if (dontShowAgain) {
            const newPrefs = { ...userProfile.ui_preferences, has_seen_tutorial: true };
            await supabase
              .from('profiles')
              .update({ ui_preferences: newPrefs })
              .eq('id', userProfile.id);
            
            setUserProfile({ ...userProfile, ui_preferences: newPrefs });
          } else {
            // Temporary dismiss, just hide it for this session by updating local state
            setUserProfile({ ...userProfile, ui_preferences: { ...userProfile.ui_preferences, has_seen_tutorial: true } });
          }
        } catch (e) {
          console.error('Erro ao salvar tutorial:', e);
        }
      }}
    />
  );
}
