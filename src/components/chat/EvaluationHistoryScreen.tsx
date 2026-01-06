import React from "react";
import { 
  Calendar, 
  Clock, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  BarChart2
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

function formatRelativeTime(timestampMs: number, language: string) {
  const locale = language?.startsWith("si") ? "si-LK" : "en";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffSeconds = Math.round((timestampMs - Date.now()) / 1000);

  const abs = Math.abs(diffSeconds);
  if (abs < 60) return rtf.format(diffSeconds, "second");

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, "day");

  const diffWeeks = Math.round(diffDays / 7);
  if (Math.abs(diffWeeks) < 4) return rtf.format(diffWeeks, "week");

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, "month");

  const diffYears = Math.round(diffDays / 365);
  return rtf.format(diffYears, "year");
}

export interface EvaluationSession {
  id: string;
  timestamp: number;
  files: File[];
  results: any[]; // Using any for now to match the mock structure
  averageScore: number;
}

interface EvaluationHistoryScreenProps {
  history: EvaluationSession[];
  onSelectSession: (session: EvaluationSession) => void;
  onBack: () => void;
  onStartNewAnswerEvaluation: () => void | Promise<void>;
}

export default function EvaluationHistoryScreen({
  history,
  onSelectSession,
  onBack,
  onStartNewAnswerEvaluation
}: EvaluationHistoryScreenProps) {
  const { t, i18n } = useTranslation("chat");

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
        <div>
        <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("evaluation_history_title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("evaluation_history_subtitle")}
          </p>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onStartNewAnswerEvaluation}>
            {t("evaluation_start_new_answer_evaluation")}
          </Button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#222] rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t("evaluation_history_empty_title")}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t("evaluation_history_empty_desc")}
            </p>
          </div>
        ) : (
          history.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="group bg-white dark:bg-[#111111] p-5 rounded-xl border border-gray-200 dark:border-[#2a2a2a] hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
                      {t("evaluation_history_session_title")}
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#222] px-2 py-0.5 rounded-full">
                        {formatRelativeTime(session.timestamp, i18n.language)}
                      </span>
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        {t("evaluation_history_answer_sheets", { count: session.files.length })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4" />
                        {t("evaluation_history_avg_score")}:{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">{session.averageScore}%</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
