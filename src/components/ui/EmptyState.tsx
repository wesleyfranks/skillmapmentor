import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  children?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, message, children }: EmptyStateProps) => {
  return (
    <div className="bg-muted/50 rounded-lg p-4 min-h-[100px] max-h-[500px] overflow-y-auto mt-6">
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Icon className="w-16 h-16 text-slate-400" />
        <p className="text-xl font-semibold text-slate-600 tracking-wide">
          {message}
        </p>
        {children}
      </div>
    </div>
  );
};