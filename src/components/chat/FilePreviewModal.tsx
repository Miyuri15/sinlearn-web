"use client";

import { X } from "lucide-react";
import { useEffect, useMemo } from "react";

export default function FilePreviewModal({
  file,
  onClose,
}: {
  file: File | import("@/lib/models/chat").FileMeta;
  onClose: () => void;
}) {
  // normalize name & size
  let name: string;
  if (file instanceof File) name = file.name;
  else if (file.name) name = file.name;
  else if ("url" in file && file.url)
    name = file.url.split("/").pop() || "file";
  else name = "file";
  const ext = name.split(".").pop()?.toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext!);
  const isAudio = ["mp3", "wav", "aac", "ogg"].includes(ext!);
  const isVideo = ["mp4", "mov", "webm"].includes(ext!);
  const isPDF = ext === "pdf";

  const url = useMemo(() => {
    if (file instanceof File) return URL.createObjectURL(file);
    if ("url" in file && file.url) return file.url;
    return undefined;
  }, [file]);

  useEffect(() => {
    return () => {
      if (file instanceof File && url) URL.revokeObjectURL(url);
    };
  }, [url, file]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    globalThis.addEventListener("keydown", handleEsc);
    return () => globalThis.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full p-4 flex flex-col items-center animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-black dark:text-white 
                     bg-white/70 dark:bg-black/40 backdrop-blur-md 
                     p-2 rounded-full hover:bg-white/90 dark:hover:bg-black/60 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* CONTENT */}
        <div className="bg-white dark:bg-[#111] rounded-lg p-4 max-h-[100vh] overflow-auto shadow-xl w-full text-center">
          <h3 className="text-lg font-semibold mb-1 truncate">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {file instanceof File
              ? (file.size / 1024).toFixed(1)
              : "size" in file && file.size
              ? (file.size / 1024).toFixed(1)
              : ""}{" "}
            KB
          </p>

          {isImage && (
            <img
              src={url}
              alt="preview"
              className="max-h-[70vh] w-auto mx-auto object-contain mt-4"
            />
          )}

          {isVideo && (
            <video
              controls
              src={url}
              className="max-h-[70vh] w-auto mx-auto rounded-lg mt-4"
            />
          )}

          {isAudio && <audio controls src={url} className="w-full mt-4" />}

          {isPDF && (
            <iframe
              src={url}
              className="w-full h-[70vh] rounded-lg border shadow-sm mt-4"
            />
          )}
        </div>

        {url ? (
          <a
            href={url}
            download={name}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm 
                     hover:bg-blue-700 transition shadow-sm"
          >
            Download
          </a>
        ) : (
          <button className="mt-4 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm cursor-not-allowed">
            Download
          </button>
        )}
      </div>
    </div>
  );
}
