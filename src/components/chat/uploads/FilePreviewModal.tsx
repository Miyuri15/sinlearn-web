"use client";

import { useEffect } from "react";
import { X, Download, FileText } from "lucide-react";
import { downloadResource } from "@/lib/api/resource";

interface FilePreviewModalProps {
  resourceId?: string;
  url: string;
  type: "image" | "video" | "audio" | "pdf" | "file";
  onClose: () => void;
}

export default function FilePreviewModal({
  resourceId,
  url,
  type,
  onClose,
}: FilePreviewModalProps) {
  // Lock body scroll when modal is open
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

  const renderContent = () => {
    switch (type) {
      case "image":
        return (
          <img
            src={url}
            alt="Preview"
            className="max-w-full max-h-[85vh] object-contain rounded shadow-sm"
          />
        );
      case "video":
        return (
          <video
            controls
            className="max-w-full max-h-[85vh] rounded shadow-sm outline-none"
          >
            <source src={url} />
            Your browser does not support the video tag.
          </video>
        );
      case "audio":
        return (
          <div className="w-full max-w-md p-6 rounded-lg shadow-sm flex flex-col items-center gap-4 bg-gray-100 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="p-4 rounded-full bg-white dark:bg-zinc-800 shadow-sm">
              <FileText className="w-8 h-8 text-gray-400 dark:text-zinc-400" />
            </div>
            <audio controls className="w-full">
              <source src={url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case "pdf":
        return (
          <div className="w-full max-w-4xl h-[85vh] bg-gray-100 dark:bg-zinc-800 rounded shadow-sm">
            <iframe
              src={url}
              className="w-full h-full rounded"
              title="PDF Preview"
            />
          </div>
        );
      default:
        return (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <FileText className="w-12 h-12 text-gray-300 dark:text-zinc-600" />
            </div>
            <p className="mb-4 text-gray-600 dark:text-zinc-300">
              Preview not available for this file type.
            </p>
            <button
              onClick={handleDownload}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
            >
              Download to view
            </button>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 dark:bg-black/90 transition-colors duration-200"
      onClick={onClose}
    >
      {/* Wrapper to handle pointer events and centering */}
      <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
        {/* Toolbar */}
        <div className="absolute top-0 right-0 flex items-center gap-4 pointer-events-auto p-2">
          {resourceId && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
              title="Download"
            >
              <Download className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Content */}
        <div
          className="pointer-events-auto flex items-center justify-center w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
