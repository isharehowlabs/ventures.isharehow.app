import { useState, useEffect } from 'react';
import { getBackendUrl } from '../utils/backendUrl';

export interface TwitchGoals {
  followers: number;
  followerGoal: number;
  viewers: number;
  viewerGoal: number;
}

export function useTwitch() {
  const [goals, setGoals] = useState<TwitchGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/twitch/goals`, {
        credentials: 'include',
      });

      if (!response.ok) {
        // If 404, endpoint doesn't exist yet - use default values
        if (response.status === 404) {
          setGoals({
            followers: 0,
            followerGoal: 2500,
            viewers: 0,
            viewerGoal: 5000,
          });
          return;
        }
        throw new Error('Failed to fetch Twitch goals');
      }

      const data = await response.json();
      setGoals({
        followers: data.followers || 0,
        followerGoal: data.followerGoal || 2500,
        viewers: data.viewers || 0,
        viewerGoal: data.viewerGoal || 5000,
      });
    } catch (err: any) {
      // Only set error for non-404 cases
      if (err.message && !err.message.includes('404')) {
        setError(err.message);
        console.error('Error fetching Twitch goals:', err);
      } else {
        // 404 or network error - use default values silently
        setGoals({
          followers: 0,
          followerGoal: 2500,
          viewers: 0,
          viewerGoal: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    const interval = setInterval(fetchGoals, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    goals,
    isLoading,
    error,
    refresh: fetchGoals,
  };
}

