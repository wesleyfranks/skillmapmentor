import { EmptyState } from "@/components/ui/EmptyState";
import { ResumeEditor } from "./ResumeEditor";
import { ResumePreview } from "./ResumePreview";
import { File } from "lucide-react";

interface ResumeContentProps {
  isEditing: boolean;
  resumeText: string;
  onChange: (text: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const ResumeContent = ({
  isEditing,
  resumeText,
  onChange,
  onSave,
  isSaving,
}: ResumeContentProps) => {
  if (!resumeText && !isEditing) {
    return (
      <EmptyState
        icon={File}
        message="No resume uploaded yet. Click 'Upload PDF' or 'Edit' to add your resume."
      />
    );
  }

  if (isEditing) {
    return (
      <ResumeEditor
        resumeText={resumeText}
        onChange={onChange}
        onSave={onSave}
        isSaving={isSaving}
      />
    );
  }

  return <ResumePreview resumeText={resumeText} />;
};