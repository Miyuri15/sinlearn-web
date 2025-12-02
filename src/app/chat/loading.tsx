export default function Loading() {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-[#0C0C0C]">
      {/* LEFT SIDEBAR SKELETON */}
      <div className="w-16 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#2a2a2a] flex items-start justify-center p-4">
        <div className="w-6 h-6 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
      </div>

      {/* MAIN SKELETON */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-white dark:bg-[#111111] p-4 border-b border-gray-200 dark:border-[#2a2a2a]">
          {/* Left buttons */}
          <div className="flex items-center gap-3">
            <div className="w-32 h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="w-36 h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg animate-pulse"></div>
            <div className="w-15 h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="w-9 h-9 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* CHAT AREA SKELETON */}
        <div className="flex-1 flex items-center justify-center text-center px-4 bg-gray-100 dark:bg-[#0C0C0C]">
          <div className="space-y-4 w-full max-w-sm">
            <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded w-3/4 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* INPUT BAR SKELETON */}
        <div className="p-4 border-t bg-white dark:bg-[#111111] border-gray-200 dark:border-[#2a2a2a]">
          <div className="flex items-center bg-gray-100 dark:bg-[#1A1A1A] rounded-xl px-4 py-3 border dark:border-[#2a2a2a] gap-3">
            <div className="w-5 h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="flex-1 h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="w-5 h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
