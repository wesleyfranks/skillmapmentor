import { EmptyResumeState } from "./EmptyResumeState";
import { ResumeEditor } from "./ResumeEditor";
import { ResumePreview } from "./ResumePreview";

interface ResumeContentProps {
  isEditing: boolean;
  resumeText: string;
  onChange: (text: string) => void;
  onSave: () => void;  // Keep this as () => void since we handle the text in parent
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
      <div className="h-[300px] border border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center space-y-4 mt-6">
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