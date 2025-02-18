// src/ui/Toolbar.tsx

import { Button } from './button';
import { LucideIcon } from 'lucide-react';
import { useRef } from 'react';

export interface ToolbarAction {
  label: string;
  icon: LucideIcon;
  onClick: (
    event?:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => void;
  variant?: 'default' | 'destructive' | 'outline';
  isProcessing?: boolean;
  disabled?: boolean;
  stretch?: boolean;
  iconClassName?: string;
  className?: string;
  tooltip?: string;
  'aria-label'?: string;
}

interface ToolbarProps {
  actions: ToolbarAction[];
}

export const Toolbar = ({ actions }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ADJUSTED: Force purple for 'default', red for 'destructive'
  const getButtonClasses = (action: ToolbarAction) => {
    if (action.variant === 'destructive') {
      return 'bg-red-600 hover:bg-red-700 text-white border-0';
    }
    if (action.variant === 'default') {
      // Purple background, white text
      return 'bg-purple-600 hover:bg-purple-700 text-white';
    }
    // Outline fallback
    return 'border border-purple-600 text-purple-600 hover:bg-purple-50';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadAction = actions.find((action) => action.label === 'Upload');
    if (uploadAction?.onClick) {
      uploadAction.onClick(e);
    } else {
      console.error('Upload action handler not defined.');
    }
  };

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
      <input
        title="Upload Resume"
        type="file"
        accept=".pdf, .docx, .doc, .pages, .txt"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />
      {actions.map((action, index) => {
        const Icon = action.icon;
        const handleClickWrapper: React.MouseEventHandler<HTMLButtonElement> = (
          e
        ) => {
          if (action.label === 'Upload' && fileInputRef.current) {
            // Trigger hidden file input
            fileInputRef.current.click();
          } else {
            action.onClick?.(e);
          }
        };

        return (
          <div
            key={index}
            className={`${action.stretch ? 'col-span-2' : ''}`}
            data-tooltip={action.tooltip}
          >
            <Button
              variant="outline" // We'll override with getButtonClasses
              onClick={handleClickWrapper as any}
              disabled={action.disabled || action.isProcessing}
              className={`
                w-full flex items-center justify-center gap-2 h-11 
                ${action.stretch ? 'col-span-2' : ''}
                ${getButtonClasses(action)} 
                ${action.className || ''}
              `}
            >
              <Icon
                className={`h-4 w-4 ${
                  action.isProcessing ? 'animate-spin' : ''
                } ${action.iconClassName || ''}`}
              />
              <span className="font-medium">{action.label}</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
};
