import { Button } from "@/components/ui/button";
import { Copy, Filter, Trash2, RotateCw } from "lucide-react";

interface KeywordsToolbarProps {
  keywordsCount: number;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  onRemoveDuplicates: () => void;
  onCopyKeywords: () => void;
  onDeleteAll: () => void;
  showAnalyzeButton: boolean;
}

export const KeywordsToolbar = ({
  keywordsCount,
  isAnalyzing,
  onReanalyze,
  onRemoveDuplicates,
  onCopyKeywords,
  onDeleteAll,
  showAnalyzeButton,
}: KeywordsToolbarProps) => {
  const hasKeywords = keywordsCount > 0;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onCopyKeywords}
          disabled={!hasKeywords || isAnalyzing}
          className="w-full flex items-center justify-center gap-2"
        >
          <Copy className="h-4 w-4" />
          <span>Copy All</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onRemoveDuplicates}
          disabled={!hasKeywords || isAnalyzing}
          className="w-full flex items-center justify-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>Remove Duplicates</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onDeleteAll}
          disabled={!hasKeywords || isAnalyzing}
          className="text-red-500 hover:text-white hover:bg-red-500 w-full flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear All</span>
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className="bg-primary hover:bg-primary/90 w-full flex items-center justify-center gap-2"
        >
          <RotateCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
        </Button>
      </div>
    </div>
  );
};