"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Trash2, Info } from "lucide-react";
import NumberInput from "@/components/ui/NumberInput";
import Input from "@/components/ui/Input";
import { PaperPart, Question, SubQuestion } from "@/lib/models/chat";

// --- Types ---
// Imported from @/lib/models/chat

interface EvaluationMarksModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (config: PaperPart[]) => void | Promise<void>;
  initialConfig?: PaperPart[]; // Optional: if we want to edit existing config
  // Deprecated props kept for compatibility if needed, but we won't use them
  totalMarks?: number;
  setTotalMarks?: (value: number) => void;
  mainQuestions?: number;
  setMainQuestions?: (value: number) => void;
  requiredQuestions?: number;
  setRequiredQuestions?: (value: number) => void;
  onAllocateMarks?: () => void;
  onViewMarks?: () => void;
}

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const getSubQuestionLabel = (index: number) => {
  return String.fromCharCode(97 + index); // 'a', 'b', 'c'...
};

const createDefaultQuestion = (index: number): Question => ({
  id: generateId(),
  label: `Q${index + 1}`,
  marks: 0,
  hasSubQuestions: false,
  subQuestions: [],
});

const createDefaultPaperPart = (index: number): PaperPart => ({
  id: generateId(),
  name: `Paper_${index === 0 ? "I" : index === 1 ? "II" : index + 1}`,
  totalMarks: 0,
  mainQuestionsCount: 0,
  requiredQuestionsCount: 0,
  questions: [],
});

// --- Components ---

