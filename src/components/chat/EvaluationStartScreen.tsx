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
  File
} from "lucide-react";
import Button from "@/components/ui/Button";

interface EvaluationStartScreenProps {
  onOpenRubric: () => void;
  onOpenSyllabus: () => void;
  onOpenQuestions: () => void;
  onOpenMarks: () => void;
  onUploadAnswers: (files: File[]) => void;
  onProcess: () => void;
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void;
  onReplaceFile: (index: number, file: File) => void;
  isProcessing?: boolean;
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
  onUploadAnswers,
  onProcess,
  uploadedFiles,
  onRemoveFile,
  onReplaceFile,
  isProcessing = false,
  hasMarks = false,
  rubricSet = false,
  syllabusSet = false,
  questionsSet = false,
  processingStatus = "idle"
}: EvaluationStartScreenProps) {
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
    { label: "Rubric", icon: FileText, action: onOpenRubric, status: rubricSet ? "completed" : "pending" },
    { label: "Syllabus", icon: BookOpen, action: onOpenSyllabus, status: syllabusSet ? "completed" : "pending" },
    { label: "Questions", icon: HelpCircle, action: onOpenQuestions, status: questionsSet ? "completed" : "pending" },
    { label: "Answers", icon: FileInput, action: triggerFileUpload, status: uploadedFiles.length > 0 ? "completed" : "pending" },
    { label: "Process", icon: Settings, action: isReadyToProcess ? onProcess : () => {}, status: isProcessingCompleted ? "completed" : "pending", disabled: !isReadyToProcess },
    { label: "Marks", icon: Edit3, action: isProcessingCompleted ? onOpenMarks : () => {}, status: hasMarks ? "completed" : "pending", disabled: !isProcessingCompleted },
    { label: "Send", icon: Send, action: () => {}, status: "pending", disabled: !isProcessingCompleted || !hasMarks },
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
        Start a new evaluation
      </h1>

      {/* Reprocessing Banner */}
      {needsReprocessing && (
        <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center gap-3 text-amber-800 dark:text-amber-200">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full">
            <RefreshCw size={16} />
          </div>
          <p className="text-sm font-medium">
            Attachments have changed. You must re-process documents before proceeding to evaluation.
          </p>
        </div>
      )}

      {/* Stepper */}

      {/* Stepper */}
      <div className="w-full flex items-center justify-between relative px-4">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
        
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center bg-gray-100 dark:bg-[#0C0C0C] px-2">
            <button 
              onClick={step.action}
              disabled={step.disabled}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                ${step.status === 'completed' 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : step.disabled
                    ? 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 hover:border-blue-400 hover:text-blue-400'}
              `}
            >
              {step.status === 'completed' ? (
                <Check size={20} />
              ) : (
                <step.icon size={20} />
              )}
            </button>
            <span className={`mt-2 text-xs font-medium ${step.disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Uploaded Answer Sheets Card */}
      <div className="w-full bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-200">
          Uploaded Answer Sheets
        </h3>
        
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
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <RefreshCw size={14} />
                    Replace attachment
                  </button>
                  <button 
                    onClick={() => onRemoveFile(index)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    <X size={14} />
                    Remove attachment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No answer sheets uploaded yet</p>
            <Button onClick={triggerFileUpload} variant="ghost">
              Upload Answer Sheets
            </Button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-4">
        <Button 
          onClick={onProcess}
          disabled={!isReadyToProcess || processingStatus === "processing"}
          className={`w-full h-12 rounded-full text-lg font-medium flex items-center justify-center gap-2
            ${!isReadyToProcess || processingStatus === "processing"
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400' 
              : 'bg-blue-700 hover:bg-blue-800 text-white'}
          `}
        >
          <Sparkles size={20} />
          {processingStatus === "processing" ? "Processing..." : needsReprocessing ? "Re-process Documents" : "Process Documents"}
        </Button>
        
        <Button 
          variant="ghost"
          className="w-full h-12 rounded-full text-lg font-medium flex items-center justify-center gap-2 border-gray-300 dark:border-gray-600"
        >
          <History size={20} />
          View results history
        </Button>
      </div>

      {/* Status List */}
      <div className="w-full bg-gray-50 dark:bg-[#111111]/50 rounded-xl p-4 space-y-4">
        <StatusItem 
          label="Answer sheets processing" 
          status={processingStatus === "idle" ? "Pending" : processingStatus === "processing" ? "Processing" : "Completed"} 
          isActive={processingStatus === "processing"}
          isCompleted={processingStatus === "completed"}
        />
        <StatusItem 
          label="Question paper processing" 
          status={processingStatus === "idle" ? "Pending" : processingStatus === "processing" ? "Processing" : "Completed"} 
          isActive={processingStatus === "processing"}
          isCompleted={processingStatus === "completed"}
        />
        <StatusItem 
          label="Syllabus processing" 
          status={processingStatus === "idle" ? "Pending" : processingStatus === "processing" ? "Processing" : "Completed"} 
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
