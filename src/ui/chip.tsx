import { X, Pencil, Ban, MoreVertical } from 'lucide-react';
import { Button } from '@/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

interface ChipProps {
  label: string;
  onDelete: () => void;
  onEdit: () => void;
  onAddToNonKeywords: () => void;
}

export const Chip = ({
  label,
  onDelete,
  onEdit,
  onAddToNonKeywords,
}: ChipProps) => (
  <div className="group flex items-center gap-1 bg-purple-600/10 text-purple-700 px-2 py-1 rounded-md text-sm">
    <span title={label.length > 20 ? label : undefined}>
      {label.length > 20 ? `${label.slice(0, 20)}...` : label}
    </span>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-2 p-0 shrink-0 inline-flex"
          aria-label="More actions"
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-max">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddToNonKeywords}>
          <Ban className="mr-2 h-4 w-4" />
          <span>Non-Keyword</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <X className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
