import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  children?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, message, children }: EmptyStateProps) => {
  return (
    <div className="h-[300px] border border-dashed border-muted rounded-lg bg-muted/50 flex flex-col items-center justify-center space-y-4 mt-6">
      <Icon className="w-12 h-12 text-muted-foreground" />
      <p className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
        {message}
      </p>
      {children}
    </div>
  );
};