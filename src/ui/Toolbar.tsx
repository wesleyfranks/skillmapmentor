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
  stretch?: boolean; // Ensure the stretch property is used
  iconClassName?: string;
  className?: string;
  tooltip?: string; // Tooltip for accessibility
  'aria-label'?: string; // Aria-label for accessibility
}

interface ToolbarProps {
  actions: ToolbarAction[];
}

export const Toolbar = ({ actions }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getButtonClasses = (action: ToolbarAction) => {
    if (action.variant === 'destructive') {
      return 'bg-red-500 hover:bg-red-600 text-white border-0';
    }
    if (action.variant === 'default' && !action.className) {
      return 'bg-primary hover:bg-primary/90';
    }
    if (!action.className) {
      return 'bg-background hover:bg-accent border border-input';
    }
    return '';
  };

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const uploadAction = actions.find((action) => action.label === 'Upload');
      if (uploadAction?.onClick) {
        uploadAction.onClick(e as React.ChangeEvent<HTMLInputElement>);
      } else {
        console.error('Upload action handler not defined.');
      }
    } else if (e.target instanceof HTMLButtonElement) {
      const buttonAction = actions.find((action) => action.label !== 'Upload');
      if (buttonAction?.onClick) {
        buttonAction.onClick(e as React.MouseEvent<HTMLButtonElement>);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <input
        title="Upload Resume"
        type="file"
        accept=".pdf, .docx, .doc, .pages, .txt"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const uploadAction = actions.find(
            (action) => action.label === 'Upload'
          );
          if (uploadAction?.onClick) {
            uploadAction.onClick(e);
          } else {
            console.error('Upload action handler not defined.');
          }
        }}
        aria-hidden="true"
      />
      {actions.map((action, index) => {
        const Icon = action.icon;
        const handleClickWrapper: React.MouseEventHandler<HTMLButtonElement> = (
          e
        ) => {
          if (action.label === 'Upload' && fileInputRef.current) {
            fileInputRef.current.click();
          } else {
            action.onClick?.(e);
          }
        };

        return (
          <div
            key={index}
            className={`tooltip-wrapper ${action.stretch ? 'col-span-2' : ''}`}
            data-tooltip={action.tooltip}
          >
            <Button
              variant={action.variant || 'outline'}
              onClick={handleClickWrapper as any}
              disabled={action.disabled || action.isProcessing}
              className={`w-full flex items-center justify-center gap-2 h-11 ${
                action.stretch ? 'col-span-2' : ''
              } ${getButtonClasses(action)} ${action.className || ''}`}
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
