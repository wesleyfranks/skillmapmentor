import { Progress } from '@/ui/progress';
import { Skeleton } from '@/ui/skeleton';
import { EmptyState } from '@/ui/EmptyState';
import { KeywordsList } from './KeywordsList';
import { Search } from 'lucide-react';

interface KeywordContentProps {
  resumeText: string;
  isAnalyzing: boolean;
  keywords: string[];
  progress: number;
  editingKeyword: { index: number; value: string } | null;
  onEditKeyword: (index: number, value: string) => void;
  onSaveKeyword: () => void;
  onCancelEdit: () => void;
  onDeleteKeyword: (index: number) => void;
  onEditingChange: (index: number, value: string) => void;
  onAddToNonKeywords?: (keyword: string) => void;
}

export const KeywordContent = ({
  resumeText,
  isAnalyzing,
  keywords,
  progress,
  editingKeyword,
  onEditKeyword,
  onSaveKeyword,
  onCancelEdit,
  onDeleteKeyword,
  onEditingChange,
  onAddToNonKeywords = () => {}, // Provide a default no-op function
}: KeywordContentProps) => {
  if (!resumeText) {
    return <EmptyState icon={Search} message="No resume content to analyze." />;
  }

  if (keywords.length === 0 && !isAnalyzing) {
    return <EmptyState icon={Search} message="No keywords available." />;
  }

  const renderSkeletons = (count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-6 w-20" aria-hidden="true" />
    ));

  return (
    <div
      className="bg-muted/50 rounded-lg p-4 min-h-[100px] max-h-[500px] overflow-y-auto mt-6"
      role="region"
      aria-label="Keyword Analysis Results"
    >
      {isAnalyzing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground" aria-live="polite">
              {progress < 30 && 'Initializing analysis...'}
              {progress >= 30 &&
                progress < 70 &&
                'Processing resume content...'}
              {progress >= 70 && progress < 90 && 'Extracting keywords...'}
              {progress >= 90 && 'Finalizing results...'}
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="flex flex-wrap gap-2">{renderSkeletons(5)}</div>
        </div>
      ) : (
        keywords.length > 0 && (
          <KeywordsList
            keywords={keywords}
            editingKeyword={editingKeyword}
            onEdit={onEditKeyword}
            onSave={onSaveKeyword}
            onCancel={onCancelEdit}
            onDelete={onDeleteKeyword}
            onEditingChange={onEditingChange}
            onAddToNonKeywords={onAddToNonKeywords}
          />
        )
      )}
    </div>
  );
};
