import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (
  userId: string, 
  onResumeLoad: (text: string) => void, 
  onKeywordsLoad?: (keywords: string[], nonKeywords: string[]) => void
) => {
  const { isLoading } = useQuery({
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

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('No valid session found');
          throw new Error('No valid session');
        }

        const { data, error } = await supabase
          .from('users')
          .select('resume_text, keywords, non_keywords')
          .eq('id', userId);

        if (error) {
          console.error('Error fetching user data:', {
            error,
            errorMessage: error.message,
            errorDetails: error.details,
            userId
          });
          throw error;
        }

        // Handle case where user exists in auth but not in public.users yet
        if (!data || data.length === 0) {
          console.log('No user data found, this is normal for new users');
          return null;
        }

        const userData = data[0]; // Get first row since we filtered by user ID
        
        if (userData) {
          console.log('Successfully received user data:', {
            hasResumeText: !!userData.resume_text,
            keywordsCount: userData.keywords?.length,
            nonKeywordsCount: userData.non_keywords?.length
          });
          
          if (userData.resume_text) {
            onResumeLoad(userData.resume_text);
          }
          
          if (onKeywordsLoad) {
            onKeywordsLoad(userData.keywords || [], userData.non_keywords || []);
          }
        }
        
        return userData;
      } catch (error: any) {
        console.error('Error in fetchUserData:', error);
        toast.error("Could not load your data. Please try refreshing the page.");
        throw error;
      }
    },
    staleTime: Infinity, // Data won't become stale automatically
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  return { isLoading };
};