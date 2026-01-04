import type { SafetySummary as SafetySummaryType } from "@/lib/models/chat";

const severityStyles: Record<
  SafetySummaryType["overall_severity"],
  { label: string; dot: string; pill: string }
> = {
  low: {
    label: "Low risk",
    dot: "bg-emerald-500",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-100",
  },
  medium: {
    label: "Medium risk",
    dot: "bg-amber-500",
    pill: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/30 dark:text-amber-100",
  },
  high: {
    label: "High risk",
    dot: "bg-rose-500",
    pill: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-900/30 dark:text-rose-100",
  },
};

const reliabilityCopy: Record<SafetySummaryType["reliability"], string> = {
  fully_supported: "Fully supported by the source",
  partially_supported: "Mostly supported by the source",
  likely_unsupported: "Some content may be unsupported",
};

function clampToPercent(score?: number) {
  if (typeof score !== "number" || Number.isNaN(score)) return 0;
  const clamped = Math.min(Math.max(score, 0), 1);
  return Math.round(clamped * 100);
}

export function SafetySummary({
  summary,
}: Readonly<{ summary: SafetySummaryType }>) {
  const { overall_severity, confidence_score, reliability } = summary;
  const severity = severityStyles[overall_severity] ?? severityStyles.low;
  const confidencePercent = clampToPercent(confidence_score);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${severity.pill}`}
      >
        <span className={`h-2 w-2 rounded-full ${severity.dot}`} aria-hidden />
        <span>{severity.label}</span>
      </span>

      <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700 dark:border-gray-800 dark:bg-white/5 dark:text-gray-100">
        <span className="font-semibold">Confidence</span>
        <span>{confidencePercent}%</span>
      </span>

      <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700 dark:border-gray-800 dark:bg-white/5 dark:text-gray-100">
        {reliabilityCopy[reliability] ?? "Reliability unavailable"}
      </span>
    </div>
  );
}
