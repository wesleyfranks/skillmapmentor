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
    <div className="mb-4">
      <label className="text-sm font-medium text-muted-foreground block mb-2">Resume Text</label>
      <div className="grid grid-cols-2 gap-2">
        {/* First row */}
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex items-center justify-center gap-2 bg-background hover:bg-accent"
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
        
        {!isEditing ? (
          <DeleteResumeDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onDelete={onDelete}
          />
        ) : (
          <div /> // Empty div to maintain grid layout when editing
        )}
        
        {/* Second row - Upload button spans both columns */}
        <Button
          variant="default"
          size="sm"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 col-span-2"
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
      </div>
    </div>
  );
};