// src/components/chat/messages/ProcessingLogButton.tsx
"use client";

import { FileClock, Loader2 } from "lucide-react";
import { useState } from "react";
import { getMessageAttchmentLog } from "@/lib/api/chat";
import ProcessingLogsModal from "@/components/chat/ProcessingLogsModal";
import type { ProcessingLogEntry } from "@/components/chat/ProcessingLogsModal";

interface ProcessingLogButtonProps {
  messageId: string;
  hasProcessingLog: boolean;
}

export function ProcessingLogButton({
  messageId,
  hasProcessingLog,
}: ProcessingLogButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<ProcessingLogEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!hasProcessingLog) return null;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const data = await getMessageAttchmentLog(messageId);
      setLogs(Array.isArray(data) ? data : []);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
        title="View document processing history"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileClock className="h-3.5 w-3.5" />
        )}
        <span>Details</span>
      </button>

      <ProcessingLogsModal
        isOpen={isModalOpen}
        logs={logs}
        filename="Document Processing Details"
        onClose={() => {
          setIsModalOpen(false);
          setLogs([]);
        }}
      />
    </>
  );
}
