import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

export interface ToolbarAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline";
  isProcessing?: boolean;
  disabled?: boolean;
  stretch?: boolean;
}

interface ToolbarProps {
  actions: ToolbarAction[];
}

export const Toolbar = ({ actions }: ToolbarProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant={action.variant || "outline"}
            onClick={action.onClick}
            disabled={action.disabled || action.isProcessing}
            className={`w-full flex items-center justify-center gap-2 h-11 ${
              action.stretch ? "col-span-2" : ""
            } ${
              action.variant === "destructive"
                ? "bg-red-500 hover:bg-red-600 text-white border-0"
                : action.variant === "default"
                ? "bg-primary hover:bg-primary/90"
                : "bg-background hover:bg-accent border border-input"
            }`}
          >
            <Icon className={`h-4 w-4 ${action.isProcessing ? "animate-spin" : ""}`} />
            <span className="font-medium">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};