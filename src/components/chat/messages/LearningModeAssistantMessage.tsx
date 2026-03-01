import type { ChatMessage } from "@/lib/models/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { isTextMessage } from "@/lib/models/chat";
import { getExplanationForMessage } from "@/lib/api/chat";
import { RegenerateButton } from "./RegenerateButton";
import { SafetySummary } from "./SafetySummary";
import {
  CopyIcon,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Tooltip from "@mui/material/Tooltip";
import { XAIPanel } from "./XAIPanel";

/**
 * LearningModeAssistantMessage - A friendly AI assistant message component
 * Designed to make learning interactive and engaging
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
  const [copied, setCopied] = useState(false);
  const [showXAI, setShowXAI] = useState(false);

  const resetTimerRef = useRef<number | null>(null);

  const handleToggleXAI = async () => {
    const next = !showXAI;
    setShowXAI(next);

    if (next && !localXAI && !isFetchingXAI) {
      setIsFetchingXAI(true);
      try {
        const id = message.id ?? (message as any)?.parent_msg_id;
        if (!id) throw new Error("missing message id for XAI fetch");
        const data = await getExplanationForMessage(id);
        setLocalXAI(data.xai_explanation ?? data);
      } catch (err) {
        console.error("Error fetching XAI explanation", err);
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

  const shouldShowFooter =
    Boolean(m.grade_level) ||
    safetySummary !== undefined ||
    localXAI !== undefined ||
    xaiExplanation !== undefined;

  return (
    <div className="p-6 relative rounded-2xl w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300">
      {/* AI Assistant Header - More welcoming design */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Learning Assistant
            </span>
          </div>
        </div>

        {/* Copy button with improved feedback */}
        <Tooltip title={copied ? "Copied to clipboard!" : "Copy message"} arrow>
          <button
            type="button"
            onClick={handleCopy}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${
                copied
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800"
              }
            `}
            aria-label="Copy message"
          >
            <CopyIcon size={16} />
          </button>
        </Tooltip>
      </div>

      {/* Message Content - Clean and readable */}
      <div className="text-slate-700 dark:text-slate-200 text-base leading-relaxed">
        <TruncatedMessage content={contentStr} />
      </div>

      {/* XAI Panel - Smooth expand/collapse */}
      {(showXAI || localXAI) && (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
          <XAIPanel
            explanation={localXAI}
            isOpen={showXAI}
            onToggle={handleToggleXAI}
          />
        </div>
      )}

      {/* Footer Section - Clean organization of metadata */}
      {/* Footer Section - Clean organization of metadata */}
      {shouldShowFooter && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Top Row: Grade Level and Safety Summary side by side */}
          <div className="flex items-center justify-between mb-3">
            {/* Left side: Grade Level */}
            {m.grade_level && <GradeLabel gradeLevel={m.grade_level} />}

            {/* Right side: Safety Summary with risk info */}
            {safetySummary && <SafetySummary summary={safetySummary} />}
          </div>

          {/* Bottom Row: Action Buttons with Explain button on the right */}
          <div className="flex items-center justify-between">
            {/* Left side: Regenerate button (if any) */}
            <div>
              {onRegenerate && (
                <RegenerateButton
                  messageId={parentMessageId}
                  onRegenerate={onRegenerate}
                  isLoading={isRegenerating}
                />
              )}
            </div>

            {/* Right side: Explain button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleXAI}
                disabled={isFetchingXAI}
                className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
            transition-all duration-200 transform hover:scale-105 active:scale-100
            ${
              showXAI
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }
            ${isFetchingXAI ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
                aria-expanded={showXAI}
              >
                <Brain className="w-4 h-4" />
                <span>
                  {isFetchingXAI ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Loading...
                    </span>
                  ) : showXAI ? (
                    <span className="flex items-center gap-1">
                      Hide Explanation <ChevronUp className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      Explain This <ChevronDown className="w-3 h-3" />
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Subtle hint for new users */}
          {!showXAI && !safetySummary && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              Click "Explain This" to understand how I got this answer
            </p>
          )}
        </div>
      )}
    </div>
  );
}
