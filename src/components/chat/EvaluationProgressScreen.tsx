import React, { useState, useEffect } from "react";
import { Check, FileText, Loader2, Eye, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

interface EvaluationProgressScreenProps {
  answerSheets: File[];
  questionPaperName?: string;
  syllabusCount: number;
  hasRubric: boolean;
  onViewResults: () => void;
  onStartNewAnswerEvaluation: () => void | Promise<void>;
}

type FileStatus = "pending" | "processing" | "completed" | "failed";
type ProcessingStep = "analyzing" | "marking" | "feedback" | "report" | "done";

interface FileProgress {
  id: string;
  name: string;
  status: FileStatus;
  step: ProcessingStep;
  progress: number;
}

export default function EvaluationProgressScreen({
  answerSheets,
  questionPaperName,
  syllabusCount,
  hasRubric,
  onViewResults,
  onStartNewAnswerEvaluation,
}: EvaluationProgressScreenProps) {
  const { t } = useTranslation("chat");
  const [filesProgress, setFilesProgress] = useState<FileProgress[]>([]);
  const [overallStatus, setOverallStatus] = useState<"processing" | "completed">("processing");

  // Initialize state
  useEffect(() => {
    const initial = answerSheets.map((file) => ({
      id: file.name,
      name: file.name,
      status: "pending" as FileStatus,
      step: "analyzing" as ProcessingStep,
      progress: 0,
    }));
    setFilesProgress(initial);

    const timer = setInterval(() => {
      setFilesProgress((currentProgress) => {
        if (currentProgress.length === 0) return initial;

        let allDone = true;
        const updated = currentProgress.map((file, idx) => {
          if (file.status === "completed") return file;

          allDone = false;
          let status: FileStatus = file.status;
          let progress = file.progress;
          let step: ProcessingStep = file.step;

          // Start logic: stagger start or random
          if (status === "pending") {
            // Start first one immediately, others randomly
            if (idx === 0 || Math.random() > 0.85) {
              status = "processing";
            }
          }

          if (status === "processing") {
            // Random progress increment
            progress += Math.random() * 2 + 0.5; 
            
            if (progress >= 100) {
              progress = 100;
              status = "completed";
              step = "done";
            } else {
              // Map progress to steps
              if (progress < 30) step = "analyzing";
              else if (progress < 60) step = "marking";
              else if (progress < 85) step = "feedback";
              else step = "report";
            }
          }

          return { ...file, status, progress, step };
        });

        if (allDone && updated.length > 0) {
          setOverallStatus("completed");
          clearInterval(timer);
        }
        return updated;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [answerSheets]);

  const getStepLabel = (step: ProcessingStep) => {
    switch (step) {
      case "analyzing":
        return t("evaluation_progress_step_analyzing");
      case "marking":
        return t("evaluation_progress_step_marking");
      case "feedback":
        return t("evaluation_progress_step_feedback");
      case "report":
        return t("evaluation_progress_step_report");
      case "done":
        return t("evaluation_progress_step_done");
      default:
        return t("evaluation_progress_step_pending");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {t("evaluation_progress_title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("evaluation_progress_subtitle", { count: answerSheets.length })}
        </p>
      </div>

      {/* Context Summary (Compact) */}
      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#111111] px-6 py-3 rounded-full border border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-gray-200">{t("evaluation_progress_label_question_paper")}:</span>
          {questionPaperName || t("evaluation_progress_not_set")}
        </div>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 hidden sm:block" />
        <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-200">{t("evaluation_progress_label_syllabus")}:</span>
            {t("evaluation_progress_syllabus_files", { count: syllabusCount })}
        </div>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 hidden sm:block" />
        <div className="flex items-center gap-2">
           <span className="font-medium text-gray-900 dark:text-gray-200">{t("evaluation_progress_label_rubric")}:</span>
           {hasRubric ? (
             <span className="text-green-600 dark:text-green-400">{t("evaluation_progress_rubric_applied")}</span>
           ) : (
             t("evaluation_progress_rubric_none")
           )}
        </div>
      </div>

      {/* Answer Sheets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full max-w-4xl">
        {filesProgress.map((file) => (
          <div 
            key={file.id} 
            className={`
              relative overflow-hidden p-5 rounded-xl border transition-all duration-300
              ${file.status === 'completed' 
                ? 'bg-white dark:bg-[#111111] border-green-200 dark:border-green-900/30 shadow-sm' 
                : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-[#2a2a2a] shadow-sm'
              }
            `}
          >
            {/* Background Progress Fill (Optional subtle effect) */}
            {file.status === 'processing' && (
               <div 
                 className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300"
                 style={{ width: `${file.progress}%` }}
               />
            )}

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`
                  p-2.5 rounded-lg shrink-0 transition-colors
                  ${file.status === 'completed' 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}
                `}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate text-base" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {file.status === "pending"
                      ? t("evaluation_progress_waiting_to_start")
                      : getStepLabel(file.step)}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="shrink-0">
                {file.status === 'completed' ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <Check className="w-5 h-5" />
                  </div>
                ) : file.status === 'processing' ? (
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                    <Clock className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>{t("evaluation_progress_progress")}</span>
                <span>{Math.round(file.progress)}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    file.status === 'completed' ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Results Button */}
      <div className="pt-4 w-full max-w-2xl flex items-center justify-center gap-3">
        <div>
        <Button
          onClick={onViewResults}
          disabled={overallStatus !== "completed"}
          className="flex-1 flex items-center justify-center gap-2 py-6 text-lg"
          variant={overallStatus === "completed" ? "primary" : "secondary"}
        >
          {overallStatus === "completed" ? (
            <>
              <Eye className="w-5 h-5" />
              {t("evaluation_progress_view_all_results")}
            </>
          ) : (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("evaluation_progress_processing")}
            </>
          )}
        </Button>
        </div>
        <div>

        <Button
          onClick={onStartNewAnswerEvaluation}
          disabled={overallStatus !== "completed"}
          variant={overallStatus === "completed" ? "primary" : "secondary"}
          className="whitespace-nowrap py-6"
        >
          {t("evaluation_start_new_answer_evaluation")}
        </Button>
        </div>
      </div>
    </div>
  );
}
