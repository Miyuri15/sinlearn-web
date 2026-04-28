// SessionResourcesModal.tsx (updated)
"use client";

import { X, FileText, Eye, Activity } from "lucide-react";
import { formatBytes } from "@/lib/utils/format";
import { useTranslation } from "react-i18next";
import { ReactNode, useState } from "react";
import { viewResource } from "@/lib/api/resource";
import { getApiErrorMessage } from "@/lib/api/client";
import { getMessageAttchmentLog } from "@/lib/api/chat";
import FilePreviewModal from "@/components/chat/uploads/FilePreviewModal";
import ProcessingLogsModal, { ProcessingLogEntry } from "./ProcessingLogsModal";
import { formatDistanceToNow } from "date-fns";

export type SessionResourceItem = {
  id: string;
  original_filename?: string;
  mime_type?: string;
  size_bytes?: number;
  source_type?: string;
  language?: string;
  created_at?: string;
  has_processing_log?: boolean;
  message_id?: string;
};

interface SessionResourcesModalProps {
  isOpen: boolean;
  isLoading: boolean;
  resources: SessionResourceItem[];
  errorMessage?: string | null;
  onClose: () => void;
  onRetry: () => void;
}

export default function SessionResourcesModal({
  isOpen,
  isLoading,
  resources,
  errorMessage,
  onClose,
  onRetry,
}: Readonly<SessionResourcesModalProps>) {
  const { t } = useTranslation("chat");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<
    "image" | "video" | "audio" | "pdf" | "file"
  >("file");
  const [previewResourceId, setPreviewResourceId] = useState<
    string | undefined
  >(undefined);
  const [openingResourceId, setOpeningResourceId] = useState<string | null>(
    null,
  );
  const [previewErrorById, setPreviewErrorById] = useState<
    Record<string, string>
  >({});

  // Processing logs state
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<ProcessingLogEntry[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string>("");
  const [loadingLogsId, setLoadingLogsId] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolvePreviewType = (resource: SessionResourceItem) => {
    const mime = (resource.mime_type || "").toLowerCase();
    if (mime.startsWith("image/")) return "image" as const;
    if (mime.startsWith("video/")) return "video" as const;
    if (mime.startsWith("audio/")) return "audio" as const;
    if (mime === "application/pdf") return "pdf" as const;

    const fileName = (resource.original_filename || "").toLowerCase();
    if (fileName.endsWith(".pdf")) return "pdf" as const;
    if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(fileName))
      return "image" as const;
    if (/\.(mp4|webm|mov|avi|mkv)$/.test(fileName)) return "video" as const;
    if (/\.(mp3|wav|ogg|m4a|aac)$/.test(fileName)) return "audio" as const;
    return "file" as const;
  };

  const handleOpenPreview = async (resource: SessionResourceItem) => {
    try {
      setOpeningResourceId(resource.id);
      const blob = await viewResource(resource.id);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewType(resolvePreviewType(resource));
      setPreviewResourceId(resource.id);
      setPreviewErrorById((prev) => {
        const next = { ...prev };
        delete next[resource.id];
        return next;
      });
    } catch (error) {
      console.error("Failed to preview resource", error);
      setPreviewErrorById((prev) => ({
        ...prev,
        [resource.id]: getApiErrorMessage(
          error,
          t("attachment_preview_unavailable"),
          t("attachment_preview_unavailable_offline"),
        ),
      }));
    } finally {
      setOpeningResourceId(null);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewResourceId(undefined);
  };

  const handleViewProcessingLogs = async (resource: SessionResourceItem) => {
    if (!resource.message_id) {
      console.error("No message_id associated with this resource");
      return;
    }

    setLoadingLogsId(resource.id);
    try {
      const logs = await getMessageAttchmentLog(resource.message_id);
      setSelectedLogs(Array.isArray(logs) ? logs : []);
      setSelectedFilename(resource.original_filename || "Unknown file");
      setLogsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch processing logs", error);
    } finally {
      setLoadingLogsId(null);
    }
  };

  let content: ReactNode;
  if (isLoading) {
    content = (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        <span>{t("session_resources_loading")}</span>
      </div>
    );
  } else if (errorMessage) {
    content = (
      <div className="space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        <button
          onClick={onRetry}
          className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          {t("evaluation_results_retry")}
        </button>
      </div>
    );
  } else if (resources.length === 0) {
    content = (
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {t("session_resources_empty")}
      </p>
    );
  } else {
    content = (
      <ul className="space-y-3">
        {resources.map((resource) => {
          const fileName = resource.original_filename || resource.id;
          const createdDate = resource.created_at
            ? new Date(resource.created_at)
            : null;
          const createdAt =
            createdDate && !Number.isNaN(createdDate.getTime())
              ? formatDistanceToNow(createdDate, { addSuffix: true })
              : "-";
          const sizeLabel = formatBytes(resource.size_bytes);
          const hasProcessingLogs = resource.has_processing_log;

          return (
            <li
              key={resource.id}
              className="rounded-lg border border-gray-200 p-3 dark:border-[#2a2a2a]"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void handleOpenPreview(resource);
                  }}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {fileName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {resource.mime_type || "-"}
                    {sizeLabel ? ` • ${sizeLabel}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("session_resources_uploaded")} {createdAt}
                  </p>
                  {openingResourceId === resource.id && (
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                      {t("session_resources_loading")}
                    </p>
                  )}
                  {previewErrorById[resource.id] && (
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                      {previewErrorById[resource.id]}
                    </p>
                  )}
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  {hasProcessingLogs && (
                    <button
                      type="button"
                      onClick={() => handleViewProcessingLogs(resource)}
                      disabled={loadingLogsId === resource.id}
                      className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-[#1e1e1e] dark:hover:text-blue-400"
                      title="View processing logs"
                    >
                      {loadingLogsId === resource.id ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
          <dialog
            open
            aria-labelledby="session-resources-title"
            className="relative w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-0 shadow-lg dark:border-[#2a2a2a] dark:bg-[#111111] pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-[#2a2a2a]">
              <h2
                id="session-resources-title"
                className="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                {t("session_resources_title")}
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-[#1e1e1e] dark:hover:text-gray-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              {content}
            </div>

            <div className="flex justify-end border-t border-gray-200 px-5 py-4 dark:border-[#2a2a2a]">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-[#3a3a3a] dark:text-gray-200 dark:hover:bg-[#1c1c1c]"
              >
                {t("cancel")}
              </button>
            </div>
          </dialog>
        </div>

        {previewUrl && (
          <FilePreviewModal
            resourceId={previewResourceId}
            url={previewUrl}
            type={previewType}
            onClose={handleClosePreview}
          />
        )}
      </div>

      <ProcessingLogsModal
        isOpen={logsModalOpen}
        logs={selectedLogs}
        filename={selectedFilename}
        onClose={() => setLogsModalOpen(false)}
      />
    </>
  );
}