export default function EvaluationMarksModal({
  open,
  onClose,
  onSubmit,
  initialConfig,
}: EvaluationMarksModalProps) {
  const { t } = useTranslation("chat");
  // Use backend config as source of truth
  const [paperParts, setPaperParts] = useState<PaperPart[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState<
    | null
    | {
      title: string;
      messages: string[];
      variant: "warning" | "error";
    }
  >(null);

  // Initialize or Fetch Data
  // Map backend config to UI state
  useEffect(() => {
    if (open) {
      setPopup(null);
      if (initialConfig && initialConfig.length > 0) {
        setPaperParts(initialConfig);
      } else {
        setPaperParts([]);
      }
    }
  }, [open, initialConfig]);

  // Remove add/remove handlers since backend is source of truth
  const handleAddPaperPart = () => { };
  const handleRemovePaperPart = (id: string) => { };
  // Duplicate definition removed



  // Map backend config to UI state
  const updatePaperPart = (partId: string, updates: Partial<PaperPart>) => {
    setPaperParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, ...updates } : p))
    );
  };

  const updateQuestion = (
    partId: string,
    questionId: string,
    updates: Partial<Question>
  ) => {
    setPaperParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        return {
          ...p,
          questions: p.questions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
        };
      })
    );
  };

  const handleAddSubQuestion = (partId: string, questionId: string) => {
    setPaperParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        return {
          ...p,
          questions: p.questions.map((q) => {
            if (q.id !== questionId) return q;
            const newSub = {
              id: generateId(),
              label: getSubQuestionLabel(q.subQuestions.length),
              marks: 0,
            };
            const updatedSubQuestions = [...q.subQuestions, newSub];
            return {
              ...q,
              hasSubQuestions: true,
              subQuestions: updatedSubQuestions,
              marks: updatedSubQuestions.reduce((sum, sq) => sum + sq.marks, 0),
            };
          }),
        };
      })
    );
  };



  const handleRemoveSubQuestion = (
    partId: string,
    questionId: string,
    subQuestionId: string
  ) => {
    setPaperParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        return {
          ...p,
          questions: p.questions.map((q) => {
            if (q.id !== questionId) return q;
            const filtered = q.subQuestions.filter(
              (sq) => sq.id !== subQuestionId
            );
            // Re-label
            const reLabeled = filtered.map((sq, idx) => ({
              ...sq,
              label: getSubQuestionLabel(idx),
            }));

            // Recalculate parent marks
            const subMarksSum = reLabeled.reduce((sum, sq) => sum + sq.marks, 0);

            return { ...q, subQuestions: reLabeled, marks: subMarksSum };
          }),
        };
      })
    );
  };

  const handleSubQuestionMarkChange = (
    partId: string,
    questionId: string,
    subQuestionId: string,
    marks: number
  ) => {
    setPaperParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        return {
          ...p,
          questions: p.questions.map((q) => {
            if (q.id !== questionId) return q;

            const updatedSubQuestions = q.subQuestions.map((sq) =>
              sq.id === subQuestionId ? { ...sq, marks } : sq
            );

            // Recalculate parent marks
            const subMarksSum = updatedSubQuestions.reduce((sum, sq) => sum + sq.marks, 0);

            return {
              ...q,
              subQuestions: updatedSubQuestions,
              marks: subMarksSum,
            };
          }),
        };
      })
    );
  };

  // Validation Helper
  const getValidationErrors = () => {
    const errors: string[] = [];

    paperParts.forEach((part) => {
      const requiredCount = part.requiredQuestionsCount || 0;
      const totalMarks = part.totalMarks;

      // If requiredCount > 0 (e.g. "Choose 4"), check if sum of any N questions equals total marks.
      // This implies all questions must have equal marks if N < total questions.
      if (requiredCount > 0 && requiredCount < part.questions.length) {
        // Check if all questions have equal marks
        const firstMark = part.questions[0]?.marks || 0;
        const allEqual = part.questions.every(q => q.marks === firstMark);

        if (!allEqual) {
          errors.push(
            t("evaluation_marks_validation_choose_any_equal_marks", {
              partName: part.name,
            })
          );
        } else {
          // Check if sum matches
          const expectedTotal = firstMark * requiredCount;
          if (expectedTotal !== totalMarks) {
            errors.push(
              t("evaluation_marks_validation_choose_any_sum_mismatch", {
                partName: part.name,
                requiredCount,
                expectedTotal,
                totalMarks,
              })
            );
          }
        }
      } else {
        // All questions required (or requiredCount >= questions.length or 0 which implies all)
        // Sum of all questions should equal total marks
        const currentSum = part.questions.reduce((sum, q) => sum + q.marks, 0);
        if (currentSum !== totalMarks && totalMarks > 0) {
          errors.push(
            t("evaluation_marks_validation_sum_mismatch", {
              partName: part.name,
              currentSum,
              totalMarks,
            })
          );
        }
      }
    });

    return errors;
  };

  const handleConfirm = async () => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      setPopup({
        title: t("evaluation_marks_popup_fix_before_confirming"),
        messages: errors,
        variant: "warning",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(paperParts);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("evaluation_marks_confirm_failed");
      setPopup({
        title: t("evaluation_marks_popup_could_not_confirm"),
        messages: [msg],
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative bg-white dark:bg-[#111111] rounded-2xl shadow-2xl w-full max-w-4xl border dark:border-[#2a2a2a] flex flex-col max-h-[90vh]">
        {popup && (
          <div
            className={`absolute z-10 top-4 right-4 left-4 sm:left-auto sm:w-lg rounded-xl border p-4 shadow-lg backdrop-blur-sm ${popup.variant === "warning"
                ? "bg-amber-50/95 dark:bg-amber-900/25 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100"
                : "bg-red-50/95 dark:bg-red-900/25 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100"
              }`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{popup.title}</p>
                <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {popup.messages.map((m, i) => (
                    <li key={i} className="text-sm leading-snug">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setPopup(null)}
                className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label={t("dismiss")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b dark:border-[#2a2a2a] shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("paper_config")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-5 pt-4">
          <div className="w-full rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-4 text-blue-900 dark:text-blue-100">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-sm leading-relaxed">
                {t("evaluation_marks_info_banner")}
              </p>
            </div>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {paperParts.map((part, partIndex) => (
            <div
              key={part.id}
              className="p-4 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1A1A1A] space-y-4"
            >
              {/* Paper Part Header - Readonly */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      {t("evaluation_marks_paper_part_name")}
                    </label>
                    <Input
                      value={part.name}
                      readOnly
                      className="bg-white dark:bg-[#111111] cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      {t("total_marks")}
                    </label>
                    <NumberInput
                      value={part.totalMarks}
                      onChange={(val) => updatePaperPart(part.id, { totalMarks: val })}
                      className="w-full bg-white dark:bg-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      {t("main_questions")}
                    </label>
                    <NumberInput
                      value={part.mainQuestionsCount}
                      onChange={(val) => updatePaperPart(part.id, { mainQuestionsCount: val })}
                      className="w-full bg-white dark:bg-[#111111]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    {t("evaluation_marks_choose_any_optional")}
                  </label>
                  <NumberInput
                    value={part.requiredQuestionsCount || 0}
                    onChange={(val) =>
                      updatePaperPart(part.id, { requiredQuestionsCount: val })
                    }
                    className="w-full bg-white dark:bg-[#111111]"
                    placeholder={t("all")}
                  />
                </div>
              </div>
              {/* Questions List - If present */}
              {Array.isArray(part.questions) && part.questions.length > 0 && (
                <div className="space-y-3 mt-4">
                  {part.questions.map((q) => (
                    <div
                      key={q.id || q.label}
                      className="p-3 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111111]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 w-6">
                          {q.label}
                        </span>
                        <div className="flex-1">
                          <label className="text-[10px] font-medium text-gray-400 mb-0.5 block">
                            {t("marks")}
                          </label>
                          <NumberInput
                            value={q.marks}
                            onChange={(val) => updateQuestion(part.id, q.id, { marks: val })}
                            className="w-full"
                          />
                        </div>
                      </div>
                      {/* Sub Questions */}
                      {Array.isArray(q.subQuestions) && q.subQuestions.length > 0 && (
                        <div className="mt-3 pl-9 space-y-2">
                          {q.subQuestions.map((sq) => (
                            <div key={sq.id || sq.label} className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500 w-4 text-center">
                                {sq.label}
                              </span>
                              <div className="flex-1">
                                <label className="text-[10px] font-medium text-gray-400 mb-0.5 block">
                                  {t("marks")}
                                </label>
                                <NumberInput
                                  value={sq.marks}
                                  onChange={(val) => handleSubQuestionMarkChange(part.id, q.id, sq.id, val)}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t dark:border-[#2a2a2a] shrink-0 bg-gray-50 dark:bg-[#1A1A1A]">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? t("evaluation_marks_confirming") : t("evaluation_marks_confirm_paper_config")}
          </button>
        </div>
      </div>
    </div>
  );
}
