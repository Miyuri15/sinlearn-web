import "@/lib/i18n";
import { Mic, Paperclip, Send, X, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { KeyboardEvent, useState, DragEvent } from "react";
import FilePreviewModal from "@/components/chat/FilePreviewModal";

type InputBarProps = Readonly<{
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  transcript: string;
  message: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  // Updated props to handle files internally
  onFilesSelected: (files: File[]) => void;
  pendingFiles?: File[];
  onRemoveFile?: (index: number) => void;
}>;

export default function InputBar({
  isRecording,
  setIsRecording,
  transcript,
  message,
  handleInputChange,
  onSend,
  onFilesSelected,
  pendingFiles = [],
  onRemoveFile,
}: InputBarProps) {
  const { t } = useTranslation("chat");
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) return;
    if (e.key === "Enter") {
      e.preventDefault();
      // Reset height
      e.currentTarget.style.height = "auto";
      onSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).slice(0, 10);
      onFilesSelected(droppedFiles);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex flex-col rounded-xl border min-w-0 transition-colors duration-200
        ${
          isDragging
            ? "bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500"
            : "bg-gray-100 border-gray-300 dark:bg-[#111111] dark:border-[#2a2a2a]"
        }
      `}
    >
      {/* 1. PREVIEW AREA (Inside the box) */}
      {pendingFiles.length > 0 && (
        <div className="flex gap-3 p-3 pb-0 overflow-x-auto custom-scrollbar">
          {pendingFiles.map((file, index) => (
            <div
              key={index}
              className="relative group flex-shrink-0 w-16 h-16 bg-white dark:bg-[#1A1A1A] rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => {
                setPreviewFile(file);
                setIsPreviewOpen(true);
              }}
            >
              {/* Simple Image Preview or Icon */}
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <FileText className="w-8 h-8 text-blue-700" />
              )}

              {/* Delete Button (appears on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile?.(index);
                }}
                className="absolute top-0.5 right-0.5 bg-black/50 hover:bg-red-500 text-white rounded-full p-0.5 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2. INPUT ROW */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2">
        {/* ATTACHMENT BUTTON */}
        <input
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.mp3,.wav,.mp4"
          id="chat-file-upload"
          className="hidden"
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files ?? []).slice(0, 10);
            if (selectedFiles.length > 0) {
              onFilesSelected(selectedFiles);
            }
            // Reset value so same file can be selected again if needed
            e.target.value = "";
          }}
        />

        <button
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          onClick={() => document.getElementById("chat-file-upload")?.click()}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* TEXT AREA */}
        <textarea
          placeholder={t("typing_placeholder")}
          value={isRecording ? transcript : message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isRecording}
          className={`chat-input flex-1 bg-transparent outline-none px-3 resize-none overflow-hidden leading-relaxed max-h-40 break-words min-w-0 py-2 ${
            isRecording
              ? "text-gray-700 dark:text-gray-100 italic"
              : "text-gray-800 dark:text-gray-200"
          }`}
        ></textarea>

        {/* MIC BUTTON */}
        <button
          onClick={toggleRecording}
          className={`
            transition-all duration-300 p-1 rounded-lg
            ${
              isRecording
                ? "text-red-600 dark:text-red-500 scale-110"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            }
          `}
        >
          <Mic className="w-6 h-6" />
        </button>

        {/* SEND BUTTON */}
        <button
          onClick={onSend}
          disabled={!message.trim() && pendingFiles.length === 0}
          className={`
            px-3 sm:px-4 py-2 rounded-lg transition text-white
            ${
              !message.trim() && pendingFiles.length === 0
                ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            }
          `}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {isPreviewOpen && previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewFile(null);
          }}
        />
      )}
    </div>
  );
}
