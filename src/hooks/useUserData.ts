import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (
  userId: string, 
  onResumeLoad: (text: string) => void, 
  onKeywordsLoad?: (keywords: string[], nonKeywords: string[]) => void
) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useUserData][queryFn] No userId provided');
        return null;
      }

      try {
        console.log('[useUserData][queryFn] Fetching user data:', {
          userId,
          timestamp: new Date().toISOString()
        });

        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('[useUserData][queryFn] Error fetching user data:', error);
          throw error;
        }

        console.log('[useUserData][queryFn] Query response:', {
          hasData: !!data,
          data
        });

        if (data) {
          if (data.resume_text) {
            console.log('[useUserData][queryFn] Found resume text:', {
              textLength: data.resume_text.length
            });
            onResumeLoad(data.resume_text);
          }

          if (onKeywordsLoad) {
            console.log('[useUserData][queryFn] Found keywords:', {
              keywordsCount: data.keywords?.length || 0,
              nonKeywordsCount: data.non_keywords?.length || 0
            });
            onKeywordsLoad(
              data.keywords || [], 
              data.non_keywords || []
            );
          }
        } else {
          console.log('[useUserData][queryFn] No data found for user');
        }

        return data;
      } catch (error: any) {
        console.error('[useUserData][queryFn] Error in fetchUserData:', error);
        toast.error("Could not load your data. Please try refreshing the page.");
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Data becomes stale after 5 minutes
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  return { data, isLoading, refetch };
};