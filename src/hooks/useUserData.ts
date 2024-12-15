import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase, validateSession } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserData = Database['public']['Tables']['users']['Row'];

export const useUserData = (
  userId: string, 
  onResumeLoad: (text: string) => void, 
  onKeywordsLoad?: (keywords: string[], nonKeywords: string[]) => void
) => {
  const { data, isLoading } = useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No userId provided');
        return null;
      }
      
      try {
        console.log('Fetching user data:', {
          userId,
          timestamp: new Date().toISOString()
        });

        const isSessionValid = await validateSession();
        
        if (!isSessionValid) {
          console.error('No valid session found');
          throw new Error('No valid session');
        }

        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user data:', {
            error,
            errorMessage: error.message,
            errorDetails: error.details,
            userId
          });
          throw error;
        }

        if (data) {
          console.log('Successfully received user data:', {
            hasResumeText: !!data.resume_text,
            keywordsCount: data.keywords?.length,
            nonKeywordsCount: data.non_keywords?.length
          });
          
          if (data.resume_text) {
            onResumeLoad(data.resume_text);
          }
          
          if (onKeywordsLoad) {
            onKeywordsLoad(data.keywords || [], data.non_keywords || []);
          }
        }
        
        return data;
      } catch (error: any) {
        console.error('Error in fetchUserData:', error);
        toast.error("Could not load your data. Please try refreshing the page.");
        throw error;
      }
    },
    staleTime: Infinity, // Data won't become stale automatically
    cacheTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  return { isLoading };
};