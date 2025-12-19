import "@/lib/i18n";
import { Mic, Paperclip, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { KeyboardEvent } from "react";

type InputBarProps = Readonly<{
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  transcript: string;
  message: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onUpload?: (files: File[]) => void;
}>;

export default function InputBar({
  isRecording,
  setIsRecording,
  transcript,
  message,
  handleInputChange,
  onSend,
  onUpload,
}: InputBarProps) {
  const { t } = useTranslation("chat");

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // SHIFT + ENTER → new line
    if (e.key === "Enter" && e.shiftKey) return;

    // ENTER → send message
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.style.height = "auto";
      onSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl border bg-gray-100 border-gray-300 dark:bg-[#111111] dark:border-[#2a2a2a] min-w-0">
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
            // Trigger parent handler
            onUpload?.(selectedFiles);
          }
        }}
      />

      <button
        className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        onClick={() => document.getElementById("chat-file-upload")?.click()}
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* INPUT */}
      <textarea
        placeholder={t("typing_placeholder")}
        value={isRecording ? transcript : message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={isRecording} // block editing when recording
        className={`chat-input flex-1 bg-transparent outline-none px-3 resize-none overflow-hidden leading-relaxed max-h-40 break-words min-w-0 ${
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
        className="
          px-3 sm:px-4 py-2 rounded-lg transition 
          bg-blue-600 hover:bg-blue-700 
          dark:bg-indigo-600 dark:hover:bg-indigo-700
          text-white
        "
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
