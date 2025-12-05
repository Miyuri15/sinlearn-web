import { FileText, ImageIcon, Music, Video } from "lucide-react";
import { useState } from "react";
import FilePreviewModal from "./FilePreviewModal";

export default function FilePreviewCard({ file }: { file: File }) {
  const [open, setOpen] = useState(false);

  const ext = file.name.split(".").pop()?.toLowerCase();

  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext!);
  const isAudio = ["mp3", "wav", "aac", "ogg"].includes(ext!);
  const isVideo = ["mp4", "mov", "webm"].includes(ext!);
  const isPDF = ext === "pdf";

  const url = URL.createObjectURL(file);

  return (
    <>
      {/* SMALL PREVIEW CARD */}
      <div
        onClick={() => setOpen(true)}
        className="p-3 rounded-lg bg-blue-50 border border-blue-200 shadow-sm flex flex-col gap-2 cursor-pointer hover:bg-blue-100 transition"
      >
        {/* TOP ICON + NAME */}
        <div className="flex items-center gap-2 text-blue-700">
          {isImage && <ImageIcon className="w-5 h-5" />}
          {isPDF && <FileText className="w-5 h-5" />}
          {isAudio && <Music className="w-5 h-5" />}
          {isVideo && <Video className="w-5 h-5" />}
          {!isImage && !isPDF && !isAudio && !isVideo && (
            <FileText className="w-5 h-5" />
          )}

          <p className="font-medium truncate">{file.name}</p>
        </div>

        {/* SMALL THUMBNAIL PREVIEW */}
        {isImage && (
          <img
            src={url}
            className="rounded-lg max-h-48 object-cover"
            alt="preview"
          />
        )}

        {isVideo && (
          <video src={url} className="rounded-lg max-h-48 opacity-70" />
        )}

        {isAudio && <audio src={url} controls className="w-full" />}

        {/* Download link inline */}
        <a
          href={url}
          download={file.name}
          className="text-blue-600 font-medium underline text-sm"
          onClick={(e) => e.stopPropagation()} // prevent opening modal when clicking link
        >
          Download
        </a>
      </div>

      {/* FULLSCREEN MODAL */}
      {open && <FilePreviewModal file={file} onClose={() => setOpen(false)} />}
    </>
  );
}
