import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Upload, FilePlus } from "lucide-react";
import { DeleteResumeDialog } from "./DeleteResumeDialog";
import { ResumeContent } from "./ResumeContent";
import { usePdfHandler } from "@/hooks/usePdfHandler";

interface ResumeEditorProps {
  resumeText: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (text: string) => void;
  userId: string;
}

export const ResumeEditor = ({
  resumeText,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onDelete,
  onChange,
  userId,
}: ResumeEditorProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isUploading, handleFileUpload } = usePdfHandler(userId, onChange);
  const [originalText, setOriginalText] = useState(resumeText);

  const handleEditClick = () => {
    if (isEditing) {
      onChange(originalText);
    } else {
      setOriginalText(resumeText);
    }
    onEdit();
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium text-muted-foreground">Resume Text</label>
        <div className="grid grid-cols-2 gap-2 max-w-md">
          <Button
            variant="default"
            size="sm"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 col-span-2"
            disabled={isUploading}
            onClick={() => document.getElementById('pdf-upload')?.click()}
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
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
          {!isEditing && resumeText && (
            <DeleteResumeDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>

      <input
        type="file"
        id="pdf-upload"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
      />

      <div className="h-[calc(100vh-20rem)] overflow-y-auto">
        <ResumeContent
          isEditing={isEditing}
          resumeText={resumeText}
          onChange={onChange}
          onSave={onSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};