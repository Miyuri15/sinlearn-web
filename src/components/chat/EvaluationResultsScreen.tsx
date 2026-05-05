import React, { useState, useEffect } from "react";
import {
  FileText,
  BarChart2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Loader2,
  BookOpen,
  ListChecks,
  X
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import {
  getEvaluationSessionResults,
  getEvaluationResult,
  getEvaluationAnswerFeedback,
  generateEvaluationFeedback,
  getAnswerDocuments
} from "@/lib/api/evaluation";
import { ApiError } from "@/lib/api/client";

// Mock data generator for demonstration (kept for backward compatibility)
export const generateMockResult = (fileName: string) => ({
  id: fileName,
  fileName,
  overallGrade: ["A", "B", "C", "S"][Math.floor(Math.random() * 4)],
  overallScore: Math.floor(Math.random() * 40) + 60,
  overallFeedback: {
    en: "The student has demonstrated a good understanding of the core concepts. The answers are well-structured, though some examples could be more specific to the local context. Handwriting is clear and legible.",
    si: "ශිෂ්‍යයා මූලික සංකල්ප පිළිබඳ හොඳ අවබෝධයක් පෙන්නුම් කර ඇත. පිළිතුරු හොඳින් ගොඩනඟා ඇති නමුත් සමහර උදාහරණ දේශීය සන්දර්භයට වඩාත් නිශ්චිත විය හැකිය. අත් අකුරු පැහැදිලි සහ කියවිය හැකි ය."
  },
  questions: [
    {
      id: 1,
      score: 8,
      maxScore: 10,
      feedback: {
        en: "Correct definition provided. Examples could be more relevant to the question asked.",
        si: "නිවැරදි අර්ථ දැක්වීමක් ලබා දී ඇත. උදාහරණ අසන ලද ප්‍රශ්නයට වඩාත් අදාළ විය හැකිය."
      },
      missedConcepts: {
        en: ["Specific examples of Newton's laws in daily life"],
        si: ["එදිනෙදා ජීවිතයේ නිව්ටන්ගේ නියමයන් සඳහා නිශ්චිත උදාහරණ"]
      },
      correctConcepts: {
        en: ["Definition of force", "SI units"],
        si: ["බලයේ අර්ථ දැක්වීම", "SI ඒකක"]
      }
    }
  ]
});

interface EvaluationResultsScreenProps {
  evaluationSessionId?: string;
  answerSheets: File[];
  answerResourceIds?: string[];
  results?: any[]; // Optional prop to pass pre-calculated results (for backward compatibility)
  onAnalysisClick: (results: ResultSummary[]) => void;
  onViewHistory: () => void;
  onStartNewAnswerEvaluation: () => void | Promise<void>;
}

interface ResultSummary {
  answer_document_id: string;
  backend_answer_document_id?: string | null;
  student_identifier: string;
  total_score: number;
  percentage_score: number | null;
  overall_feedback: string | null;
  evaluated_at: string;
}

interface DetailedResult {
  answer_document_id: string;
  backend_answer_document_id?: string | null;
  total_score: number;
  percentage_score: number | null;
  overall_feedback: string | null;
  improvement_points: string[];
  question_feedback?: any[];
  marks_summary?: Record<string, Array<{ label: string; awarded: number; max: number; is_selected?: boolean }>>;
  marking_schema?: any;
  answer_mapping?: any;
  isHydratedFromProps?: boolean;
}

type ReviewModalState = {
  type: "schema" | "mapping";
  result: DetailedResult;
  title: string;
} | null;

type NormalizedQuestionFeedback = {
  id: string;
  label: string;
  mainQuestionKey: string;
  subLabel: string | null;
  paperPart: string;
  score: number;
  maxScore: number | null;
  feedback: string | null;
  isLeaf: boolean;
};

const SUB_QUESTION_PATTERN = /^(\d+)\s*(?:[.)-]?\s*)?\(?([a-zA-Z])\)?$/;
const SUB_QUESTION_BRACKET_PATTERN = /(?:^|\b)(\d+)\s*[\(\[]\s*([\p{L}\d]+)\s*[\)\]]\s*$/u;
const SUB_QUESTION_SEPARATED_PATTERN = /(?:^|\b)(\d+)\s*[.\-]\s*([\p{L}\d]+)\s*$/u;
const MAIN_QUESTION_PATTERN = /(\d+)/;

function toNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseQuestionLabel(rawLabel: string): {
  displayLabel: string;
  mainQuestionKey: string;
  subLabel: string | null;
} {
  const label = rawLabel.trim();
  const subMatch =
    label.match(SUB_QUESTION_PATTERN) ||
    label.match(SUB_QUESTION_BRACKET_PATTERN) ||
    label.match(SUB_QUESTION_SEPARATED_PATTERN);
  if (subMatch) {
    const main = subMatch[1];
    const sub = subMatch[2].toLowerCase();
    return {
      displayLabel: `${main}(${sub})`,
      mainQuestionKey: main,
      subLabel: sub,
    };
  }

  const mainMatch = label.match(MAIN_QUESTION_PATTERN);
  if (mainMatch) {
    const main = mainMatch[1];
    return {
      displayLabel: label,
      mainQuestionKey: main,
      subLabel: null,
    };
  }

  return {
    displayLabel: label,
    mainQuestionKey: label || "unknown",
    subLabel: null,
  };
}

function normalizeQuestionFeedback(rawItems: any[]): NormalizedQuestionFeedback[] {
  return (rawItems || []).map((item: any, idx: number) => {
    const backendLabel =
      item?.question_label ||
      item?.questionNumber ||
      item?.question_number ||
      item?.label ||
      `Question ${idx + 1}`;

    const parsed = parseQuestionLabel(String(backendLabel));

    return {
      id: String(item?.id ?? `q-${idx}`),
      label:
        item?.question_label ||
        item?.questionNumber ||
        item?.question_number ||
        item?.label ||
        `Question ${idx + 1}`,
      mainQuestionKey: String(item?.main_question_key || parsed.mainQuestionKey || "unknown"),
      subLabel: item?.sub_label
        ? String(item.sub_label).toLowerCase()
        : parsed.subLabel,
      paperPart: String(item?.paper_part_display || item?.paper_part || "Other"),
      score: toNumeric(item?.score ?? item?.awarded_marks) ?? 0,
      maxScore: toNumeric(item?.max_score ?? item?.max_marks),
      feedback: typeof item?.feedback === "string" ? item.feedback : null,
      isLeaf: item?.is_leaf !== false,
    };
  });
}

function hasRealBackendQuestionFeedback(items: any[] | undefined): boolean {
  return Array.isArray(items) && items.some(
    (item) =>
      item?.paper_part ||
      item?.paper_part_display ||
      item?.question_label ||
      item?.main_question_key ||
      item?.max_marks !== undefined
  );
}

function hasUsableDetailedFeedback(detail: DetailedResult | undefined): boolean {
  if (!detail) return false;
  if (detail.isHydratedFromProps) {
    return hasRealBackendQuestionFeedback(detail.question_feedback);
  }
  return true;
}

function formatEvaluationError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (typeof error.details === "string" && error.details.trim()) {
      return error.details;
    }

    if (error.details && typeof error.details === "object") {
      const details = error.details as Record<string, unknown>;
      const detailMessage =
        (typeof details.detail === "string" && details.detail) ||
        (typeof details.message === "string" && details.message);

      if (detailMessage) return detailMessage;

      try {
        return JSON.stringify(details);
      } catch {
        return error.message || fallback;
      }
    }
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  try {
    const serialized = JSON.stringify(error);
    return serialized && serialized !== "{}" ? serialized : fallback;
  } catch {
    return fallback;
  }
}

