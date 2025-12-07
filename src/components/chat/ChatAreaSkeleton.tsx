import React from "react";

export default function ChatAreaSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100 dark:bg-[#0C0C0C]">
      {/* assistant messages (left) */}
      <div className="max-w-xl">
        <div className="p-4 rounded-lg max-w-xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1F2937] animate-pulse h-6 w-3/4 mb-3" />
        <div className="p-4 rounded-lg max-w-xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1F2937] animate-pulse h-6 w-2/3 mb-6" />
      </div>

      {/* user messages (right) */}
      <div className="ml-auto max-w-xs sm:max-w-sm">
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-[#1E3A8A] text-blue-900 dark:text-blue-100 wrap-break-word animate-pulse h-6 w-40 mb-3" />
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-[#1E3A8A] text-blue-900 dark:text-blue-100 wrap-break-word animate-pulse h-6 w-56 mb-3" />
      </div>

      {/* mixed short messages to fill the area */}
      <div className="max-w-xl">
        <div className="p-4 rounded-lg max-w-xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1F2937] animate-pulse h-6 w-1/2 mb-3" />
        <div className="ml-auto max-w-xs sm:max-w-sm">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-[#1E3A8A] text-blue-900 dark:text-blue-100 wrap-break-word animate-pulse h-6 w-48 mb-3" />
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded w-3/4 animate-pulse"></div>
      </div>
    </div>
  );
}
