import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface KeywordAnalysisProps {
  resumeText: string;
  isAnalyzing: boolean;
  keywords: string[];
  onAnalyze: () => void;
}

export const KeywordAnalysis = ({
  resumeText,
  isAnalyzing,
  keywords,
  onAnalyze,
}: KeywordAnalysisProps) => {
  if (!resumeText) return null;

  return (
    <div className="space-y-4">
      <Button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="w-full"
      >
        {isAnalyzing ? (
          <div className="flex items-center gap-2">
            <Progress value={75} className="w-full" />
            Analyzing Resume...
          </div>
        ) : (
          "Analyze Resume"
        )}
      </Button>

      {isAnalyzing && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
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