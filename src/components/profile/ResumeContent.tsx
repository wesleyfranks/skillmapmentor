import { EmptyResumeState } from "./resume/EmptyResumeState";
import { ResumeEditor } from "./resume/ResumeEditor";
import { ResumePreview } from "./resume/ResumePreview";

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
    return <EmptyResumeState />;
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