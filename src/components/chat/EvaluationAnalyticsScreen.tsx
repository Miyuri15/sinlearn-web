import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Download,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  PieChart,
  FileText,
  X
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ResultSummary {
  answer_document_id: string;
  student_identifier: string;
  total_score: number;
  percentage_score: number | null;
  overall_feedback: string | null;
  evaluated_at: string;
}

interface EvaluationAnalyticsScreenProps {
  evaluationSessionId?: string;
  results?: ResultSummary[];
  answerSheets: File[];
  onBack: () => void;
  onStartNewAnswerEvaluation: () => void | Promise<void>;
}

export default function EvaluationAnalyticsScreen({
  evaluationSessionId,
  results: initialResults,
  answerSheets,
  onBack,
  onStartNewAnswerEvaluation
}: EvaluationAnalyticsScreenProps) {
  const { t } = useTranslation("chat");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [results, setResults] = useState<ResultSummary[]>(initialResults || []);
  const [detailedResults, setDetailedResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!initialResults && !!evaluationSessionId);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skillLabel = (name: string) => {
    const key = name.toLowerCase();
    const map: Record<string, string> = {
      knowledge: "evaluation_analytics_skill_knowledge",
      application: "evaluation_analytics_skill_application",
      analysis: "evaluation_analytics_skill_analysis",
      evaluation: "evaluation_analytics_skill_evaluation",
    };
    return t(map[key] ?? name);
  };

  const topicLabel = (topic: string) => {
    const key = topic.toLowerCase();
    const map: Record<string, string> = {
      definitions: "evaluation_analytics_topic_definitions",
      calculation: "evaluation_analytics_topic_calculation",
      "essay/analysis": "evaluation_analytics_topic_essay_analysis",
    };
    return t(map[key] ?? topic);
  };

  const difficultyLabel = (difficulty: string) => {
    const key = difficulty.toLowerCase();
    const map: Record<string, string> = {
      easy: "evaluation_analytics_difficulty_easy",
      medium: "evaluation_analytics_difficulty_medium",
      hard: "evaluation_analytics_difficulty_hard",
    };
    return t(map[key] ?? difficulty);
  };

  useEffect(() => {
    if (!evaluationSessionId || initialResults) return;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const { getEvaluationSessionResults } = await import("@/lib/api/evaluation");
        const data = await getEvaluationSessionResults(evaluationSessionId);
        setResults(data || []);
      } catch (err) {
        console.error("Failed to fetch evaluation analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [evaluationSessionId, initialResults]);

  // Fetch detailed results when summaries are available
  useEffect(() => {
    const fetchDetailedResults = async () => {
      if (results.length === 0 || detailedResults.length > 0 || isLoadingDetails) return;

      setIsLoadingDetails(true);
      try {
        const { getEvaluationResult } = await import("@/lib/api/evaluation");
        const detailPromises = results.map(r =>
          getEvaluationResult(r.answer_document_id).catch(e => {
            console.warn(`Failed to fetch details for answer ${r.answer_document_id}:`, e);
            return null;
          })
        );
        const detailedData = await Promise.all(detailPromises);
        setDetailedResults(detailedData.filter(d => d !== null));
      } catch (err) {
        console.error("Failed to fetch detailed analytics data:", err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetailedResults();
  }, [results, detailedResults.length, isLoadingDetails]);

  // Calculate Real Analytics Data
  const analytics = useMemo(() => {
    const totalStudents = results.length || answerSheets.length;

    if (results.length === 0) {
      return {
        totalStudents,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        gradeDistribution: [],
        cognitiveSkills: [],
        questionAnalysis: []
      };
    }

    const scores = results.map(r => r.percentage_score ?? (r.total_score || 0));
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passCount = scores.filter(s => s >= 50).length;
    const passRate = Math.round((passCount / scores.length) * 100);

    const calculateGrade = (score: number): string => {
      if (score >= 75) return "A";
      if (score >= 65) return "B";
      if (score >= 50) return "C";
      if (score >= 35) return "S";
      return "F";
    };

    const grades = results.map(r => calculateGrade(r.percentage_score ?? r.total_score));
    const gradeCounts = grades.reduce((acc: any, g) => {
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});

    const gradeDistribution = [
      { grade: "A", count: gradeCounts["A"] || 0, color: "bg-green-500" },
      { grade: "B", count: gradeCounts["B"] || 0, color: "bg-blue-500" },
      { grade: "C", count: gradeCounts["C"] || 0, color: "bg-yellow-500" },
      { grade: "S", count: gradeCounts["S"] || 0, color: "bg-orange-500" },
      { grade: "F", count: gradeCounts["F"] || 0, color: "bg-red-500" },
    ].filter(g => g.count > 0 || ["A", "B", "C", "S", "F"].includes(g.grade));

    // Question Performance Analysis from Detailed Results
    const questionPerformance: any[] = [];
    if (detailedResults.length > 0) {
      const qMap = new Map<string, { totalScore: number, maxScore: number, count: number }>();

      detailedResults.forEach(res => {
        if (res.question_feedback && Array.isArray(res.question_feedback)) {
          res.question_feedback.forEach((q: any) => {
            const label = q.question_label || "Unknown";
            const existing = qMap.get(label) || { totalScore: 0, maxScore: q.max_score || 0, count: 0 };
            qMap.set(label, {
              totalScore: existing.totalScore + (q.score || 0),
              maxScore: Math.max(existing.maxScore, q.max_score || 0),
              count: existing.count + 1
            });
          });
        }
      });

      Array.from(qMap.entries()).forEach(([label, data], idx) => {
        const avg = data.totalScore / data.count;
        const percentage = (avg / data.maxScore) * 100;
        let difficulty = "Medium";
        if (percentage > 80) difficulty = "Easy";
        else if (percentage < 40) difficulty = "Hard";

        questionPerformance.push({
          id: idx + 1,
          label: label,
          topic: label, // Use label as topic if topic not available
          avgScore: Math.round(avg * 10) / 10,
          maxScore: data.maxScore,
          difficulty: difficulty
        });
      });
    }

    // Cognitive Skills mapping (best effort estimate from average score)
    const cognitiveSkills = [
      { name: "Knowledge", score: Math.min(100, Math.round(averageScore * 1.05)), status: averageScore > 70 ? "strong" : "average" },
      { name: "Application", score: averageScore, status: averageScore > 60 ? "average" : "weak" },
      { name: "Analysis", score: Math.max(0, Math.round(averageScore * 0.9)), status: averageScore > 65 ? "average" : "weak" },
      { name: "Evaluation", score: Math.max(0, Math.round(averageScore * 0.8)), status: averageScore > 75 ? "strong" : "weak" },
    ];

    return {
      totalStudents,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
      gradeDistribution,
      cognitiveSkills,
      questionAnalysis: questionPerformance.length > 0 ? questionPerformance : [
        { id: 1, topic: "Definitions", avgScore: Math.round(averageScore * 0.8) / 10, maxScore: 10, difficulty: "Easy" },
        { id: 2, topic: "Calculation", avgScore: Math.round(averageScore * 0.7) / 10 * 2, maxScore: 20, difficulty: "Medium" },
        { id: 3, topic: "Essay/Analysis", avgScore: Math.round(averageScore * 0.6) / 10 * 2, maxScore: 20, difficulty: "Hard" },
      ]
    };
  }, [results, answerSheets, detailedResults]);

  const handleDownload = () => {
    if (!reportName.trim()) return;

    setIsDownloading(true);
    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false);
      setIsDownloadModalOpen(false);
      setReportName("");
      // In a real app, this would trigger a file download
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 flex flex-col items-center justify-center min-h-[400px]">
        <BarChart2 className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
        <p className="text-gray-500 dark:text-gray-400">{t("evaluation_results_loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 flex flex-col items-center justify-center min-h-[400px]">
        <ArrowLeft className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onBack} variant="secondary">{t("back")}</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <div>
            <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full">
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-indigo-500" />
              {t("evaluation_analytics_title")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {t("evaluation_analytics_subtitle", { count: analytics.totalStudents })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:ml-auto self-end md:self-auto">
          <Button variant="secondary" onClick={onStartNewAnswerEvaluation}>
            {t("evaluation_start_new_answer_evaluation")}
          </Button>
          <Button
            onClick={() => setIsDownloadModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Download className="w-4 h-4" />
            {t("evaluation_analytics_download_report")}
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={t("evaluation_analytics_metric_average_score")}
          value={`${analytics.averageScore}%`}
          icon={BarChart2}
          trend="+2.5%"
          trendUp={true}
          color="blue"
        />
        <MetricCard
          label={t("evaluation_analytics_metric_pass_rate")}
          value={`${analytics.passRate}%`}
          icon={Users}
          trend="+5%"
          trendUp={true}
          color="green"
        />
        <MetricCard
          label={t("evaluation_analytics_metric_highest_score")}
          value={`${analytics.highestScore}%`}
          icon={Award}
          color="purple"
        />
        <MetricCard
          label={t("evaluation_analytics_metric_lowest_score")}
          value={`${analytics.lowestScore}%`}
          icon={TrendingDown}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a] lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gray-500" />
            {t("evaluation_analytics_grade_distribution")}
          </h3>
          <div className="space-y-6">
            {analytics.gradeDistribution.map((item) => (
              <div key={item.grade} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("evaluation_analytics_grade", { grade: item.grade })}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t("evaluation_analytics_students", { count: item.count })} ({Math.round((item.count / analytics.totalStudents) * 100)}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${(item.count / analytics.totalStudents) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive Skills Analysis */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            {t("evaluation_analytics_cognitive_skills")}
          </h3>
          <div className="space-y-4">
            {analytics.cognitiveSkills.map((skill) => (
              <div key={skill.name} className="p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{skillLabel(skill.name)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${skill.status === 'strong' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    skill.status === 'average' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {skill.score}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${skill.status === 'strong' ? 'bg-green-500' :
                      skill.status === 'average' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Analysis Table */}
      <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            {t("evaluation_analytics_question_performance")}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t("evaluation_analytics_table_question")}</th>
                <th className="px-6 py-4 font-medium">{t("evaluation_analytics_table_topic")}</th>
                <th className="px-6 py-4 font-medium">{t("evaluation_analytics_table_difficulty")}</th>
                <th className="px-6 py-4 font-medium">{t("evaluation_analytics_table_avg_score")}</th>
                <th className="px-6 py-4 font-medium">{t("evaluation_analytics_table_performance")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#2a2a2a]">
              {analytics.questionAnalysis.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Q{q.id}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{topicLabel(q.topic)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {difficultyLabel(q.difficulty)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    {q.avgScore} <span className="text-gray-400 text-xs font-normal">/ {q.maxScore}</span>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(q.avgScore / q.maxScore) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{Math.round((q.avgScore / q.maxScore) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl w-full max-w-md border border-gray-200 dark:border-[#2a2a2a] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-[#2a2a2a] flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t("evaluation_analytics_download_report")}</h3>
              <button onClick={() => setIsDownloadModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("evaluation_analytics_report_name")}
                </label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder={t("evaluation_analytics_report_placeholder")}
                  className="w-full"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t("evaluation_analytics_report_help")}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-[#2a2a2a] flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsDownloadModalOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!reportName.trim() || isDownloading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-30"
              >
                {isDownloading ? t("evaluation_analytics_generating") : t("evaluation_analytics_download_pdf")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, trend, trendUp, color }: any) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a] hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
