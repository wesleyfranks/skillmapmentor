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
    return (
      <div className="h-[300px] border border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <EmptyResumeState />
      </div>
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