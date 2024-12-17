import { Toolbar, type ToolbarAction } from '@/components/ui/Toolbar';
import { Pencil, Upload, FilePlus, Trash2 } from 'lucide-react';
import { DeleteResumeDialog } from './DeleteResumeDialog';

interface ResumeToolbarProps {
  resumeText: string;
  isEditing: boolean;
  isUploading: boolean;
  onEdit: () => void;
  onUpload: () => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  onDelete: () => void;
}

export const ResumeToolbar = ({
  resumeText,
  isEditing,
  isUploading,
  onEdit,
  onUpload,
  showDeleteDialog,
  setShowDeleteDialog,
  onDelete,
}: ResumeToolbarProps) => {
  const toolbarActions: ToolbarAction[] = [
    {
      label: resumeText ? (isEditing ? 'Cancel' : 'Edit') : 'Add Manual',
      icon: resumeText ? Pencil : FilePlus,
      onClick: onEdit,
      variant: "outline"
    }
  ];

  if (!isEditing) {
    toolbarActions.push({
      label: "Delete",
      icon: Trash2,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive"
    });
  }

  toolbarActions.push({
    label: isUploading ? "Uploading..." : "Upload PDF",
    icon: Upload,
    onClick: onUpload,
    isProcessing: isUploading,
    variant: "default",
    disabled: isUploading,
    stretch: true // Add this line to make the Upload PDF button stretch
  });

  return (
    <>
      <Toolbar actions={toolbarActions} />
      <DeleteResumeDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={onDelete}
      />
    </>
  );
};