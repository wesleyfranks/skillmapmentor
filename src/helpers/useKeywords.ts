import { useState } from 'react';
import { supabase } from '@/api/supabase/client';
import { toast } from 'sonner';
import { updateResumesTableUserResume } from '@/api/supabase/resumes/table/update';
import { deleteResumesTableKeywords } from '@/api/supabase/resumes/table/delete';

export const useKeywords = (resumeId: string, userId: string) => {
  // No explicit type annotation so keywords can be any array.
  const [keywords, setKeywords] = useState([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Analyze resume and extract keywords.
   * @param text - Resume text to analyze
   * @param existingKeywords - Array of existing keywords
   */
  const analyzeResume = async (text: string, existingKeywords: any[] = []) => {
    console.log('[useKeywords] analyzeResume started');

    if (!text || !resumeId) {
      toast.error('Missing resume text or ID.');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        'analyze-resume',
        {
          body: { resumeText: text, existingKeywords },
        }
      );

      if (error) throw error;

      console.log('[useKeywords] API Response:', data);

      if (
        !data ||
        typeof data !== 'object' ||
        (!Array.isArray(data.keywords) && typeof data.keywords !== 'string')
      ) {
        console.error('Invalid response format:', data);
        throw new Error(
          'Invalid response structure: keywords should be an array or comma separated string.'
        );
      }

      const keywordsArray = Array.isArray(data.keywords)
        ? data.keywords
        : data.keywords.split(',').map((k: string) => k.trim());

      setKeywords(keywordsArray);
      console.log('[useKeywords] Keywords extracted:', keywordsArray);

      return { keywords: keywordsArray };
    } catch (error) {
      console.error('[useKeywords] Analysis failed:', error);
      toast.error('Keyword extraction failed.');
      return false;
    }
  };

  /**
   * Update keywords in the database and local state.
   * @param newKeywords - Array of new keywords
   */
  const updateKeywords = async (newKeywords: any[]): Promise<boolean> => {
    try {
      const success = await updateResumesTableUserResume(
        userId,
        resumeId,
        undefined,
        newKeywords
      );

      if (success) {
        setKeywords(newKeywords);
        toast.success('Keywords updated successfully.');
        return true;
      } else {
        throw new Error('Failed to update keywords.');
      }
    } catch (error) {
      console.error('[useKeywords] Update error:', error);
      toast.error('Failed to update keywords.');
      return false;
    }
  };

  /**
   * Delete all keywords from the database and local state.
   */
  const deleteKeywords = async (): Promise<boolean> => {
    try {
      const success = await deleteResumesTableKeywords(resumeId, userId);

      if (success) {
        setKeywords([]);
        toast.success('Keywords cleared.');
        return true;
      } else {
        throw new Error('Failed to delete keywords.');
      }
    } catch (error) {
      console.error('[useKeywords] Deletion error:', error);
      toast.error('Failed to delete keywords.');
      return false;
    }
  };

  return {
    isAnalyzing,
    keywords,
    analyzeResume,
    updateKeywords,
    deleteKeywords,
  };
};
