import { EmptyState } from "@/components/ui/EmptyState";
import { ResumeEditor } from "./ResumeEditor";
import { ResumePreview } from "./ResumePreview";
import { File } from "lucide-react";
import { Toolbar } from "@/components/ui/Toolbar";
import { Edit, Save, Upload, Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ResumeContentProps {
  isEditing: boolean;
  resumeText: string;
  onChange: (text: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onEdit: () => void;
  onUpload: () => void;
  isUploading: boolean;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  onDelete: () => void;
}

export const ResumeContent = ({
  isEditing,
  resumeText,
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
      label: isEditing ? "Save" : "Edit",
      icon: isEditing ? Save : Edit,
      onClick: isEditing ? onSave : onEdit,
      isProcessing: isSaving,
      variant: isEditing ? "default" : "outline",
    },
    {
      label: "Upload",
      icon: Upload,
      onClick: onUpload,
      isProcessing: isUploading,
      disabled: isEditing,
    },
    {
      label: "Delete",
      icon: Trash,
      onClick: () => setShowDeleteDialog(true),
      variant: "destructive",
      disabled: !resumeText || isEditing,
      stretch: true,
    },
  ];

  if (!resumeText && !isEditing) {
    return (
      <div className="space-y-6">
        <Toolbar actions={toolbarActions} />
        <EmptyState
          icon={File}
          message="NO RESUME AVAILABLE"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toolbar actions={toolbarActions} />
      {isEditing ? (
        <ResumeEditor
          resumeText={resumeText}
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
              This action cannot be undone. This will permanently delete your resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};