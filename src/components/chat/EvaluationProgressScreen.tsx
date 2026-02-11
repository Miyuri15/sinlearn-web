import React, { useState, useEffect, useRef } from "react";
import { Check, FileText, Loader2, Eye, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { evaluateAnswerStream, StreamProgressEvent, getAnswerDocuments } from "@/lib/api/evaluation";

interface EvaluationProgressScreenProps {
  evaluationSessionId: string;
  answerResourceIds: string[];
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

function mapBackendStepToFrontend(backendStep: any): ProcessingStep {
  switch (backendStep) {
    case "evaluating_answer_sheets": return "analyzing";
    case "calculating_marks": return "marking";
    case "generating_feedback": return "feedback";
    case "preparing_report": return "report";
    case "completed": return "done";
    default: return "analyzing"; // Default fallback
  }
}

export default function EvaluationProgressScreen({
  evaluationSessionId,
  answerResourceIds,
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

  // Backend integration: listen to evaluation progress for EACH answer
  useEffect(() => {
    if (!evaluationSessionId || !answerResourceIds || answerResourceIds.length === 0) return;

    let isMounted = true;
    const abortController = new AbortController();

    // Fetch answer documents and start evaluation streams
    const initializeAndStartEvaluation = async () => {
      try {
        // Fetch answer documents for this evaluation session
        const answerDocuments = await getAnswerDocuments(evaluationSessionId);

        if (!isMounted) return;

        // Create a map from resource_id to answer_document_id
        const resourceToAnswerMap = new Map<string, string>();
        answerDocuments.forEach((doc: any) => {
          if (doc.resource_id && doc.id) {
            resourceToAnswerMap.set(doc.resource_id, doc.id);
          }
        });

        // Initialize progress for each answer using resource IDs for display
        const initial = answerResourceIds.map((resourceId, idx) => ({
          id: resourceId, // Keep resource ID for UI tracking
          name: answerSheets[idx]?.name || `Answer ${idx + 1}`,
          status: "pending" as FileStatus,
          step: "analyzing" as ProcessingStep,
          progress: 0,
        }));
        setFilesProgress(initial);
        setOverallStatus("processing");

        // Start evaluation streams using answer document IDs
        const startAllStreams = async () => {
          const promises = answerResourceIds.map(async (resourceId) => {
            const answerDocId = resourceToAnswerMap.get(resourceId);

            if (!answerDocId) {
              console.error(`No answer document found for resource ${resourceId}`);
              if (isMounted) {
                setFilesProgress((prev) =>
                  prev.map((f) => f.id === resourceId ? { ...f, status: 'failed' } : f)
                );
              }
              return;
            }

            try {
              await evaluateAnswerStream({
                answerId: answerDocId, // Use answer document ID, not resource ID
                onEvent: (evt: StreamProgressEvent) => {
                  if (!isMounted) return;

                  setFilesProgress((prev) =>
                    prev.map((file) => {
                      if (file.id !== resourceId) return file; // Match by resource ID for UI

                      // Parse event
                      // Expectation: backend sends either JSON or raw text
                      // If JSON: { step, progress, status, ... }
                      // If text: "data: ..."

                      let newStatus = file.status;
                      let newProgress = file.progress;
                      let newStep = file.step;

                      try {
                        const data = typeof evt.raw === "string" && evt.raw.trim().startsWith("{")
                          ? JSON.parse(evt.raw)
                          : null;

                        if (data) {
                          if (data.status) newStatus = data.status;
                          if (typeof data.progress === "number") newProgress = data.progress;
                          if (data.step) newStep = mapBackendStepToFrontend(data.step);
                        } else if (evt.step) {
                          // Fallback from raw text guessing
                          newStep = mapBackendStepToFrontend(evt.step);
                        }

                        // Auto-complete logic
                        if (newStatus === "completed" || newProgress >= 100 || newStep === 'done') {
                          newStatus = "completed";
                          newProgress = 100;
                          newStep = "done";
                        }

                        // If we just started processing
                        if (newStatus === 'pending' && (newProgress > 0 || (newStep !== 'analyzing'))) {
                          newStatus = 'processing';
                        }

                      } catch (e) {
                        console.error("Error parsing progress event", e);
                      }

                      return { ...file, status: newStatus as FileStatus, progress: newProgress, step: newStep as ProcessingStep };
                    })
                  );
                },
                signal: abortController.signal,
              });

              // When specific stream finishes successfully (resolves)
              if (isMounted) {
                setFilesProgress((prev) =>
                  prev.map((f) => f.id === resourceId ? { ...f, status: 'completed', progress: 100, step: 'done' } : f)
                );
              }
            } catch (err: any) {
              if (err.name === "AbortError" || abortController.signal.aborted) {
                return;
              }
              console.error(`Error streaming answer ${answerDocId}`, err);
              if (isMounted) {
                setFilesProgress((prev) =>
                  prev.map((f) => f.id === resourceId ? { ...f, status: 'failed' } : f)
                );
              }
            }
          });

          await Promise.allSettled(promises);
          if (isMounted) {
            setOverallStatus("completed");
          }
        };

        startAllStreams();
      } catch (error) {
        console.error("Error fetching answer documents:", error);
        if (isMounted) {
          // Mark all as failed if we can't fetch answer documents
          setFilesProgress((prev) =>
            prev.map((f) => ({ ...f, status: 'failed' as FileStatus }))
          );
          setOverallStatus("completed");
        }
      }
    };

    initializeAndStartEvaluation();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [evaluationSessionId, answerResourceIds, answerSheets]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
        {filesProgress.map((file) => (
          <div
            key={file.id}
            className={`
              relative overflow-hidden p-5 rounded-xl border transition-all duration-300
              ${file.status === 'completed'
                ? 'bg-white dark:bg-[#111111] border-green-200 dark:border-green-900/30 shadow-sm'
                : file.status === 'failed'
                  ? 'bg-white dark:bg-[#111111] border-red-200 dark:border-red-900/30 shadow-sm'
                  : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-[#2a2a2a] shadow-sm'
              }
            `}
          >
            {/* Background Progress Fill (Optional subtle effect) */}
            {(file.status === 'processing' || file.status === 'pending') && (
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
                    : file.status === 'failed'
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
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
                      : file.status === "failed"
                        ? "Failed"
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
                ) : file.status === 'failed' ? (
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <span className="text-xl font-bold">!</span>
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
                  className={`h-full rounded-full transition-all duration-300 ${file.status === 'completed' ? 'bg-green-500' : file.status === 'failed' ? 'bg-red-500' : 'bg-blue-600'
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
