import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { KeywordsList } from "./KeywordsList";
import { Search } from "lucide-react";

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
  onAddToNonKeywords,
}: KeywordContentProps) => {
  if (!resumeText || (keywords.length === 0 && !isAnalyzing)) {
    return <EmptyState icon={Search} message="NO KEYWORDS AVAILABLE" />;
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4 min-h-[100px] max-h-[500px] overflow-y-auto mt-6">
      {isAnalyzing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {progress < 30 && "Initializing analysis..."}
              {progress >= 30 && progress < 70 && "Processing resume content..."}
              {progress >= 70 && progress < 90 && "Extracting keywords..."}
              {progress >= 90 && "Finalizing results..."}
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
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