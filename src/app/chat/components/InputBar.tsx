import "@/lib/i18n";
import { Mic, Paperclip, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

type InputBarProps = Readonly<{
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  transcript: string;
  message: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}>;

export default function InputBar({
  isRecording,
  setIsRecording,
  transcript,
  message,
  handleInputChange,
}: InputBarProps) {
  const { t } = useTranslation("chat");
  return (
    <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 border">
      <button className="text-gray-600">
        <Paperclip className="w-5 h-5" />
      </button>

      <textarea
        placeholder={t("typing_placeholder")}
        value={isRecording ? transcript : message}
        onChange={handleInputChange}
        rows={1}
        disabled={isRecording} // prevent editing during recording
        className={`flex-1 bg-transparent outline-none px-3 resize-none overflow-hidden leading-relaxed max-h-40 ${
          isRecording ? "text-gray-700 italic" : "text-gray-800"
        }`}
      ></textarea>

      <button
        className={`mx-2 transition-all duration-300 ${
          isRecording ? "text-red-600 scale-110" : "text-gray-600"
        }`}
        onClick={() => setIsRecording(true)}
      >
        <Mic className="w-6 h-6" />
      </button>

      <button className="bg-blue-600 text-white rounded-lg p-2">
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
