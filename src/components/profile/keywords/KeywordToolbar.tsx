// src/components/profile/keywords/KeywordToolbar.tsx

import React from 'react';
import { LucideIcon, Copy, Trash2, RotateCw, CheckSquare } from 'lucide-react';
import { Toolbar, ToolbarAction } from '@/ui/Toolbar';

interface KeywordToolbarProps {
  keywords: string[];
  isAnalyzing: boolean;
  isCopying: boolean;
  onCopy: () => void;
  onDelete: () => void;
  onReanalyze: () => void;
}

export function KeywordToolbar({
  keywords,
  isAnalyzing,
  isCopying,
  onCopy,
  onDelete,
  onReanalyze,
}: KeywordToolbarProps) {
  const CopyIcon: LucideIcon = isCopying ? CheckSquare : Copy;

  const toolbarActions: ToolbarAction[] = [
    {
      label: 'Copy All',
      icon: CopyIcon,
      onClick: onCopy,
      disabled: !keywords.length || isAnalyzing,
      variant: 'default',
      isProcessing: isCopying,
      tooltip: 'Copy all keywords to clipboard',
    },
    {
      label: 'Clear All',
      icon: Trash2,
      onClick: onDelete,
      disabled: !keywords.length || isAnalyzing,
      variant: 'destructive',
      tooltip: 'Delete all keywords',
    },
    {
      label: isAnalyzing ? 'Analyzing...' : 'Analyze',
      icon: RotateCw,
      onClick: onReanalyze,
      isProcessing: isAnalyzing,
      disabled: !keywords.length && !isAnalyzing,
      variant: 'default',
      stretch: true,
      tooltip: 'Re-analyze the resume for keywords',
    },
  ];

  return <Toolbar actions={toolbarActions} />;
}
