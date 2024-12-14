import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface KeywordAnalysisProps {
  resumeText: string;
  isAnalyzing: boolean;
  keywords: string[];
  onReanalyze: () => void;
}

export const KeywordAnalysis = ({
  resumeText,
  isAnalyzing,
  keywords,
  onReanalyze,
}: KeywordAnalysisProps) => {
  if (!resumeText) return null;

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Keywords Found</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? "Analyzing..." : "Re-analyze"}
        </Button>
      </div>

      {(isAnalyzing || keywords.length > 0) && (
        <div className="bg-muted/50 rounded-lg p-4 h-[calc(100vh-20rem)] overflow-y-auto">
          {isAnalyzing && (
            <div className="space-y-4">
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
          )}
        </div>
      )}
    </div>
  );
};