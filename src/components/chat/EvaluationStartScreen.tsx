import React from "react";
import {
  Check,
  FileText,
  BookOpen,
  HelpCircle,
  FileInput,
  Settings,
  Edit3,
  ScrollText,
  Send,
  RefreshCw,
  X,
  Sparkles,
  History,
  File,
  Upload,
  Eye,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import FilePreviewModal from "@/components/chat/uploads/FilePreviewModal";
import { getResourceExtractedText, viewResource } from "@/lib/api/resource";
import { getApiErrorMessage } from "@/lib/api/client";
import { LimitWarning } from "@/components/pricing/LimitWarning";
import { useUserUsage } from "@/hooks/usePricing";
import { USAGE_POLL_INTERVAL } from "@/lib/constants";

type PreviewType = "image" | "video" | "audio" | "pdf" | "file";

interface EvaluationStartScreenProps {
  onOpenRubric: () => void;
  onOpenSyllabus: () => void;
  onOpenQuestions: () => void;
  onOpenMarks: () => void;
  onOpenMarkingSchema: () => void;
  onClearAnswerSheets: () => void | Promise<void>;
  onUploadAnswers: (files: File[]) => void | Promise<void>;
  onProcess: () => void | Promise<void>;
  uploadedFiles: File[];
  answerResourceIds?: string[];
  onRemoveFile: (index: number) => void | Promise<void>;
  onReplaceFile: (index: number, file: File) => void | Promise<void>;
  onStartEvaluation: () => void | Promise<void>;
  onViewHistory: () => void;
  isProcessing?: boolean;
  isUploading?: boolean;
  isPaperConfigLoading?: boolean;
  isMarkingSchemaLoading?: boolean;
  hasMarks?: boolean;
  hasMarkingSchema?: boolean;
  rubricSet?: boolean;
  syllabusSet?: boolean;
  questionsSet?: boolean;
  processingStatus?: "idle" | "processing" | "completed" | "needs_reprocessing";
  uploadProgress?: { current: number; total: number };
  processProgress?: { current: number; total: number };
}

export default function EvaluationStartScreen({
  onOpenRubric,
  onOpenSyllabus,
  onOpenQuestions,
  onOpenMarks,
  onOpenMarkingSchema,
  onClearAnswerSheets,
  onUploadAnswers,
  onProcess,
  onStartEvaluation,
  onViewHistory,
  uploadedFiles,
  answerResourceIds = [],
  onRemoveFile,
  onReplaceFile,
  isProcessing = false,
  isUploading = false,
  isPaperConfigLoading = false,
  isMarkingSchemaLoading = false,
  hasMarks = false,
  hasMarkingSchema = false,
  rubricSet = false,
  syllabusSet = false,
  questionsSet = false,
  processingStatus = "idle",
  uploadProgress,
  processProgress,
}: EvaluationStartScreenProps) {
  const { t } = useTranslation("chat");
  const { usage } = useUserUsage(USAGE_POLL_INTERVAL);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const replaceInputRef = React.useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = React.useState<number | null>(
    null,
  );
  const [previewAnswerSheet, setPreviewAnswerSheet] = React.useState<{
    resourceId?: string;
    url: string;
    type: PreviewType;
    extractedText: string;
    isExtracting: boolean;
    extractedTextError: string | null;
    extractedTextPage: number;
    extractedTextPageSize: number;
    extractedTextTotalPages: number;
    extractedTextReturnedPages: number;
    extractedTextHasNext: boolean;
    extractedTextHasPrevious: boolean;
    previewError?: string | null;
  } | null>(null);

  React.useEffect(() => {
    return () => {
      if (previewAnswerSheet?.url) {
        URL.revokeObjectURL(previewAnswerSheet.url);
      }
    };
  }, [previewAnswerSheet?.url]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const allowedFiles =
        remainingAnswerSlots === null ? files : files.slice(0, remainingAnswerSlots);
      if (allowedFiles.length > 0) {
        onUploadAnswers(allowedFiles);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files &&
      e.target.files.length > 0 &&
      replacingIndex !== null
    ) {
      onReplaceFile(replacingIndex, e.target.files[0]);
    }
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
    }
    setReplacingIndex(null);
  };

  const triggerFileUpload = () => {
    if (isAnswerUploadLimitReached) return;
    fileInputRef.current?.click();
  };

  const triggerReplaceUpload = (index: number) => {
    setReplacingIndex(index);
    replaceInputRef.current?.click();
  };

  const resolvePreviewType = (
    file: File,
    fallbackMimeType?: string,
  ): PreviewType => {
    const mime = (fallbackMimeType || file.type || "").toLowerCase();
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.includes("pdf")) return "pdf";

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".pdf")) return "pdf";
    if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(fileName)) return "image";
    if (/\.(mp4|webm|mov|avi|mkv)$/.test(fileName)) return "video";
    if (/\.(mp3|wav|ogg|m4a|aac)$/.test(fileName)) return "audio";
    return "file";
  };

  const handlePreviewAnswerSheet = async (file: File, index: number) => {
    const resourceId = answerResourceIds[index];

    try {
      if (!resourceId) {
        const url = URL.createObjectURL(file);
        setPreviewAnswerSheet((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url);
          return {
            url,
            type: resolvePreviewType(file),
            extractedText: "",
            isExtracting: false,
            extractedTextError: null,
            extractedTextPage: 1,
            extractedTextPageSize: 1,
            extractedTextTotalPages: 0,
            extractedTextReturnedPages: 0,
            extractedTextHasNext: false,
            extractedTextHasPrevious: false,
            previewError: null,
          };
        });
        return;
      }

      const [blobResult, extractedTextResult] = await Promise.allSettled([
        viewResource(resourceId),
        getResourceExtractedText(resourceId, { page: 1, pageSize: 1 }),
      ]);

      if (blobResult.status === "rejected") {
        throw blobResult.reason;
      }

      let extractedText = "";
      let extractedTextError: string | null = null;
      let extractedTextMeta = {
        page: 1,
        pageSize: 1,
        totalPages: 0,
        returnedPages: 0,
        hasNext: false,
        hasPrevious: false,
      };

      if (extractedTextResult.status === "fulfilled") {
        extractedText = extractedTextResult.value.extracted_text || "";
        extractedTextMeta = {
          page: extractedTextResult.value.page || 1,
          pageSize: extractedTextResult.value.page_size || 1,
          totalPages: extractedTextResult.value.total_pages || 0,
          returnedPages: extractedTextResult.value.returned_pages || 0,
          hasNext: extractedTextResult.value.has_next,
          hasPrevious: extractedTextResult.value.has_previous,
        };
      } else {
        console.error(
          "Failed to load extracted text",
          extractedTextResult.reason,
        );
        extractedTextError = getApiErrorMessage(
          extractedTextResult.reason,
          "Failed to load extracted text.",
        );
      }

      const url = URL.createObjectURL(blobResult.value);
      setPreviewAnswerSheet((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return {
          resourceId,
          url,
          type: resolvePreviewType(file, blobResult.value.type),
          extractedText,
          isExtracting: false,
          extractedTextError,
          extractedTextPage: extractedTextMeta.page,
          extractedTextPageSize: extractedTextMeta.pageSize,
          extractedTextTotalPages: extractedTextMeta.totalPages,
          extractedTextReturnedPages: extractedTextMeta.returnedPages,
          extractedTextHasNext: extractedTextMeta.hasNext,
          extractedTextHasPrevious: extractedTextMeta.hasPrevious,
          previewError: null,
        };
      });
    } catch (error) {
      console.error("Failed to preview answer sheet", error);
      setPreviewAnswerSheet((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return {
          resourceId,
          url: "",
          type: "file",
          extractedText: "",
          isExtracting: false,
          extractedTextError: null,
          extractedTextPage: 1,
          extractedTextPageSize: 1,
          extractedTextTotalPages: 0,
          extractedTextReturnedPages: 0,
          extractedTextHasNext: false,
          extractedTextHasPrevious: false,
          previewError: getApiErrorMessage(
            error,
            "Failed to preview answer sheet.",
          ),
        };
      });
    }
  };

  const isReadyToProcess =
    rubricSet && syllabusSet && questionsSet && uploadedFiles.length > 0;
  const isProcessingCompleted = processingStatus === "completed";
  const needsReprocessing = processingStatus === "needs_reprocessing";
  const dailySessionLimitReached = Boolean(
    usage &&
      usage.today.limit > 0 &&
      usage.today.evaluationSessions >= usage.today.limit,
  );
  const evaluationsPerSessionLimit = usage?.limits.evaluationsPerSession ?? 10;
  const hasEvaluationUploadLimit = evaluationsPerSessionLimit !== null;
  const remainingAnswerSlots = hasEvaluationUploadLimit
    ? Math.max(evaluationsPerSessionLimit - uploadedFiles.length, 0)
    : null;
  const isAnswerUploadLimitReached =
    remainingAnswerSlots !== null && remainingAnswerSlots <= 0;

  const steps = [
    {
      labelKey: "evaluation_start_step_rubric",
      icon: FileText,
      action: onOpenRubric,
      status: rubricSet ? "completed" : "pending",
      disabled: isUploading,
    },
    {
      labelKey: "evaluation_start_step_syllabus",
      icon: BookOpen,
      action: onOpenSyllabus,
      status: syllabusSet ? "completed" : "pending",
      disabled: isUploading,
    },
    {
      labelKey: "evaluation_start_step_questions",
      icon: HelpCircle,
      action: onOpenQuestions,
      status: questionsSet ? "completed" : "pending",
      disabled: isUploading,
    },
    {
      labelKey: "evaluation_start_step_answers",
      icon: FileInput,
      action: triggerFileUpload,
      status: uploadedFiles.length > 0 ? "completed" : "pending",
      disabled: isUploading || isAnswerUploadLimitReached,
    },
    {
      labelKey: "evaluation_start_step_process",
      icon: Settings,
      action: isReadyToProcess ? onProcess : () => {},
      status: isProcessingCompleted ? "completed" : "pending",
      disabled: !isReadyToProcess || isUploading,
    },
    {
      labelKey: "evaluation_start_step_marks",
      icon: Edit3,
      action: isProcessingCompleted ? onOpenMarks : () => {},
      status: isPaperConfigLoading
        ? "loading"
        : hasMarks
          ? "completed"
          : "pending",
      disabled: !isProcessingCompleted || isUploading || isPaperConfigLoading,
    },
    {
      labelKey: "evaluation_start_step_schema",
      icon: ScrollText,
      action:
        isProcessingCompleted && hasMarks ? onOpenMarkingSchema : () => {},
      status: isMarkingSchemaLoading
        ? "loading"
        : hasMarkingSchema
          ? "completed"
          : "pending",
      disabled:
        !isProcessingCompleted ||
        !hasMarks ||
        isUploading ||
        isMarkingSchemaLoading,
    },
    {
      labelKey: "evaluation_start_step_send",
      icon: Send,
      action: onStartEvaluation,
      status: "pending",
      disabled:
        !isProcessingCompleted ||
        !hasMarks ||
        !hasMarkingSchema ||
        isUploading ||
        dailySessionLimitReached,
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        />
        <input
          type="file"
          ref={replaceInputRef}
          className="hidden"
          onChange={handleReplaceChange}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        />
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {t("evaluation_start_title")}
        </h1>

        <div className="w-full">
          <LimitWarning usage={usage} type="evaluation" />
          {dailySessionLimitReached && usage && (
            <div className="mb-3 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Daily evaluation session limit reached</p>
                <p>
                  You have used {usage.today.evaluationSessions} of{" "}
                  {usage.today.limit} sessions. Resets at{" "}
                  {new Date(usage.today.resetAt).toLocaleString()}.
                </p>
              </div>
            </div>
          )}
          {isAnswerUploadLimitReached && (
            <div className="mb-3 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Evaluation upload limit reached</p>
                <p>
                  Your current plan allows {evaluationsPerSessionLimit} answer
                  sheets per evaluation session.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Uploading Banner - Only show for real answer sheet uploads, not background config loading */}
        {isUploading && !isPaperConfigLoading && (
          <div
            className="w-full bg-gray-100 dark:bg-[#111111] border border-blue-200 dark:border-blue-900/30 rounded-xl p-5 flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600">
              <Upload size={20} className="animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {uploadProgress && uploadProgress.total > 0
                    ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} documents...`
                    : t("evaluation_start_uploading")}
                </p>
                {uploadProgress && uploadProgress.total > 0 && (
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(
                      (uploadProgress.current / uploadProgress.total) * 100,
                    )}
                    %
                  </span>
                )}
              </div>
              <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  style={{
                    width:
                      uploadProgress && uploadProgress.total > 0
                        ? `${(uploadProgress.current / uploadProgress.total) * 100}%`
                        : "30%",
                  }}
                />
              </div>
              {uploadProgress && uploadProgress.total > 0 && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Please wait while we process your documents for evaluation.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Processing Banner */}
        {processingStatus === "processing" && (
          <div
            className="w-full bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-5 flex items-center gap-4 shadow-sm"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {processProgress && processProgress.total > 0
                    ? `Processing ${processProgress.current} of ${processProgress.total} documents...`
                    : t("evaluation_start_processing")}
                </p>
                {processProgress && processProgress.total > 0 && (
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(
                      (processProgress.current / processProgress.total) * 100,
                    )}
                    %
                  </span>
                )}
              </div>
              <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  style={{
                    width:
                      processProgress && processProgress.total > 0
                        ? `${(processProgress.current / processProgress.total) * 100}%`
                        : "10%",
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Analyzing student answers and mapping to the rubric. This may
                take a few moments.
              </p>
            </div>
          </div>
        )}

        {/* Reprocessing Banner */}
        {needsReprocessing && (
          <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center gap-3 text-amber-800 dark:text-amber-200">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full">
              <RefreshCw size={16} />
            </div>
            <p className="text-sm font-medium">
              {t("evaluation_start_reprocess_banner")}
            </p>
          </div>
        )}

        {/* Stepper */}

        {/* Stepper */}
        <div className="w-full flex items-center px-2 mb-6">
          {steps.map((step, index) => {
            const isNext =
              !step.disabled &&
              step.status !== "completed" &&
              (index === 0 || steps[index - 1].status === "completed");

            return (
              <React.Fragment key={index}>
                {/* Connecting Line */}
                {index > 0 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                      steps[index - 1].status === "completed"
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}

                <div className="flex flex-col items-center relative group">
                  <button
                    onClick={step.action}
                    disabled={step.disabled}
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 active:scale-95
                    ${
                      step.status === "completed"
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 scale-105"
                        : step.disabled
                          ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-blue-400 hover:text-blue-400 hover:shadow-md"
                    }
                    ${isNext ? "ring-4 ring-blue-100 dark:ring-blue-900/30 border-blue-500 text-blue-500 animate-pulse" : ""}
                  `}
                  >
                    {step.status === "completed" ? (
                      <Check size={22} />
                    ) : (
                      <step.icon size={22} />
                    )}
                  </button>
                  <span
                    className={`absolute -bottom-8 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                      step.status === "completed"
                        ? "text-blue-600 dark:text-blue-400"
                        : isNext
                          ? "text-blue-500 dark:text-blue-400 font-bold"
                          : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {t(step.labelKey)}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Uploaded Answer Sheets Card */}
        <div className="w-full bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 mt-20 mb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t("evaluation_start_uploaded_answer_sheets")}
              </h3>
            </div>
            <div>
              {uploadedFiles.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={onClearAnswerSheets}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <X size={18} />
                  {t("evaluation_start_clear_answer_sheets")}
                </Button>
              )}
            </div>
          </div>

          {uploadedFiles.length > 0 ? (
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => void handlePreviewAnswerSheet(file, index)}
                    className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden text-left"
                    title={`Preview ${file.name}`}
                  >
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600">
                      <File size={20} />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {file.name}
                    </span>
                  </button>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => void handlePreviewAnswerSheet(file, index)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400 font-medium"
                      title={`Preview ${file.name}`}
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                    <button
                      onClick={() => triggerReplaceUpload(index)}
                      disabled={isUploading}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={14} />
                      {t("evaluation_start_replace_attachment")}
                    </button>
                    <button
                      onClick={() => onRemoveFile(index)}
                      disabled={isUploading}
                      className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={14} />
                      {t("evaluation_start_remove_attachment")}
                    </button>
                  </div>
                </div>
              ))}
              {!isAnswerUploadLimitReached && (
                <button
                  onClick={triggerFileUpload}
                  disabled={isUploading}
                  className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload size={18} />
                  <span>
                    {hasEvaluationUploadLimit
                      ? t("evaluation_start_upload_more_answer_sheets", {
                          remaining: remainingAnswerSlots,
                        })
                      : t("evaluation_start_upload_answer_sheets")}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t("evaluation_start_no_answer_sheets")}
              </p>
              <Button
                onClick={triggerFileUpload}
                variant="ghost"
                disabled={isUploading}
              >
                {isUploading
                  ? t("evaluation_start_uploading")
                  : t("evaluation_start_upload_answer_sheets")}
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <Button
            onClick={onProcess}
            disabled={
              !isReadyToProcess ||
              processingStatus === "processing" ||
              isUploading ||
              dailySessionLimitReached
            }
            className={`w-full h-12 rounded-full text-lg font-medium flex items-center justify-center gap-2
            ${
              !isReadyToProcess || processingStatus === "processing"
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }
          `}
          >
            <Sparkles size={20} />
            {processingStatus === "processing"
              ? t("evaluation_start_processing")
              : needsReprocessing
                ? t("evaluation_start_reprocess_documents")
                : t("evaluation_start_process_documents")}
          </Button>

          <Button
            variant="ghost"
            onClick={onViewHistory}
            className="w-full h-12 rounded-full text-lg font-medium flex items-center justify-center gap-2 border-gray-300 dark:border-gray-600"
          >
            <History size={20} />
            {t("evaluation_start_view_results_history")}
          </Button>
        </div>

        {/* Status List */}
        <div className="w-full bg-gray-50 dark:bg-[#111111]/50 rounded-xl p-4 space-y-4">
          <StatusItem
            label={t("evaluation_start_status_answer_sheets")}
            status={
              processingStatus === "idle"
                ? t("evaluation_start_status_pending")
                : processingStatus === "processing"
                  ? t("evaluation_start_status_processing")
                  : t("evaluation_start_status_completed")
            }
            isActive={processingStatus === "processing"}
            isCompleted={processingStatus === "completed"}
          />
          <StatusItem
            label={t("evaluation_start_status_question_paper")}
            status={
              processingStatus === "idle"
                ? t("evaluation_start_status_pending")
                : processingStatus === "processing"
                  ? t("evaluation_start_status_processing")
                  : t("evaluation_start_status_completed")
            }
            isActive={processingStatus === "processing"}
            isCompleted={processingStatus === "completed"}
          />
          <StatusItem
            label={t("evaluation_start_status_syllabus")}
            status={
              processingStatus === "idle"
                ? t("evaluation_start_status_pending")
                : processingStatus === "processing"
                  ? t("evaluation_start_status_processing")
                  : t("evaluation_start_status_completed")
            }
            isActive={processingStatus === "processing"}
            isCompleted={processingStatus === "completed"}
          />
        </div>
      </div>
      {previewAnswerSheet && (
        <FilePreviewModal
          resourceId={previewAnswerSheet.resourceId}
          url={previewAnswerSheet.url}
          type={previewAnswerSheet.type}
          extractedText={previewAnswerSheet.extractedText}
          isExtracting={previewAnswerSheet.isExtracting}
          extractedTextError={previewAnswerSheet.extractedTextError}
          extractedTextPage={previewAnswerSheet.extractedTextPage}
          extractedTextPageSize={previewAnswerSheet.extractedTextPageSize}
          extractedTextTotalPages={previewAnswerSheet.extractedTextTotalPages}
          extractedTextReturnedPages={
            previewAnswerSheet.extractedTextReturnedPages
          }
          extractedTextHasNext={previewAnswerSheet.extractedTextHasNext}
          extractedTextHasPrevious={previewAnswerSheet.extractedTextHasPrevious}
          previewError={previewAnswerSheet.previewError}
          onClose={() => {
            URL.revokeObjectURL(previewAnswerSheet.url);
            setPreviewAnswerSheet(null);
          }}
        />
      )}
    </>
  );
}

function StatusItem({
  label,
  status,
  isActive,
  isCompleted,
}: {
  label: string;
  status: string;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-white transition-colors duration-300
          ${isCompleted ? "bg-blue-600" : isActive ? "bg-blue-400 animate-pulse" : "bg-gray-300 dark:bg-gray-700"}
        `}
        >
          {isCompleted ? (
            <Check size={12} />
          ) : isActive ? (
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
          ) : null}
        </div>
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300
        ${
          isCompleted
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            : isActive
              ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
              : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        }
      `}
      >
        {status}
      </span>
    </div>
  );
}
