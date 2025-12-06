import { Download, Eye, FileText, ImageIcon, Music, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FilePreviewModal from "./FilePreviewModal";

export default function FilePreviewCard({ file }: { file: File }) {
  const [open, setOpen] = useState(false);

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const sizeKB = (file.size / 1024).toFixed(1);

  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext);
  const isAudio = ["mp3", "wav", "aac", "ogg"].includes(ext);
  const isVideo = ["mp4", "mov", "webm"].includes(ext);
  const isPDF = ext === "pdf";

  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  const getIcon = () => {
    if (isImage) return <ImageIcon className="w-5 h-5 text-blue-700" />;
    if (isAudio) return <Music className="w-5 h-5 text-blue-700" />;
    if (isVideo) return <Video className="w-5 h-5 text-blue-700" />;
    return <FileText className="w-5 h-5 text-blue-700" />;
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="p-3 rounded-lg bg-blue-50 border border-blue-200 
                   shadow-sm flex flex-col gap-3 cursor-pointer
                   hover:bg-blue-100 hover:shadow transition duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex flex-col min-w-0">
            <p className="font-medium truncate max-w-[180px]" title={file.name}>
              {file.name}
            </p>
            <span className="text-xs text-blue-600">{sizeKB} KB</span>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="relative rounded-lg overflow-hidden max-h-48 flex justify-center">
          {isImage && (
            <img
              src={url}
              className="object-cover w-full h-48 hover:scale-105 transition"
              alt="preview"
            />
          )}

          {isVideo && (
            <div className="relative w-full h-48 bg-black/50 flex justify-center items-center">
              <video
                src={url}
                className="absolute inset-0 object-cover opacity-70"
              />
              <Video className="w-10 h-10 text-white opacity-90" />
            </div>
          )}

          {isAudio && (
            <div className="w-full p-2 bg-white rounded border">
              <audio src={url} controls className="w-full" />
            </div>
          )}

          {!isImage && !isVideo && !isAudio && (
            <div className="flex flex-col items-center justify-center text-blue-700 h-20 w-full bg-white rounded border">
              {getIcon()}
              <p className="text-xs mt-1">No preview available</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="flex items-center gap-1 text-blue-700 text-xs font-medium hover:opacity-80"
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          <a
            href={url}
            download={file.name}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-blue-700 text-xs font-medium hover:opacity-80"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      </div>

      {open && <FilePreviewModal file={file} onClose={() => setOpen(false)} />}
    </>
  );
}
