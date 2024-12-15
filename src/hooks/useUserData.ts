import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (
  userId: string, 
  onResumeLoad: (text: string) => void, 
  onKeywordsLoad?: (keywords: string[], nonKeywords: string[]) => void
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
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
        
        // Using the Supabase client to fetch user data
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

        console.log('Successfully received user data:', {
          hasResumeText: !!data?.resume_text,
          keywordsCount: data?.keywords?.length,
          nonKeywordsCount: data?.non_keywords?.length
        });
        
        if (data?.resume_text) {
          onResumeLoad(data.resume_text);
        }
        
        if (onKeywordsLoad) {
          onKeywordsLoad(data?.keywords || [], data?.non_keywords || []);
        }
        
        setRetryCount(0);
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
          toast.error("Could not load your data. Please try refreshing the page.");
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId, onResumeLoad, onKeywordsLoad]);

  return { isLoading };
};