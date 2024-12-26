import { supabase } from "../../integrations/supabase/client";
import { toast } from "sonner";
import { UserData } from "./types";

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    console.log('[API] Fetching user data for:', userId);
    
    const { data: resumeData, error: fetchError } = await supabase
      .from('resumes')
      .select('file_path')
      .eq('user_id', userId); // Ensure we filter by user_id

    console.log('[API] Resume data response:', resumeData);

    if (!resumeData || resumeData.length === 0) {
      console.log('[API] No resume data found, returning default values');
      return {
        resume_text: null,
        file_path: null,
        keywords: [],
        non_keywords: [],
      };
    }

    return {
      resume_text: null,
      file_path: null,
      keywords: [],
      non_keywords: [], // Placeholder for non-keywords
    };
  } catch (error: any) {
    console.error('[API] Error:', error);
    throw error;
  }
};
