import type { ChatMessage } from "@/lib/models/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { isTextMessage } from "@/lib/models/chat";
import { getExplanationForMessage } from "@/lib/api/chat";
import { RegenerateButton } from "./RegenerateButton";
import { SafetySummary } from "./SafetySummary";
import { CopyIcon, Brain, Sparkles } from "lucide-react";
import Tooltip from "@mui/material/Tooltip";
import { XAIPanel } from "./XAIPanel";

/**
 * LearningModeAssistantMessage - A friendly AI assistant message component
 * Designed to make learning interactive and engaging for students
 */
export function LearningModeAssistantMessage({
  message,
  onRegenerate,
  isRegenerating = false,
}: {
  message: ChatMessage;
  onRegenerate?: (messageId?: string) => void;
  isRegenerating?: boolean;
}) {
  const m = message as any;
  const contentStr =
    typeof m.content === "string" ? m.content : String(m.content);
  const parentMessageId = isTextMessage(message)
    ? (message.parent_msg_id ?? message.id)
    : undefined;
  const safetySummary = m.safety_summary;
  const xaiExplanation = m.xai_explanation;

  const [localXAI, setLocalXAI] = useState<any | undefined>(xaiExplanation);
  const [isFetchingXAI, setIsFetchingXAI] = useState(false);
  const [xaiUnavailableMessage, setXaiUnavailableMessage] = useState<
    string | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [showXAI, setShowXAI] = useState(false);

  const resetTimerRef = useRef<number | null>(null);

  const handleToggleXAI = async () => {
    const next = !showXAI;
    setShowXAI(next);

    if (next && !localXAI && !isFetchingXAI) {
      setIsFetchingXAI(true);
      setXaiUnavailableMessage(null);
      try {
        const id = message.id ?? (message as any)?.parent_msg_id;
        if (!id) throw new Error("missing message id for XAI fetch");
        const data = await getExplanationForMessage(id);
        const explanation = data?.xai_explanation ?? data;
        const hasSummary = Boolean(explanation?.explanation_summary);

        if (hasSummary) {
          setLocalXAI(explanation);
        } else {
          setLocalXAI(undefined);
          setXaiUnavailableMessage(
            "XAI explanation is not available for this message.",
          );
        }
      } catch (err) {
        setLocalXAI(undefined);

        const rawMessage = err instanceof Error ? err.message : "";
        const isNotAvailableError =
          rawMessage.toLowerCase().includes("not available") ||
          rawMessage.toLowerCase().includes("xai explanation");

        setXaiUnavailableMessage(
          isNotAvailableError
            ? "XAI explanation is not available for this message."
            : "Unable to load explanation right now. Please try again.",
        );
      } finally {
        setIsFetchingXAI(false);
      }
    }
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contentStr);
      setCopied(true);
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message", err);
    }
  }, [contentStr]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="p-5 relative rounded-2xl w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Simple Header - Just avatar and copy button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Assistant
          </span>
        </div>

        <Tooltip title={copied ? "Copied!" : "Copy"} arrow>
          <button
            type="button"
            onClick={handleCopy}
            className={`
              p-1.5 rounded-lg transition-all
              ${
                copied
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800"
              }
            `}
            aria-label="Copy message"
          >
            <CopyIcon size={15} />
          </button>
        </Tooltip>
      </div>

      {/* Message Content */}
      <div className="text-slate-700 dark:text-slate-200 text-base leading-relaxed mb-4">
        <TruncatedMessage content={contentStr} />
      </div>

      {/* Info Bar - Grade, Safety, Support all inline with Explain button */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
        {/* Left side: All status indicators inline */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade Level Pill */}
          {m.grade_level && <GradeLabel gradeLevel={m.grade_level} />}

          {/* Safety Summary Pill */}
          {safetySummary && <SafetySummary summary={safetySummary} />}
        </div>

        {/* Right side: Explain button + Regenerate */}
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <RegenerateButton
              messageId={parentMessageId}
              onRegenerate={onRegenerate}
              isLoading={isRegenerating}
              compact
            />
          )}

          <button
            onClick={handleToggleXAI}
            disabled={isFetchingXAI}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all
              ${
                showXAI
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }
              ${isFetchingXAI ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
            aria-expanded={showXAI}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>
              {isFetchingXAI ? (
                <span className="flex items-center gap-1">
                  <span className="animate-spin text-xs">⌛</span>
                  Loading...
                </span>
              ) : showXAI ? (
                "Hide Details"
              ) : (
                "Explain This"
              )}
            </span>
          </button>
        </div>
      </div>

      {/* XAI Content - Directly expands below without extra header */}
      {showXAI && (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
          <XAIPanel
            explanation={localXAI ?? null}
            isLoading={isFetchingXAI}
            unavailableMessage={xaiUnavailableMessage}
          />
        </div>
      )}

      {/* Subtle hint for first-time users */}
      {!showXAI && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 text-right">
          Click "Explain This" to see how I got this answer
        </p>
      )}
    </div>
  );
}
