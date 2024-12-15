import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Pencil } from "lucide-react";

interface KeywordsListProps {
  keywords: string[];
  editingKeyword: { index: number; value: string } | null;
  onEdit: (index: number, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (index: number) => void;
  onEditingChange: (index: number, value: string) => void;
}

export const KeywordsList = ({
  keywords,
  editingKeyword,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditingChange,
}: KeywordsListProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <div
          key={index}
          className={`group flex items-center gap-1 ${
            editingKeyword?.index === index
              ? ''
              : 'bg-primary/10 text-primary px-2 py-1 rounded-md text-sm animate-fade-in'
          }`}
        >
          {editingKeyword?.index === index ? (
            <div className="flex items-center gap-1">
              <Input
                value={editingKeyword.value}
                onChange={(e) => onEditingChange(index, e.target.value)}
                onBlur={onSave}
                onKeyDown={handleKeyDown}
                className="h-6 w-32 text-sm"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onCancel}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <span>{keyword}</span>
              <div className="hidden group-hover:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onEdit(index, keyword)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={() => onDelete(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};