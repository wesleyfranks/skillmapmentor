import React, { useEffect, useState } from 'react';
import { useResumeContext } from '@/components/profile/resume/ResumeContext';
import { useKeywords } from '@/helpers/useKeywords';
import { usePdfHandler } from '@/helpers/usePdfHandler';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { useAuth } from '@/api/supabase/AuthContext';

const Profile = () => {
  const { resumeState, setResumeState } = useResumeContext();
  const { user } = useAuth();
  const [keywordList, setKeywordList] = useState<string[]>([]);

  useEffect(() => {
    if (user && !resumeState.userId) {
      setResumeState((prev) => ({ ...prev, userId: user.id }));
    }
  }, [user, resumeState.userId, setResumeState]);

  // Use selectedResume for analysis
  const selectedResumeId = resumeState.selectedResume?.id || '';
  const { analyzeResume, isAnalyzing } = useKeywords(
    selectedResumeId,
    resumeState.userId || ''
  );

  // Upload PDF
  const { handleFileUpload, isUploading } = usePdfHandler(
    resumeState.userId || '',
    (extractedText: string) => {
      setResumeState((prev) => {
        if (!prev.selectedResume) return prev;
        return {
          ...prev,
          selectedResume: {
            ...prev.selectedResume,
            resume_text: extractedText,
          },
        };
      });
    }
  );

  const handleUpload = async (file: File) => {
    const uploadedFilePath = await handleFileUpload(file);
    if (uploadedFilePath) {
      setResumeState((prev) => {
        if (!prev.selectedResume) return prev;
        return {
          ...prev,
          selectedResume: {
            ...prev.selectedResume,
            file_path: uploadedFilePath,
          },
        };
      });
      console.log('[Profile] File uploaded successfully:', uploadedFilePath);
    }
  };

  // Analyze Resume
  const handleAnalyzeResume = async () => {
    const text = resumeState.selectedResume?.resume_text;
    if (!text) {
      console.error('[Profile] No resume text to analyze.');
      return;
    }

    try {
      const response = await analyzeResume(
        text,
        resumeState.selectedResume?.keywords || []
      );

      console.log('[Profile] Raw Response:', response);

      // Ensure response is valid before accessing properties
      if (!response || typeof response !== 'object') {
        console.error('[Profile] Error: Invalid response structure:', response);
        return;
      }

      // Ensure keywords are formatted as an array
      let extractedKeywords = response.keywords;
      if (typeof extractedKeywords === 'string') {
        extractedKeywords = extractedKeywords.split(',').map((k) => k.trim());
      }

      if (!Array.isArray(extractedKeywords)) {
        console.error(
          '[Profile] Error: Keywords should be an array:',
          response
        );
        return;
      }

      console.log(
        '[Profile] Resume analysis successful. Extracted Keywords:',
        extractedKeywords
      );

      setResumeState((prev) => {
        if (!prev.selectedResume) return prev;
        return {
          ...prev,
          selectedResume: {
            ...prev.selectedResume,
            keywords: extractedKeywords,
          },
        };
      });

      setKeywordList(extractedKeywords);
    } catch (error) {
      console.error('[Profile] Resume analysis error:', error);
    }
  };

  useEffect(() => {
    if (resumeState.selectedResume?.keywords) {
      setKeywordList([...resumeState.selectedResume.keywords]);
    }
  }, [resumeState.selectedResume?.keywords]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {/* Upload Resume */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Upload Resume</h2>
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          disabled={isUploading}
          onChange={(e) => {
            if (e.target.files?.[0]) handleUpload(e.target.files[0]);
          }}
        />
      </div>

      {/* Resume Text */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Resume Text</h2>
        <Textarea
          placeholder="Paste your resume text here"
          value={resumeState.selectedResume?.resume_text || ''}
          onChange={(e) => {
            setResumeState((prev) => {
              if (!prev.selectedResume) return prev;
              return {
                ...prev,
                selectedResume: {
                  ...prev.selectedResume,
                  resume_text: e.target.value,
                },
              };
            });
          }}
        />
        <Button
          className="mt-2"
          onClick={handleAnalyzeResume}
          disabled={isAnalyzing || !resumeState.selectedResume?.resume_text}
        >
          Analyze Resume
        </Button>
      </div>

      {/* Keywords Display */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Keywords</h2>
        {keywordList.length > 0 ? (
          <ul>
            {keywordList.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        ) : (
          <p>No keywords found yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
