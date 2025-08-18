import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Hook for real-time subscriptions
export function useRealtimeSubscription(
  channel: string,
  table: string,
  callback: (payload: any) => void
) {
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const sub = supabase
      .channel(channel)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          callback(payload);
        }
      )
      .subscribe();

    setSubscription(sub);

    return () => {
      if (sub) {
        supabase.removeChannel(sub);
      }
    };
  }, [channel, table]);

  return subscription;
}

// Hook for news updates
export function useNewsUpdates(onNewArticle?: (article: any) => void) {
  useRealtimeSubscription('news_updates', 'news_items', (payload) => {
    if (payload.eventType === 'INSERT' && onNewArticle) {
      onNewArticle(payload.new);
    }
  });
}

// Hook for favorites updates
export function useFavoritesUpdates(userId: string, onUpdate?: () => void) {
  useRealtimeSubscription('favorites_updates', 'favorites', (payload) => {
    if (payload.new?.user_id === userId || payload.old?.user_id === userId) {
      onUpdate?.();
    }
  });
}

// Hook for user preferences
export function useUserPreferences(userId: string) {
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferred_categories')
          .eq('user_id', userId)
          .single();

        if (data) {
          setPreferences(data.preferred_categories || []);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const updatePreferences = async (newPreferences: string[]) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferred_categories: newPreferences,
        });

      if (!error) {
        setPreferences(newPreferences);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return { preferences, loading, updatePreferences };
}

// Hook for authentication state
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}