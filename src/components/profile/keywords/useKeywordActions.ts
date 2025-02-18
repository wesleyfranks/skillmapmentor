// src/components/profile/keywords/useKeywordActions.ts

import { useState } from 'react';
import { toast } from 'sonner';

export const useKeywordActions = (
  keywords: string[],
  onUpdateKeywords?: (keywords: string[]) => void,
  onDeleteKeywords?: () => void
) => {
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyKeywords = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(keywords.join(', '));
      toast.success('Keywords copied to clipboard');
      setTimeout(() => setIsCopying(false), 1000);
    } catch (error) {
      toast.error('Failed to copy keywords');
      setIsCopying(false);
    }
  };

  const handleEditKeyword = (index: number, currentValue: string) => {
    if (onUpdateKeywords) {
      const newKeywords = [...keywords];
      newKeywords[index] = currentValue.trim();
      onUpdateKeywords(newKeywords);
    }
  };

  const handleDeleteKeyword = (index: number) => {
    if (onUpdateKeywords) {
      const newKeywords = keywords.filter((_, i) => i !== index);
      onUpdateKeywords(newKeywords);
    }
  };

  return {
    isCopying,
    handleCopyKeywords,
    handleEditKeyword,
    handleDeleteKeyword,
  };
};
