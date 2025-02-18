import React from 'react';
import { X, Pencil, Ban } from 'lucide-react';
import { Button } from '@/ui/button';

interface KeywordChipProps {
  label: string;
  onDelete: () => void;
  onEdit: () => void;
  onAddToNonKeywords: () => void;
}

export const KeywordChip: React.FC<KeywordChipProps> = ({
  label,
  onDelete,
  onEdit,
  onAddToNonKeywords,
}) => {
  return (
    <div className="flex items-center gap-1 bg-gray-200 rounded-full px-2 py-1">
      <span className="text-sm">{label}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onEdit}
        aria-label="Edit keyword"
      >
        <Pencil className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onDelete}
        aria-label="Delete keyword"
      >
        <X className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onAddToNonKeywords}
        aria-label="Add to non-keywords"
      >
        <Ban className="h-3 w-3" />
      </Button>
    </div>
  );
};
