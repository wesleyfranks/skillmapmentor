import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserData = {
  resume_text: string | null;
  keywords: string[];
  non_keywords: string[];
};

export const useUserData = (userId: string) => {
  return useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        return data as UserData;
      } catch (error: any) {
        toast.error("Failed to load user data");
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    gcTime: 1000 * 60 * 30,   // Keep unused data for 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: true,
    retry: 1
  });
};