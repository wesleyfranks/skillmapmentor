import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

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
    if (textareaRef.current) {
      if (resumeText) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 792)}px`; // 792px = 11 inches
      } else {
        textareaRef.current.style.height = '300px'; // Default height when empty
      }
    }
  }, [resumeText]);

  if (isEditing) {
    return (
      <>
        <Textarea
          ref={textareaRef}
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => onChange(e.target.value)}
          className={`font-mono whitespace-pre-wrap ${resumeText ? 'min-h-[11in]' : 'min-h-[300px]'}`}
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
            resize: "none"
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
      className={`whitespace-pre-wrap bg-white rounded-md font-mono ${resumeText ? 'mx-auto' : 'w-full'}`}
      style={{ 
        padding: resumeText ? "0.25in" : "0.5rem",
        width: resumeText ? "8.5in" : "100%",
        minHeight: resumeText ? "11in" : "300px",
        lineHeight: "1.5",
        tabSize: "4",
        border: "1px solid #e2e8f0",
        boxShadow: resumeText ? "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" : "none",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        fontFamily: "monospace"
      }}
    >
      {resumeText || "No resume text provided"}
    </div>
  );
};