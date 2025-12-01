import { Mic, Paperclip, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

type InputBarProps = Readonly<{
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  setTranscript: (value: string) => void;
  transcript: string;
  message: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}>;

export default function InputBar({
  isRecording,
  setIsRecording,
  setTranscript,
  transcript,
  message,
  handleInputChange,
}: InputBarProps) {
  const { t } = useTranslation("chat");
  return (
    <div className="p-4 border-t bg-white">
      {/* RECORDING BAR */}
      {isRecording && (
        <div className="flex justify-center px-4 pb-2">
          <div className="w-full max-w-xl bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-slide-up">
            {/* Left Side */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Recording</span>
            </div>

            {/* Waveform */}
            <div className="flex items-end gap-1 h-6">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-400 rounded-full animate-wave"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-5 text-sm">
              {/* Cancel */}
              <button
                onClick={() => {
                  setIsRecording(false);
                  setTranscript("");
                }}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ✕ Cancel
              </button>

              {/* Stop */}
              <button
                onClick={() => {
                  setIsRecording(false);
                }}
                className="text-red-600 font-medium hover:text-red-700"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 border">
        <button className="text-gray-600">
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          placeholder={t("typing_placeholder")}
          value={message}
          onChange={handleInputChange}
          rows={1}
          className="flex-1 bg-transparent outline-none px-3 resize-none overflow-hidden leading-relaxed max-h-40"
        ></textarea>

        {isRecording && transcript && (
          <p className="text-gray-500 mt-2 italic">{transcript}</p>
        )}

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
    </div>
  );
}
