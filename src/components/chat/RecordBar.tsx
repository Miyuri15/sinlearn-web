type RecordBarProps = Readonly<{
  onCancelRecording?: () => void;
  onStopRecording?: () => void;
}>;

export default function RecordBar({
  onCancelRecording,
  onStopRecording,
}: RecordBarProps) {
  return (
    <div className="flex justify-center px-2 sm:px-4 pb-2">
      <div className="w-full max-w-xl bg-red-50 border border-red-100 text-red-600 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 sm:gap-4 animate-slide-up">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium text-sm sm:text-base">Recording</span>
        </div>

        {/* Waveform */}
        <div className="hidden sm:flex items-end gap-1 h-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full animate-wave"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-5 text-xs sm:text-sm">
          {/* Cancel */}
          <button
            onClick={() => onCancelRecording?.()}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 whitespace-nowrap"
          >
            ✕ Cancel
          </button>

          {/* Stop */}
          <button
            onClick={() => onStopRecording?.()}
            className="text-red-600 font-medium hover:text-red-700 whitespace-nowrap"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
