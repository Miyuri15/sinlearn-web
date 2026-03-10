// components/chat/ProcessingLogsModal.tsx
"use client";

import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Timer,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";

export type ProcessingLogEntry = {
  id: string;
  resource_id: string;
  user_id: string;
  session_id: string;
  message_id: string;
  stage: string;
  progress: number;
  details: Record<string, any> | null;
  timestamp: string;
};

interface ProcessingLogsModalProps {
  isOpen: boolean;
  logs: ProcessingLogEntry[];
  filename: string;
  onClose: () => void;
}

export default function ProcessingLogsModal({
  isOpen,
  logs,
  filename,
  onClose,
}: Readonly<ProcessingLogsModalProps>) {
  const { t } = useTranslation("chat");

  if (!isOpen) return null;

  // Sort logs by timestamp
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  // Get the first and last log timestamps
  const firstLogTimestamp =
    sortedLogs.length > 0 ? new Date(sortedLogs[0].timestamp).getTime() : null;

  const lastLogTimestamp =
    sortedLogs.length > 0
      ? new Date(sortedLogs[sortedLogs.length - 1].timestamp).getTime()
      : null;

  // Calculate total processing time
  const formatTotalTime = () => {
    if (!firstLogTimestamp || !lastLogTimestamp) return "0s";

    const totalSeconds = Math.round(
      (lastLogTimestamp - firstLogTimestamp) / 1000,
    );

    if (totalSeconds < 60) return `${totalSeconds}s`;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (seconds === 0) return `${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  // Calculate time difference from previous step
  const getTimeFromPreviousStep = (index: number) => {
    if (index === 0) return "0s";

    const currentTime = new Date(sortedLogs[index].timestamp).getTime();
    const previousTime = new Date(sortedLogs[index - 1].timestamp).getTime();
    const diffInSeconds = Math.round((currentTime - previousTime) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;

    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;

    if (seconds === 0) return `${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  // Format timestamp to show actual time (HH:MM:SS)
  const formatActualTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;

      // Format as HH:MM:SS
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return timestamp;
    }
  };

  const getStageIcon = (stage: string) => {
    if (stage.includes("Completed") || stage === "Processing Completed") {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (stage.includes("Error") || stage.includes("Failed")) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  const formatDetails = (details: Record<string, any> | null) => {
    if (!details) return null;

    return (
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#1A1A1A] p-2 rounded-md">
        {Object.entries(details).map(([key, value]) => {
          // Truncate preview text if too long
          if (key === "preview" && typeof value === "string") {
            return (
              <div key={key} className="mb-1">
                <span className="font-medium">{key}:</span>{" "}
                <span className="italic">
                  {value.length > 100 ? `${value.substring(0, 100)}...` : value}
                </span>
              </div>
            );
          }
          return (
            <div key={key} className="mb-1">
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <dialog
          open
          aria-labelledby="processing-logs-title"
          className="relative w-full max-w-3xl max-h-[80vh] rounded-xl border border-gray-200 bg-white p-0 shadow-lg dark:border-[#2a2a2a] dark:bg-[#111111] pointer-events-auto flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-[#2a2a2a]">
            <h2
              id="processing-logs-title"
              className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"
            >
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="truncate max-w-md">{filename}</span>
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-[#1e1e1e] dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Total Time Banner */}
          {sortedLogs.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Timer className="h-4 w-4" />
                  <span className="font-medium">Total Processing Time:</span>
                </div>
                <span className="text-sm font-mono font-semibold text-blue-700 dark:text-blue-300">
                  {formatTotalTime()}
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-3">
              {sortedLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="relative flex gap-3 pb-3 border-l-2 border-gray-200 dark:border-[#2a2a2a] pl-4 last:border-l-2 last:pb-0"
                >
                  <div className="absolute -left-2 mt-1.5">
                    {getStageIcon(log.stage)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {log.stage}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {/* Show time from previous step */}
                        <span className="font-mono min-w-[70px] text-right">
                          {getTimeFromPreviousStep(index)}
                        </span>
                        <span className="min-w-[40px] text-right">
                          {log.progress % 1 === 0
                            ? log.progress
                            : log.progress.toFixed(2)}
                          %
                        </span>
                        <span className="hidden sm:inline-block min-w-[100px] text-right">
                          {formatActualTime(log.timestamp)}
                        </span>
                      </div>
                    </div>
                    {log.details && formatDetails(log.details)}

                    {/* Show page progress in a more visual way if available */}
                    {log.details?.current_page && log.details?.total_pages && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${(log.details.current_page / log.details.total_pages) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Page {log.details.current_page} of{" "}
                          {log.details.total_pages}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {sortedLogs.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No processing logs available
              </p>
            )}
          </div>

          <div className="flex justify-end border-t border-gray-200 px-5 py-4 dark:border-[#2a2a2a]">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-[#3a3a3a] dark:text-gray-200 dark:hover:bg-[#1c1c1c]"
            >
              {t("close", "Close")}
            </button>
          </div>
        </dialog>
      </div>
    </div>
  );
}
