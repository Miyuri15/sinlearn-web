"use client";

import { useEffect, useState } from "react";
import {
  X,
  Download,
  FileText,
  AlignLeft,
  Loader2,
  Copy,
  RefreshCw,
} from "lucide-react";
import { downloadResource } from "@/lib/api/resource";

interface FilePreviewModalProps {
  resourceId?: string;
  url: string;
  type: "image" | "video" | "audio" | "pdf" | "file";
  onClose: () => void;
  extractedText?: string;
  isExtracting?: boolean;
}

export default function FilePreviewModal({
  resourceId,
  url,
  type,
  onClose,
  isExtracting: initialLoading = false,
  extractedText = "EXTRACTED TEXT (HARDCODED):\n\n1. Invoice Number: INV-2026-001\n2. Date: April 16, 2026\n3. Total Amount: $1,250.00\n4. Vendor: Tech Solutions Inc.",
}: FilePreviewModalProps) {
  // Use internal state so we can manually toggle the loading view for testing
  const [loading, setLoading] = useState(initialLoading);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resourceId) return;
    try {
      await downloadResource(resourceId);
    } catch (err) {
      console.error("Failed to download:", err);
    }
  };

  const renderMedia = () => {
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
            src={url}
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-colors duration-200"
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
            {/* TEST LOADING BUTTON */}
            <button
              onClick={() => setLoading(!loading)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800 transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Stop Loading" : "Test Loading State"}
            </button>

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
                disabled={loading || !extractedText}
                className="flex items-center gap-1 text-xs text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                onClick={() => navigator.clipboard.writeText(extractedText)}
              >
                <Copy className="w-3 h-3" />
                Copy Text
              </button>
            </div>

            <div className="prose dark:prose-invert max-w-none flex-1">
              {loading ? (
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
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-zinc-300 leading-relaxed bg-transparent p-0 border-none">
                  {extractedText}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
