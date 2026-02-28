import type { ChatMessage } from "@/lib/models/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { isTextMessage } from "@/lib/models/chat";
import { getExplanationForMessage } from "@/lib/api/chat";
import { RegenerateButton } from "./RegenerateButton";
import { SafetySummary } from "./SafetySummary";
import { CopyIcon, Brain } from "lucide-react";
import Tooltip from "@mui/material/Tooltip";
import { XAIPanel } from "./XAIPanel";

/**
 * LearningModeAssistantMessage: Assistant message in learning mode
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
  const resetTimerRef = useRef<number | null>(null);
  const [showXAI, setShowXAI] = useState(false);

  const handleToggleXAI = async () => {
    const next = !showXAI;
    setShowXAI(next);

    if (next && !localXAI && !isFetchingXAI) {
      setIsFetchingXAI(true);
      try {
        const id = message.id ?? (message as any)?.parent_msg_id;
        if (!id) throw new Error("missing message id for XAI fetch");
        const data = await getExplanationForMessage(id);
        // helper may already unwrap or return object with xai_explanation
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
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
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
    <div className="p-4 relative rounded-lg w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1F2937] break-words shadow-sm">
      <Tooltip title={copied ? "Copied" : "Copy message"} arrow>
        <button
          type="button"
          aria-label="Copy message"
          onClick={handleCopy}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
        >
          <CopyIcon size={14} />
        </button>
      </Tooltip>

      <TruncatedMessage content={contentStr} />

      {/* XAI Panel - show when opened or when we already have explanation */}
      {(showXAI || localXAI) && (
        <XAIPanel
          explanation={localXAI}
          isOpen={showXAI}
          onToggle={handleToggleXAI}
        />
      )}

      {/* Footer Section - Show if there's ANY metadata */}
      {shouldShowFooter && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Left side: Grade Label */}
          <div className="self-start sm:self-auto">
            {m.grade_level ? (
              <GradeLabel gradeLevel={m.grade_level} />
            ) : (
              <div />
            )}
          </div>

          {/* Right side: Safety, Explain button, Regenerate */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
            {safetySummary && <SafetySummary summary={safetySummary} />}

            {/* Explain button - fetches XAI if needed */}
            <button
              onClick={handleToggleXAI}
              className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors font-medium ${
                showXAI
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
              aria-expanded={showXAI}
              aria-label={showXAI ? "Hide explanation" : "Show explanation"}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>
                {isFetchingXAI
                  ? "Loading..."
                  : showXAI
                    ? "Hide Details"
                    : "Explain Answer"}
              </span>
            </button>

            {onRegenerate && (
              <RegenerateButton
                messageId={parentMessageId}
                onRegenerate={onRegenerate}
                isLoading={isRegenerating}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
