"use client";

import { FileText, ImageIcon, Music, Video, Download } from "lucide-react";
import { useMemo, useState } from "react";
import FilePreviewModal from "../FilePreviewModal";

interface InlineAttachmentProps {
  file: File | any; // accommodating your specific FileMeta type
}

export function InlineAttachment({ file }: InlineAttachmentProps) {
  const [showModal, setShowModal] = useState(false);

  // --- 1. Data Normalization (Same logic as before, just kept purely for data) ---
  const name =
    file instanceof File
      ? file.name
      : file.name || file.url?.split("/").pop() || "file";
  const size = file instanceof File ? file.size : file.size;
  const sizeLabel = size ? `${(size / 1024).toFixed(1)} KB` : "";
  const ext = name.split(".").pop()?.toLowerCase() || "";

  const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
  const isVideo = ["mp4", "mov", "webm"].includes(ext);
  const isAudio = ["mp3", "wav", "aac"].includes(ext);

  const url = useMemo(() => {
    if (file instanceof File) return URL.createObjectURL(file);
    return file.url;
  }, [file]);

  // --- 2. Render Logic ---

  // TYPE A: IMAGE / VIDEO THUMBNAIL
  // Renders a simple rounded square with the image content
  if (isImage && url) {
    return (
      <>
        <div
          onClick={() => setShowModal(true)}
          className="group relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/20 bg-black/20"
        >
          <img
            src={url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
        </div>

        {showModal && (
          <FilePreviewModal file={file} onClose={() => setShowModal(false)} />
        )}
      </>
    );
  }

  // TYPE B: GENERIC FILE CHIP
  // Renders a compact horizontal bar (Icon + Name + Size)
  const Icon = isVideo ? Video : isAudio ? Music : FileText;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="group flex w-full max-w-[240px] cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 pr-4 hover:bg-white/10 transition-colors"
      >
        {/* Icon Box */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
          <Icon className="h-5 w-5" />
        </div>

        {/* Text Info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="truncate text-sm font-medium text-white/90"
            title={name}
          >
            {name}
          </span>
          <span className="text-xs text-white/50">{sizeLabel}</span>
        </div>
      </div>

      {showModal && (
        <FilePreviewModal file={file} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
