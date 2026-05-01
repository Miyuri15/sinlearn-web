"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  FileText,
  AlignLeft,
  Loader2,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  downloadResource,
  getResourceExtractedText,
} from "@/lib/api/resource";
import { getApiErrorMessage } from "@/lib/api/client";

interface FilePreviewModalProps {
  resourceId?: string;
  url: string;
  type: "image" | "video" | "audio" | "pdf" | "file";
  onClose: () => void;
  extractedText?: string;
  isExtracting?: boolean;
  extractedTextError?: string | null;
  extractedTextPage?: number;
  extractedTextPageSize?: number;
  extractedTextTotalPages?: number;
  extractedTextReturnedPages?: number;
  extractedTextHasNext?: boolean;
  extractedTextHasPrevious?: boolean;
  previewError?: string | null;
}

export default function FilePreviewModal({
  resourceId,
  url,
  type,
  onClose,
  previewError,
  isExtracting = false,
  extractedText = "",
  extractedTextError,
  extractedTextPage = 1,
  extractedTextPageSize = 1,
  extractedTextTotalPages = 0,
  extractedTextReturnedPages = 0,
  extractedTextHasNext = false,
  extractedTextHasPrevious = false,
}: FilePreviewModalProps) {
  const [currentExtractedText, setCurrentExtractedText] =
    useState(extractedText);
  const [currentExtractedTextError, setCurrentExtractedTextError] = useState<
    string | null
  >(extractedTextError ?? null);
  const [currentPage, setCurrentPage] = useState(extractedTextPage);
  const [pageSize, setPageSize] = useState(extractedTextPageSize);
  const [totalPages, setTotalPages] = useState(extractedTextTotalPages);
  const [returnedPages, setReturnedPages] = useState(
    extractedTextReturnedPages,
  );
  const [hasNext, setHasNext] = useState(extractedTextHasNext);
  const [hasPrevious, setHasPrevious] = useState(extractedTextHasPrevious);
  const [isLoadingExtractedPage, setIsLoadingExtractedPage] =
    useState(isExtracting);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    setCurrentExtractedText(extractedText);
    setCurrentExtractedTextError(extractedTextError ?? null);
    setCurrentPage(extractedTextPage);
    setPageSize(extractedTextPageSize);
    setTotalPages(extractedTextTotalPages);
    setReturnedPages(extractedTextReturnedPages);
    setHasNext(extractedTextHasNext);
    setHasPrevious(extractedTextHasPrevious);
    setIsLoadingExtractedPage(isExtracting);
  }, [
    extractedText,
    extractedTextError,
    extractedTextPage,
    extractedTextPageSize,
    extractedTextTotalPages,
    extractedTextReturnedPages,
    extractedTextHasNext,
    extractedTextHasPrevious,
    isExtracting,
  ]);

  const pdfUrl = useMemo(() => {
    if (type !== "pdf" || !url) return url;
    return `${url}#page=${currentPage || 1}`;
  }, [currentPage, type, url]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resourceId) return;
    try {
      await downloadResource(resourceId);
    } catch (err) {
      console.error("Failed to download:", err);
    }
  };

  const loadExtractedTextPage = async (nextPage: number) => {
    if (!resourceId || nextPage < 1 || isLoadingExtractedPage) return;

    setIsLoadingExtractedPage(true);
    setCurrentExtractedTextError(null);

    try {
      const response = await getResourceExtractedText(resourceId, {
        page: nextPage,
        pageSize: pageSize || 1,
      });
      setCurrentExtractedText(response.extracted_text || "");
      setCurrentPage(response.page || nextPage);
      setPageSize(response.page_size || pageSize || 1);
      setTotalPages(response.total_pages || 0);
      setReturnedPages(response.returned_pages || 0);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
    } catch (error) {
      console.error("Failed to load extracted text page:", error);
      setCurrentExtractedText("");
      setCurrentExtractedTextError(
        getApiErrorMessage(error, "Failed to load extracted text."),
      );
    } finally {
      setIsLoadingExtractedPage(false);
    }
  };

  const renderMedia = () => {
    if (previewError || !url) {
      return (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 rounded px-6 text-center">
          <FileText className="w-12 h-12 mb-3" />
          <p className="text-sm font-medium">
            {previewError || "Preview unavailable"}
          </p>
        </div>
      );
    }

    switch (type) {
      case "image":
        return (
          <img
            src={url}
            alt="Original"
            className="max-w-full max-h-[70vh] object-contain rounded"
          />
        );
      case "pdf":
        return (
          <iframe
            src={pdfUrl}
            className="w-full h-[70vh] rounded border border-gray-200 dark:border-zinc-800"
            title="PDF Preview"
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[40vh] bg-gray-50 dark:bg-zinc-900 rounded">
            <FileText className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Standard preview for {type}</p>
          </div>
        );
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-colors duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-white dark:bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-800 dark:text-zinc-100">
              Comparison View
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {resourceId && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-100 dark:divide-zinc-800 overflow-hidden">
          <div className="p-6 overflow-y-auto flex items-center justify-center bg-gray-50/50 dark:bg-zinc-900/30">
            {renderMedia()}
          </div>

          <div className="p-6 overflow-y-auto bg-white dark:bg-zinc-950 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Extracted Text
              </span>

              <button
                disabled={isLoadingExtractedPage || !currentExtractedText}
                className="flex items-center gap-1 text-xs text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                onClick={() =>
                  navigator.clipboard.writeText(currentExtractedText)
                }
              >
                <Copy className="w-3 h-3" />
                Copy Text
              </button>
            </div>

            {(totalPages > 1 || hasNext || hasPrevious) && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
                <button
                  type="button"
                  disabled={!hasPrevious || isLoadingExtractedPage}
                  onClick={() => void loadExtractedTextPage(currentPage - 1)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                  Page {currentPage}
                  {totalPages > 0 ? ` of ${totalPages}` : ""}
                  {returnedPages > 1 ? ` (${returnedPages} pages)` : ""}
                </span>

                <button
                  type="button"
                  disabled={!hasNext || isLoadingExtractedPage}
                  onClick={() => void loadExtractedTextPage(currentPage + 1)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none flex-1">
              {isLoadingExtractedPage ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 blur-sm bg-blue-500/20 rounded-full animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                      Processing Document
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Extracting text using OCR...
                    </p>
                  </div>
                </div>
              ) : currentExtractedTextError ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-lg border border-amber-200 bg-amber-50 px-6 text-center text-amber-800 dark:border-amber-900/70 dark:bg-amber-900/20 dark:text-amber-200">
                  <FileText className="mb-3 h-10 w-10" />
                  <p className="text-sm font-medium">
                    {currentExtractedTextError}
                  </p>
                </div>
              ) : currentExtractedText ? (
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-zinc-300 leading-relaxed bg-transparent p-0 border-none">
                  {currentExtractedText}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-lg border border-gray-200 bg-gray-50 px-6 text-center text-gray-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                  <FileText className="mb-3 h-10 w-10 text-gray-400" />
                  <p className="text-sm font-medium">
                    No extracted text is available for this resource.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
