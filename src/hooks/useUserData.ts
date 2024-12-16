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
          timestamp: new Date().toISOString(),
          source: 'cache or network'
        });

        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('[useUserData][queryFn] Error fetching user data:', error);
          throw error;
        }

        if (data) {
          console.log('[useUserData][queryFn] Successfully received user data:', {
            hasResumeText: !!data.resume_text,
            keywordsCount: data.keywords?.length,
            nonKeywordsCount: data.non_keywords?.length,
            source: 'database'
          });

          if (data.resume_text) {
            console.log('[useUserData][queryFn] Calling onResumeLoad with text');
            onResumeLoad(data.resume_text);
          }

          if (onKeywordsLoad && (data.keywords || data.non_keywords)) {
            console.log('[useUserData][queryFn] Calling onKeywordsLoad with keywords and non-keywords');
            onKeywordsLoad(data.keywords || [], data.non_keywords || []);
          }
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
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: false // Don't refetch on window focus
  });

  return { data, isLoading, refetch };
};