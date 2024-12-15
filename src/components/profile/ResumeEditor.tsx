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

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium text-muted-foreground">Resume Text</label>
        <div className="flex gap-2">
          <Button
            variant={resumeText ? "ghost" : "default"}
            size="sm"
            className="flex items-center gap-2"
            disabled={isUploading}
            onClick={() => document.getElementById('pdf-upload')?.click()}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload PDF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit()}
            className="flex items-center gap-2"
          >
            {resumeText ? (
              <>
                <Pencil className="h-4 w-4" />
                {isEditing ? "Cancel" : "Edit"}
              </>
            ) : (
              <>
                <FilePlus className="h-4 w-4" />
                Add Resume Manually
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