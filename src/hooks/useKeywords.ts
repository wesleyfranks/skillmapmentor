import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useKeywords = (userId: string) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeResume = async (text: string, existingKeywords: string[] = []) => {
    if (!text || isAnalyzing) return;
    
    console.log('[useKeywords] Starting analysis');
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { 
          resumeText: text,
          existingKeywords,
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      console.log('[useKeywords] Analysis complete:', data);
      
      const keywordList = Array.from(new Set(
        (data.keywords as string)
          .split(',')
          .map(k => k.trim())
          .filter(Boolean)
      )).sort();

      await supabase
        .from("users")
        .update({ keywords: keywordList })
        .eq("id", userId);

      const newKeywordsCount = data.newKeywordsCount || 0;
      if (newKeywordsCount > 0) {
        toast.success(`Found ${newKeywordsCount} new keyword${newKeywordsCount === 1 ? '' : 's'}!`);
      } else {
        toast.info("Analysis complete. No new keywords found.");
      }

      return true;
    } catch (error) {
      console.error('[useKeywords] Analysis error:', error);
      toast.error("Failed to analyze resume");
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateKeywords = async (newKeywords: string[]) => {
    console.log('[useKeywords] Updating keywords:', newKeywords.length);
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ keywords: newKeywords })
        .eq("id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[useKeywords] Error updating keywords:', error);
      toast.error("Failed to update keywords");
      return false;
    }
  };

  const deleteKeywords = async () => {
    console.log('[useKeywords] Deleting keywords');
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ keywords: [] })
        .eq("id", userId);

      if (error) throw error;
      
      toast.success("Keywords cleared successfully");
      return true;
    } catch (error) {
      console.error('[useKeywords] Error clearing keywords:', error);
      toast.error("Failed to clear keywords");
      return false;
    }
  };

  return {
    isAnalyzing,
    analyzeResume,
    updateKeywords,
    deleteKeywords
  };
};