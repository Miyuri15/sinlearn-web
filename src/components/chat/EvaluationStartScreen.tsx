import React from "react";
import { 
  Check, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  FileInput, 
  Settings, 
  Edit3, 
  Send, 
  RefreshCw, 
  X, 
  Sparkles, 
  History,
  File,
  Upload
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

interface EvaluationStartScreenProps {
  onOpenRubric: () => void;
  onOpenSyllabus: () => void;
  onOpenQuestions: () => void;
  onOpenMarks: () => void;
  onClearAnswerSheets: () => void | Promise<void>;
  onUploadAnswers: (files: File[]) => void | Promise<void>;
  onProcess: () => void | Promise<void>;
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void | Promise<void>;
  onReplaceFile: (index: number, file: File) => void | Promise<void>;
  onStartEvaluation: () => void | Promise<void>;
  onViewHistory: () => void;
  isProcessing?: boolean;
  isUploading?: boolean;
  hasMarks?: boolean;
  rubricSet?: boolean;
  syllabusSet?: boolean;
  questionsSet?: boolean;
  processingStatus?: "idle" | "processing" | "completed" | "needs_reprocessing";
}

export default function EvaluationStartScreen({
  onOpenRubric,
  onOpenSyllabus,
  onOpenQuestions,
  onOpenMarks,
  onClearAnswerSheets,
  onUploadAnswers,
  onProcess,
  onStartEvaluation,
  onViewHistory,
  uploadedFiles,
  onRemoveFile,
  onReplaceFile,
  isProcessing = false,
  isUploading = false,
  hasMarks = false,
  rubricSet = false,
  syllabusSet = false,
  questionsSet = false,
  processingStatus = "idle"
}: EvaluationStartScreenProps) {
  const { t } = useTranslation("chat");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const replaceInputRef = React.useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = React.useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadAnswers(Array.from(e.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && replacingIndex !== null) {
      onReplaceFile(replacingIndex, e.target.files[0]);
    }
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
    }
    setReplacingIndex(null);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerReplaceUpload = (index: number) => {
    setReplacingIndex(index);
    replaceInputRef.current?.click();
  };

  const isReadyToProcess = rubricSet && syllabusSet && questionsSet && uploadedFiles.length > 0;
  const isProcessingCompleted = processingStatus === "completed";
  const needsReprocessing = processingStatus === "needs_reprocessing";

  const steps = [
    { labelKey: "evaluation_start_step_rubric", icon: FileText, action: onOpenRubric, status: rubricSet ? "completed" : "pending", disabled: isUploading },
    { labelKey: "evaluation_start_step_syllabus", icon: BookOpen, action: onOpenSyllabus, status: syllabusSet ? "completed" : "pending", disabled: isUploading },
    { labelKey: "evaluation_start_step_questions", icon: HelpCircle, action: onOpenQuestions, status: questionsSet ? "completed" : "pending", disabled: isUploading },
    { labelKey: "evaluation_start_step_answers", icon: FileInput, action: triggerFileUpload, status: uploadedFiles.length > 0 ? "completed" : "pending", disabled: isUploading },
    { labelKey: "evaluation_start_step_process", icon: Settings, action: isReadyToProcess ? onProcess : () => {}, status: isProcessingCompleted ? "completed" : "pending", disabled: !isReadyToProcess || isUploading },
    { labelKey: "evaluation_start_step_marks", icon: Edit3, action: isProcessingCompleted ? onOpenMarks : () => {}, status: hasMarks ? "completed" : "pending", disabled: !isProcessingCompleted || isUploading },
    { labelKey: "evaluation_start_step_send", icon: Send, action: onStartEvaluation, status: "pending", disabled: !isProcessingCompleted || !hasMarks || isUploading },
  ];

  return (
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

      {/* Uploading Banner */}
      {isUploading && (
        <div
          className="w-full bg-gray-50 dark:bg-[#111111]/50 border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-4 flex items-center gap-3"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="p-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-full">
            <Upload size={16} className="animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("evaluation_start_uploading")}</p>
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-blue-600/70 animate-pulse" />
            </div>
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
          const isNext = !step.disabled && step.status !== 'completed' && (index === 0 || steps[index-1].status === 'completed');
          
          return (
            <React.Fragment key={index}>
              {/* Connecting Line */}
              {index > 0 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                  steps[index - 1].status === 'completed' 
                    ? 'bg-blue-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
              
              <div className="flex flex-col items-center relative group">
                <button 
                  onClick={step.action}
                  disabled={step.disabled}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 active:scale-95
                    ${step.status === 'completed' 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 scale-105' 
                      : step.disabled
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-blue-400 hover:text-blue-400 hover:shadow-md'}
                    ${isNext ? 'ring-4 ring-blue-100 dark:ring-blue-900/30 border-blue-500 text-blue-500 animate-pulse' : ''}
                  `}
                >
                  {step.status === 'completed' ? (
                    <Check size={22} />
                  ) : (
                    <step.icon size={22} />
                  )}
                </button>
                <span className={`absolute -bottom-8 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                  step.status === 'completed' ? 'text-blue-600 dark:text-blue-400' :
                  isNext ? 'text-blue-500 dark:text-blue-400 font-bold' :
                  'text-gray-400 dark:text-gray-500'
                }`}>
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
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-600">
                    <File size={20} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
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
            {uploadedFiles.length < 10 && (
              <button
                onClick={triggerFileUpload}
                disabled={isUploading}
                className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={18} />
                <span>{t("evaluation_start_upload_more_answer_sheets", { remaining: 10 - uploadedFiles.length })}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t("evaluation_start_no_answer_sheets")}</p>
            <Button onClick={triggerFileUpload} variant="ghost" disabled={isUploading}>
              {isUploading ? t("evaluation_start_uploading") : t("evaluation_start_upload_answer_sheets")}
            </Button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-4">
        <Button 
          onClick={onProcess}
          disabled={!isReadyToProcess || processingStatus === "processing" || isUploading}
          className={`w-full h-12 rounded-full text-lg font-medium flex items-center justify-center gap-2
            ${!isReadyToProcess || processingStatus === "processing"
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400' 
              : 'bg-blue-700 hover:bg-blue-800 text-white'}
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
  );
}

function StatusItem({ label, status, isActive, isCompleted }: { label: string; status: string; isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white transition-colors duration-300
          ${isCompleted ? 'bg-blue-600' : isActive ? 'bg-blue-400 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}
        `}>
          {isCompleted ? <Check size={12} /> : isActive ? <div className="w-2 h-2 bg-white rounded-full animate-bounce" /> : null}
        </div>
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300
        ${isCompleted 
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
          : isActive 
            ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
      `}>
        {status}
      </span>
    </div>
  );
}
