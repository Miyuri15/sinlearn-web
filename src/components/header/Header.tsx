"use client";

import { useTranslation } from "react-i18next";
import MenuIcon from "@mui/icons-material/Menu";
import LanguageToggle from "@/components/header/LanguageToggle";
import ThemeToggle from "@/components/header/ThemeToggle";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Book,
  HelpCircle,
  WifiOff,
} from "lucide-react";
import { useConnectivityStatus } from "@/hooks/useConnectivityStatus";
import type { WSConnectionStatus } from "@/hooks/useProcessingProgressWS";

interface HeaderProps {
  mode: "learning" | "evaluation";
  isRubricOpen: boolean;
  isSyllabusOpen: boolean;
  isQuestionsOpen: boolean;
  isSessionResourcesOpen?: boolean;
  isSyncingMessages?: boolean;
  toggleRubric: () => void;
  toggleSyllabus: () => void;
  toggleQuestions: () => void;
  toggleSessionResources?: () => void;
  toggleSidebar?: () => void;
  activeStep?: string; // Add this prop to track active step
  isTemporal?: boolean;
  backendConnectionStatus?: WSConnectionStatus;
}

export default function Header({
  mode,
  isRubricOpen,
  isSyllabusOpen,
  isQuestionsOpen,
  isSessionResourcesOpen = false,
  isSyncingMessages = false,
  toggleRubric,
  toggleSyllabus,
  toggleQuestions,
  toggleSessionResources,
  toggleSidebar,
  activeStep,
  isTemporal = false,
  backendConnectionStatus,
}: Readonly<HeaderProps>) {
  const { t } = useTranslation("chat");
  const connectivityStatus = useConnectivityStatus(backendConnectionStatus);
  const showConnectivityBadge = connectivityStatus !== "online";
  const showCompactConnectivityBadge =
    isSyllabusOpen || isQuestionsOpen || isRubricOpen;
  const connectivityLabel =
    connectivityStatus === "offline"
      ? t("connectivity_offline")
      : t("connectivity_reconnecting");

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

            {showConnectivityBadge && (
              <div
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/70 dark:bg-amber-900/20 dark:text-amber-200"
                title={connectivityLabel}
              >
                <WifiOff className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Toggles + (Evaluation Action Menu) */}
        <div className="flex items-center gap-1">
          {mode === "learning" && !isTemporal && (
            <button
              onClick={toggleSessionResources}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
                isSessionResourcesOpen
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
              }`}
              title={t("view_resources")}
            >
              <Book className="w-4 h-4" />
              <span className="text-xs font-medium">{t("view_resources")}</span>
            </button>
          )}

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
                className={`p-2 rounded-lg transition-all duration-300 relative ${
                  isRubricOpen
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : activeStep === "rubric"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-[#111] animate-pulse"
                      : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                }`}
                title={t("evaluation_start_step_rubric")}
              >
                <FileText className="w-5 h-5" />
                {activeStep === "rubric" && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                )}
              </button>
              <button
                onClick={toggleSyllabus}
                className={`p-2 rounded-lg transition-all duration-300 relative ${
                  isSyllabusOpen
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : activeStep === "syllabus"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-[#111] animate-pulse"
                      : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                }`}
                title={t("evaluation_start_step_syllabus")}
              >
                <Book className="w-5 h-5" />
                {activeStep === "syllabus" && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                )}
              </button>
              <button
                onClick={toggleQuestions}
                className={`p-2 rounded-lg transition-all duration-300 relative ${
                  isQuestionsOpen
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : activeStep === "questions"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-[#111] animate-pulse"
                      : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
                }`}
                title={t("evaluation_start_step_questions")}
              >
                <HelpCircle className="w-5 h-5" />
                {activeStep === "questions" && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                )}
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

          {showConnectivityBadge && (
            <div
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/70 dark:bg-amber-900/20 dark:text-amber-200"
              title={connectivityLabel}
            >
              <WifiOff className="h-4 w-4" />
              {!showCompactConnectivityBadge && (
                <span>{connectivityLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* RIGHT TOOLS */}
        <div className="flex items-center gap-4">
          {mode === "learning" && !isTemporal && (
            <button
              onClick={toggleSessionResources}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isSessionResourcesOpen
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800"
                  : "hover:bg-gray-50 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-[#333]"
              }`}
              title={t("view_resources")}
            >
              <Book className="w-5 h-5" />
              <span className="text-sm font-medium">{t("view_resources")}</span>
            </button>
          )}

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
                title={t("evaluation_start_step_rubric")}
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {t("evaluation_start_step_rubric")}
                </span>
              </button>

              <button
                onClick={toggleSyllabus}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isSyllabusOpen
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-[#333]"
                }`}
                title={t("evaluation_start_step_syllabus")}
              >
                <Book className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {t("evaluation_start_step_syllabus")}
                </span>
              </button>

              <button
                onClick={toggleQuestions}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isQuestionsOpen
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-[#333]"
                }`}
                title={t("evaluation_start_step_questions")}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {t("evaluation_start_step_questions")}
                </span>
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
