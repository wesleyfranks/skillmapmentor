import { FileX } from "lucide-react";

export const EmptyResumeState = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 h-[300px] border border-dashed border-gray-300 rounded-lg bg-gray-50 mt-6">
      <FileX className="w-12 h-12 text-gray-400" />
      <p className="text-lg font-semibold text-gray-500 uppercase tracking-wide">
        No Resume Available
      </p>
    </div>
  );
};