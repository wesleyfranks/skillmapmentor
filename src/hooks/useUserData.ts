import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase, validateSession } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserData = Database['public']['Tables']['users']['Row'];

export const useUserData = (
  userId: string, 
  onResumeLoad: (text: string) => void, 
  onKeywordsLoad?: (keywords: string[], nonKeywords: string[]) => void
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [hasShownError, setHasShownError] = useState(false);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  useEffect(() => {
    const fetchUserData = async (attempt = 0) => {
      if (!userId) {
        console.log('No userId provided');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Attempting to fetch user data:', {
          attempt: attempt + 1,
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
            userId,
            attempt: attempt + 1
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
        
        setRetryCount(0);
        setHasShownError(false);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Detailed error in fetchUserData:', {
          error,
          errorMessage: error?.message,
          errorDetails: error?.details,
          userId,
          attempt: attempt + 1,
          retryCount: attempt,
          timestamp: new Date().toISOString()
        });
        
        if (attempt < MAX_RETRIES) {
          console.log('Retrying fetch...', {
            nextAttempt: attempt + 1,
            maxRetries: MAX_RETRIES,
            delay: RETRY_DELAY * Math.pow(2, attempt)
          });
          
          setRetryCount(attempt + 1);
          setTimeout(() => {
            fetchUserData(attempt + 1);
          }, RETRY_DELAY * Math.pow(2, attempt));
        } else {
          console.error('Max retries reached, stopping attempts');
          if (!hasShownError) {
            toast.error("Could not load your data. Please try refreshing the page.");
            setHasShownError(true);
          }
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId, onResumeLoad, onKeywordsLoad, hasShownError]);

  return { isLoading };
};