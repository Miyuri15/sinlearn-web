"use client";

import ChatLanguageToggle from "@/components/language/ChatLanguageToggle";
import MarkingRubic from "@/app/chat/components/MarkingRubic";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import InputBar from "./components/InputBar";
import RecordBar from "./components/RecordBar";
import FullPageSkeleton from "./components/FullPageSkeleton";

export default function Chat() {
  const { t, i18n } = useTranslation("chat");

  const [loading, setLoading] = useState(true);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [isI18nReady, setIsI18nReady] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setMessage(transcript);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setTranscript("");
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setTranscript("student asking about solar systems…");
  }, []);

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsI18nReady(true);
      return;
    }

    const handleInit = () => setIsI18nReady(true);

    i18n.on("initialized", handleInit);
    return () => {
      i18n.off("initialized", handleInit);
    };
  }, [i18n]);

  if (!isI18nReady || loading) {
    return <FullPageSkeleton />;
  }

  return (
    <main className="flex min-h-screen bg-gray-100 text-gray-900 relative overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-16 bg-white border-r flex items-start justify-center p-4">
        <Menu className="w-6 h-6 text-gray-700 cursor-pointer" />
      </div>

      {/* MAIN AREA */}
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

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            <ChatLanguageToggle />

            <button
              onClick={() => setIsRubricOpen(true)}
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

        {/* CENTER CONTENT */}
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              {t("start_conversation")}
            </h2>
            <p className="text-gray-500 mt-2">{t("start_conversation_sub")}</p>
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="p-4 border-t bg-white">
          {isRecording && (
            <RecordBar
              onCancelRecording={handleCancelRecording}
              onStopRecording={handleStopRecording}
            />
          )}

          <InputBar
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            transcript={transcript}
            message={message}
            handleInputChange={handleInputChange}
          />
        </div>
      </div>

      {/* RIGHT SLIDE SIDEBAR */}
      <div
        className={`fixed right-0 top-0 h-full transition-transform duration-300 
        ${isRubricOpen ? "translate-x-0" : "translate-x-full"}`}
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
