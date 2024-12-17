import { useState } from "react";
import { ResumeContent } from "./ResumeContent";
import { ResumeToolbar } from "./ResumeToolbar";
import { usePdfHandler } from "@/hooks/usePdfHandler";

interface ResumeEditorProps {
  resumeText: string;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: (text: string) => void;  // Updated type to accept string parameter
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

  const handleUploadClick = () => {
    document.getElementById('pdf-upload')?.click();
  };

  return (
    <div className="space-y-6">
      <div className="h-[52px]">
        <ResumeToolbar
          resumeText={resumeText}
          isEditing={isEditing}
          isUploading={isUploading}
          onEdit={handleEditClick}
          onUpload={handleUploadClick}
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          onDelete={onDelete}
        />
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

      <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
        <ResumeContent
          isEditing={isEditing}
          resumeText={resumeText}
          onChange={onChange}
          onSave={() => onSave(resumeText)}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};