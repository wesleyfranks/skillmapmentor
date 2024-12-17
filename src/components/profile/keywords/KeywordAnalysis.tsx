import { useState, useEffect } from "react";
import { toast } from "sonner";
import { KeywordToolbar } from "./KeywordToolbar";
import { KeywordContent } from "./KeywordContent";

interface KeywordAnalysisProps {
  resumeText: string;
  isAnalyzing: boolean;
  keywords: string[];
  onReanalyze: () => void;
  onDeleteKeywords?: () => void;
  onUpdateKeywords?: (keywords: string[]) => void;
  onAddToNonKeywords?: (keyword: string) => void;
}

export const KeywordAnalysis = ({
  resumeText,
  isAnalyzing,
  keywords,
  onReanalyze,
  onDeleteKeywords,
  onUpdateKeywords,
  onAddToNonKeywords,
}: KeywordAnalysisProps) => {
  const [editingKeyword, setEditingKeyword] = useState<{ index: number; value: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAnalyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 2;
          if (prev < 70) return prev + 1;
          if (prev < 90) return prev + 0.5;
          return prev;
        });
      }, 100);
    } else {
      setProgress(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  const handleEditKeyword = (index: number, currentValue: string) => {
    setEditingKeyword({ index, value: currentValue });
  };

  const handleSaveKeyword = () => {
    if (editingKeyword && onUpdateKeywords) {
      const newKeywords = [...keywords];
      newKeywords[editingKeyword.index] = editingKeyword.value.trim();
      onUpdateKeywords(newKeywords);
      setEditingKeyword(null);
    }
  };

  const handleDeleteKeyword = (indexToDelete: number) => {
    if (onUpdateKeywords) {
      const newKeywords = keywords.filter((_, index) => index !== indexToDelete);
      onUpdateKeywords(newKeywords);
    }
  };

  const handleRemoveDuplicates = () => {
    if (onUpdateKeywords) {
      const seen = new Set<string>();
      const uniqueKeywords = keywords.filter(keyword => {
        const lowercase = keyword.toLowerCase();
        if (seen.has(lowercase)) {
          return false;
        }
        seen.add(lowercase);
        return true;
      });
      
      if (uniqueKeywords.length !== keywords.length) {
        const removedCount = keywords.length - uniqueKeywords.length;
        onUpdateKeywords(uniqueKeywords);
        toast.success(`Removed ${removedCount} duplicate keyword${removedCount === 1 ? '' : 's'}`);
      } else {
        toast.info('No duplicate keywords found');
      }
    }
  };

  const handleCopyKeywords = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(keywords.join(', '));
      toast.success('Keywords copied to clipboard');
      // Increased timing from 200ms to 1000ms (1 second)
      setTimeout(() => setIsCopying(false), 1000);
    } catch (error) {
      toast.error('Failed to copy keywords');
      setIsCopying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[110px]">
        <KeywordToolbar
          keywords={keywords}
          isAnalyzing={isAnalyzing}
          isCopying={isCopying}
          onCopy={handleCopyKeywords}
          onRemoveDuplicates={handleRemoveDuplicates}
          onDelete={onDeleteKeywords!}
          onReanalyze={onReanalyze}
        />
      </div>
      <KeywordContent
        resumeText={resumeText}
        isAnalyzing={isAnalyzing}
        keywords={keywords}
        progress={progress}
        editingKeyword={editingKeyword}
        onEditKeyword={handleEditKeyword}
        onSaveKeyword={handleSaveKeyword}
        onCancelEdit={() => setEditingKeyword(null)}
        onDeleteKeyword={handleDeleteKeyword}
        onEditingChange={(index, value) => setEditingKeyword({ index, value })}
        onAddToNonKeywords={onAddToNonKeywords}
      />
    </div>
  );
};
