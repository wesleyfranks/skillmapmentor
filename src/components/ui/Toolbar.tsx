import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

export interface ToolbarAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline";
  isProcessing?: boolean;
  disabled?: boolean;
}

interface ToolbarProps {
  actions: ToolbarAction[];
}

export const Toolbar = ({ actions }: ToolbarProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 w-full h-[52px]">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant={action.variant || "outline"}
            onClick={action.onClick}
            disabled={action.disabled || action.isProcessing}
            className={`w-full flex items-center justify-center gap-2 ${
              action.variant === "destructive"
                ? "text-red-500 hover:text-white hover:bg-red-500 border-red-200 hover:border-red-500"
                : action.variant === "default"
                ? "bg-primary hover:bg-primary/90"
                : "bg-background hover:bg-accent"
            }`}
          >
            <Icon className={`h-4 w-4 ${action.isProcessing ? "animate-spin" : ""}`} />
            <span>{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};