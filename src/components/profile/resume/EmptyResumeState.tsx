import { FileX } from "lucide-react";

export const EmptyResumeState = () => {
  return (
    <>
      <FileX className="w-12 h-12 text-gray-400" />
      <p className="text-lg font-semibold text-gray-500 uppercase tracking-wide">
        No Resume Available
      </p>
    </>
  );
};