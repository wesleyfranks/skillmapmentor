import { type ToolbarAction } from "@/components/ui/Toolbar";
import { Toolbar } from "@/components/ui/Toolbar";
import { Copy, Filter, Trash2, RotateCw, CheckSquare } from "lucide-react";

interface KeywordToolbarProps {
  keywords: string[];
  isAnalyzing: boolean;
  isCopying: boolean;
  onCopy: () => void;
  onRemoveDuplicates: () => void;
  onDelete: () => void;
  onReanalyze: () => void;
}

export const KeywordToolbar = ({
  keywords,
  isAnalyzing,
  isCopying,
  onCopy,
  onRemoveDuplicates,
  onDelete,
  onReanalyze,
}: KeywordToolbarProps) => {
  const toolbarActions: ToolbarAction[] = [
    {
      label: "Copy All",
      icon: isCopying ? CheckSquare : Copy,
      onClick: onCopy,
      disabled: !keywords.length || isAnalyzing,
      variant: "outline",
      iconClassName: isCopying ? "text-green-500" : undefined
    },
    {
      label: "Remove Duplicates",
      icon: Filter,
      onClick: onRemoveDuplicates,
      disabled: !keywords.length || isAnalyzing,
      variant: "outline"
    },
    {
      label: "Clear All",
      icon: Trash2,
      onClick: onDelete,
      disabled: !keywords.length || isAnalyzing,
      variant: "destructive"
    },
    {
      label: isAnalyzing ? "Analyzing..." : "Analyze",
      icon: RotateCw,
      onClick: onReanalyze,
      isProcessing: isAnalyzing,
      variant: "default"
    }
  ];

  return <Toolbar actions={toolbarActions} />;
};