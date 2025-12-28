export default function Loading() {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-[#0C0C0C]">
      {/* LEFT SIDEBAR — Desktop only */}
      <div className="hidden md:flex w-16 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#2a2a2a] items-start justify-center p-4">
        <div className="w-6 h-6 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR — Shared but responsive */}
        <div className="flex items-center justify-between bg-white dark:bg-[#111111] p-3 md:p-4 border-b border-gray-200 dark:border-[#2a2a2a]">
          {/* LEFT BUTTONS */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-24 md:w-32 h-9 md:h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="w-28 md:w-36 h-9 md:h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse hidden sm:block"></div>
          </div>

          {/* RIGHT BUTTONS */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-9 md:w-10 h-9 md:h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg animate-pulse"></div>
            <div className="hidden md:block w-10 h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg animate-pulse"></div>
            <div className="w-16 md:w-20 h-9 md:h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="hidden md:block w-20 h-10 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="w-8 md:w-9 h-8 md:h-9 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex items-center justify-center text-center px-3 md:px-4 bg-gray-100 dark:bg-[#0C0C0C]">
          <div className="space-y-3 md:space-y-4 w-full max-w-xs sm:max-w-sm">
            <div className="h-7 md:h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded w-5/6 md:w-3/4 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-2/3 md:w-1/2 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="p-3 md:p-4 border-t bg-white dark:bg-[#111111] border-gray-200 dark:border-[#2a2a2a]">
          <div className="flex items-center bg-gray-100 dark:bg-[#1A1A1A] rounded-xl px-3 md:px-4 py-2.5 md:py-3 border dark:border-[#2a2a2a] gap-2 md:gap-3">
            <div className="w-5 h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="flex-1 h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="hidden sm:block w-5 h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
