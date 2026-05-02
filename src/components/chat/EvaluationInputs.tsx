"use client";

import { Send, Paperclip, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserUsage } from "@/hooks/usePricing";

type EvaluationInputsProps = Readonly<{
  totalMarks: number;
  setTotalMarks: (value: number) => void;

  mainQuestions: number;
  setMainQuestions: (value: number) => void;

  requiredQuestions: number;
  setRequiredQuestions: (value: number) => void;

  onUpload?: (files: File[]) => void; // Optional upload handler
  onSend: () => void;
  onOpenMarks: () => void;
  uploadedFilesCount?: number; // Track uploaded files count
}>;

export default function EvaluationInputs({
  onSend,
  onUpload,
  onOpenMarks,
  uploadedFilesCount = 0,
}: EvaluationInputsProps) {
  const { t } = useTranslation("chat");
  const { usage } = useUserUsage();
  const evaluationLimit = usage?.limits.evaluationsPerSession ?? 10;
  const remainingSlots =
    evaluationLimit === null ? null : evaluationLimit - uploadedFilesCount;
  const isUploadDisabled = remainingSlots !== null && remainingSlots <= 0;

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-2 sm:gap-3 w-full">
      {/* ATTACH BUTTON */}
      <div className="w-full sm:w-auto">
        <input
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          id="eval-upload-input"
          onChange={(e) => {
            const selectedFiles =
              remainingSlots === null
                ? Array.from(e.target.files ?? [])
                : Array.from(e.target.files ?? []).slice(0, remainingSlots);
            if (selectedFiles.length > 0) onUpload?.(selectedFiles);
          }}
        />

        <button
          onClick={() => document.getElementById("eval-upload-input")?.click()}
          disabled={isUploadDisabled}
          className="
            w-full sm:w-auto
            flex items-center justify-center gap-2
            px-5 py-2.5 rounded-lg
            bg-blue-600 hover:bg-blue-700
            dark:bg-indigo-600 dark:hover:bg-indigo-700
            disabled:bg-gray-400 disabled:cursor-not-allowed
            dark:disabled:bg-gray-600
            text-white font-medium shadow-sm transition
            text-sm sm:text-base
            whitespace-nowrap
          "
          title={
            isUploadDisabled
              ? "Maximum files reached"
              : remainingSlots === null
                ? "Unlimited files allowed"
                : `${remainingSlots} file(s) remaining`
          }
        >
          <Paperclip className="w-5 h-5" />
          {t("attach")} ({uploadedFilesCount}/{evaluationLimit ?? "Unlimited"})
        </button>
      </div>

      {/* MARKS BUTTON */}
      <button
        onClick={onOpenMarks}
        className="
          w-full sm:w-auto
          flex items-center justify-center gap-2
          px-5 py-2.5 rounded-lg
          bg-blue-600 hover:bg-blue-700
          dark:bg-indigo-600 dark:hover:bg-indigo-700
          text-white font-medium shadow-sm transition
          text-sm sm:text-base
          whitespace-nowrap
        "
      >
        <Plus className="w-5 h-5" />
        {t("marks")}
      </button>

      {/* SEND BUTTON */}
      <button
        onClick={onSend}
        className="
          w-full sm:w-auto
          flex items-center justify-center gap-2
          px-5 py-2.5 rounded-lg
          bg-blue-600 hover:bg-blue-700
          dark:bg-indigo-600 dark:hover:bg-indigo-700
          text-white font-medium shadow-sm transition
          text-sm sm:text-base
          whitespace-nowrap
        "
      >
        <Send className="w-5 h-5" />
        {t("send")}
      </button>
    </div>
  );
}
