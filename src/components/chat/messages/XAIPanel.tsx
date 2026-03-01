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

interface XAIPanelProps {
  explanation: any;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function XAIPanel({
  explanation,
  isOpen = false,
  onToggle,
}: XAIPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["confidence", "sources", "concepts", "safety"]), // Auto-expand all
  );
  const [showAllConcepts, setShowAllConcepts] = useState(false);
  const [showAllFlagged, setShowAllFlagged] = useState(false);
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [showAllExtra, setShowAllExtra] = useState(false);
  const [showAllKeyTerms, setShowAllKeyTerms] = useState<
    Record<number, boolean>
  >({});

  if (!explanation && !isOpen) return null;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.8)
      return {
        label: "High",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
      };
    if (score >= 0.6)
      return {
        label: "Good",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20",
      };
    return {
      label: "Needs Review",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
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
    (d) => d.type === "flagged_sentence",
  );
  const missingDetails = safetyDetails.filter(
    (d) => d.type === "missing_concepts",
  );
  const extraDetails = safetyDetails.filter((d) => d.type === "extra_concepts");

  const displayedFlagged = showAllFlagged
    ? flaggedDetails
    : flaggedDetails.slice(0, 3);

  return (
    <div className="mt-5 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 bg-gradient-to-r from-indigo-50 to-slate-50 dark:from-indigo-900/40 dark:to-slate-800 flex items-center justify-between hover:from-indigo-100 dark:hover:from-indigo-900/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
            <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              My Thought Process
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Here's how I arrived at this answer
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-5 space-y-4 bg-white dark:bg-slate-900">
          {/* Loading State */}
          {!explanation && (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 text-center text-slate-600 dark:text-slate-400 text-sm">
              ✨ Gathering my thoughts...
            </div>
          )}

          {explanation && (
            <>
              {/* Summary / TL;DR */}
              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  TL;DR
                </h4>
                <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  {explanation.explanation_summary}
                </p>
              </div>

              {/* Confidence Meter */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("confidence")}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>My Confidence Level</span>
                  {expandedSections.has("confidence") ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.has("confidence") && (
                  <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                    {/* Overall confidence */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          Overall Confidence
                        </span>
                        <span
                          className={`text-2xl font-bold ${getConfidenceLevel(explanation.confidence_breakdown.overall).color}`}
                        >
                          {Math.round(
                            explanation.confidence_breakdown.overall * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div
                        className={`h-3 rounded-full overflow-hidden ${getConfidenceLevel(explanation.confidence_breakdown.overall).bg}`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 dark:from-indigo-500 dark:to-indigo-700 rounded-full transition-all"
                          style={{
                            width: `${explanation.confidence_breakdown.overall * 100}%`,
                          }}
                        />
                      </div>
                      <p
                        className={`text-xs font-medium ${getConfidenceLevel(explanation.confidence_breakdown.overall).color}`}
                      >
                        {
                          getConfidenceLevel(
                            explanation.confidence_breakdown.overall,
                          ).label
                        }{" "}
                        Confidence
                      </p>
                    </div>

                    {/* Component breakdown */}
                    {explanation.confidence_breakdown.components?.length >
                      0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                          Sources of my confidence:
                        </p>
                        {explanation.confidence_breakdown.components.map(
                          (comp: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs"
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                                    {comp.name}
                                  </p>
                                  <Tooltip
                                    title={`Weight: ${comp.weight * 100}% of overall score`}
                                  >
                                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                                      ({comp.weight * 100}%)
                                    </span>
                                  </Tooltip>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1">
                                  <div
                                    className="h-full bg-gradient-to-r from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-700 rounded-full"
                                    style={{ width: `${comp.score * 100}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-slate-600 dark:text-slate-400 font-semibold min-w-fit">
                                {Math.round(comp.score * 100)}%
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* References I Used */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("sources")}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>References I Used</span>
                    <span className="ml-auto text-xs font-normal text-slate-500 dark:text-slate-400">
                      {explanation.chunk_contributions?.length || 0}
                    </span>
                  </div>
                  {expandedSections.has("sources") ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.has("sources") && (
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto bg-white dark:bg-slate-900">
                    {explanation.chunk_contributions?.map(
                      (chunk: any, idx: number) => {
                        const showAllTerms = showAllKeyTerms[idx];
                        const displayedTerms = showAllTerms
                          ? chunk.key_terms
                          : chunk.key_terms?.slice(0, 4);

                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-xs font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full">
                                Source {chunk.rank}
                              </span>
                              <div className="flex gap-2">
                                <Tooltip title="How relevant this is to your question">
                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Match:{" "}
                                    {Math.round(chunk.similarity_score * 100)}%
                                  </span>
                                </Tooltip>
                                <Tooltip title="How much this source contributed to the answer">
                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Contribution:{" "}
                                    {Math.round(chunk.contribution_score * 100)}
                                    %
                                  </span>
                                </Tooltip>
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                              {chunk.preview}
                            </p>

                            {/* Key Terms Section - IMPROVED */}
                            {chunk.key_terms?.length > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Key terms from this source (
                                    {chunk.key_terms.length}):
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
                                  {displayedTerms.map(
                                    (term: string, tidx: number) => (
                                      <Tooltip
                                        key={tidx}
                                        title="Found in answer"
                                      >
                                        <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                                          {term} ✓
                                        </span>
                                      </Tooltip>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* Key Concepts (Word Cloud Style) - IMPROVED with source info */}
              {explanation.concept_tracing && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection("concepts")}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>
                      Key Ideas (
                      {explanation.concept_tracing.concepts_with_sources}/
                      {explanation.concept_tracing.total_concepts} verified)
                    </span>
                    {expandedSections.has("concepts") ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedSections.has("concepts") && (
                    <div className="p-4 bg-white dark:bg-slate-900">
                      <div className="flex flex-wrap gap-2">
                        {displayedConcepts.map((concept: any, idx: number) => (
                          <Tooltip
                            key={idx}
                            title={
                              concept.found_in_sources
                                ? `✓ Found in ${concept.source_count} source${concept.source_count > 1 ? "s" : ""}: ${concept.sources?.map((s) => `Source ${s.chunk_rank}`).join(", ")}`
                                : "This concept wasn't found in the source materials"
                            }
                          >
                            <span
                              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all cursor-help ${
                                concept.found_in_sources
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                              }`}
                            >
                              {concept.found_in_sources ? "✓" : "○"}{" "}
                              {concept.concept}
                              {concept.found_in_sources && (
                                <span className="ml-1 text-[10px] opacity-70">
                                  ({concept.source_count})
                                </span>
                              )}
                            </span>
                          </Tooltip>
                        ))}
                      </div>

                      {/* Show more/less for concepts */}
                      {conceptDetails.length > 8 && (
                        <button
                          onClick={() => setShowAllConcepts(!showAllConcepts)}
                          className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                        >
                          {showAllConcepts
                            ? `Show less`
                            : `Show all ${conceptDetails.length} ideas...`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Safety Check - IMPROVED to show missing/extra concepts */}
              {explanation.safety_explanation?.has_issues && (
                <div className="border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden bg-amber-50 dark:bg-amber-900/10">
                  <button
                    onClick={() => toggleSection("safety")}
                    className="w-full px-4 py-3 bg-amber-100 dark:bg-amber-900/20 flex items-center justify-between text-sm font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Things to Review</span>
                      <span className="text-xs font-normal text-amber-700 dark:text-amber-300">
                        ({explanation.safety_explanation.flagged_count} flagged,{" "}
                        {explanation.safety_explanation.missing_concepts_count}{" "}
                        missing,{" "}
                        {explanation.safety_explanation.extra_concepts_count}{" "}
                        extra)
                      </span>
                    </div>
                    {expandedSections.has("safety") ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedSections.has("safety") && (
                    <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                      {/* Flagged Sentences Section */}
                      {flaggedDetails.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Flagged Sentences ({flaggedDetails.length})
                          </h5>

                          {displayedFlagged.map((detail: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg"
                            >
                              <div className="flex-shrink-0">
                                {getSeverityIcon(detail.severity)}
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
                                    {detail.severity.toUpperCase()} RISK
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {Math.round(detail.unseen_ratio * 100)}%
                                    unsupported
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300">
                                  {detail.explanation}
                                </p>
                                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic border-l-2 border-amber-300 dark:border-amber-700 pl-2">
                                  "{detail.sentence}"
                                </p>
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
                                : `Show all ${flaggedDetails.length} flagged sentences...`}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Missing Concepts Section - NEW */}
                      {missingDetails.map((detail: any, idx: number) => (
                        <div
                          key={`missing-${idx}`}
                          className="space-y-2 pt-2 border-t border-amber-200 dark:border-amber-800"
                        >
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

                          {detail.concepts?.length > 20 && (
                            <button
                              onClick={() => setShowAllMissing(!showAllMissing)}
                              className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline mt-2"
                            >
                              {showAllMissing
                                ? "Show fewer concepts"
                                : `Show all ${detail.concepts.length} missing concepts...`}
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Extra Concepts Section - NEW */}
                      {extraDetails.map((detail: any, idx: number) => (
                        <div
                          key={`extra-${idx}`}
                          className="space-y-2 pt-2 border-t border-amber-200 dark:border-amber-800"
                        >
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
                              <Tooltip
                                key={cidx}
                                title="Added by AI, not in sources"
                              >
                                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
                                  {concept}
                                </span>
                              </Tooltip>
                            ))}
                          </div>

                          {detail.concepts?.length > 20 && (
                            <button
                              onClick={() => setShowAllExtra(!showAllExtra)}
                              className="text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline mt-2"
                            >
                              {showAllExtra
                                ? "Show fewer concepts"
                                : `Show all ${detail.concepts.length} extra concepts...`}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
