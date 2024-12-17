import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  children?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, message, children }: EmptyStateProps) => {
  return (
    <div className="h-[300px] border border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center space-y-4">
      <Icon className="w-12 h-12 text-gray-400" />
      <p className="text-lg font-semibold text-gray-500 uppercase tracking-wide">
        {message}
      </p>
      {children}
    </div>
  );
};