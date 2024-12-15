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

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    // Get the clipboard data
    const text = e.clipboardData.getData('text/plain');
    
    // Get cursor position
    const startPos = e.currentTarget.selectionStart;
    const endPos = e.currentTarget.selectionEnd;
    
    // Get current value
    const currentValue = e.currentTarget.value;
    
    // Create new value with pasted text
    const newValue = 
      currentValue.substring(0, startPos) + 
      text +
      currentValue.substring(endPos);
    
    // Update the textarea value while preserving formatting
    onChange(newValue);
    
    // Set cursor position after pasted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = startPos + text.length;
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
      }
    }, 0);
  };

  if (!resumeText && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 h-[300px] border border-dashed border-gray-300 rounded-lg bg-gray-50 mt-4">
        <FileX className="w-12 h-12 text-gray-400" />
        <p className="text-lg font-semibold text-gray-500 uppercase tracking-wide">No Resume Available</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <>
        <pre className="w-full mt-4">
          <textarea
            ref={textareaRef}
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            className={`w-full font-mono whitespace-pre rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
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
              whiteSpace: "pre",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              fontFamily: "monospace",
              resize: "vertical"
            }}
          />
        </pre>
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
    <pre 
      className="whitespace-pre bg-white rounded-md font-mono mx-auto mt-4"
      style={{ 
        padding: "0.25in",
        width: "8.5in",
        minHeight: "11in",
        lineHeight: "1.5",
        tabSize: "4",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        whiteSpace: "pre",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        fontFamily: "monospace"
      }}
    >
      {resumeText}
    </pre>
  );
};