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
          className="min-h-[300px] font-mono"
          style={{ 
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            lineHeight: '1.5',
            tabSize: '4'
          }}
        />
        <Button onClick={onSave} disabled={isSaving} className="mt-2">
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
      className="whitespace-pre bg-muted p-4 rounded-md min-h-[100px] font-mono"
      style={{ 
        fontFamily: 'monospace',
        lineHeight: '1.5',
        tabSize: '4',
        overflowX: 'auto'
      }}
    >
      {resumeText || "No resume text provided"}
    </div>
  );
};