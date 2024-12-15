import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  if (isEditing) {
    return (
      <>
        <Textarea
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[300px] font-mono whitespace-pre-wrap"
          style={{ 
            padding: "0.25in",
            width: "8.5in",
            minHeight: "11in",
            margin: "0 auto",
            lineHeight: "1.5",
            tabSize: "4",
            border: "1px solid #e2e8f0",
            backgroundColor: "white",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          }}
        />
        <Button onClick={onSave} disabled={isSaving} className="mt-4">
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              Saving...
            </div>
          ) : (
            "Save Resume"
          )}
        </Button>
      </>
    );
  }

  return (
    <div 
      className="whitespace-pre-wrap bg-white rounded-md font-mono mx-auto"
      style={{ 
        padding: "0.25in",
        width: "8.5in",
        minHeight: "11in",
        lineHeight: "1.5",
        tabSize: "4",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      {resumeText || "No resume text provided"}
    </div>
  );
};