import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { KeywordsList } from "./KeywordsList";
import { KeywordsToolbar } from "./KeywordsToolbar";

interface KeywordAnalysisProps {
  resumeText: string;
  isAnalyzing: boolean;
  keywords: string[];
  onReanalyze: () => void;
  onDeleteKeywords?: () => void;
  onUpdateKeywords?: (keywords: string[]) => void;
  onAddToNonKeywords?: (keyword: string) => void;
}

export const KeywordAnalysis = ({
  resumeText,
  isAnalyzing,
  keywords,
  onReanalyze,
  onDeleteKeywords,
  onUpdateKeywords,
  onAddToNonKeywords,
}: KeywordAnalysisProps) => {
  const [editingKeyword, setEditingKeyword] = useState<{ index: number; value: string } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAnalyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 2;
          if (prev < 70) return prev + 1;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 100);
    } else {
      setProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

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
        const removedCount = keywords.length - uniqueKeywords.length;
        onUpdateKeywords(uniqueKeywords);
        toast.success(`Removed ${removedCount} duplicate keyword${removedCount === 1 ? '' : 's'}`);
      } else {
        toast.info('No duplicate keywords found');
      }
    }
  };

  const handleCopyKeywords = async () => {
    try {
      await navigator.clipboard.writeText(keywords.join(', '));
      toast.success('Keywords copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy keywords');
    }
  };

  if (!resumeText) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <h2 className="text-lg font-semibold">Keywords Found</h2>
        <div className="flex flex-wrap gap-2">
          {keywords.length > 0 && (
            <>
              <KeywordsToolbar
                keywordsCount={keywords.length}
                isAnalyzing={isAnalyzing}
                onReanalyze={onReanalyze}
                onRemoveDuplicates={handleRemoveDuplicates}
                onCopyKeywords={handleCopyKeywords}
                onDeleteAll={onDeleteKeywords}
              />
            </>
          )}
          {!keywords.length && (
            <button
              onClick={onReanalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </button>
          )}
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
            <KeywordsList
              keywords={keywords}
              editingKeyword={editingKeyword}
              onEdit={handleEditKeyword}
              onSave={handleSaveKeyword}
              onCancel={() => setEditingKeyword(null)}
              onDelete={handleDeleteKeyword}
              onEditingChange={(index, value) => setEditingKeyword({ index, value })}
              onAddToNonKeywords={onAddToNonKeywords!}
            />
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