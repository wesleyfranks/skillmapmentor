import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, X, Pencil, Trash2, Filter } from "lucide-react";
import { useState, useEffect } from "react";

interface KeywordAnalysisProps {
  resumeText: string;
  isAnalyzing: boolean;
  keywords: string[];
  onReanalyze: () => void;
  onDeleteKeywords?: () => void;
  onUpdateKeywords?: (keywords: string[]) => void;
}

export const KeywordAnalysis = ({
  resumeText,
  isAnalyzing,
  keywords,
  onReanalyze,
  onDeleteKeywords,
  onUpdateKeywords,
}: KeywordAnalysisProps) => {
  const [editingKeyword, setEditingKeyword] = useState<{ index: number; value: string } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAnalyzing) {
      setProgress(0);
      // Simulate progress in 3 stages
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 2; // First stage: Quick progress to 30%
          if (prev < 70) return prev + 1; // Second stage: Slower progress to 70%
          if (prev < 90) return prev + 0.5; // Third stage: Very slow progress to 90%
          return prev; // Stop at 90% until analysis is complete
        });
      }, 100);
    } else {
      setProgress(100); // Complete the progress when analysis is done
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  if (!resumeText) return null;

  const handleEditKeyword = (index: number, currentValue: string) => {
    setEditingKeyword({ index, value: currentValue });
  };

  const handleSaveKeyword = () => {
    if (editingKeyword && onUpdateKeywords) {
      const newKeywords = [...keywords];
      newKeywords[editingKeyword.index] = editingKeyword.value.trim();
      onUpdateKeywords(newKeywords);
      setEditingKeyword(null);
    }
  };

  const handleDeleteKeyword = (indexToDelete: number) => {
    if (onUpdateKeywords) {
      const newKeywords = keywords.filter((_, index) => index !== indexToDelete);
      onUpdateKeywords(newKeywords);
    }
  };

  const handleRemoveDuplicates = () => {
    if (onUpdateKeywords) {
      // Convert to lowercase for case-insensitive comparison, remove duplicates, and maintain original case
      const seen = new Set<string>();
      const uniqueKeywords = keywords.filter(keyword => {
        const lowercase = keyword.toLowerCase();
        if (seen.has(lowercase)) {
          return false;
        }
        seen.add(lowercase);
        return true;
      });
      
      if (uniqueKeywords.length !== keywords.length) {
        onUpdateKeywords(uniqueKeywords);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveKeyword();
    } else if (e.key === 'Escape') {
      setEditingKeyword(null);
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Keywords Found</h2>
        <div className="flex gap-2">
          {keywords.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveDuplicates}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Remove Duplicates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteKeywords}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </div>

      {(isAnalyzing || keywords.length > 0) ? (
        <div className="bg-muted/50 rounded-lg p-4 min-h-[100px] max-h-[500px] overflow-y-auto">
          {isAnalyzing && (
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {progress < 30 && "Initializing analysis..."}
                {progress >= 30 && progress < 70 && "Processing resume content..."}
                {progress >= 70 && progress < 90 && "Extracting keywords..."}
                {progress >= 90 && "Finalizing results..."}
              </div>
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
                <div
                  key={index}
                  className={`group flex items-center gap-1 ${
                    editingKeyword?.index === index
                      ? ''
                      : 'bg-primary/10 text-primary px-2 py-1 rounded-md text-sm animate-fade-in'
                  }`}
                >
                  {editingKeyword?.index === index ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingKeyword.value}
                        onChange={(e) => setEditingKeyword({ index, value: e.target.value })}
                        onBlur={handleSaveKeyword}
                        onKeyDown={handleKeyDown}
                        className="h-6 w-32 text-sm"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setEditingKeyword(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span>{keyword}</span>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleEditKeyword(index, keyword)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => handleDeleteKeyword(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4 text-center text-muted-foreground min-h-[100px]">
          <p>No keywords found yet. Click "Analyze" to extract keywords from your resume.</p>
        </div>
      )}
    </div>
  );
};