import { type ToolbarAction } from '@/ui/Toolbar';
import { Toolbar } from '@/ui/Toolbar';
import { Copy, Trash2, RotateCw, CheckSquare } from 'lucide-react';

interface KeywordToolbarProps {
  keywords: string[];
  isAnalyzing: boolean;
  isCopying: boolean;
  onCopy: () => void;
  onDelete: () => void;
  onReanalyze: () => void;
}

export const KeywordToolbar = ({
  keywords,
  isAnalyzing,
  isCopying,
  onCopy,
  onDelete,
  onReanalyze,
}: KeywordToolbarProps) => {
  const toolbarActions: ToolbarAction[] = [
    {
      label: 'Copy All',
      icon: isCopying ? CheckSquare : Copy,
      onClick: onCopy,
      disabled: !keywords.length || isAnalyzing,
      variant: isCopying ? 'default' : 'outline',
      className: isCopying
        ? 'bg-green-500 hover:bg-green-600 border-0'
        : undefined,
      iconClassName: isCopying ? 'text-white' : undefined,
      tooltip: 'Copy all keywords to clipboard', // Added tooltip
      'aria-label': 'Copy All', // Added for screen readers
    },
    {
      label: 'Clear All',
      icon: Trash2,
      onClick: onDelete,
      disabled: !keywords.length || isAnalyzing,
      variant: 'destructive',
      tooltip: 'Clear all keywords', // Added tooltip
      'aria-label': 'Clear All', // Added for screen readers
    },
    {
      label: isAnalyzing ? 'Analyzing...' : 'Analyze',
      icon: RotateCw,
      onClick: onReanalyze,
      isProcessing: isAnalyzing,
      variant: 'default',
      stretch: true,
      tooltip: isAnalyzing ? 'Analyzing keywords...' : 'Analyze keywords', // Added tooltip
      'aria-label': isAnalyzing ? 'Analyzing' : 'Analyze', // Added for screen readers
    },
  ];

  return <Toolbar actions={toolbarActions} />;
};
