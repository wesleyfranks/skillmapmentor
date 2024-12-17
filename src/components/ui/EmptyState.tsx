import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  children?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, message, children }: EmptyStateProps) => {
  return (
    <div className="h-[400px] border border-dashed border-slate-200 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center space-y-4 mt-8">
      <Icon className="w-16 h-16 text-slate-400" />
      <p className="text-xl font-semibold text-slate-600 tracking-wide">
        {message}
      </p>
      {children}
    </div>
  );
};