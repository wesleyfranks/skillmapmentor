import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { FileX } from "lucide-react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && resumeText) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 792)}px`; // 792px = 11 inches
    }
  }, [resumeText]);

  if (!resumeText && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 h-[300px] border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <FileX className="w-12 h-12 text-gray-400" />
        <p className="text-lg font-semibold text-gray-500 uppercase tracking-wide">No Resume Available</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <>
        <textarea
          ref={textareaRef}
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full font-mono whitespace-pre-wrap rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            resumeText ? 'min-h-[11in]' : 'min-h-[300px]'
          }`}
          style={{ 
            padding: resumeText ? "0.25in" : "0.5rem",
            width: resumeText ? "8.5in" : "100%",
            margin: resumeText ? "0 auto" : "0",
            lineHeight: "1.5",
            tabSize: "4",
            border: "1px solid #e2e8f0",
            backgroundColor: "white",
            boxShadow: resumeText ? "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" : "none",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            fontFamily: "monospace",
            resize: "vertical"
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
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        fontFamily: "monospace"
      }}
    >
      {resumeText}
    </div>
  );
};