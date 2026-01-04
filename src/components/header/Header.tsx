"use client";

import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LanguageToggle from "@/components/header/LanguageToggle";
import ThemeToggle from "@/components/header/ThemeToggle";
import { BookOpen, ClipboardCheck } from "lucide-react";
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
            <div className="relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                  isMobileMenuOpen
                    ? "bg-gray-100 dark:bg-[#333] border-gray-300 dark:border-[#444]"
                    : "bg-white dark:bg-[#222] border-gray-200 dark:border-[#333]"
                }`}
              >
                <MoreVertIcon className="text-gray-600 dark:text-gray-300 text-lg" />
              </button>

              {/* The Dropdown Menu */}
              {isMobileMenuOpen && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />

                  {/* Menu Content */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-xl z-40 p-1.5 flex flex-col gap-1">
                    {/* Rubric Toggle */}
                    <button
                      onClick={() => {
                        toggleRubric();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        isRubricOpen
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      Rubric
                    </button>

                    {/* Syllabus Toggle */}
                    <button
                      onClick={() => {
                        toggleSyllabus();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        isSyllabusOpen
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      Syllabus
                    </button>

                    <div className="h-px bg-gray-100 dark:bg-[#333] my-1" />

                    {/* Add Questions Toggle */}
                    <button
                      onClick={() => {
                        toggleQuestions();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        isQuestionsOpen
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <AddIcon className="text-sm" />
                      <span>Add Questions</span>
                    </button>
                  </div>
                </>
              )}
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
          <ThemeToggle />
          <LanguageToggle />

          {/* Show action buttons only in evaluation mode */}
          {mode === "evaluation" && (
            <div className="relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                  isMobileMenuOpen
                    ? "bg-gray-100 dark:bg-[#333] border-gray-300 dark:border-[#444]"
                    : "bg-white dark:bg-[#222] border-gray-200 dark:border-[#333]"
                }`}
              >
                <MoreVertIcon className="text-gray-600 dark:text-gray-300 text-lg" />
              </button>

              {/* The Dropdown Menu */}
              {isMobileMenuOpen && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />

                  {/* Menu Content */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-xl z-40 p-1.5 flex flex-col gap-1">
                    {/* Rubric Toggle */}
                    <button
                      onClick={() => {
                        toggleRubric();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        isRubricOpen
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      Rubric
                    </button>

                    {/* Syllabus Toggle */}
                    <button
                      onClick={() => {
                        toggleSyllabus();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        isSyllabusOpen
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      Syllabus
                    </button>

                    <div className="h-px bg-gray-100 dark:bg-[#333] my-1" />

                    {/* Add Questions Toggle */}
                    <button
                      onClick={() => {
                        toggleQuestions();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        isQuestionsOpen
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium"
                          : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <AddIcon className="text-sm" />
                      <span>Add Questions</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
