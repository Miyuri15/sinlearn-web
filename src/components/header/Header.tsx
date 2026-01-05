"use client";

import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import LanguageToggle from "@/components/header/LanguageToggle";
import ThemeToggle from "@/components/header/ThemeToggle";
import { BookOpen, ClipboardCheck, FileText, Book, HelpCircle } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  mode: "learning" | "evaluation";
  isRubricOpen: boolean;
  isSyllabusOpen: boolean;
  isQuestionsOpen: boolean;
  isSyncingMessages?: boolean;
  toggleRubric: () => void;
  toggleSyllabus: () => void;
  toggleQuestions: () => void;
  toggleSidebar?: () => void;
}

export default function Header({
  mode,
  isRubricOpen,
  isSyllabusOpen,
  isQuestionsOpen,
  isSyncingMessages = false,
  toggleRubric,
  toggleSyllabus,
  toggleQuestions,
  toggleSidebar,
}: Readonly<HeaderProps>) {
  const { t } = useTranslation("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if any panel is open
  const isAnyPanelOpen = isRubricOpen || isSyllabusOpen || isQuestionsOpen;

  const modeDetails =
    mode === "learning"
      ? {
          label: t("learning_mode"),
          icon: <BookOpen className="w-5 h-5" />,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          textColor: "text-blue-700 dark:text-blue-300",
          borderColor: "border-blue-200 dark:border-blue-800",
        }
      : {
          label: t("evaluation_mode"),
          icon: <ClipboardCheck className="w-5 h-5" />,
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          textColor: "text-emerald-700 dark:text-emerald-300",
          borderColor: "border-emerald-200 dark:border-emerald-800",
        };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#2a2a2a]">
      {/* MOBILE - Single Row */}
      <div className="md:hidden flex items-center justify-between p-2">
        {/* LEFT: Sidebar Toggle (Always Visible) */}
        <div className="flex items-center gap-2">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <MenuIcon className="text-lg" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-1 sm:px-2 py-1 rounded-lg border ${modeDetails.bgColor} ${modeDetails.borderColor}`}
            >
              <div className={`${modeDetails.textColor}`}>
                {modeDetails.icon}
              </div>
              {/* show label if having sufficient space */}
              <span
                className={`sm:inline hidden font-semibold text-sm ${modeDetails.textColor}`}
              >
                {modeDetails.label}
              </span>
            </div>

            {isSyncingMessages && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full border border-gray-200 dark:border-[#2a2a2a] bg-white/70 dark:bg-[#1a1a1a]/70">
                <span
                  className="inline-block h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
                  aria-label="Syncing"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Toggles + (Evaluation Action Menu) */}
        <div className="flex items-center gap-1">
          {/* Theme & Language */}
          <div className="flex items-center">
            <div className="scale-75">
              <ThemeToggle />
            </div>
            <div className="scale-75">
              <LanguageToggle />
            </div>
          </div>

          {/* Evaluation Mode: "Extra One Button" (Dropdown) */}
          {mode === "evaluation" && (
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={toggleRubric}
                className={`p-2 rounded-lg transition-colors ${
                  isRubricOpen
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                }`}
                title="Rubric"
              >
                <FileText className="w-5 h-5" />
              </button>
              <button
                onClick={toggleSyllabus}
                className={`p-2 rounded-lg transition-colors ${
                  isSyllabusOpen
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                }`}
                title="Syllabus"
              >
                <Book className="w-5 h-5" />
              </button>
              <button
                onClick={toggleQuestions}
                className={`p-2 rounded-lg transition-colors ${
                  isQuestionsOpen
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                }`}
                title="Questions"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABLET/DESKTOP - Single Row */}
      <div className="hidden md:flex items-center justify-between w-full p-3 md:p-4">
        {/* CURRENT MODE DISPLAY (Static Badge) */}
        <div className="flex items-center gap-3">
          <div
            className={`
              flex items-center gap-3 px-5 py-2.5 rounded-full border
              ${modeDetails.bgColor} 
              ${modeDetails.borderColor}
              transition-colors min-w-0 shrink ${
                mode === "evaluation" ? "mr-2" : "mr-0"
              }
            `}
          >
            <div className={modeDetails.textColor}>{modeDetails.icon}</div>
            <span
              className={`font-semibold text-sm ${
                mode === "evaluation" ? "truncate max-w-20 lg:max-w-none" : ""
              } ${modeDetails.textColor}`}
            >
              {modeDetails.label}
            </span>
          </div>

          {isSyncingMessages && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#2a2a2a] bg-white/70 dark:bg-[#1a1a1a]/70">
              <span
                className="inline-block h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
                aria-label="Syncing"
              />
              <span>Syncing…</span>
            </div>
          )}
        </div>

        {/* RIGHT TOOLS */}
        <div className="flex items-center gap-4">
          {/* Show action buttons only in evaluation mode */}
          {mode === "evaluation" && (
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={toggleRubric}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isRubricOpen
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-[#333]"
                }`}
                title="Rubric"
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Rubric</span>
              </button>
              
              <button
                onClick={toggleSyllabus}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isSyllabusOpen
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-[#333]"
                }`}
                title="Syllabus"
              >
                <Book className="w-5 h-5" />
                <span className="text-sm font-medium">Syllabus</span>
              </button>

              <button
                onClick={toggleQuestions}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isQuestionsOpen
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-[#333]"
                }`}
                title="Questions"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Questions</span>
              </button>
            </div>
          )}

          <div className="h-6 w-px bg-gray-200 dark:bg-[#333] mx-1" />
          
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
