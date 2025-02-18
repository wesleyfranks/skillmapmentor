// src/components/profile/keywords/KeywordsList.tsx

import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { X, Pencil, Ban, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import React from 'react';
import { Chip } from '@/ui/chip'; // Ensure Chip component is imported

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

export const KeywordsList = React.memo(
  ({
    keywords,
    editingKeyword,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onEditingChange,
    onAddToNonKeywords = () => {},
  }: KeywordsListProps) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onSave();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };

    const handleDelete = (index: number) => {
      onDelete(index);
      toast.success(`Removed "${keywords[index]}" from keywords list`);
    };

    return (
      <ul
        className="flex flex-wrap gap-2"
        role="list"
        aria-label="Keywords List"
      >
        {keywords.map((keyword, index) => (
          <li key={index} role="listitem">
            {editingKeyword?.index === index ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editingKeyword.value}
                  onChange={(e) => onEditingChange(index, e.target.value)}
                  onBlur={onSave}
                  onKeyDown={handleKeyDown}
                  className="h-6 w-32 text-sm"
                  aria-label={`Editing keyword ${index + 1}`}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={onCancel}
                  aria-label="Cancel editing"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Chip
                label={keyword}
                onDelete={() => handleDelete(index)}
                onEdit={() => onEdit(index, keyword)}
                onAddToNonKeywords={() => onAddToNonKeywords(keyword)}
              />
            )}
          </li>
        ))}
      </ul>
    );
  }
);
