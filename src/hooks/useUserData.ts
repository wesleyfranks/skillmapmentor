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
        // Only log user ID comparison
        const { data: session } = await supabase.auth.getSession();
        console.log('[useUserData] User ID check:', {
          currentUserId: session?.user?.id,
          requestedUserId: userId,
          match: session?.user?.id === userId
        });

        let { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        if (error?.message?.includes('contains 0 rows')) {
          const { data: authUser } = await supabase.auth.getUser(userId);
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: authUser.user?.email || '',
              full_name: authUser.user?.user_metadata?.full_name || null,
              keywords: [],
              non_keywords: []
            });

          if (insertError) {
            console.error('[useUserData] Error:', insertError);
            throw insertError;
          }

          const { data: newData, error: fetchError } = await supabase
            .from('users')
            .select('resume_text, keywords, non_keywords')
            .eq('id', userId)
            .single();

          if (fetchError) throw fetchError;
          data = newData;
        } else if (error) {
          throw error;
        }

        return data as UserData;
      } catch (error: any) {
        console.error('[useUserData] Error:', error);
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