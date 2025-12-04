"use client";

import { X } from "lucide-react";

export default function FilePreviewModal({
  file,
  onClose,
}: {
  file: File;
  onClose: () => void;
}) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext!);
  const isAudio = ["mp3", "wav", "aac", "ogg"].includes(ext!);
  const isVideo = ["mp4", "mov", "webm"].includes(ext!);
  const isPDF = ext === "pdf";
  const url = URL.createObjectURL(file);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative max-w-3xl w-full p-4 flex flex-col items-center">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white bg-black/40 p-2 rounded-full hover:bg-black/60"
        >
          <X className="w-6 h-6" />
        </button>

        {/* CONTENT VIEWER */}
        <div className="bg-white dark:bg-[#111] rounded-lg p-4 max-h-[80vh] overflow-auto shadow-xl w-full text-center">
          <h3 className="text-lg font-semibold mb-4 truncate">{file.name}</h3>

          {isImage && (
            <img
              src={url}
              className="max-h-[70vh] w-auto mx-auto object-contain"
            />
          )}

          {isVideo && (
            <video
              controls
              src={url}
              className="max-h-[70vh] w-auto mx-auto rounded-lg"
            />
          )}

          {isAudio && <audio controls src={url} className="w-full mt-4" />}

          {isPDF && (
            <iframe src={url} className="w-full h-[70vh] rounded-lg border" />
          )}
        </div>

        <a
          href={url}
          download={file.name}
          className="mt-3 text-blue-300 underline text-sm"
        >
          Download file
        </a>
      </div>
    </div>
  );
}
