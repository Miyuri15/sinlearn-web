"use client";
import "@/lib/i18n";
import ChatLanguageToggle from "@/components/language/ChatLanguageToggle";
import MarkingRubic from "@/components/ui/MarkingRubic";
import { Menu, Mic, Paperclip, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function Chat() {
  const { t } = useTranslation("chat");

  const [loading, setLoading] = useState(true);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const toggleRubricSidebar = () => {
    setIsRubricOpen(!isRubricOpen);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    setTranscript("student asking about solar systems…");
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        {/* LEFT SIDEBAR SKELETON */}
        <div className="w-16 bg-white border-r flex items-start justify-center p-4">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* MAIN SKELETON */}
        <div className="flex-1 flex flex-col">
          {/* TOP BAR */}
          <div className="flex items-center justify-between bg-white p-4 border-b">
            {/* Left buttons */}
            <div className="flex items-center gap-3">
              <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-36 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* CHAT AREA SKELETON */}
          <div className="flex-1 flex items-center justify-center text-center px-4">
            <div className="space-y-4 w-full max-w-sm">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* INPUT BAR SKELETON */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3 border gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-gray-100 text-gray-900 relative overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-16 bg-white border-r flex items-start justify-center p-4">
        <Menu className="w-6 h-6 text-gray-700 cursor-pointer" />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-white p-4 border-b">
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium border border-blue-200">
              Learning Mode
            </button>
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium border">
              Evaluation Mode
            </button>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-4">
            <ChatLanguageToggle />

            <button
              onClick={() => toggleRubricSidebar()}
              className="px-4 py-2 rounded-lg bg-white border font-medium text-gray-700"
            >
              Rubric
            </button>

            <button className="px-4 py-2 rounded-lg bg-white border font-medium text-gray-700">
              Syllabus
            </button>

            <button className="w-9 h-9 flex items-center justify-center border rounded-lg bg-white text-gray-700">
              +
            </button>
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              {t("start_conversation")}
            </h2>

            <p className="text-gray-500 mt-2">{t("start_conversation_sub")}</p>
          </div>
        </div>

        {/* INPUT BAR */}
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

            <input
              placeholder={t("typing_placeholder")}
              className="flex-1 bg-transparent outline-none px-3"
            />

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
      </div>

      {/* RIGHT SIDEBAR */}
      <div
        className={`
          fixed right-0 top-0 h-full transition-transform duration-300
          ${isRubricOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <MarkingRubic
          loading={loading}
          onClose={() => setIsRubricOpen(false)}
          onSelectRubric={(id) => console.log("Selected:", id)}
          onUpload={() => console.log("Upload pressed")}
        />
      </div>
    </main>
  );
}
