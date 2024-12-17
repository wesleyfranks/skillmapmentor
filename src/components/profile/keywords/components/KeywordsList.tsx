import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Pencil, Ban, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KeywordsListProps {
  keywords: string[];
  editingKeyword: { index: number; value: string } | null;
  onEdit: (index: number, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (index: number) => void;
  onEditingChange: (index: number, value: string) => void;
  onAddToNonKeywords?: (keyword: string) => void;
}

export const KeywordsList = ({
  keywords,
  editingKeyword,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditingChange,
  onAddToNonKeywords,
}: KeywordsListProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleDelete = (index: number) => {
    toast.success(`Removed "${keywords[index]}" from keywords list`);
    onDelete(index);
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-2 p-0 shrink-0 inline-flex"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-max">
                  <DropdownMenuItem onClick={() => onEdit(index, keyword)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onAddToNonKeywords?.(keyword)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    <span>Non-Keyword</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(index)}
                    className="text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      ))}
    </div>
  );
};