export default function EvaluationResultsScreen({
  evaluationSessionId,
  answerSheets,
  answerResourceIds,
  results: propResults,
  onAnalysisClick,
  onViewHistory,
  onStartNewAnswerEvaluation
}: EvaluationResultsScreenProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultsSummary, setResultsSummary] = useState<ResultSummary[]>([]);
  const [docIdToFilenameMap, setDocIdToFilenameMap] = useState<Map<string, string>>(new Map());
  const [detailedResults, setDetailedResults] = useState<Map<string, DetailedResult>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [generatingFeedback, setGeneratingFeedback] = useState<Set<string>>(new Set());
  const [reviewModal, setReviewModal] = useState<ReviewModalState>(null);

  const { t, i18n } = useTranslation("chat");
  const contentLanguage: "en" | "si" = i18n.language?.startsWith("si") ? "si" : "en";

  // Fetch results summary on mount
  useEffect(() => {
    const hydrateFromProps = () => {
      if (!propResults || propResults.length === 0) return;

      const normalizedSummary: ResultSummary[] = propResults.map((r, idx) => {
        const backendId =
          (typeof r.answer_document_id === "string" && r.answer_document_id) ||
          (typeof r.answerDocumentId === "string" && r.answerDocumentId) ||
          null;
        const localId =
          backendId ||
          `prop-${idx}-${String(r.id || r.fileName || r.student_identifier || "result")}`;

        return {
          answer_document_id: localId,
          backend_answer_document_id: backendId,
          student_identifier: r.student_identifier || r.fileName || r.id,
          total_score: r.total_score || r.overallScore || 0,
          percentage_score: r.percentage_score ?? r.overallScore ?? null,
          overall_feedback: typeof r.overall_feedback === 'string' ? r.overall_feedback : (r.overallFeedback?.en || null),
          evaluated_at: r.evaluated_at || new Date().toISOString()
        };
      });

      setResultsSummary(normalizedSummary);

      const newDetailed = new Map<string, DetailedResult>();
      propResults.forEach((r, idx) => {
        const backendId =
          (typeof r.answer_document_id === "string" && r.answer_document_id) ||
          (typeof r.answerDocumentId === "string" && r.answerDocumentId) ||
          null;
        const localId =
          backendId ||
          `prop-${idx}-${String(r.id || r.fileName || r.student_identifier || "result")}`;
        const questionFeedback = r.question_feedback || r.question_feedbacks || r.questions || [];

        newDetailed.set(localId, {
          answer_document_id: localId,
          backend_answer_document_id: backendId,
          total_score: r.total_score || r.overallScore || 0,
          percentage_score: r.percentage_score ?? r.overallScore ?? null,
          overall_feedback: typeof r.overall_feedback === 'string' ? r.overall_feedback : (r.overallFeedback?.en || null),
          improvement_points: r.improvement_points || [],
          question_feedback: questionFeedback,
          marks_summary: r.marks_summary || {},
          marking_schema: r.marking_schema || null,
          answer_mapping: r.answer_mapping || null,
          isHydratedFromProps: true,
        });
      });
      setDetailedResults(newDetailed);
      setIsLoading(false);
    };

    // If results are passed as props (e.g. from history), use them directly
    if (propResults && propResults.length > 0) {
      hydrateFromProps();
      if (!evaluationSessionId) return;
    }

    if (!evaluationSessionId) {
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      if (!propResults || propResults.length === 0) {
        setIsLoading(true);
      }
      setError(null);
      try {
        // 1. Fetch all results for the session
        const data = await getEvaluationSessionResults(evaluationSessionId);

        // 2. Fetch answer documents to map resource IDs to answer document IDs and build filename map
        let mappedAnswerIds: string[] = [];
        const newDocIdToFilenameMap = new Map<string, string>();

        try {
          const answerDocs = await getAnswerDocuments(evaluationSessionId);

          // Build a lookup for resource ID -> filename from answerSheets prop
          const resourceToFilename = new Map<string, string>();
          if (answerResourceIds && answerSheets) {
            answerResourceIds.forEach((rid, idx) => {
              if (answerSheets[idx]?.name) {
                resourceToFilename.set(rid, answerSheets[idx].name);
              }
            });
          }

          answerDocs.forEach((doc: any) => {
            // Populate ID mapping for filtering
            if (answerResourceIds && answerResourceIds.includes(doc.resource_id)) {
              mappedAnswerIds.push(doc.id);
            }

            // Populate filename mapping for display
            // Prioritize name from answerDocs if backend provided one, or lookup from resourceToFilename
            const filename = resourceToFilename.get(doc.resource_id) || doc.filename || doc.name;
            if (filename && !filename.includes("Answer Sheet") && filename !== "untreated") {
              newDocIdToFilenameMap.set(doc.id, filename);
            }
          });

          setDocIdToFilenameMap(newDocIdToFilenameMap);
        } catch (mapErr) {
          console.error("Failed to fetch answer document mapping:", mapErr);
          // Fallback filtering logic
        }

        // 3. Filter results by mapped answer IDs if we have them
        const filtered = mappedAnswerIds.length > 0
          ? (data || []).filter((r: ResultSummary) => mappedAnswerIds.includes(r.answer_document_id))
          : (data || []); // Fallback to all results if no filtering or mapping fails

        setResultsSummary(
          (filtered || []).map((r: ResultSummary) => ({
            ...r,
            backend_answer_document_id: r.answer_document_id,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch evaluation results:", err);
        if (!propResults || propResults.length === 0) {
          setError(formatEvaluationError(err, t("evaluation_results_failed_load")));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [evaluationSessionId, answerResourceIds, answerSheets, propResults]);

  // Fetch detailed result when expanding
  const toggleExpand = async (answerId: string) => {
    // If feedback is already loaded, just toggle
    if (detailedResults.has(answerId)) {
      setExpandedId(expandedId === answerId ? null : answerId);
      return;
    }

    // If feedback is not loaded, we don't allow expanding via chevron alone anymore
    // expansion happens via "View Feedback" button now
  };

  const handleViewFeedback = async (summary: ResultSummary) => {
    const rowId = summary.answer_document_id;
    const backendAnswerId = summary.backend_answer_document_id || summary.answer_document_id;

    if (expandedId === rowId) {
      setExpandedId(null);
      return;
    }

    // If we already have the detailed result, just expand
    const existingDetail = detailedResults.get(rowId);
    if (hasUsableDetailedFeedback(existingDetail)) {
      setExpandedId(rowId);
      return;
    }

    if (!summary.backend_answer_document_id) {
      setError(t("evaluation_results_detail_syncing"));
      return;
    }

    setError(null);
    setGeneratingFeedback(prev => new Set(prev).add(rowId));
    try {
      // First generate the feedback
      await generateEvaluationFeedback(backendAnswerId);

      // Then fetch result and feedback details
      const [resultData, feedbackData] = await Promise.all([
        getEvaluationResult(backendAnswerId),
        getEvaluationAnswerFeedback(backendAnswerId)
      ]);

      const combined: DetailedResult = {
        answer_document_id: rowId,
        backend_answer_document_id: backendAnswerId,
        total_score: resultData.total_score || 0,
        percentage_score: resultData.percentage_score ?? null,
        overall_feedback: feedbackData.overall_feedback || null,
        improvement_points: feedbackData.improvement_points || [],
        question_feedback: resultData.question_feedbacks || [],
        marks_summary: resultData.marks_summary || {},
        marking_schema: resultData.marking_schema || null,
        answer_mapping: resultData.answer_mapping || null,
        isHydratedFromProps: false,
      };

      setDetailedResults(prev => new Map(prev).set(rowId, combined));
      setExpandedId(rowId);
    } catch (err) {
      console.error(`Failed to generate/fetch feedback for answer ${backendAnswerId}:`, err);
      setError(formatEvaluationError(err, t("evaluation_results_failed_feedback")));
    } finally {
      setGeneratingFeedback(prev => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    }
  };

  const loadDetailedResultForReview = async (summary: ResultSummary): Promise<DetailedResult | null> => {
    const rowId = summary.answer_document_id;
    const backendAnswerId = summary.backend_answer_document_id || summary.answer_document_id;
    const existing = detailedResults.get(rowId);

    if (existing && !existing.isHydratedFromProps && (existing.marking_schema || existing.answer_mapping)) {
      return existing;
    }

    if (!backendAnswerId) {
      setError(t("evaluation_results_review_syncing"));
      return null;
    }

    setError(null);
    setLoadingDetails(prev => new Set(prev).add(rowId));
    try {
      const resultData = await getEvaluationResult(backendAnswerId);
      const hydrated: DetailedResult = {
        answer_document_id: rowId,
        backend_answer_document_id: backendAnswerId,
        total_score: resultData.total_score || 0,
        percentage_score: resultData.percentage_score ?? null,
        overall_feedback: resultData.overall_feedback || existing?.overall_feedback || null,
        improvement_points: resultData.improvement_points || existing?.improvement_points || [],
        question_feedback: resultData.question_feedbacks || existing?.question_feedback || [],
        marks_summary: resultData.marks_summary || existing?.marks_summary || {},
        marking_schema: resultData.marking_schema || existing?.marking_schema || null,
        answer_mapping: resultData.answer_mapping || existing?.answer_mapping || null,
        isHydratedFromProps: false,
      };

      setDetailedResults(prev => new Map(prev).set(rowId, hydrated));
      return hydrated;
    } catch (err) {
      console.error(`Failed to fetch review details for answer ${backendAnswerId}:`, err);
      setError(formatEvaluationError(err, t("evaluation_results_failed_review")));
      return null;
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    }
  };

  const handleOpenReview = async (
    summary: ResultSummary,
    type: "schema" | "mapping",
  ) => {
    const detail = await loadDetailedResultForReview(summary);
    if (!detail) return;
    setReviewModal({
      type,
      result: detail,
      title:
        type === "schema"
          ? t("evaluation_results_generated_schema")
          : t("evaluation_results_mapped_answers"),
    });
  };


  const getStudentDisplayName = (documentId: string, identifier: string) => {
    // 1. Check mapped filenames from useEffect
    if (docIdToFilenameMap.has(documentId)) {
      return docIdToFilenameMap.get(documentId)!;
    }

    // 2. Prioritize filenames from answerSheets if available (legacy/fallback)
    if (answerResourceIds && answerSheets) {
      const idx = answerResourceIds.indexOf(documentId);
      if (idx !== -1 && answerSheets[idx]) {
        // If it's a File object with a real name (not just placeholder from history)
        const name = answerSheets[idx].name;
        if (name && !name.includes("Answer Sheet") && name !== "untreated") {
          return name;
        }
      }
    }

    // 3. Clean up common "Student-UUID" pattern from backend
    if (identifier && identifier.startsWith("Student-")) {
      // If we have a filename in the identifier (sometimes backend does this), keep it, else it's just a UUID
      const parts = identifier.split("-");
      if (parts.length > 2) {
        // It's likely Student-UUID-ActualName.pdf or similar
        // Try to return everything after the first two parts if it looks like a name
        return identifier; // Default to full identifier if ambiguous
      }
    }

    // 3. Last fallback
    return identifier || t("evaluation_results_unknown_student");
  };


  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6 pb-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400">{t("evaluation_results_loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6 pb-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={() => window.location.reload()} variant="secondary">
              {t("evaluation_results_retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6 pb-20">
      {/* Header Section */}
      <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 p-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              <CheckCircle className="h-3.5 w-3.5" />
              {t("evaluation_results_complete_badge")}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t("evaluation_results_title")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {t("evaluation_results_subtitle", { count: resultsSummary.length })}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <Button
              onClick={onStartNewAnswerEvaluation}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white"
            >
              <FileText className="w-4 h-4" />
              {t("evaluation_start_new_answer_evaluation")}
            </Button>

            <Button
              onClick={onViewHistory}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Clock className="w-4 h-4" />
              {t("evaluation_results_history")}
            </Button>

            <Button
              onClick={() => onAnalysisClick(resultsSummary)}
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              <BarChart2 className="w-4 h-4" />
              {t("evaluation_results_evaluation_analysis")}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 dark:divide-[#2a2a2a] dark:border-[#2a2a2a] dark:bg-[#161616] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("evaluation_results_sheets")}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{resultsSummary.length}</p>
          </div>
          <div className="px-6 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("evaluation_results_review_tools")}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("evaluation_results_review_tools_value")}
            </p>
          </div>
          <div className="px-6 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("evaluation_results_feedback")}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("evaluation_results_feedback_value")}
            </p>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {[...resultsSummary].reverse().map((result) => {
          const detailedResult = detailedResults.get(result.answer_document_id);
          const isLoadingDetail = loadingDetails.has(result.answer_document_id);

          return (
            <div
              key={result.answer_document_id}
              className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden transition-all"
            >
              {/* Card Header / Summary */}
              <div
                className="p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a]/50 transition-colors"
                onClick={() => toggleExpand(result.answer_document_id)}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg truncate">
                      {getStudentDisplayName(result.answer_document_id, result.student_identifier)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        {t("evaluation_results_completed")}
                      </span>
                      <span>•</span>
                      <span>{new Date(result.evaluated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-4 xl:w-auto xl:flex-row xl:items-center xl:justify-end">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-left dark:border-blue-900/40 dark:bg-blue-900/20 xl:text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{t("evaluation_results_score")}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {result.percentage_score !== null && result.percentage_score !== undefined
                        ? `${result.percentage_score}%`
                        : `${result.total_score}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 xl:justify-end xl:border-l xl:border-gray-200 xl:pl-6 dark:xl:border-[#333]">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReview(result, "schema");
                      }}
                      disabled={isLoadingDetail}
                      className="flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isLoadingDetail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                      {t("evaluation_results_schema")}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReview(result, "mapping");
                      }}
                      disabled={isLoadingDetail}
                      className="flex items-center gap-2 whitespace-nowrap bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      {isLoadingDetail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ListChecks className="w-4 h-4" />
                      )}
                      {t("evaluation_results_mapped_answers")}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewFeedback(result);
                      }}
                      disabled={generatingFeedback.has(result.answer_document_id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 whitespace-nowrap min-w-[120px]"
                    >
                      {generatingFeedback.has(result.answer_document_id) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("evaluation_results_generating")}
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          {t("view_feedback")}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="hidden xl:block pl-2">
                    {expandedId === result.answer_document_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown
                        className={`w-5 h-5 transition-opacity ${detailedResults.has(result.answer_document_id) ? 'text-gray-400' : 'text-gray-200 dark:text-gray-800'}`}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === result.answer_document_id && detailedResult && (
                <div className="border-t border-gray-200 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#0C0C0C]/50">
                  <div className="p-6 space-y-8">
                    {/* Marks Summary Section */}
                    {detailedResult.marks_summary && Object.keys(detailedResult.marks_summary).length > 0 && (
                      <section>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {t("marks_summary")}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(detailedResult.marks_summary).map(([part, questions]) => {
                            // Determine if selection is in play (i.e., some rows are marked not selected)
                            const hasSelection = questions.some(q => q.is_selected === false);
                            const selectedQuestions = hasSelection ? questions.filter(q => q.is_selected !== false) : questions;
                            const totalAwarded = selectedQuestions.reduce((sum, q) => sum + q.awarded, 0);
                            const totalMax = selectedQuestions.reduce((sum, q) => sum + q.max, 0);

                            return (
                              <div key={part} className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden">
                                <div className="bg-gray-50 dark:bg-[#222] px-4 py-2 border-b border-gray-200 dark:border-[#2a2a2a] flex justify-between items-center">
                                  <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{part}</h5>
                                  {hasSelection && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                      {t("evaluation_results_best_selected", {
                                        selected: selectedQuestions.length / 3,
                                        total: Math.round(questions.length / 3),
                                      })}
                                    </span>
                                  )}

                                </div>
                                <div className="p-0">
                                  <table className="w-full text-sm text-left">
                                    <thead>
                                      <tr className="border-b border-gray-100 dark:border-[#2a2a2a] text-gray-500 dark:text-gray-400">
                                        <th className="px-4 py-2 font-medium">{t("question")}</th>
                                        <th className="px-4 py-2 font-medium text-right">{t("marks")}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a2a]">
                                      {questions.map((q, qIdx) => {
                                        const isNotSelected = hasSelection && q.is_selected === false;
                                        return (
                                          <tr
                                            key={qIdx}
                                            className={`text-gray-700 dark:text-gray-300 ${isNotSelected ? 'opacity-40' : ''
                                              }`}
                                            title={isNotSelected ? t("evaluation_results_not_counted") : ""}
                                          >
                                            <td className="px-4 py-2">
                                              {q.label}
                                              {isNotSelected && <span className="ml-1 text-xs text-gray-400">✗</span>}
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold">
                                              <span className={q.awarded === q.max ? "text-green-600 dark:text-green-400" : ""}>
                                                {q.awarded}
                                              </span>
                                              <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
                                              <span>{q.max}</span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                      <tr className="bg-blue-50/30 dark:bg-blue-900/10 font-bold text-blue-700 dark:text-blue-300">
                                        <td className="px-4 py-2">
                                          {t("total")}
                                          {hasSelection && (
                                            <span className="font-normal text-xs text-blue-400 ml-1">
                                              {t("evaluation_results_selected_suffix")}
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                          {Math.round(totalAwarded * 100) / 100}
                                          <span className="text-blue-400 dark:text-blue-500 mx-1">/</span>
                                          {totalMax}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {/* Overall Feedback */}
                    {detailedResult.question_feedback && detailedResult.question_feedback.length > 0 && (
                    <section>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" />
                        {t("evaluation_results_question_wise_breakdown")}
                      </h4>

                      <div className="space-y-6">
                        {(() => {
                          const normalized = normalizeQuestionFeedback(detailedResult.question_feedback || []);

                          const getPerformanceClass = (score: number, maxScore: number | null) => {
                            if (!maxScore || maxScore <= 0) {
                              return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
                            }
                            const ratio = score / maxScore;
                            if (ratio >= 0.75) return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
                            if (ratio >= 0.4) return "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400";
                            return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                          };

                          const getPerformanceIcon = (score: number, maxScore: number | null) => {
                            if (!maxScore || maxScore <= 0) {
                              return <MessageSquare className="w-4 h-4 text-slate-500" />;
                            }
                            const ratio = score / maxScore;
                            if (ratio >= 0.75) return <CheckCircle className="w-4 h-4 text-green-500" />;
                            if (ratio >= 0.4) return <AlertCircle className="w-4 h-4 text-amber-500" />;
                            return <XCircle className="w-4 h-4 text-red-500" />;
                          };

                          const paperGroups = normalized.reduce((acc, item) => {
                            const key = item.paperPart || t("evaluation_results_other");
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(item);
                            return acc;
                          }, {} as Record<string, NormalizedQuestionFeedback[]>);

                          return Object.entries(paperGroups).map(([paperPart, items]) => {
                            const grouped: Array<
                              | { type: "single"; item: NormalizedQuestionFeedback }
                              | { type: "main"; mainQuestion: string; items: NormalizedQuestionFeedback[] }
                            > = [];

                            const groupedMainIndex = new Map<string, number>();

                            for (const current of items) {
                              const hasSub = Boolean(current.subLabel);

                              if (!hasSub) {
                                grouped.push({ type: "single", item: current });
                                continue;
                              }

                              const groupKey = `${paperPart}::${current.mainQuestionKey}`;
                              const existingIndex = groupedMainIndex.get(groupKey);

                              if (existingIndex !== undefined) {
                                const existingGroup = grouped[existingIndex];
                                if (existingGroup?.type === "main") {
                                  existingGroup.items.push(current);
                                }
                                continue;
                              }

                              grouped.push({
                                type: "main",
                                mainQuestion: current.mainQuestionKey,
                                items: [current],
                              });
                              groupedMainIndex.set(groupKey, grouped.length - 1);
                            }

                            return (
                              <div
                                key={paperPart}
                                className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden"
                              >
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1c1c1c]">
                                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                                    {paperPart}
                                  </h5>
                                </div>

                                <div className="p-4 space-y-4">
                                  {grouped.map((group, idx) => {
                                    if (group.type === "single") {
                                      const q = group.item;
                                      return (
                                        <div
                                          key={`single-${paperPart}-${q.id}-${idx}`}
                                          className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-4 space-y-4"
                                        >
                                          <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-center gap-2">
                                              {getPerformanceIcon(q.score, q.maxScore)}
                                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {q.label}
                                              </span>
                                            </div>
                                            <span
                                              className={clsx(
                                                "text-sm font-semibold px-2 py-1 rounded",
                                                getPerformanceClass(q.score, q.maxScore)
                                              )}
                                            >
                                              {q.maxScore !== null ? `${q.score} / ${q.maxScore}` : `${q.score}`}
                                            </span>
                                          </div>

                                          {q.feedback && (
                                            <div className="pt-2 border-t border-gray-100 dark:border-[#2a2a2a]">
                                              <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                {t("evaluation_results_feedback")}
                                              </h5>
                                              <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown>{q.feedback}</ReactMarkdown>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }

                                    return (
                                      <div
                                        key={`main-${paperPart}-${group.mainQuestion}-${idx}`}
                                        className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden"
                                      >
                                        <details open className="group">
                                          <summary className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1c1c1c] cursor-pointer list-none flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                              {t("evaluation_results_question", {
                                                id: group.mainQuestion,
                                              })}
                                            </span>
                                            <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                                          </summary>

                                          <div className="p-4 space-y-4">
                                            {group.items.map((q, subIdx) => (
                                              <div
                                                key={`sub-${paperPart}-${q.id}-${subIdx}`}
                                                className="rounded-md border border-gray-100 dark:border-[#2a2a2a] p-3"
                                              >
                                                <div className="flex justify-between items-start gap-3">
                                                  <div className="flex items-center gap-2">
                                                    {getPerformanceIcon(q.score, q.maxScore)}
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                      {q.label}
                                                    </span>
                                                  </div>
                                                  <span
                                                    className={clsx(
                                                      "text-xs font-semibold px-2 py-1 rounded whitespace-nowrap",
                                                      getPerformanceClass(q.score, q.maxScore)
                                                    )}
                                                  >
                                                    {q.maxScore !== null ? `${q.score} / ${q.maxScore}` : `${q.score}`}
                                                  </span>
                                                </div>

                                                {q.feedback && (
                                                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-[#2a2a2a]">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                                      <ReactMarkdown>{q.feedback}</ReactMarkdown>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </details>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </section>
                  )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {reviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setReviewModal(null)}
        >
          <div
            className="w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111111] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-[#2a2a2a] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {reviewModal.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getStudentDisplayName(
                    reviewModal.result.answer_document_id,
                    resultsSummary.find(r => r.answer_document_id === reviewModal.result.answer_document_id)?.student_identifier ||
                      t("evaluation_results_student")
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-[#1f1f1f] dark:hover:text-gray-100"
                aria-label={t("evaluation_results_close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(85vh-82px)] overflow-auto p-5">
              {reviewModal.type === "schema" ? (
                <div className="space-y-5">
                  {(() => {
                    const items = reviewModal.result.marking_schema?.items || [];
                    if (!items.length) {
                      return (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("evaluation_results_no_schema")}
                        </p>
                      );
                    }

                    const grouped = items.reduce((acc: Record<string, any[]>, item: any) => {
                      const key = item.part_display || item.part_name || t("evaluation_results_other");
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(item);
                      return acc;
                    }, {});

                    return (Object.entries(grouped) as Array<[string, any[]]>).map(([part, partItems]) => (
                      <section key={part} className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                          {part}
                        </h4>
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[#2a2a2a]">
                          <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-[#1c1c1c] dark:text-gray-400">
                              <tr>
                                <th className="px-4 py-3 font-medium">{t("question")}</th>
                                <th className="px-4 py-3 font-medium">{t("marks")}</th>
                                <th className="px-4 py-3 font-medium">{t("evaluation_results_question_text")}</th>
                                <th className="px-4 py-3 font-medium">{t("evaluation_results_covering_points")}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                              {partItems.map((item: any) => (
                                <tr key={String(item.id || item.question_id || item.question_number)}>
                                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                    {item.question_number || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                    {item.max_marks ?? "-"}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                    {item.question_text || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {item.reference_text || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    ));
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const details = reviewModal.result.answer_mapping?.details || [];
                    if (!details.length) {
                      return (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("evaluation_results_no_mapped_answers")}
                        </p>
                      );
                    }

                    return (
                      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[#2a2a2a]">
                        <table className="w-full min-w-[760px] text-left text-sm">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-[#1c1c1c] dark:text-gray-400">
                            <tr>
                              <th className="px-4 py-3 font-medium">{t("evaluation_results_mapped_question")}</th>
                              <th className="px-4 py-3 font-medium">{t("marks")}</th>
                              <th className="px-4 py-3 font-medium">{t("evaluation_results_question_text")}</th>
                              <th className="px-4 py-3 font-medium">{t("evaluation_results_student_answer")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                            {details.map((item: any) => (
                              <tr key={String(item.question_id || item.display_label)}>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                  {item.display_label || item.question_number || "-"}
                                  {!item.is_mapped_to_current_question && (
                                    <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                      {t("evaluation_results_unresolved")}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                  {item.max_marks ?? "-"}
                                </td>
                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                  {item.question_text || "-"}
                                </td>
                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {item.student_answer || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
