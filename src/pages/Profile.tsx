import { Card } from '../ui/card'; // Card component
import { Navigate } from 'react-router-dom'; // For navigation
import { ProfileHeader } from '../components/profile/ProfileHeader'; // Profile header
import { ResumeContent } from '../components/profile/resume/ResumeContent'; // Resume display/edit component
import { KeywordAnalysis } from '../components/profile/keywords/KeywordAnalysis'; // Keyword analysis component
import { useResume } from '../helpers/useResume'; // Hook for resume handling
import { useState } from 'react'; // React state management
import {
  resumesTableUploadSingleResume,
  storageBucketResumeUpload,
  updateResumesTableUserResume,
} from '../api/supabase/resumes/resumes';
import { usePdfHandler } from '../helpers/usePdfHandler';
// Functions to handle file uploads and database inserts
import { toast } from 'sonner'; // Toast notifications
import { useAuth } from '../api/supabase/AuthContext';

const Profile = () => {
  const { user } = useAuth(); // Authenticated user
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Delete dialog visibility
  const [isUploading, setIsUploading] = useState(false); // Uploading state

  const [isAnalyzing, setIsAnalyzing] = useState(false); // Keyword analysis state
  const [keywords, setKeywords] = useState<string[]>([]); // Extracted keywords

  // Redirect to login if user is not authenticated
  if (!user) {
    console.log('[Profile] No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const {
    resumes,
    resumeId,
    resumeText,
    isEditing,
    isSaving,
    isLoading,
    setIsEditing,
    handleSaveResume,
    handleDeleteResume,
    handleResumeTextChange,
  } = useResume(user.id); // Hook for handling resumes

  // Trigger keyword analysis
  const handleAnalyzeKeywords = () => {
    if (resumeText) {
      setIsAnalyzing(true);
      setTimeout(() => {
        const extractedKeywords = resumeText
          .split(/\s+/)
          .filter(
            (word, index, arr) => arr.indexOf(word) === index && word.length > 3
          );
        setKeywords(extractedKeywords);
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  // Clear all extracted keywords
  const handleDeleteKeywords = () => {
    setKeywords([]);
  };

  // Update keyword list
  const handleUpdateKeywords = (updatedKeywords: string[]) => {
    setKeywords(updatedKeywords);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[handleUpload] Start upload process');
    setIsUploading(true);
    const file = event.target.files?.[0];

    if (!file) {
      console.warn('[handleUpload] No file selected for upload');
      setIsUploading(false);
      return;
    }

    // Validate file type
    if (
      ![
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/x-iwork-pages-sffpages',
      ].includes(file.type)
    ) {
      toast.error(
        'Invalid file type. Only PDF, Word (.doc, .docx), and Pages files are allowed.'
      );
      console.error('[handleUpload] Invalid file type:', file.type);
      setIsUploading(false);
      return;
    }

    try {
      console.log(
        '[handleUpload] Uploading file to storage bucket:',
        file.name
      );
      const filePath = await storageBucketResumeUpload(user.id, file);

      if (!filePath) {
        console.error(
          '[handleUpload] File upload failed. Aborting database insert.'
        );
        toast.error('Failed to upload file to storage');
        return;
      }

      console.log(
        '[handleUpload] File uploaded successfully. Proceeding with database insert:',
        filePath
      );
      const resumeId = await resumesTableUploadSingleResume(user.id, filePath);

      if (resumeId) {
        console.log(
          '[handleUpload] Resume inserted/updated successfully:',
          resumeId
        );
        toast.success('Resume uploaded successfully');

        // Trigger pdfHandler to extract resume text and update the table
        const extractedText = await usePdfHandler(file); // Assuming pdfHandler returns text
        if (extractedText) {
          console.log('[handleUpload] Extracted resume text:', extractedText);

          const keywords = extractedText
            .split(/\s+/)
            .filter(
              (word, index, arr) =>
                arr.indexOf(word) === index && word.length > 3
            ); // Example keyword extraction logic

          console.log('[handleUpload] Extracted keywords:', keywords);

          const updateSuccess = await updateResumesTableUserResume(
            user.id,
            resumeId,
            extractedText,
            keywords
          );

          if (updateSuccess) {
            console.log(
              '[handleUpload] Resume text and keywords updated successfully'
            );
          } else {
            console.error(
              '[handleUpload] Failed to update resume text and keywords'
            );
          }
        } else {
          console.error('[handleUpload] Failed to extract text from resume');
        }
      } else {
        console.error(
          '[handleUpload] Failed to insert/update resume in the database'
        );
      }
    } catch (error) {
      console.error('[handleUpload] Error during upload process:', error);
      toast.error('Failed to upload resume');
    } finally {
      setIsUploading(false);
      console.log('[handleUpload] Upload process completed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          <div className="space-y-4 mb-8">
            <ProfileHeader user={user} isLoading={isLoading} />
          </div>

          {!isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="order-1">
                <h2 className="text-2xl font-bold text-center mb-6">
                  Keywords
                </h2>
                <KeywordAnalysis
                  resumeText={resumeText}
                  isAnalyzing={isAnalyzing}
                  keywords={keywords}
                  onReanalyze={handleAnalyzeKeywords}
                  onDeleteKeywords={handleDeleteKeywords}
                  onUpdateKeywords={handleUpdateKeywords}
                />
              </div>
              <div className="order-2">
                <h2 className="text-2xl font-bold text-center mb-6">Resume</h2>
                <ResumeContent
                  isEditing={isEditing}
                  resumeId={resumeId}
                  resumeText={resumeText}
                  onChange={handleResumeTextChange}
                  onSave={() => handleSaveResume(resumeText)}
                  isSaving={isSaving}
                  onEdit={() => setIsEditing(!isEditing)}
                  onUpload={handleUpload}
                  isUploading={isUploading}
                  showDeleteDialog={showDeleteDialog}
                  setShowDeleteDialog={setShowDeleteDialog}
                  onDelete={() => handleDeleteResume(resumeId)}
                  resumes={resumes} // Pass this prop
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
