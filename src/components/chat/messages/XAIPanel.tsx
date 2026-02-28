// components/XAIPanel.tsx
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  Database,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Tooltip from "@mui/material/Tooltip";

interface XAIPanelProps {
  explanation: any; // Replace with proper type
  isOpen?: boolean;
  onToggle?: () => void;
}

export function XAIPanel({
  explanation,
  isOpen = false,
  onToggle,
}: XAIPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  // If there's no explanation and the panel isn't open, don't render anything.
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

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 0.6) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-500" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            How this answer was generated
          </span>
          <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
            Explainable AI
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
          {/* Loading state when explanation not yet available */}
          {!explanation && (
            <div className="p-3 rounded bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
              Loading explanation...
            </div>
          )}
          {explanation && (
            <>
              {/* Summary */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-sm text-indigo-900 dark:text-indigo-200">
                  {explanation.explanation_summary}
                </p>
              </div>

              {/* Confidence Breakdown */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleSection("confidence")}
                  className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Confidence Breakdown</span>
                  </div>
                  {expandedSections.has("confidence") ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.has("confidence") && (
                  <div className="p-3 space-y-3">
                    {/* Overall confidence */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Overall Confidence
                      </span>
                      <span
                        className={`font-semibold ${getConfidenceColor(explanation.confidence_breakdown.overall)}`}
                      >
                        {Math.round(
                          explanation.confidence_breakdown.overall * 100,
                        )}
                        %
                      </span>
                    </div>

                    {/* Component bars */}
                    {explanation.confidence_breakdown.components?.map(
                      (comp: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              {comp.name} ({Math.round(comp.weight * 100)}%)
                            </span>
                            <span className="font-medium">
                              {Math.round(comp.score * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${comp.score * 100}%` }}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Source Chunks */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleSection("sources")}
                  className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>
                      Source Materials (
                      {explanation.chunk_contributions?.length || 0})
                    </span>
                  </div>
                  {expandedSections.has("sources") ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.has("sources") && (
                  <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
                    {explanation.chunk_contributions?.map(
                      (chunk: any, idx: number) => (
                        <div
                          key={idx}
                          className="text-sm border-l-2 border-indigo-200 dark:border-indigo-800 pl-3"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                              Chunk {chunk.rank}
                            </span>
                            <Tooltip title="Similarity to query">
                              <span className="text-xs text-gray-500">
                                Match:{" "}
                                {Math.round(chunk.similarity_score * 100)}%
                              </span>
                            </Tooltip>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {chunk.preview}
                          </p>
                          {chunk.key_terms?.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {chunk.key_terms
                                .slice(0, 3)
                                .map((term: string, tidx: number) => (
                                  <span
                                    key={tidx}
                                    className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded"
                                  >
                                    {term}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Safety Analysis */}
              {explanation.safety_explanation &&
                explanation.safety_explanation.has_issues && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => toggleSection("safety")}
                      className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>
                          Safety Analysis (
                          {explanation.safety_explanation.flagged_count} issues)
                        </span>
                      </div>
                      {expandedSections.has("safety") ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {expandedSections.has("safety") && (
                      <div className="p-3 space-y-3">
                        {explanation.safety_explanation.details?.map(
                          (detail: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <div className="flex items-start gap-2">
                                {getSeverityIcon(detail.severity)}
                                <div>
                                  <p className="text-xs text-gray-700 dark:text-gray-300">
                                    {detail.explanation}
                                  </p>
                                  {detail.sentence && (
                                    <p className="mt-1 text-xs text-gray-500 italic">
                                      "{detail.sentence}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Concept Tracing */}
              {explanation.concept_tracing && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => toggleSection("concepts")}
                    className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      <span>
                        Key Concepts (
                        {explanation.concept_tracing.concepts_with_sources}/
                        {explanation.concept_tracing.total_concepts} traced)
                      </span>
                    </div>
                    {expandedSections.has("concepts") ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {expandedSections.has("concepts") && (
                    <div className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {explanation.concept_tracing.concept_details?.map(
                          (concept: any, idx: number) => (
                            <Tooltip
                              key={idx}
                              title={
                                concept.found_in_sources
                                  ? `Found in ${concept.source_count} sources`
                                  : "Not found in sources"
                              }
                            >
                              <span
                                className={`text-xs px-2 py-1 rounded-full border ${
                                  concept.found_in_sources
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300"
                                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300"
                                }`}
                              >
                                {concept.concept}
                              </span>
                            </Tooltip>
                          ),
                        )}
                      </div>
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
