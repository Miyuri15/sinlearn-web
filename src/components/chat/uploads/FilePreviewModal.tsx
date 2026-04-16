"use client";

import { useEffect } from "react";
import { X, Download, FileText, AlignLeft } from "lucide-react";
import { downloadResource } from "@/lib/api/resource";

interface FilePreviewModalProps {
  resourceId?: string;
  url: string;
  type: "image" | "video" | "audio" | "pdf" | "file";
  onClose: () => void;
  extractedText?: string;
}

export default function FilePreviewModal({
  resourceId,
  url,
  type,
  onClose,
  extractedText = "EXTRACTED TEXT (HARDCODED):\n\n1. Invoice Number: INV-2026-001\n2. Date: April 16, 2026\n3. Total Amount: $1,250.00\n4. Vendor: Tech Solutions Inc.\n\nNotes: This text was extracted using OCR. Please verify against the original document on the left.",
}: FilePreviewModalProps) {
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
      {/* Expanded Modal Container */}
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
          {/* Left Side: Original Media */}
          <div className="p-6 overflow-y-auto flex items-center justify-center bg-gray-50/50 dark:bg-zinc-900/30">
            {renderMedia()}
          </div>

          {/* Right Side: Extracted Text */}
          <div className="p-6 overflow-y-auto bg-white dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Extracted Text
              </span>
              <button
                className="text-xs text-blue-500 hover:underline"
                onClick={() => navigator.clipboard.writeText(extractedText)}
              >
                Copy Text
              </button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-zinc-300 leading-relaxed bg-transparent p-0 border-none">
                {extractedText}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
