import { useAuth } from '../contexts/AuthContext'; // Auth context for user info
import { Card } from '../components/ui/card'; // Card component
import { Navigate } from 'react-router-dom'; // For navigation
import { ProfileHeader } from '../components/profile/ProfileHeader'; // Profile header
import { ResumeContent } from '../components/profile/resume/ResumeContent'; // Resume display/edit component
import { KeywordAnalysis } from '../components/profile/keywords/KeywordAnalysis'; // Keyword analysis component
import { useResume } from '../hooks/useResume'; // Hook for resume handling
import { useState } from 'react'; // React state management
import { uploadResume, insertResume } from '../api/users/mutations'; // Functions to handle file uploads and database inserts
import { toast } from 'sonner'; // Toast notifications
import { supabase } from '../integrations/supabase/client'; // Supabase client

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
    selectedResumeId,
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
  const handleReanalyze = () => {
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

  // Handle resume file upload
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    const file = event.target.files?.[0];
    if (!file) {
      setIsUploading(false);
      return;
    }

    try {
      const uploadSuccess = await uploadResume(user.id, file);
      if (uploadSuccess) {
        const filePath = `${user.id}/${new Date().getTime()}-${file.name}`;
        await insertResume(user.id, filePath);
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        handleResumeTextChange(text);

        // Update resume_text in the database
        const { error } = await supabase
          .from('resumes')
          .update({ resume_text: text })
          .eq('id', selectedResumeId);
        if (error) {
          throw new Error('Failed to update resume text.');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setIsUploading(false);
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
                  onReanalyze={handleReanalyze}
                  onDeleteKeywords={handleDeleteKeywords}
                  onUpdateKeywords={handleUpdateKeywords}
                />
              </div>
              <div className="order-2">
                <h2 className="text-2xl font-bold text-center mb-6">Resume</h2>
                <ResumeContent
                  isEditing={isEditing}
                  resumeText={resumeText}
                  onChange={handleResumeTextChange}
                  onSave={() => handleSaveResume(resumeText)}
                  isSaving={isSaving}
                  onEdit={() => setIsEditing(!isEditing)}
                  onUpload={handleUpload}
                  isUploading={isUploading}
                  showDeleteDialog={showDeleteDialog}
                  setShowDeleteDialog={setShowDeleteDialog}
                  onDelete={() => handleDeleteResume(selectedResumeId)}
                  selectedResumeId={selectedResumeId} // Pass this prop
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
