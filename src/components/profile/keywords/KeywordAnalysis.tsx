import { useState, useEffect } from 'react';
import { KeywordToolbar } from './components/KeywordToolbar';
import { KeywordContent } from './components/KeywordContent';
import { useKeywordActions } from './hooks/useKeywordActions';

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
  const [editingKeyword, setEditingKeyword] = useState<{
    index: number;
    value: string;
  } | null>(null);
  const [progress, setProgress] = useState(0);

  const {
    isCopying,
    handleCopyKeywords,
    handleEditKeyword,
    handleDeleteKeyword,
  } = useKeywordActions(keywords, onUpdateKeywords, onDeleteKeywords);

  useEffect(() => {
    if (isAnalyzing) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) =>
          prev < 100 ? prev + (prev < 30 ? 2 : prev < 70 ? 1 : 0.5) : prev
        );
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isAnalyzing]);

  const handleEditKeywordStart = (index: number, currentValue: string) => {
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

  return (
    <div className="space-y-4">
      <div className="h-[110px]">
        <KeywordToolbar
          keywords={keywords}
          isAnalyzing={isAnalyzing}
          isCopying={isCopying}
          onCopy={handleCopyKeywords}
          onDelete={onDeleteKeywords || (() => {})} // Safe fallback
          onReanalyze={onReanalyze}
        />
      </div>
      <KeywordContent
        resumeText={resumeText}
        isAnalyzing={isAnalyzing}
        keywords={keywords}
        progress={progress}
        editingKeyword={editingKeyword}
        onEditKeyword={handleEditKeywordStart}
        onSaveKeyword={handleSaveKeyword}
        onCancelEdit={() => setEditingKeyword(null)}
        onDeleteKeyword={handleDeleteKeyword}
        onEditingChange={(index, value) => setEditingKeyword({ index, value })}
        onAddToNonKeywords={onAddToNonKeywords}
      />
    </div>
  );
};
