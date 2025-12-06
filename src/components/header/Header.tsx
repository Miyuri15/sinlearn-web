"use client";

import { useTranslation } from "react-i18next";
import ChatLanguageToggle from "@/components/language/ChatLanguageToggle";
import ChatThemeToggle from "@/components/chat/ChatThemeToggle";
import AddIcon from "@mui/icons-material/Add";
import Image from "next/image";

interface HeaderProps {
  mode: "learning" | "evaluation";
  setMode: (mode: "learning" | "evaluation") => void;
  isRubricOpen: boolean;
  isSyllabusOpen: boolean;
  isQuestionsOpen: boolean;
  toggleRubric: () => void;
  toggleSyllabus: () => void;
  toggleQuestions: () => void;
}

export default function Header({
  mode,
  setMode,
  isRubricOpen,
  isSyllabusOpen,
  isQuestionsOpen,
  toggleRubric,
  toggleSyllabus,
  toggleQuestions,
}: HeaderProps) {
  const { t } = useTranslation("chat");

  return (
    <div className="flex items-center justify-between bg-white dark:bg-[#111111] p-4 border-b border-gray-200 dark:border-[#2a2a2a]">
      {/* MODE TOGGLE BUTTONS */}
      <div className="flex gap-0 bg-gray-200 dark:bg-[#2a2a2a] p-1 rounded-full w-fit">
        <button
          onClick={() => setMode("learning")}
          className={`px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
            mode === "learning"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <Image
            src={"/icons/syllabus.png"}
            alt="Learning Mode"
            width={20}
            height={20}
            className={mode === "learning" ? "brightness-0 invert" : ""}
          />
          {t("learning_mode")}
        </button>

        <button
          onClick={() => setMode("evaluation")}
          className={`px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
            mode === "evaluation"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <Image
            src={"/icons/Icon.png"}
            alt="Evaluation Mode"
            width={20}
            height={20}
            className={mode === "evaluation" ? "brightness-0 invert" : ""}
          />
          {t("evaluation_mode")}
        </button>
      </div>

      {/* RIGHT TOOLS */}
      <div className="flex items-center gap-4">
        <ChatThemeToggle />
        <ChatLanguageToggle />

        <button
          onClick={toggleRubric}
          className={`px-4 py-2 rounded-lg border ${
            isRubricOpen
              ? "bg-blue-100 dark:bg-[#1E3A8A]/40 border-blue-300 dark:border-blue-900"
              : "bg-white dark:bg-[#222] dark:border-[#333]"
          }`}
        >
          Rubric
        </button>

        <button
          onClick={toggleSyllabus}
          className={`px-4 py-2 rounded-lg border ${
            isSyllabusOpen
              ? "bg-blue-100 dark:bg-[#1E3A8A]/40 border-blue-300 dark:border-blue-900"
              : "bg-white dark:bg-[#222] dark:border-[#333]"
          }`}
        >
          Syllabus
        </button>

        <button
          onClick={toggleQuestions}
          className={`w-9 h-9 flex items-center justify-center border rounded-lg text-xl font-bold ${
            isQuestionsOpen
              ? "bg-blue-100 dark:bg-[#1E3A8A]/40 border-blue-300 dark:border-blue-900"
              : "bg-white dark:bg-[#222] dark:border-[#333]"
          }`}
        >
          <AddIcon />
        </button>
      </div>
    </div>
  );
}
