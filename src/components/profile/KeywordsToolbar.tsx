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
    <div className="grid grid-cols-2 gap-2 max-w-md">
      <Button
        variant="outline"
        size="sm"
        onClick={onCopyKeywords}
        className="bg-background hover:bg-accent w-full flex items-center justify-center gap-2"
      >
        <Copy className="h-4 w-4" />
        <span>Copy All</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRemoveDuplicates}
        className="bg-background hover:bg-accent w-full flex items-center justify-center gap-2"
      >
        <Filter className="h-4 w-4" />
        <span>Remove Duplicates</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDeleteAll}
        className="text-destructive hover:text-destructive-foreground hover:bg-destructive w-full flex items-center justify-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        <span>Clear All</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onReanalyze}
        disabled={isAnalyzing}
        className="bg-primary hover:bg-primary/90 w-full flex items-center justify-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        <span>{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
      </Button>
    </div>
  );
};