"use client";

import NumberInput from "@/components/ui/NumberInput";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface EvaluationMarksModalProps {
  open: boolean;
  onClose: () => void;
  totalMarks: number;
  setTotalMarks: (value: number) => void;
  mainQuestions: number;
  setMainQuestions: (value: number) => void;
  requiredQuestions: number;
  setRequiredQuestions: (value: number) => void;
  onAllocateMarks: () => void;
  onViewMarks: () => void;
  onSubmit: () => void;
}

export default function EvaluationMarksModal({
  open,
  onClose,
  totalMarks,
  setTotalMarks,
  mainQuestions,
  setMainQuestions,
  requiredQuestions,
  setRequiredQuestions,
  onAllocateMarks,
  onViewMarks,
  onSubmit,
}: EvaluationMarksModalProps) {
  const { t } = useTranslation("chat");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-2xl w-full max-w-md border dark:border-[#2a2a2a] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b dark:border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("evaluation_details")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            {/* Total Marks */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("total_marks")}
              </label>
              <NumberInput
                value={totalMarks}
                onChange={setTotalMarks}
                min={0}
                max={100}
                className="w-full"
              />
            </div>

            {/* Main Questions */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("main_questions")}
              </label>
              <NumberInput
                value={mainQuestions}
                onChange={setMainQuestions}
                min={0}
                max={50}
                className="w-full"
              />
            </div>

            {/* Required Questions */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("required_questions")}
              </label>
              <NumberInput
                value={requiredQuestions}
                onChange={setRequiredQuestions}
                min={0}
                max={mainQuestions}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onAllocateMarks}
              disabled={mainQuestions <= 0}
              className="px-4 py-2.5 rounded-xl border dark:border-[#333] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t("allocate_marks")}
            </button>
            <button
              onClick={onViewMarks}
              className="px-4 py-2.5 rounded-xl border dark:border-[#333] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all"
            >
              {t("view_marks")}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 bg-gray-50 dark:bg-[#0a0a0a] border-t dark:border-[#2a2a2a]">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onSubmit}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition-all"
          >
            {t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
