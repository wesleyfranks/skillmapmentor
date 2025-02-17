import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useAuth } from '@/api/supabase/AuthContext';
import { getResumesTableUserMultipleResumes } from '@/api/supabase/resumes/table/select/getMultipleResumes';

export interface Resume {
  id: string;
  file_path: string;
  resume_text: string;
  keywords: string[];
  non_keywords: string[];
  created_at?: string;
}

interface ResumeState {
  resumes: Resume[];
  selectedResume: Resume | null;
  userId: string | null;
}

const defaultResumeState: ResumeState = {
  resumes: [],
  selectedResume: null,
  userId: null,
};

interface ResumeContextType {
  resumeState: ResumeState;
  setResumeState: React.Dispatch<React.SetStateAction<ResumeState>>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResumeContext = (): ResumeContextType => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
};

interface ResumeProviderProps {
  children: ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [resumeState, setResumeState] =
    useState<ResumeState>(defaultResumeState);
  const { user } = useAuth();

  useEffect(() => {
    const fetchResumes = async () => {
      if (user) {
        // Set userId in state first
        setResumeState((prev) => ({ ...prev, userId: user.id }));
        try {
          const resumes = await getResumesTableUserMultipleResumes(user.id);
          console.log('[ResumeContext] Fetched resumes:', resumes);
          setResumeState({
            resumes,
            // Optionally, select the first resume as default
            selectedResume: resumes.length > 0 ? resumes[0] : null,
            userId: user.id,
          });
        } catch (error) {
          console.error('Failed to fetch resumes:', error);
        }
      }
    };

    fetchResumes();
  }, [user]);

  return (
    <ResumeContext.Provider value={{ resumeState, setResumeState }}>
      {children}
    </ResumeContext.Provider>
  );
};
