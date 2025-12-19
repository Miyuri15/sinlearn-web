"use client";

import NumberInput from "@/components/ui/NumberInput";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

interface SubMarksModalProps {
  open: boolean;
  mainQuestions: number;
  marks: number[][]; // nested marks for each main question
  onChange: (marks: number[][]) => void;
  onDone: () => void;
  onCancel: () => void;
}

export default function SubMarksModal({
  open,
  mainQuestions,
  marks,
  onChange,
  onDone,
  onCancel,
}: Readonly<SubMarksModalProps>) {
  const { t } = useTranslation("chat");
  const [currentIdx, setCurrentIdx] = useState(0); // Which main question
  const [localMarks, setLocalMarks] = useState<number[][]>([]);

  useEffect(() => {
    if (open) {
      setLocalMarks(marks.length > 0 ? [...marks.map((m) => [...m])] : []);
      setCurrentIdx(0);
    }
  }, [open, marks]);

  if (!open) return null;

  const currentMainQuestionMarks = localMarks[currentIdx] || [0];

  const handleSubMarkChange = (subIdx: number, val: number) => {
    const nextLocal = [...localMarks];
    if (!nextLocal[currentIdx]) {
      nextLocal[currentIdx] = [0];
    }
    nextLocal[currentIdx][subIdx] = val;
    setLocalMarks(nextLocal);
  };

  const addSubQuestion = () => {
    const nextLocal = [...localMarks];
    if (!nextLocal[currentIdx]) {
      nextLocal[currentIdx] = [0];
    }
    nextLocal[currentIdx].push(0);
    setLocalMarks(nextLocal);
  };

  const handleNext = () => {
    if (currentIdx < mainQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onChange(localMarks);
      onDone();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const isLast = currentIdx === mainQuestions - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl p-6 w-full max-w-sm border dark:border-[#2a2a2a]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">
            {t("question")} {currentIdx + 1}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 max-h-80 overflow-y-auto pr-1 mb-6">
          {currentMainQuestionMarks.map((m, subIdx) => (
            <div key={`q-${currentIdx}-sub-${subIdx}`} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("sub_question")} {String.fromCodePoint(97 + subIdx)})
              </span>
              <NumberInput
                value={m}
                onChange={(v) => handleSubMarkChange(subIdx, v)}
                min={0}
                max={100}
                className="w-24"
              />
            </div>
          ))}

          <button
            onClick={addSubQuestion}
            className="flex items-center gap-2 text-blue-600 dark:text-indigo-400 text-sm font-medium hover:underline mt-2"
          >
            <Plus className="w-4 h-4" />
            {t("add_sub_question")}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t dark:border-[#2a2a2a]">
          <button
            disabled={currentIdx === 0}
            onClick={handlePrev}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border dark:border-[#333] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("previous")}
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 dark:bg-indigo-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-indigo-700 transition-all"
          >
            {isLast ? t("submit") : (
              <>
                {t("next")}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
