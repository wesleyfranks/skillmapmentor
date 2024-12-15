import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Filter, Copy } from "lucide-react";

interface KeywordsToolbarProps {
  keywordsCount: number;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  onRemoveDuplicates: () => void;
  onCopyKeywords: () => void;
  onDeleteAll: () => void;
}

export const KeywordsToolbar = ({
  keywordsCount,
  isAnalyzing,
  onReanalyze,
  onRemoveDuplicates,
  onCopyKeywords,
  onDeleteAll,
}: KeywordsToolbarProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Keywords Found</h2>
      <div className="flex gap-2">
        {keywordsCount > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyKeywords}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveDuplicates}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Remove Duplicates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteAll}
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
  );
};