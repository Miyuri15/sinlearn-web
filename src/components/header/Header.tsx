"use client";

import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import Image from "next/image";
import LanguageToggle from "@/components/header/LanguageToggle";
import ThemeToggle from "@/components/header/ThemeToggle";

interface HeaderProps {
  mode: "learning" | "evaluation";
  setMode: (mode: "learning" | "evaluation") => void;
  isRubricOpen: boolean;
  isSyllabusOpen: boolean;
  isQuestionsOpen: boolean;
  toggleRubric: () => void;
  toggleSyllabus: () => void;
  toggleQuestions: () => void;
  toggleSidebar?: () => void;
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
  toggleSidebar,
}: HeaderProps) {
  const { t } = useTranslation("chat");

  // Check if any panel is open
  const isAnyPanelOpen = isRubricOpen || isSyllabusOpen || isQuestionsOpen;

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#2a2a2a]">
      {/* MOBILE - Single Row */}
      <div className="md:hidden flex items-center justify-between p-2">
        {mode === "learning" ? (
          // Learning mode: only Theme + Language on the right
          <div className="flex w-full items-center justify-end gap-2">
            <div className="scale-75">
              <ThemeToggle />
            </div>
            <div className="scale-75">
              <LanguageToggle />
            </div>
          </div>
        ) : (
          // Evaluation mode: keep existing layout
          // Evaluation mode: single row layout
          <div className="flex w-full items-center gap-1 overflow-x-auto no-scrollbar">
            {/* Mobile Menu Button - Hide when any panel is open */}
            {toggleSidebar && (
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors flex-shrink-0"
                aria-label="Open menu"
              >
                <MenuIcon className="text-lg" />
              </button>
            )}

            {mode === "evaluation" && (
              /* Right side tools */
              <div className="flex items-center gap-1 ml-auto">
                {/* Theme + Language Group */}
                <div className="flex items-center gap-2 scale-75 origin-right">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>

                {/* Rubric */}
                <button
                  onClick={toggleRubric}
                  className={`px-2 py-1 rounded-lg border text-xs min-w-[60px] text-center whitespace-nowrap ${
                    isRubricOpen
                      ? "bg-blue-100 dark:bg-[#1E3A8A]/40 border-blue-300 dark:border-blue-900"
                      : "bg-white dark:bg-[#222] dark:border-[#333]"
                  }`}
                >
                  Rubric
                </button>
                {/* Syllabus */}
                <button
                  onClick={toggleSyllabus}
                  className={`px-2 py-1 rounded-lg border text-xs min-w-[60px] text-center whitespace-nowrap ${
                    isSyllabusOpen
                      ? "bg-blue-100 dark:bg-[#1E3A8A]/40 border-blue-300 dark:border-blue-900"
                      : "bg-white dark:bg-[#222] dark:border-[#333]"
                  }`}
                >
                  Syllabus
                </button>
                {/* Add (+) */}
                <button
                  onClick={toggleQuestions}
                  className={`w-7 h-7 flex items-center justify-center border rounded-lg text-sm font-bold flex-shrink-0 ${
                    isQuestionsOpen
                      ? "bg-blue-100 dark:bg-[#1E3A8A]/40 border-blue-300 dark:border-blue-900"
                      : "bg-white dark:bg-[#222] dark:border-[#333]"
                  }`}
                >
                  <AddIcon className="text-base" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TABLET/DESKTOP - Single Row */}
      <div className="hidden md:flex items-center justify-between w-full p-3 md:p-4">
        {/* MODE TOGGLE BUTTONS - Tablet/Desktop */}
        <div className="flex gap-0 bg-gray-200 dark:bg-[#2a2a2a] p-1 rounded-full">
          <button
            onClick={() => setMode("learning")}
            className={`px-4 md:px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              mode === "learning"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <span className="inline-flex items-center justify-center">
              <Image
                src={"/icons/syllabus.png"}
                alt="Learning Mode"
                width={20}
                height={20}
                className={`block ${
                  mode === "learning" ? "brightness-0 invert" : ""
                }`}
              />
            </span>
            <span>{t("learning_mode")}</span>
          </button>

          <button
            onClick={() => setMode("evaluation")}
            className={`px-4 md:px-6 py-2 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              mode === "evaluation"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <span className="inline-flex items-center justify-center">
              <Image
                src={"/icons/Icon.png"}
                alt="Evaluation Mode"
                width={20}
                height={20}
                className={`block ${
                  mode === "evaluation" ? "brightness-0 invert" : ""
                }`}
              />
            </span>
            <span>{t("evaluation_mode")}</span>
          </button>
        </div>

        {/* RIGHT TOOLS - Tablet/Desktop */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageToggle />

          {/* Show action buttons only in evaluation mode */}
          {mode === "evaluation" && (
            <>
              <button
                onClick={toggleRubric}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  isRubricOpen
                    ? "bg-blue-100 dark:bg-[#1E3A8A]/40 border-blue-300 dark:border-blue-900"
                    : "bg-white dark:bg-[#222] dark:border-[#333]"
                }`}
              >
                Rubric
              </button>

              <button
                onClick={toggleSyllabus}
                className={`px-4 py-2 rounded-lg border text-sm ${
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}