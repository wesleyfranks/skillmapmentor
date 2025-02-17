import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getUserData, type UserData } from '../api/supabase/users';
export { type UserData };

export const useUserData = (
  userId: string
): UseQueryResult<UserData | null> => {
  return useQuery<UserData | null>({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) {
        console.warn('[useUserData] No user ID provided.');
        return null;
      }
      try {
        const data = await getUserData(userId);
        return data || null; // Ensure null is returned if no data is found
      } catch (error) {
        console.error('[useUserData] Failed to fetch user data:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      console.warn(
        `[useUserData] Retry attempt ${failureCount} for fetching user data.`,
        error
      );
      return failureCount < 3; // Retry up to 3 times
    },
  });
};
