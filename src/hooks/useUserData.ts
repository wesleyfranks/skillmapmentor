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
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Fetching user data for ID:', userId);
        
        // First, ensure the user exists in the users table
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking user existence:', checkError);
          throw checkError;
        }

        // If user doesn't exist, the trigger will create it
        if (!existingUser) {
          console.log('User record not found, waiting for trigger to create it...');
          // Add a small delay to allow the trigger to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Now fetch the user data
        const { data, error } = await supabase
          .from("users")
          .select("resume_text, keywords, non_keywords")
          .eq("id", userId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Received data:', data);
        
        if (data?.resume_text) {
          onResumeLoad(data.resume_text);
        }
        
        if (onKeywordsLoad) {
          console.log('Setting initial keywords:', data?.keywords);
          console.log('Setting initial non-keywords:', data?.non_keywords);
          onKeywordsLoad(data?.keywords || [], data?.non_keywords || []);
        }
        
        setRetryCount(0);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching user data:', {
          error,
          userId,
          attempt,
          retryCount: attempt
        });
        
        if (attempt < MAX_RETRIES) {
          setRetryCount(attempt + 1);
          setTimeout(() => {
            fetchUserData(attempt + 1);
          }, RETRY_DELAY * Math.pow(2, attempt));
        } else {
          toast.error("Could not load your data. Please try refreshing the page.");
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId, onResumeLoad, onKeywordsLoad]);

  return { isLoading };
};