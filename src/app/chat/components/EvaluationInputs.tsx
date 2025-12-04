"use client";

import NumberInput from "@/components/ui/NumberInput";
import { Send, Paperclip } from "lucide-react";
import { useTranslation } from "react-i18next";

type EvaluationInputsProps = Readonly<{
  totalMarks: number;
  setTotalMarks: (value: number) => void;

  mainQuestions: number;
  setMainQuestions: (value: number) => void;

  requiredQuestions: number;
  setRequiredQuestions: (value: number) => void;

  subQuestions: number;
  setSubQuestions: (value: number) => void;

  onSend: () => void;
  onUpload?: (file: File) => void; // Optional upload handler
}>;

export default function EvaluationInputs({
  totalMarks,
  setTotalMarks,
  mainQuestions,
  setMainQuestions,
  requiredQuestions,
  setRequiredQuestions,
  subQuestions,
  setSubQuestions,
  onSend,
  onUpload,
}: EvaluationInputsProps) {
  const { t } = useTranslation("chat");

  const parseNumber = (v: string) =>
    Number.isNaN(parseInt(v, 10)) ? 0 : parseInt(v, 10);

  return (
    <div className="bg-white dark:bg-[#111111] dark:border-[#2a2a2a]">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          {t("evaluation_settings_sub")}
        </p>

        <div className="flex items-center gap-2">
          {/* UPLOAD BUTTON */}
          <div>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              id="eval-upload-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload?.(file);
              }}
            />

            <button
              onClick={() =>
                document.getElementById("eval-upload-input")?.click()
              }
              className="
                p-2 rounded-lg border
                bg-white text-gray-700 
                dark:bg-[#222] dark:text-gray-200 dark:border-[#333]
                hover:bg-gray-100 dark:hover:bg-[#333]
                transition
              "
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          {/* SEND BUTTON */}
          <button
            onClick={onSend}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-lg
              bg-blue-600 hover:bg-blue-700
              dark:bg-indigo-600 dark:hover:bg-indigo-700
              text-white font-medium shadow-sm transition
              whitespace-nowrap
            "
          >
            <Send className="w-5 h-5" />
            {t("send")}
          </button>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* TOTAL MARKS */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {t("total_marks")}
          </label>
          <NumberInput
            value={totalMarks}
            onChange={(v) => setTotalMarks(v)}
            min={0}
            max={100}
            className="w-full"
          />
        </div>

        {/* MAIN QUESTIONS */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {t("main_questions")}
          </label>
          <NumberInput
            value={mainQuestions}
            onChange={(v) => setMainQuestions(v)}
            min={0}
            max={10}
            className="w-full"
          />
        </div>

        {/* REQUIRED QUESTIONS */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {t("required_questions")}
          </label>
          <NumberInput
            value={requiredQuestions}
            onChange={(v) => setRequiredQuestions(v)}
            min={0}
            max={10}
            className="w-full"
          />
        </div>

        {/* SUB QUESTIONS */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {t("sub_questions")}
          </label>
          <NumberInput
            value={subQuestions}
            onChange={(v) => setSubQuestions(v)}
            min={0}
            max={10}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
