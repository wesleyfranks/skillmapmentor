import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface ResumeEditorProps {
  resumeText: string;
  onChange: (text: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const ResumeEditor = ({
  resumeText,
  onChange,
  onSave,
  isSaving,
}: ResumeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && resumeText) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [resumeText]);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const startPos = e.currentTarget.selectionStart;
    const endPos = e.currentTarget.selectionEnd;
    const currentValue = e.currentTarget.value;
    const newValue = 
      currentValue.substring(0, startPos) + 
      text +
      currentValue.substring(endPos);
    onChange(newValue);
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = startPos + text.length;
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
      }
    }, 0);
  };

  return (
    <>
      <div className="bg-muted/50 rounded-lg p-4 min-h-[100px] max-h-[500px] overflow-y-auto mt-6">
        <textarea
          ref={textareaRef}
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          className="w-full font-mono whitespace-pre rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[300px] p-4"
          style={{ 
            resize: "vertical",
            fontFamily: "Menlo, monospace",
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        />
      </div>
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
};