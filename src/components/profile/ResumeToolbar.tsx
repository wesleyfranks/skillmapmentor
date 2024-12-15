import { Button } from "@/components/ui/button";
import { Pencil, Upload, FilePlus, Trash2 } from "lucide-react";
import { DeleteResumeDialog } from "./DeleteResumeDialog";

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
  return (
    <div className="grid grid-cols-2 gap-2 max-w-md">
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="bg-background hover:bg-accent w-full flex items-center justify-center gap-2"
      >
        {resumeText ? (
          <>
            <Pencil className="h-4 w-4" />
            <span>{isEditing ? "Cancel" : "Edit"}</span>
          </>
        ) : (
          <>
            <FilePlus className="h-4 w-4" />
            <span>Add Manual</span>
          </>
        )}
      </Button>
      
      {!isEditing && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive w-full flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      )}
      
      {isEditing && (
        <Button
          variant="outline"
          size="sm"
          className="invisible w-full"
        />
      )}
      
      <Button
        variant="default"
        size="sm"
        className="bg-primary hover:bg-primary/90 w-full flex items-center justify-center gap-2 col-span-2"
        disabled={isUploading}
        onClick={onUpload}
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Upload PDF</span>
          </>
        )}
      </Button>

      <DeleteResumeDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={onDelete}
      />
    </div>
  );
};