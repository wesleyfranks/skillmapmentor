import { Button } from "./button";
import { LucideIcon } from "lucide-react";
import { useRef } from 'react';

export interface ToolbarAction {
  label: string;
  icon: LucideIcon;
  onClick: (event?: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: "default" | "destructive" | "outline";
  isProcessing?: boolean;
  disabled?: boolean;
  stretch?: boolean;
  iconClassName?: string;
  className?: string;
}

interface ToolbarProps {
  actions: ToolbarAction[];
}

export const Toolbar = ({ actions }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <input
        title="Upload Resume"
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const uploadAction = actions.find(action => action.label === 'Upload');
          if (uploadAction) {
            uploadAction.onClick(e);
          }
        }}
      />
      {actions.map((action, index) => {
        const Icon = action.icon;
        const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
          if (action.label === 'Upload' && fileInputRef.current) {
            fileInputRef.current.click();
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            action.onClick(e);
          }
        };

        return (
          <Button
            key={index}
            variant={action.variant || "outline"}
            onClick={handleClick as any}
            disabled={action.disabled || action.isProcessing}
            className={`w-full flex items-center justify-center gap-2 h-11 ${
              action.stretch ? "col-span-2" : ""
            } ${
              action.variant === "destructive"
                ? "bg-red-500 hover:bg-red-600 text-white border-0"
                : action.variant === "default" && !action.className
                ? "bg-primary hover:bg-primary/90"
                : !action.className
                ? "bg-background hover:bg-accent border border-input"
                : ""
            } ${action.className || ""}`}
          >
            <Icon 
              className={`h-4 w-4 ${action.isProcessing ? "animate-spin" : ""} ${action.iconClassName || ""}`}
            />
            <span className="font-medium">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
