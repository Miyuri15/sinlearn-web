"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileText, RefreshCw, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import type { MarkingSchema, MarkingSchemaQuestion } from "@/lib/models/chat";

interface EvaluationMarkingSchemaModalProps {
  open: boolean;
  schema: MarkingSchema | null;
  loading?: boolean;
  saving?: boolean;
  onClose: () => void;
  onRefresh: () => void | Promise<void>;
  onSave: (questions: MarkingSchemaQuestion[]) => void | Promise<void>;
  onConfirm: (questions: MarkingSchemaQuestion[]) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

export default function EvaluationMarkingSchemaModal({
  open,
  schema,
  loading = false,
  saving = false,
  onClose,
  onRefresh,
  onSave,
  onConfirm,
  onDelete,
}: EvaluationMarkingSchemaModalProps) {
  const [questions, setQuestions] = useState<MarkingSchemaQuestion[]>([]);

  useEffect(() => {
    if (!open) return;
    setQuestions(schema?.questions ?? []);
  }, [open, schema]);

  const completedCount = useMemo(
    () => questions.filter((question) => question.referenceText.trim().length > 0).length,
    [questions]
  );

  const handleQuestionChange = (questionId: string, value: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, referenceText: value }
          : question
      )
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-[#2a2a2a] dark:bg-[#111111]">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-[#2a2a2a]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                Marking Schema
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Review extracted references before grading
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Edit the extracted reference points question by question, save them
                for this session, then confirm to unlock grading.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-[#1b1b1b] dark:hover:text-gray-100"
            aria-label="Close marking schema modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-[#2a2a2a] dark:bg-[#161616]">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="rounded-full bg-white px-3 py-1 font-medium dark:bg-[#111111]">
              {completedCount}/{questions.length} references ready
            </span>
            <span className="rounded-full bg-white px-3 py-1 font-medium dark:bg-[#111111]">
              Status: {schema?.isConfirmed ? "Confirmed" : "Draft"}
            </span>
            {schema?.resourceId ? (
              <span className="rounded-full bg-white px-3 py-1 font-medium dark:bg-[#111111]">
                Saved as session resource
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <div>
                <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                  Loading marking schema...
                </p>
                <p className="text-sm">
                  The backend will load the saved schema or generate a new one for
                  this session.
                </p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-amber-100 p-4 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  No marking schema available yet
                </p>
                <p className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
                  Once the backend endpoint is in place, this dialog will show the
                  saved schema for the session or regenerate it when needed.
                </p>
              </div>
              <Button variant="secondary" onClick={onRefresh}>
                Retry loading schema
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2a2a2a] dark:bg-[#141414]"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:bg-teal-900/20 dark:text-teal-300">
                          {question.partName || "Question"}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {question.questionNumber}
                        </span>
                        {typeof question.maxMarks === "number" ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {question.maxMarks} marks
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">
                        {question.questionText || `Question ${index + 1}`}
                      </p>
                    </div>
                  </div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                    Extracted reference
                  </label>
                  <textarea
                    value={question.referenceText}
                    onChange={(event) =>
                      handleQuestionChange(question.id, event.target.value)
                    }
                    className="min-h-[148px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-teal-500 focus:bg-white dark:border-[#2a2a2a] dark:bg-[#101010] dark:text-gray-100 dark:focus:border-teal-400"
                    placeholder="Reference points for this question will appear here."
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-[#2a2a2a] dark:bg-[#161616]">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={onRefresh}
              disabled={loading || saving}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              onClick={onDelete}
              disabled={loading || saving || !schema}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete schema
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => onSave(questions)}
              disabled={loading || saving || questions.length === 0}
            >
              {saving ? "Saving..." : "Save draft"}
            </Button>
            <Button
              onClick={() => onConfirm(questions)}
              disabled={loading || saving || questions.length === 0}
              className="min-w-[180px]"
            >
              {saving ? "Saving..." : "Confirm schema"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
