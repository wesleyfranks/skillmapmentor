import { EmptyState } from '@/ui/EmptyState';
import { ResumeEditor } from './ResumeEditor';
import { ResumePreview } from './ResumePreview';
import { File } from 'lucide-react';
import { Toolbar } from '@/ui/Toolbar';
import { Edit, Save, Upload, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog';

interface ResumeContentProps {
  isEditing: boolean;
  resumeId: string;
  resumeText: string;
  onChange: (text: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onEdit: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  onDelete: (resumeId: string, filePath: string) => void; // Accept two arguments for deletion
  resumes: { id: string; file_path: string }[];
}

export const ResumeContent = ({
  isEditing,
  resumeText,
  resumeId,
  resumes,
  onChange,
  onSave,
  isSaving,
  onEdit,
  onUpload,
  isUploading,
  showDeleteDialog,
  setShowDeleteDialog,
  onDelete,
}: ResumeContentProps) => {
  const toolbarActions = [
    {
      label: isEditing ? 'Save' : 'Manual',
      icon: isEditing ? Save : Edit,
      onClick: isEditing ? onSave : onEdit,
      isProcessing: isSaving,
      variant: isEditing ? ('default' as const) : ('outline' as const),
    },
    {
      label: 'Delete Resume',
      icon: Trash,
      onClick: () => setShowDeleteDialog(true),
      variant: 'destructive' as const,
      disabled: !resumeText || isEditing,
    },
    {
      label: 'Upload',
      icon: Upload,
      onClick: onUpload,
      isProcessing: isUploading,
      disabled: isEditing,
      variant: 'default' as const,
      stretch: true,
    },
  ];

  const handleDelete = () => {
    if (!resumeId) {
      console.error('No selected resume for deletion.');
      return;
    }

    const selectedResume = resumes.find(
      (resume) => resume.id === resumeId
    );
    if (!selectedResume) {
      console.error('Resume not found.');
      return;
    }

    // Pass resumeId and filePath to the onDelete handler
    onDelete(selectedResume.id, selectedResume.file_path);
  };

  if (!resumeText && !isEditing) {
    return (
      <div className="space-y-6">
        <Toolbar actions={toolbarActions} />
        <EmptyState icon={File} message="NO RESUME AVAILABLE" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toolbar actions={toolbarActions} />
      {isEditing ? (
        <ResumeEditor
          resumeText={resumeText}
          resumeId={resumeId}
          onChange={onChange}
          onSave={onSave}
          isSaving={isSaving}
        />
      ) : (
        <ResumePreview resumeText={resumeText} />
      )}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
