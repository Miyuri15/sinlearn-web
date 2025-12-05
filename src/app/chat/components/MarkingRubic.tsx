"use client";

import { ChevronDown, Upload } from "lucide-react";
import CloseIcon from '@mui/icons-material/Close';

type MarkingRubicProps = Readonly<{
  loading?: boolean;
  onClose?: () => void;
  onSelectRubric?: (rubricId: string) => void;
  onUpload?: () => void;
}>;

export default function MarkingRubic({
  loading = false,
  onClose,
  onSelectRubric,
  onUpload,
}: MarkingRubicProps) {
  if (loading) {
    return (
      <div className="h-full w-[400px] bg-white dark:bg-[#111111] border-l dark:border-[#2a2a2a] p-6">
        <div className="w-32 h-6 bg-gray-200 mb-6 rounded animate-pulse"></div>

        <div className="space-y-3">
          <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-full h-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-[400px] bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-[#2a2a2a] flex flex-col">
        <div className="p-6 overflow-y-scroll hidden-scrollbar flex-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Select Rubric</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer">
                <CloseIcon />
                </button>
            </div>

            {/* Dropdown */}
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">Choose a Rubric</p>
            <span className="text-sm text-gray-400 mb-2 block">Standard Rubrics</span>

            <button
                onClick={() => onSelectRubric?.("default")}
                className="w-full py-2 px-4 bg-gray-100 dark:bg-[#1a1a1a] border dark:border-gray-700 rounded-lg flex justify-between items-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#222] transition"
            >
                Select a rubric
                <ChevronDown className="w-4 h-4" />
            </button>

            {/* Upload Section */}
            <div className="mt-8">
                <p className="text-gray-600 dark:text-gray-400 font-medium">or upload a custom Rubric</p>
                <p className="text-sm text-gray-400">PDF, DOCX, or Excel</p>

                <div
                onClick={onUpload}
                className="mt-4 border border-dashed rounded-lg p-6 text-center bg-gray-50 dark:bg-[#1a1a1a] dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222] transition"
                >
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Upload</span>
                </div>
            </div>
        </div>
    </div>
  );
}