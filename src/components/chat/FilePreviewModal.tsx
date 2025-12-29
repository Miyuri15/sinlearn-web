"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatBytes } from "@/lib/utils/format";
import type { FileMeta } from "@/lib/models/chat";

interface FilePreviewModalProps {
  file: File | FileMeta;
  onClose: () => void;
}

export default function FilePreviewModal({
  file,
  onClose,
}: Readonly<FilePreviewModalProps>) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  // Build + clean blob URL properly
  useEffect(() => {
    if (file instanceof File) {
      const objUrl = URL.createObjectURL(file);
      setPreviewUrl(objUrl);

      return () => URL.revokeObjectURL(objUrl);
    }

    if ("url" in file && file.url) {
      setPreviewUrl(file.url);
    }
  }, [file]);

  // Close on ESC key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const name =
    file instanceof File
      ? file.name
      : file.name || file.url?.split("/").pop() || "file";

  const ext = name.split(".").pop()?.toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext ?? "");
  const isAudio = ["mp3", "wav", "aac", "ogg"].includes(ext ?? "");
  const isVideo = ["mp4", "mov", "webm"].includes(ext ?? "");
  const isPDF = ext === "pdf";
  const sizeLabel = file instanceof File ? formatBytes(file.size) : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full p-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-black/40 text-white p-2 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="bg-white dark:bg-[#111] rounded-lg p-4 max-h-[100vh] overflow-auto shadow-xl w-full text-center">
          <h3 className="font-semibold mb-1 truncate">
            {name}
            {sizeLabel && (
              <span className="ml-2 text-sm text-gray-500">({sizeLabel})</span>
            )}
          </h3>

          {isImage && previewUrl && (
            <img
              src={previewUrl}
              className="max-h-[70vh] mx-auto object-contain mt-4"
            />
          )}

          {isVideo && previewUrl && (
            <video
              controls
              src={previewUrl}
              className="max-h-[70vh] mx-auto mt-4 rounded"
            />
          )}

          {isAudio && previewUrl && (
            <audio controls src={previewUrl} className="w-full mt-4" />
          )}

          {isPDF && previewUrl && (
            <iframe src={previewUrl} className="w-full h-[70vh] rounded mt-4" />
          )}
        </div>
      </div>
    </div>
  );
}
