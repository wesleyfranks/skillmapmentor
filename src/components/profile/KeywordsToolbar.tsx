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
    <div className="mb-4">
      <label className="text-sm font-medium text-muted-foreground block mb-2">Keywords Found</label>
      <div className="grid grid-cols-2 gap-2">
        {/* First row */}
        <Button
          variant="outline"
          size="sm"
          onClick={onCopyKeywords}
          className="flex items-center justify-center gap-2 bg-background hover:bg-accent"
        >
          <Copy className="h-4 w-4" />
          <span>Copy All</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemoveDuplicates}
          className="flex items-center justify-center gap-2 bg-background hover:bg-accent"
        >
          <Filter className="h-4 w-4" />
          <span>Remove Duplicates</span>
        </Button>
        
        {/* Second row */}
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteAll}
          className="flex items-center justify-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear All</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
        </Button>
      </div>
    </div>
  );
};