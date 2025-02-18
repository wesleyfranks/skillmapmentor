// src/components/profile/resume/ResumeContent.tsx

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
  onDelete: (resumeId: string, filePath: string) => void;
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
      variant: 'default' as const, // Purple
    },
    {
      label: 'Delete Resume',
      icon: Trash,
      onClick: () => setShowDeleteDialog(true),
      variant: 'destructive' as const, // Red
      disabled: !resumeText || isEditing,
    },
    {
      label: 'Upload',
      icon: Upload,
      onClick: onUpload,
      isProcessing: isUploading,
      disabled: isEditing,
      variant: 'default' as const, // Purple
      stretch: true,
    },
  ];

  const handleDelete = () => {
    if (!resumeId) {
      console.error('No selected resume for deletion.');
      return;
    }
    const selectedResume = resumes.find((r) => r.id === resumeId);
    if (!selectedResume) {
      console.error('Resume not found.');
      return;
    }
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

      {/* ADDED: Minimal Resumes List */}
      {resumes && resumes.length > 0 && (
        <div className="border border-gray-300 rounded p-3">
          <h3 className="font-semibold mb-2 text-sm">Resumes List</h3>
          <ul className="space-y-1 text-sm">
            {resumes.map((r) => (
              <li key={r.id} className="flex items-center justify-between">
                <span>{r.file_path || 'Untitled Resume'}</span>
                {/* Example: highlight if it's the selected one */}
                {r.id === resumeId && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

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
