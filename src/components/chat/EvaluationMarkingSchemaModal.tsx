"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, FileText, RefreshCw, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import type { MarkingSchema, MarkingSchemaQuestion } from "@/lib/models/chat";
import { useTranslation } from "react-i18next";
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";

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
  const { t, i18n } = useTranslation("chat");
  const [questions, setQuestions] = useState<MarkingSchemaQuestion[]>([]);

  useEffect(() => {
    if (!open) return;
    setQuestions(schema?.questions ?? []);
  }, [open, schema]);

  const completedCount = useMemo(
    () => questions.filter((question) => question.referenceText.trim().length > 0).length,
    [questions]
  );

  const parseQuestionNumber = (value: string) => {
    const normalized = String(value || "").trim();
    const match = normalized.match(/^(\d+)(?:\s*[\(\.]?\s*([a-zA-Z0-9]+)\)?)?/);

    if (!match) {
      return {
        main: Number.MAX_SAFE_INTEGER,
        sub: normalized.toLowerCase(),
      };
    }

    const main = Number(match[1]);
    const rawSub = match[2] ?? "";
    const numericSub = Number(rawSub);

    return {
      main,
      sub: Number.isFinite(numericSub) && rawSub !== "" ? numericSub : rawSub.toLowerCase(),
    };
  };

  const orderedSections = useMemo(() => {
    const partOrderValue = (partName?: string) => {
      const normalized = String(partName || "").toLowerCase();
      if (normalized.includes("paper_i") || normalized.includes("paper i")) return 1;
      if (normalized.includes("paper_ii") || normalized.includes("paper ii")) return 2;
      if (normalized.includes("paper_iii") || normalized.includes("paper iii")) return 3;
      return 99;
    };

    const groups = new Map<string, MarkingSchemaQuestion[]>();

    for (const question of questions) {
      const key = question.partName || t("evaluation_results_other");
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(question);
    }

    return Array.from(groups.entries())
      .sort((a, b) => {
        const partDiff = partOrderValue(a[0]) - partOrderValue(b[0]);
        if (partDiff !== 0) return partDiff;
        return a[0].localeCompare(b[0]);
      })
      .map(([partName, items]) => ({
        partName,
        questions: [...items].sort((a, b) => {
          const aParsed = parseQuestionNumber(a.questionNumber);
          const bParsed = parseQuestionNumber(b.questionNumber);

          if (aParsed.main !== bParsed.main) {
            return aParsed.main - bParsed.main;
          }

          if (typeof aParsed.sub === "number" && typeof bParsed.sub === "number") {
            return aParsed.sub - bParsed.sub;
          }

          return String(aParsed.sub).localeCompare(String(bParsed.sub));
        }),
      }));
  }, [questions]);

  const handleQuestionChange = (questionId: string, value: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, referenceText: value }
          : question
      )
    );
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLTextAreaElement>,
    questionId: string,
    currentValue: string
  ) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    const target = event.currentTarget;
    const start = target.selectionStart ?? currentValue.length;
    const end = target.selectionEnd ?? currentValue.length;
    const nextValue =
      currentValue.slice(0, start) + pastedText + currentValue.slice(end);

    handleQuestionChange(questionId, nextValue);

    requestAnimationFrame(() => {
      const cursorPosition = start + pastedText.length;
      target.selectionStart = cursorPosition;
      target.selectionEnd = cursorPosition;
    });
  };

  const escapeHtml = (value: unknown) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const buildPrintableSchemaHtml = () => {
    const generatedAt = new Date().toLocaleString();
    const statusLabel = schema?.isConfirmed
      ? t("evaluation_marking_schema_status_confirmed")
      : t("evaluation_marking_schema_status_draft");
    const sectionsHtml = orderedSections
      .map(
        (section) => `
          <section class="paper-section">
            <h2>${escapeHtml(section.partName)}</h2>
            ${section.questions
              .map(
                (question) => `
                  <article class="question">
                    <div class="question-header">
                      <div>
                        <span class="question-label">${escapeHtml(question.partName || t("question"))} - ${escapeHtml(question.questionNumber)}</span>
                        <h3>${escapeHtml(question.questionText || t("evaluation_results_question", { id: question.questionNumber }))}</h3>
                      </div>
                      ${
                        typeof question.maxMarks === "number"
                          ? `<span class="marks">${escapeHtml(question.maxMarks)} ${escapeHtml(t("marks"))}</span>`
                          : ""
                      }
                    </div>
                    <div class="reference">${escapeHtml(question.referenceText || "-").replace(/\n/g, "<br />")}</div>
                  </article>
                `
              )
              .join("")}
          </section>
        `
      )
      .join("");

    return `
      <!doctype html>
      <html lang="${escapeHtml(i18n.language?.startsWith("si") ? "si" : "en")}">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(t("evaluation_marking_schema_title"))}</title>
          <style>
            @page { size: A4; margin: 18mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              color: #111827;
              font-family: "Noto Sans Sinhala", "Nirmala UI", "Iskoola Pota", Arial, sans-serif;
              line-height: 1.65;
            }
            header {
              border-bottom: 2px solid #0f766e;
              margin-bottom: 18px;
              padding-bottom: 12px;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 6px;
            }
            .meta {
              color: #4b5563;
              font-size: 12px;
            }
            .summary {
              background: #f0fdfa;
              border: 1px solid #99f6e4;
              border-radius: 10px;
              font-size: 13px;
              margin-bottom: 18px;
              padding: 10px 12px;
            }
            .paper-section {
              break-inside: avoid;
              margin-bottom: 22px;
            }
            h2 {
              background: #f3f4f6;
              border-left: 4px solid #0f766e;
              font-size: 16px;
              margin: 0 0 10px;
              padding: 8px 10px;
            }
            .question {
              border: 1px solid #d1d5db;
              border-radius: 10px;
              break-inside: avoid;
              margin-bottom: 10px;
              padding: 12px;
            }
            .question-header {
              align-items: flex-start;
              display: flex;
              gap: 12px;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .question-label {
              color: #0f766e;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.04em;
              text-transform: uppercase;
            }
            h3 {
              font-size: 14px;
              font-weight: 600;
              margin: 4px 0 0;
            }
            .marks {
              color: #374151;
              font-size: 12px;
              white-space: nowrap;
            }
            .reference {
              border-top: 1px solid #e5e7eb;
              font-size: 13px;
              padding-top: 8px;
              white-space: normal;
            }
          </style>
        </head>
        <body>
          <header>
            <h1>${escapeHtml(t("evaluation_marking_schema_title"))}</h1>
            <div class="meta">${escapeHtml(t("evaluation_marking_schema_print_generated", { date: generatedAt }))}</div>
          </header>
          <div class="summary">${escapeHtml(t("evaluation_marking_schema_references_ready", { completed: completedCount, total: questions.length }))} - ${escapeHtml(t("evaluation_marking_schema_status", { status: statusLabel }))}</div>
          ${sectionsHtml}
        </body>
      </html>
    `;
  };

  const handleDownloadPdf = () => {
    if (questions.length === 0) return;

    const printWindow = window.open("", "_blank", "width=960,height=720");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(buildPrintableSchemaHtml());
    printWindow.document.close();
    printWindow.focus();

    window.setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-[#2a2a2a] dark:bg-[#111111]">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-[#2a2a2a]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">
                {t("evaluation_marking_schema_title")}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("evaluation_marking_schema_heading")}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("evaluation_marking_schema_subtitle")}
              </p>
            </div>
          </div>
          {/* Download PDF Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleDownloadPdf}
              className="flex items-center gap-2"
              title={t("evaluation_marking_schema_download_pdf")}
            >
              <Download className="w-4 h-4" />
              <span>{t("evaluation_marking_schema_download_pdf")}</span>
            </Button>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-[#1b1b1b] dark:hover:text-gray-100"
            aria-label={t("evaluation_marking_schema_close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-4 text-sm text-teal-900 dark:border-teal-900/40 dark:bg-teal-900/15 dark:text-teal-100">
            <p className="font-semibold">
              {t("evaluation_marking_schema_help_title")}
            </p>
            <p className="mt-2 leading-6">
              {t("evaluation_marking_schema_help_review")}{" "}
              <span className="font-semibold">
                {t("evaluation_marking_schema_save_changes")}
              </span>{" "}
              {t("evaluation_marking_schema_help_confirm_prefix")}
              <span className="font-semibold">
                {" "}
                {t("evaluation_marking_schema_confirm_schema")}
              </span>
              .
            </p>
            <p className="mt-2 leading-6">
              {t("evaluation_marking_schema_help_typing")}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="rounded-full bg-white px-3 py-1 font-medium dark:bg-[#111111]">
              {t("evaluation_marking_schema_references_ready", {
                completed: completedCount,
                total: questions.length,
              })}
            </span>
            <span className="rounded-full bg-white px-3 py-1 font-medium dark:bg-[#111111]">
              {t("evaluation_marking_schema_status", {
                status: schema?.isConfirmed
                  ? t("evaluation_marking_schema_status_confirmed")
                  : t("evaluation_marking_schema_status_draft"),
              })}
            </span>
            {schema?.resourceId ? (
              <span className="rounded-full bg-white px-3 py-1 font-medium dark:bg-[#111111]">
                {t("evaluation_marking_schema_saved_resource")}
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-gray-500 dark:text-gray-400">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <div>
                <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                  {t("evaluation_marking_schema_loading")}
                </p>
                <p className="text-sm">
                  {t("evaluation_marking_schema_loading_desc")}
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
                  {t("evaluation_marking_schema_empty_title")}
                </p>
                <p className="max-w-xl text-sm text-gray-500 dark:text-gray-400">
                  {t("evaluation_marking_schema_empty_desc")}
                </p>
              </div>
              <Button variant="secondary" onClick={onRefresh}>
                {t("evaluation_marking_schema_retry")}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {orderedSections.map((section) => (
                <div key={section.partName} className="space-y-4">
                  <div className="sticky top-0 z-10 -mx-1 rounded-2xl bg-gray-100/95 px-4 py-3 backdrop-blur dark:bg-[#181818]/95">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-700 dark:text-gray-200">
                      {section.partName}
                    </h3>
                  </div>

                  {section.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2a2a2a] dark:bg-[#141414]"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:bg-teal-900/20 dark:text-teal-300">
                              {question.partName || t("question")}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {question.questionNumber}
                            </span>
                            {typeof question.maxMarks === "number" ? (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {question.maxMarks} {t("marks")}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">
                            {question.questionText ||
                              t("evaluation_results_question", { id: index + 1 })}
                          </p>
                        </div>
                      </div>

                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                        {t("evaluation_marking_schema_extracted_reference")}
                      </label>
                      <div
                        className="
                          relative
                          [&_ul]:bottom-full!
                          [&_ul]:top-auto!
                          [&_ul]:mb-2!
                          [&_ul]:z-50!
                          [&_ul]:shadow-lg
                          [&_ul]:rounded-lg
                          [&_ul]:border-gray-200!
                          dark:[&_ul]:bg-[#1F1F1F]!
                          dark:[&_ul]:border-[#333]!
                          dark:[&_ul]:text-gray-200!
                        "
                      >
                        <ReactTransliterate
                          value={question.referenceText}
                          onChangeText={(text) => {
                            handleQuestionChange(question.id, text);
                          }}
                          lang="si"
                          renderComponent={(props) => (
                            <textarea
                              {...props}
                              onPaste={(event) =>
                                handlePaste(
                                  event,
                                  question.id,
                                  question.referenceText
                                )
                              }
                              className="min-h-[148px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-teal-500 focus:bg-white dark:border-[#2a2a2a] dark:bg-[#101010] dark:text-gray-100 dark:focus:border-teal-400"
                              placeholder={t("evaluation_marking_schema_reference_placeholder")}
                            />
                          )}
                          containerStyles={{ width: "100%", position: "relative" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-[#2a2a2a] dark:bg-[#161616]">
          <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={onRefresh}
              disabled={loading || saving}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {t("evaluation_marking_schema_refresh")}
            </Button>
            <Button
              variant="ghost"
              onClick={onDelete}
              disabled={loading || saving || !schema}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              {t("evaluation_marking_schema_delete")}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => onSave(questions)}
              disabled={loading || saving || questions.length === 0}
            >
              {saving
                ? t("evaluation_marking_schema_saving")
                : t("evaluation_marking_schema_save_changes")}
            </Button>
            <Button
              onClick={() => onConfirm(questions)}
              disabled={loading || saving || questions.length === 0}
              className="min-w-[180px]"
            >
              {saving
                ? t("evaluation_marking_schema_saving")
                : t("evaluation_marking_schema_confirm_schema")}
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
