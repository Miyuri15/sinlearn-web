import type { SafetySummary as SafetySummaryType } from "@/lib/models/chat";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

const severityStyles: Record<
  SafetySummaryType["overall_severity"],
  { label: string; dot: string; pill: string; icon: React.ReactNode }
> = {
  low: {
    label: "Low risk",
    dot: "bg-emerald-500",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-100",
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
  },
  medium: {
    label: "Medium risk",
    dot: "bg-amber-500",
    pill: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/30 dark:text-amber-100",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  },
  high: {
    label: "High risk",
    dot: "bg-rose-500",
    pill: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-900/30 dark:text-rose-100",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
  },
};

const supportLevels = {
  fully_supported: {
    label: "Fully supported",
    description: "Directly matches source material",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  partially_supported: {
    label: "Partially supported",
    description: "Some concepts match sources, some added by AI",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "text-amber-600 dark:text-amber-400",
  },
  likely_unsupported: {
    label: "Limited Support",
    description: "Limited support from source materials",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "text-rose-600 dark:text-rose-400",
  },
};

// Optional: Keep internal score for visual bar only
function getSupportWidth(score?: number) {
  if (typeof score !== "number" || Number.isNaN(score)) return 0;
  const clamped = Math.min(Math.max(score, 0), 1);
  return clamped * 100;
}

export function SafetySummary({
  summary,
}: Readonly<{ summary: SafetySummaryType }>) {
  const { overall_severity, confidence_score, reliability } = summary;
  const severity = severityStyles[overall_severity] ?? severityStyles.low;
  const support =
    supportLevels[reliability] ?? supportLevels.likely_unsupported;
  const supportWidth = getSupportWidth(confidence_score);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
      {/* Risk Severity Pill - Keep this as is, it's clear and useful */}
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${severity.pill}`}
      >
        <span className={`h-2 w-2 rounded-full ${severity.dot}`} aria-hidden />
        <span>{severity.label}</span>
      </span>

      {/* REPLACED: Confidence percentage with Support Level indicator */}
      <Tooltip title={support.description} arrow>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium
            border-gray-200 bg-gray-50 text-gray-700 
            dark:border-gray-800 dark:bg-white/5 dark:text-gray-100
            hover:bg-gray-100 dark:hover:bg-white/10 cursor-help transition-colors`}
        >
          {support.icon}
          <span className={support.color}>{support.label} from source</span>

          {/* Optional: Add subtle visual bar instead of percentage */}
          <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-1">
            <div
              className={`h-full rounded-full ${
                reliability === "fully_supported"
                  ? "bg-emerald-500"
                  : reliability === "partially_supported"
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
              style={{ width: `${supportWidth}%` }}
            />
          </div>
        </span>
      </Tooltip>

      {/* REMOVED: The third pill with reliabilityCopy - now integrated above */}
    </div>
  );
}
