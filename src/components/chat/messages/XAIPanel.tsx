// components/XAIPanel.tsx
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Shield,
  BookOpen,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import Tooltip from "@mui/material/Tooltip";

// Define types for the explanation data
interface ChunkContribution {
  rank: number;
  preview: string;
  similarity_score: number;
  contribution_score: number;
  key_terms?: string[];
}

interface ConceptDetail {
  concept: string;
  found_in_sources: boolean;
  sources?: Array<{ chunk_rank: number }>;
}

interface ConceptTracing {
  concept_details: ConceptDetail[];
  concepts_with_sources: number;
  total_concepts: number;
}

interface SafetyDetail {
  type: "flagged_sentence" | "missing_concepts" | "extra_concepts";
  severity?: "high" | "medium" | "low";
  explanation: string;
  sentence?: string;
  unseen_ratio?: number;
  concepts?: string[];
}

interface SafetyExplanation {
  has_issues: boolean;
  flagged_count: number;
  missing_concepts_count: number;
  extra_concepts_count: number;
  details: SafetyDetail[];
}

interface Explanation {
  explanation_summary: string;
  chunk_contributions?: ChunkContribution[];
  concept_tracing?: ConceptTracing;
  safety_explanation?: SafetyExplanation;
}

interface XAIPanelProps {
  explanation: Explanation | null;
  isLoading?: boolean;
  unavailableMessage?: string | null;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function XAIPanel({
  explanation,
  isLoading = false,
  unavailableMessage = null,
}: XAIPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["sources", "concepts", "safety"]),
  );
  const [showAllConcepts, setShowAllConcepts] = useState(false);
  const [showAllFlagged, setShowAllFlagged] = useState(false);
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [showAllExtra, setShowAllExtra] = useState(false);
  const [showAllKeyTerms, setShowAllKeyTerms] = useState<
    Record<number, boolean>
  >({});

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="animate-spin">⌛</div>
          <span>Analyzing how I got this answer...</span>
        </div>
      </div>
    );
  }

  if (!explanation) {
    if (!unavailableMessage) return null;

    return (
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
          <Info className="w-4 h-4 mt-0.5 text-slate-500 dark:text-slate-400" />
          <p className="text-sm leading-relaxed">{unavailableMessage}</p>
        </div>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getQualityIndicator = (summary: string) => {
    if (summary.includes("highly confident")) {
      return {
        icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
        label: "High Confidence",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
      };
    }
    if (summary.includes("confident")) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
        label: "Confident",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/20",
      };
    }
    if (summary.includes("cautious")) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        label: "Verify Recommended",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20",
      };
    }
    return {
      icon: <Info className="w-4 h-4 text-slate-500" />,
      label: "Limited Confidence",
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-50 dark:bg-slate-800",
    };
  };
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Toggle key terms visibility for a specific chunk
  const toggleKeyTerms = (chunkIndex: number) => {
    setShowAllKeyTerms((prev) => ({
      ...prev,
      [chunkIndex]: !prev[chunkIndex],
    }));
  };

  // Get displayed concepts
  const conceptDetails = explanation?.concept_tracing?.concept_details || [];
  const displayedConcepts = showAllConcepts
    ? conceptDetails
    : conceptDetails.slice(0, 8);

  // Get safety details
  const safetyDetails = explanation?.safety_explanation?.details || [];
  const flaggedDetails = safetyDetails.filter(
    (d: SafetyDetail) => d.type === "flagged_sentence",
  );
  const missingDetails = safetyDetails.filter(
    (d: SafetyDetail) => d.type === "missing_concepts",
  );
  const extraDetails = safetyDetails.filter(
    (d: SafetyDetail) => d.type === "extra_concepts",
  );

  const displayedFlagged = showAllFlagged
    ? flaggedDetails
    : flaggedDetails.slice(0, 3);

  const quality = getQualityIndicator(explanation.explanation_summary);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
      {/* Simple Summary at the top */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${quality.bg} flex-shrink-0`}>
            <div className="w-5 h-5 flex items-center justify-center">
              {quality.icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {explanation.explanation_summary}
            </p>
            {explanation.chunk_contributions && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 inline-block" />
                Based on {explanation.chunk_contributions.length} source
                {explanation.chunk_contributions.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Sources Section */}
      {explanation.chunk_contributions &&
        explanation.chunk_contributions.length > 0 && (
          <div className="border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => toggleSection("sources")}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Sources Used ({explanation.chunk_contributions.length})
              </span>
              {expandedSections.has("sources") ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.has("sources") && (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/50">
                {explanation.chunk_contributions.map((chunk, idx) => {
                  const showAllTerms = showAllKeyTerms[idx];
                  const displayedTerms = showAllTerms
                    ? chunk.key_terms
                    : chunk.key_terms?.slice(0, 4);

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full">
                          Source {chunk.rank}
                        </span>
                        <div className="flex gap-2">
                          {chunk.similarity_score > 0.7 && (
                            <Tooltip title="Highly relevant to your question">
                              <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                                Highly Relevant
                              </span>
                            </Tooltip>
                          )}
                          {chunk.contribution_score > 0.2 && (
                            <Tooltip title="Key source for this answer">
                              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                Key Source
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {chunk.preview}
                      </p>

                      {/* Key Terms Section */}
                      {chunk.key_terms && chunk.key_terms.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              Key terms found:
                            </span>
                            {chunk.key_terms.length > 4 && (
                              <button
                                onClick={() => toggleKeyTerms(idx)}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {showAllTerms
                                  ? "Show less"
                                  : `Show all ${chunk.key_terms.length}`}
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {displayedTerms?.map(
                              (term: string, tidx: number) => (
                                <Tooltip key={tidx} title="Found in answer">
                                  <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    {term}
                                  </span>
                                </Tooltip>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      {/* Key Concepts Section */}
      {explanation.concept_tracing && (
        <div className="border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => toggleSection("concepts")}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span>
              Key Ideas Used (
              {explanation.concept_tracing.concepts_with_sources}/
              {explanation.concept_tracing.total_concepts} from sources)
            </span>
            {expandedSections.has("concepts") ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.has("concepts") && (
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex flex-wrap gap-2">
                {displayedConcepts.map(
                  (concept: ConceptDetail, idx: number) => (
                    <Tooltip
                      key={idx}
                      title={
                        concept.found_in_sources
                          ? `Found in source ${concept.sources?.map((s) => s.chunk_rank).join(", ")}`
                          : "Added by AI, not in sources"
                      }
                    >
                      <span
                        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all cursor-help ${
                          concept.found_in_sources
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                        }`}
                      >
                        {concept.concept}
                      </span>
                    </Tooltip>
                  ),
                )}
              </div>

              {conceptDetails.length > 8 && (
                <button
                  onClick={() => setShowAllConcepts(!showAllConcepts)}
                  className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {showAllConcepts
                    ? "Show fewer"
                    : `Show all ${conceptDetails.length} ideas`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Safety Section - Full details with flagged, missing, and extra concepts */}
      {explanation.safety_explanation?.has_issues && (
        <div>
          <button
            onClick={() => toggleSection("safety")}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Things to Review</span>
              <span className="text-xs font-normal text-amber-600 dark:text-amber-500">
                ({explanation.safety_explanation.flagged_count} flagged,{" "}
                {explanation.safety_explanation.missing_concepts_count} missing,{" "}
                {explanation.safety_explanation.extra_concepts_count} extra)
              </span>
            </div>
            {expandedSections.has("safety") ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.has("safety") && (
            <div className="p-4 space-y-4 bg-amber-50/50 dark:bg-amber-950/20">
              {/* Flagged Sentences Section */}
              {flaggedDetails.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Flagged Sentences ({flaggedDetails.length})
                  </h5>

                  {displayedFlagged.map((detail: SafetyDetail, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {getSeverityIcon(detail.severity || "low")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              detail.severity === "high"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                : detail.severity === "medium"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            }`}
                          >
                            {(detail.severity || "low").toUpperCase()} RISK
                          </span>
                          {detail.unseen_ratio !== undefined && (
                            <span className="text-xs text-slate-500">
                              {Math.round(detail.unseen_ratio * 100)}%
                              unsupported
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {detail.explanation}
                        </p>
                        {detail.sentence && (
                          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic border-l-2 border-amber-300 dark:border-amber-700 pl-2">
                            "{detail.sentence}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Show more flagged sentences */}
                  {flaggedDetails.length > 3 && (
                    <button
                      onClick={() => setShowAllFlagged(!showAllFlagged)}
                      className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline"
                    >
                      {showAllFlagged
                        ? "Show fewer flagged sentences"
                        : `Show all ${flaggedDetails.length} flagged sentences`}
                    </button>
                  )}
                </div>
              )}

              {/* Missing Concepts Section */}
              {missingDetails.map((detail: SafetyDetail, idx: number) => (
                <div key={`missing-${idx}`} className="space-y-2 pt-2">
                  <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Missing Concepts ({detail.concepts?.length || 0})
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {detail.explanation}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {(showAllMissing
                      ? detail.concepts
                      : detail.concepts?.slice(0, 20)
                    )?.map((concept: string, cidx: number) => (
                      <Tooltip key={cidx} title="Not found in answer">
                        <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800">
                          {concept}
                        </span>
                      </Tooltip>
                    ))}
                  </div>

                  {detail.concepts && detail.concepts.length > 20 && (
                    <button
                      onClick={() => setShowAllMissing(!showAllMissing)}
                      className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline mt-2"
                    >
                      {showAllMissing
                        ? "Show fewer concepts"
                        : `Show all ${detail.concepts.length} missing concepts`}
                    </button>
                  )}
                </div>
              ))}

              {/* Extra Concepts Section */}
              {extraDetails.map((detail: SafetyDetail, idx: number) => (
                <div key={`extra-${idx}`} className="space-y-2 pt-2">
                  <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Extra Concepts Not in Sources (
                    {detail.concepts?.length || 0})
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {detail.explanation}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {(showAllExtra
                      ? detail.concepts
                      : detail.concepts?.slice(0, 20)
                    )?.map((concept: string, cidx: number) => (
                      <Tooltip key={cidx} title="Added by AI, not in sources">
                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
                          {concept}
                        </span>
                      </Tooltip>
                    ))}
                  </div>

                  {detail.concepts && detail.concepts.length > 20 && (
                    <button
                      onClick={() => setShowAllExtra(!showAllExtra)}
                      className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline mt-2"
                    >
                      {showAllExtra
                        ? "Show fewer concepts"
                        : `Show all ${detail.concepts.length} extra concepts`}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
