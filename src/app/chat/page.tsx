"use client";

import ChatLanguageToggle from "@/components/language/ChatLanguageToggle";
import MarkingRubic from "@/components/ui/MarkingRubic";
import { Menu, Mic, Paperclip, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t, i18n } = useTranslation("chat");

  return (
    <main className="flex min-h-screen bg-gray-100 text-gray-900">
      {/* LEFT SIDEBAR */}
      <div className="w-16 bg-white border-r flex items-start justify-center p-4">
        <Menu className="w-6 h-6 text-gray-700 cursor-pointer" />
      </div>

      {/* MAIN MIDDLE SECTION */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-white p-4 border-b">
          {/* Left buttons */}
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

            <button className="px-4 py-2 rounded-lg bg-white border font-medium text-gray-700">
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

        {/* BOTTOM INPUT BAR */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 border">
            <button className="text-gray-600">
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              placeholder={t("typing_placeholder")}
              className="flex-1 bg-transparent outline-none px-3"
            />

            <button className="text-gray-600 mx-2">
              <Mic className="w-5 h-5" />
            </button>

            <button className="bg-blue-600 text-white rounded-lg p-2">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <MarkingRubic
        onClose={() => console.log("Closed")}
        onSelectRubric={(id) => console.log("Selected:", id)}
        onUpload={() => console.log("Upload pressed")}
      />
    </main>
  );
}
