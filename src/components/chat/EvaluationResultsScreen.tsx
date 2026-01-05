import React, { useState, useMemo } from "react";
import { 
  FileText, 
  BarChart2, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Globe,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Languages,
  Clock
} from "lucide-react";
import Button from "@/components/ui/Button";

// Mock data generator for demonstration
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
    },
    {
      id: 2,
      score: 15,
      maxScore: 20,
      feedback: {
        en: "Calculation is correct but intermediate steps are missing. Please show all work.",
        si: "ගණනය කිරීම නිවැරදි නමුත් අතරමැදි පියවර මග හැරී ඇත. කරුණාකර සියලු පියවර පෙන්වන්න."
      },
      missedConcepts: {
        en: ["Step-by-step derivation", "Final answer units"],
        si: ["පියවරෙන් පියවර ව්‍යුත්පන්න කිරීම", "අවසාන පිළිතුරේ ඒකක"]
      },
      correctConcepts: {
        en: ["Correct formula application", "Accurate calculation"],
        si: ["නිවැරදි සූත්‍ර යෙදීම", "නිවැරදි ගණනය කිරීම"]
      }
    },
    {
      id: 3,
      score: 18,
      maxScore: 20,
      feedback: {
        en: "Excellent analysis. The conclusion is well-supported by the arguments presented.",
        si: "විශිෂ්ට විශ්ලේෂණයක්. ඉදිරිපත් කරන ලද තර්ක මගින් නිගමනය හොඳින් තහවුරු වේ."
      },
      missedConcepts: {
        en: ["Minor grammatical errors"],
        si: ["සුළු ව්‍යාකරණ දෝෂ"]
      },
      correctConcepts: {
        en: ["Critical thinking", "Evidence-based arguments", "Clear structure"],
        si: ["විචාරාත්මක චින්තනය", "සාක්ෂි මත පදනම් වූ තර්ක", "පැහැදිලි ව්‍යුහය"]
      }
    }
  ]
});

interface EvaluationResultsScreenProps {
  answerSheets: File[];
  results?: any[]; // Optional prop to pass pre-calculated results
  onAnalysisClick: () => void;
  onViewHistory: () => void;
}

export default function EvaluationResultsScreen({
  answerSheets,
  results: propResults,
  onAnalysisClick,
  onViewHistory
}: EvaluationResultsScreenProps) {
  const [language, setLanguage] = useState<"en" | "si">("en");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Use passed results or generate new ones if not provided
  const results = useMemo(() => {
    if (propResults) return propResults;
    return answerSheets.map(f => generateMockResult(f.name));
  }, [answerSheets, propResults]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Evaluation Results
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {answerSheets.length} answer sheet{answerSheets.length !== 1 ? "s" : ""} evaluated
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-1 border border-gray-200 dark:border-[#333]">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                language === "en"
                  ? "bg-white dark:bg-[#333] text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("si")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                language === "si"
                  ? "bg-white dark:bg-[#333] text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              සිංහල
            </button>
          </div>

          <Button
            onClick={onViewHistory}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            History
          </Button>

          <Button
            onClick={onAnalysisClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <BarChart2 className="w-4 h-4" />
            Evaluation Analysis
          </Button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden transition-all"
          >
            {/* Card Header / Summary */}
            <div 
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a]/50 transition-colors"
              onClick={() => toggleExpand(result.id)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    {result.fileName}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Completed
                    </span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Grade</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.overallGrade}</p>
                </div>
                <div className="text-right border-l border-gray-200 dark:border-[#333] pl-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Score</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.overallScore}%</p>
                </div>
                <div className="pl-2">
                  {expandedId === result.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === result.id && (
              <div className="border-t border-gray-200 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#0C0C0C]/50">
                
                <div className="p-6 space-y-8">
                  {/* Overall Feedback */}
                  <section>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Overall Feedback
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 text-gray-700 dark:text-gray-300 leading-relaxed">
                      {result.overallFeedback[language]}
                    </div>
                  </section>

                  {/* Question-wise Breakdown */}
                  <section>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4" />
                      Question-wise Breakdown
                    </h4>
                    <div className="space-y-4">
                      {result.questions.map((q) => (
                        <div 
                          key={q.id}
                          className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-4 space-y-4"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              Question {q.id}
                            </span>
                            <span className="text-sm font-semibold bg-gray-100 dark:bg-[#222] px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                              {q.score} / {q.maxScore}
                            </span>
                          </div>

                          {/* Concepts Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Correct Concepts */}
                            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                              <h5 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Correct Concepts
                              </h5>
                              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                {q.correctConcepts?.[language]?.map((concept, idx) => (
                                  <li key={idx}>{concept}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Missed Concepts */}
                            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                              <h5 className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Missed Concepts
                              </h5>
                              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                {q.missedConcepts?.[language]?.map((concept, idx) => (
                                  <li key={idx}>{concept}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Feedback */}
                          <div className="pt-2 border-t border-gray-100 dark:border-[#2a2a2a]">
                            <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                              Feedback
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {q.feedback[language]}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
