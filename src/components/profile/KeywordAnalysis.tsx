import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface KeywordAnalysisProps {
  resumeText: string;
  isAnalyzing: boolean;
  keywords: string[];
}

export const KeywordAnalysis = ({
  resumeText,
  isAnalyzing,
  keywords,
}: KeywordAnalysisProps) => {
  if (!resumeText) return null;

  return (
    <div className="space-y-4">
      {isAnalyzing && (
        <div className="space-y-2">
          <Progress value={75} className="w-full" />
          <div className="text-sm text-muted-foreground">Analyzing Resume...</div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
        </div>
      )}

      {keywords.length > 0 && !isAnalyzing && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Keywords Found</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm animate-fade-in"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};