interface ResumePreviewProps {
  resumeText: string;
}

export const ResumePreview = ({ resumeText }: ResumePreviewProps) => {
  return (
    <div className="bg-muted/50 rounded-lg p-4 min-h-[100px] max-h-[500px] overflow-y-auto mt-6">
      <pre 
        className="whitespace-pre-wrap font-mono bg-background rounded-md p-4 w-full"
        style={{ 
          fontFamily: "Menlo, monospace",
          lineHeight: "1.5",
          wordWrap: "break-word",
        }}
      >
        {resumeText}
      </pre>
    </div>
  );
};