import React, { useState, useEffect } from "react";
import {
  FileText,
  BarChart2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import {
  getEvaluationSessionResults,
  getEvaluationResult,
  getEvaluationAnswerFeedback
} from "@/lib/api/evaluation";

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
  onAnalysisClick: () => void;
  onViewHistory: () => void;
  onStartNewAnswerEvaluation: () => void | Promise<void>;
}

interface ResultSummary {
  answer_document_id: string;
  student_identifier: string;
  total_score: number;
  percentage_score: number | null;
  overall_feedback: string | null;
  evaluated_at: string;
}

interface DetailedResult {
  answer_document_id: string;
  total_score: number;
  percentage_score: number | null;
  overall_feedback: string | null;
  improvement_points: string[];
  question_feedback?: any[];
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
  const [detailedResults, setDetailedResults] = useState<Map<string, DetailedResult>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  const { t, i18n } = useTranslation("chat");
  const contentLanguage: "en" | "si" = i18n.language?.startsWith("si") ? "si" : "en";

  // Fetch results summary on mount
  useEffect(() => {
    if (!evaluationSessionId) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getEvaluationSessionResults(evaluationSessionId);
        setResultsSummary(data || []);
      } catch (err) {
        console.error("Failed to fetch evaluation results:", err);
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [evaluationSessionId]);

  // Fetch detailed result when expanding
  const toggleExpand = async (answerId: string) => {
    if (expandedId === answerId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(answerId);

    // If we already have the detailed result, don't fetch again
    if (detailedResults.has(answerId)) {
      return;
    }

    // Fetch detailed result and feedback
    setLoadingDetails(prev => new Set(prev).add(answerId));
    try {
      const [resultData, feedbackData] = await Promise.all([
        getEvaluationResult(answerId),
        getEvaluationAnswerFeedback(answerId)
      ]);

      const combined: DetailedResult = {
        answer_document_id: answerId,
        total_score: resultData.total_score || 0,
        percentage_score: resultData.percentage_score,
        overall_feedback: feedbackData.overall_feedback || null,
        improvement_points: feedbackData.improvement_points || [],
        question_feedback: resultData.question_feedback || []
      };

      setDetailedResults(prev => new Map(prev).set(answerId, combined));
    } catch (err) {
      console.error(`Failed to fetch details for answer ${answerId}:`, err);
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev);
        next.delete(answerId);
        return next;
      });
    }
  };

  // Calculate grade from score
  const calculateGrade = (score: number): string => {
    if (score >= 90) return "A";
    if (score >= 75) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "S";
    return "F";
  };

  const getStudentDisplayName = (documentId: string, identifier: string) => {
    if (!answerResourceIds || !answerSheets) return identifier;

    const idx = answerResourceIds.indexOf(documentId);
    if (idx !== -1 && answerSheets[idx]) {
      return answerSheets[idx].name;
    }
    return identifier;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {t("evaluation_results_title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("evaluation_results_subtitle", { count: resultsSummary.length })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onStartNewAnswerEvaluation}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {t("evaluation_start_new_answer_evaluation")}
          </Button>

          <Button
            onClick={onViewHistory}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {t("evaluation_results_history")}
          </Button>

          <Button
            onClick={onAnalysisClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <BarChart2 className="w-4 h-4" />
            {t("evaluation_results_evaluation_analysis")}
          </Button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {[...resultsSummary].reverse().map((result) => {
          const detailedResult = detailedResults.get(result.answer_document_id);
          const isLoadingDetail = loadingDetails.has(result.answer_document_id);
          const grade = calculateGrade(result.total_score);

          return (
            <div
              key={result.answer_document_id}
              className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden transition-all"
            >
              {/* Card Header / Summary */}
              <div
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a]/50 transition-colors"
                onClick={() => toggleExpand(result.answer_document_id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {getStudentDisplayName(result.answer_document_id, result.student_identifier)}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        {t("evaluation_results_completed")}
                      </span>
                      <span>•</span>
                      <span>{new Date(result.evaluated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{t("evaluation_results_grade")}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{grade}</p>
                  </div>
                  <div className="text-right border-l border-gray-200 dark:border-[#333] pl-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{t("evaluation_results_score")}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {result.percentage_score ? `${result.percentage_score}%` : `${result.total_score} pts`}
                    </p>
                  </div>
                  <div className="pl-2">
                    {isLoadingDetail ? (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : expandedId === result.answer_document_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === result.answer_document_id && detailedResult && (
                <div className="border-t border-gray-200 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#0C0C0C]/50">
                  <div className="p-6 space-y-8">
                    {/* Overall Feedback */}
                    {detailedResult.overall_feedback && (
                      <section>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          {t("evaluation_results_overall_feedback")}
                        </h4>
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 text-gray-700 dark:text-gray-300 leading-relaxed">
                          {detailedResult.overall_feedback}
                        </div>
                      </section>
                    )}

                    {/* Improvement Points */}
                    {detailedResult.improvement_points && detailedResult.improvement_points.length > 0 && (
                      <section>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {t("evaluation_results_improvement_points")}
                        </h4>
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
                            {detailedResult.improvement_points.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </section>
                    )}

                    {/* Question-wise Breakdown */}
                    {detailedResult.question_feedback && detailedResult.question_feedback.length > 0 && (
                      <section>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <BarChart2 className="w-4 h-4" />
                          {t("evaluation_results_question_wise_breakdown")}
                        </h4>
                        <div className="space-y-4">
                          {detailedResult.question_feedback.map((q: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-4 space-y-4"
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {q.question_label || `Question ${idx + 1}`}
                                </span>
                                <span className="text-sm font-semibold bg-gray-100 dark:bg-[#222] px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                                  {q.score} / {q.max_score}
                                </span>
                              </div>

                              {/* Feedback */}
                              {q.feedback && (
                                <div className="pt-2 border-t border-gray-100 dark:border-[#2a2a2a]">
                                  <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    {t("evaluation_results_feedback")}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {q.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
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
    </div>
  );
}
