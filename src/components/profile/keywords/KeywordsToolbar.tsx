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
    <div className="grid grid-cols-2 gap-2 w-full">
      <Button
        variant="outline"
        onClick={onCopyKeywords}
        disabled={!hasKeywords || isAnalyzing}
        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700"
      >
        <Copy className="h-4 w-4" />
        <span>Copy All</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={onRemoveDuplicates}
        disabled={!hasKeywords || isAnalyzing}
        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700"
      >
        <Filter className="h-4 w-4" />
        <span>Remove Duplicates</span>
      </Button>

      <Button
        variant="outline"
        onClick={onDeleteAll}
        disabled={!hasKeywords || isAnalyzing}
        className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-white hover:bg-red-500 border-red-200 hover:border-red-500"
      >
        <Trash2 className="h-4 w-4" />
        <span>Clear All</span>
      </Button>

      <Button
        variant="default"
        onClick={onReanalyze}
        disabled={isAnalyzing}
        className="w-full flex items-center justify-center gap-2 bg-[#6D28D9] hover:bg-[#5B21B6]"
      >
        <RotateCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        <span>{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
      </Button>
    </div>
  );
};