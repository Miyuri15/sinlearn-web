"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Trash2 } from "lucide-react";
import NumberInput from "@/components/ui/NumberInput";
import Input from "@/components/ui/Input";
import { PaperPart, Question, SubQuestion } from "@/lib/models/chat";

// --- Types ---
// Imported from @/lib/models/chat

interface EvaluationMarksModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (config: PaperPart[]) => void;
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
  const [paperParts, setPaperParts] = useState<PaperPart[]>([]);

  // Initialize or Fetch Data
  useEffect(() => {
    if (open) {
      if (initialConfig && initialConfig.length > 0) {
        setPaperParts(initialConfig);
      } else {
        // Default start with one paper part
        setPaperParts([createDefaultPaperPart(0)]);
        
        // TODO: Fetch from endpoint if needed
        // fetch('/api/paper-config').then(...)
      }
    }
  }, [open, initialConfig]);

  const handleAddPaperPart = () => {
    setPaperParts((prev) => [...prev, createDefaultPaperPart(prev.length)]);
  };

  const handleRemovePaperPart = (id: string) => {
    setPaperParts((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePaperPart = (id: string, updates: Partial<PaperPart>) => {
    setPaperParts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updatedPart = { ...p, ...updates };

        // Handle Main Questions Count Change
        if (updates.mainQuestionsCount !== undefined) {
          const currentCount = p.questions.length;
          const newCount = updates.mainQuestionsCount;

          if (newCount > currentCount) {
            // Add questions
            const newQuestions = [...p.questions];
            for (let i = currentCount; i < newCount; i++) {
              newQuestions.push(createDefaultQuestion(i));
            }
            updatedPart.questions = newQuestions;
          } else if (newCount < currentCount) {
            // Remove questions
            updatedPart.questions = p.questions.slice(0, newCount);
          }
        }

        return updatedPart;
      })
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
          questions: p.questions.map((q) => {
            if (q.id !== questionId) return q;
            
            const updatedQ = { ...q, ...updates };
            
            // If toggling hasSubQuestions to true, recalculate marks from subquestions
            if (updates.hasSubQuestions === true) {
              const subMarksSum = updatedQ.subQuestions.reduce((sum, sq) => sum + sq.marks, 0);
              updatedQ.marks = subMarksSum;
            }
            
            return updatedQ;
          }),
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
            const newSubIndex = q.subQuestions.length;
            const newSubQuestions = [
              ...q.subQuestions,
              {
                id: generateId(),
                label: getSubQuestionLabel(newSubIndex),
                marks: 0,
              },
            ];
            // Recalculate parent marks
            const subMarksSum = newSubQuestions.reduce((sum, sq) => sum + sq.marks, 0);
            
            return {
              ...q,
              subQuestions: newSubQuestions,
              marks: subMarksSum,
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
          errors.push(`In "${part.name}", all questions must have equal marks when "Choose Any" is used.`);
        } else {
          // Check if sum matches
          const expectedTotal = firstMark * requiredCount;
          if (expectedTotal !== totalMarks) {
             errors.push(`In "${part.name}", sum of ${requiredCount} questions (${expectedTotal}) does not match Total Marks (${totalMarks}).`);
          }
        }
      } else {
        // All questions required (or requiredCount >= questions.length or 0 which implies all)
        // Sum of all questions should equal total marks
        const currentSum = part.questions.reduce((sum, q) => sum + q.marks, 0);
        if (currentSum !== totalMarks && totalMarks > 0) {
           errors.push(`In "${part.name}", sum of questions (${currentSum}) does not match Total Marks (${totalMarks}).`);
        }
      }
    });
    
    return errors;
  };

  const handleConfirm = () => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      alert(errors.join("\n")); // Simple alert for now, or use a toast/UI message
      return;
    }
    onSubmit(paperParts);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-2xl w-full max-w-4xl border dark:border-[#2a2a2a] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b dark:border-[#2a2a2a] shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Paper Config
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {paperParts.map((part, partIndex) => (
            <div
              key={part.id}
              className="p-4 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1A1A1A] space-y-4"
            >
              {/* Paper Part Header Inputs */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Paper Part Name
                    </label>
                    <Input
                      value={part.name}
                      onChange={(e) =>
                        updatePaperPart(part.id, { name: e.target.value })
                      }
                      className="bg-white dark:bg-[#111111]"
                    />
                  </div>
                  <button
                    onClick={() => handleRemovePaperPart(part.id)}
                    className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove Paper Part"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Total Marks
                    </label>
                    <NumberInput
                      value={part.totalMarks}
                      onChange={(val) =>
                        updatePaperPart(part.id, { totalMarks: val })
                      }
                      className="w-full bg-white dark:bg-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Main Questions
                    </label>
                    <NumberInput
                      value={part.mainQuestionsCount}
                      onChange={(val) =>
                        updatePaperPart(part.id, { mainQuestionsCount: val })
                      }
                      className="w-full bg-white dark:bg-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    Choose Any (optional)
                  </label>
                  <NumberInput
                    value={part.requiredQuestionsCount || 0}
                    onChange={(val) =>
                      updatePaperPart(part.id, { requiredQuestionsCount: val })
                    }
                    className="w-full bg-white dark:bg-[#111111]"
                    placeholder="All"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3 mt-4">
                {part.questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111111]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {q.label}
                      </span>
                      
                      <div className="flex-1">
                         <label className="text-[10px] font-medium text-gray-400 mb-0.5 block">
                            Marks
                          </label>
                        <NumberInput
                          value={q.marks}
                          onChange={(val) =>
                            updateQuestion(part.id, q.id, { marks: val })
                          }
                          className="w-full"
                          disabled={q.hasSubQuestions} // Disable if subquestions control marks? Or allow override?
                        />
                      </div>

                      <div className="flex items-center pt-4">
                        <input
                          type="checkbox"
                          checked={q.hasSubQuestions}
                          onChange={(e) =>
                            updateQuestion(part.id, q.id, {
                              hasSubQuestions: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Sub Questions */}
                    {q.hasSubQuestions && (
                      <div className="mt-3 pl-9 space-y-2">
                        {q.subQuestions.map((sq) => (
                          <div key={sq.id} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 w-4 text-center">
                              {sq.label}
                            </span>
                            <div className="flex-1">
                               <label className="text-[10px] font-medium text-gray-400 mb-0.5 block">
                                Marks
                              </label>
                              <NumberInput
                                value={sq.marks}
                                onChange={(val) =>
                                  handleSubQuestionMarkChange(
                                    part.id,
                                    q.id,
                                    sq.id,
                                    val
                                  )
                                }
                                className="w-full"
                              />
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveSubQuestion(part.id, q.id, sq.id)
                              }
                              className="mt-4 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddSubQuestion(part.id, q.id)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add sub-question
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleAddPaperPart}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-[#333] rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Paper Part
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 border-t dark:border-[#2a2a2a] shrink-0 bg-gray-50 dark:bg-[#1A1A1A]">
          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]"
          >
            Confirm Paper Config
          </button>
        </div>
      </div>
    </div>
  );
}
