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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCopyKeywords}
          className="bg-background hover:bg-accent"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copy All</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemoveDuplicates}
          className="bg-background hover:bg-accent"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Remove Duplicates</span>
        </Button>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteAll}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear All</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className="bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
        </Button>
      </div>
    </div>
  );
};