import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (userId: string, onResumeLoad: (text: string) => void, onKeywordsLoad?: (keywords: string[]) => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  useEffect(() => {
    const fetchUserData = async (attempt = 0) => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from("users")
          .select("resume_text, keywords")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (data?.resume_text) {
          onResumeLoad(data.resume_text);
        }
        
        if (data?.keywords && onKeywordsLoad) {
          onKeywordsLoad(data.keywords);
        }
        
        setRetryCount(0); // Reset on success
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        
        // Retry logic for network errors
        if (attempt < MAX_RETRIES && (error.message === "Failed to fetch" || error.code === "NETWORK_ERROR")) {
          setRetryCount(attempt + 1);
          toast({
            title: "Network error",
            description: `Retrying in ${RETRY_DELAY/1000} seconds... (Attempt ${attempt + 1}/${MAX_RETRIES})`,
          });
          
          setTimeout(() => {
            fetchUserData(attempt + 1);
          }, RETRY_DELAY * Math.pow(2, attempt)); // Exponential backoff
        } else {
          toast({
            variant: "destructive",
            title: "Error fetching user data",
            description: error.message,
          });
        }
      } finally {
        if (attempt === 0) { // Only set loading to false after initial attempt
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId, toast, onResumeLoad, onKeywordsLoad]);

  return { isLoading };
};