export default function Loading() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDEBAR SKELETON */}
      <div className="w-16 bg-white border-r flex items-start justify-center p-4">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* MAIN SKELETON */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-white p-4 border-b">
          {/* Left buttons */}
          <div className="flex items-center gap-3">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-36 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* CHAT AREA SKELETON */}
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div className="space-y-4 w-full max-w-sm">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* INPUT BAR SKELETON */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3 border gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
