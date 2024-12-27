import { useQuery } from "@tanstack/react-query";
import { getUserData, type UserData } from "../api/users";

export { type UserData };

export const useUserData = (userId: string) => {
  return useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) {
        return null;
      }
      return getUserData(userId);
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    gcTime: 1000 * 60 * 30,   // Keep unused data for 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: true,
    retry: 1
  });
};
