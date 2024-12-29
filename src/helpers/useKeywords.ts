import { useState } from 'react';
import {
  updateResumesTableUserResume,
  deleteResumesTableUserDeleteMultipleKeywords,
} from '@/api/supabase/resumes/resumes';
import { toast } from 'sonner';
// import supabase for function calls
import { supabase } from '@/api/supabase/client';

export const useKeywords = (resumeId: string, userId: string) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeResume = async (
    text: string,
    existingKeywords: string[] = []
  ): Promise<boolean> => {
    console.log('[useKeywords] analyzeResume');
    if (!text || isAnalyzing || !resumeId) {
      toast.error(
        'Cannot analyze resume. Ensure resume text and ID are valid.'
      );
      return false;
    }

    console.log('[useKeywords] Starting analysis');
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        'analyze-resume',
        {
          body: {
            resumeText: text,
            existingKeywords,
          },
        }
      );

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      console.log('[useKeywords] Analysis complete:', data);

      // Explicitly type the keywords response
      const keywordList = Array.from(
        new Set(
          (data.keywords as string[]) // Cast `data.keywords` as a string array
            .map((k) => k.trim())
            .filter(Boolean)
        )
      ).sort();

      const success = await updateResumesTableUserResume(
        userId,
        resumeId,
        undefined, // Do not update `resumeText`
        keywordList
      );

      if (success) {
        const newKeywordsCount = data.newKeywordsCount || 0;
        if (newKeywordsCount > 0) {
          toast.success(
            `Found ${newKeywordsCount} new keyword${
              newKeywordsCount === 1 ? '' : 's'
            }!`
          );
        } else {
          toast.info('Analysis complete. No new keywords found.');
        }
      } else {
        throw new Error('Failed to update keywords in the database.');
      }

      return true;
    } catch (error) {
      console.error('[useKeywords] Analysis error:', error);
      toast.error('Failed to analyze resume. Please try again.');
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateKeywords = async (newKeywords: string[]): Promise<boolean> => {
    console.log('[useKeywords] Updating keywords:', newKeywords.length);

    if (!resumeId) {
      toast.error('Resume ID is required to update keywords.');
      return false;
    }

    try {
      const success = await updateResumesTableUserResume(
        userId,
        resumeId,
        undefined, // Do not update `resumeText`
        newKeywords
      );

      if (!success) {
        throw new Error('Failed to update keywords in the database.');
      }

      toast.success('Keywords updated successfully.');
      return true;
    } catch (error) {
      console.error('[useKeywords] Error updating keywords:', error);
      toast.error('Failed to update keywords. Please try again.');
      return false;
    }
  };

  const deleteKeywords = async (): Promise<boolean> => {
    console.log('[useKeywords] Deleting keywords');

    if (!resumeId) {
      toast.error('Resume ID is required to clear keywords.');
      return false;
    }

    try {
      const success = await deleteResumesTableUserDeleteMultipleKeywords(
        resumeId,
        userId
      );

      if (!success) {
        throw new Error('Failed to clear keywords in the database.');
      }

      toast.success('Keywords cleared successfully.');
      return true;
    } catch (error) {
      console.error('[useKeywords] Error clearing keywords:', error);
      toast.error('Failed to clear keywords. Please try again.');
      return false;
    }
  };

  return {
    isAnalyzing,
    analyzeResume,
    updateKeywords,
    deleteKeywords,
  };
};
