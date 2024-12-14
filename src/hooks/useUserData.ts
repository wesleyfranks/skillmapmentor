import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = (userId: string, onResumeLoad: (text: string) => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  useEffect(() => {
    const fetchResumeText = async (attempt = 0) => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from("users")
          .select("resume_text")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (data?.resume_text) {
          onResumeLoad(data.resume_text);
        }
        setRetryCount(0); // Reset on success
      } catch (error: any) {
        console.error('Error fetching resume:', error);
        
        // Retry logic for network errors
        if (attempt < MAX_RETRIES && (error.message === "Failed to fetch" || error.code === "NETWORK_ERROR")) {
          setRetryCount(attempt + 1);
          toast({
            title: "Network error",
            description: `Retrying in ${RETRY_DELAY/1000} seconds... (Attempt ${attempt + 1}/${MAX_RETRIES})`,
          });
          
          setTimeout(() => {
            fetchResumeText(attempt + 1);
          }, RETRY_DELAY * Math.pow(2, attempt)); // Exponential backoff
        } else {
          toast({
            variant: "destructive",
            title: "Error fetching resume",
            description: error.message,
          });
        }
      } finally {
        if (attempt === 0) { // Only set loading to false after initial attempt
          setIsLoading(false);
        }
      }
    };

    fetchResumeText();
  }, [userId, toast, onResumeLoad]);

  return { isLoading };
};