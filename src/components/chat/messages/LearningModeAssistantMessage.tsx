import type { ChatMessage } from "@/lib/models/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { isTextMessage } from "@/lib/models/chat";
import { RegenerateButton } from "./RegenerateButton";
import { SafetySummary } from "./SafetySummary";
import { CopyIcon } from "lucide-react";
import Tooltip from "@mui/material/Tooltip";

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
    ? message.parent_msg_id ?? message.id
    : undefined;
  const safetySummary = m.safety_summary;

  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

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
  (typeof safetySummary?.confidence_score === "number" &&
    safetySummary.confidence_score < 1);

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

      {/* Footer Section */}
      {shouldShowFooter && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Top Row on Mobile: Grade Label */}
          <div className="self-start sm:self-auto">
            {m.grade_level ? (
              <GradeLabel gradeLevel={m.grade_level} />
            ) : (
              <div />
            )}
          </div>

          {/* Bottom Row on Mobile: Safety + Regenerate Button */}
          {/* We use w-full on mobile to space them out, and w-auto on desktop to keep them grouped right */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
            {safetySummary && <SafetySummary summary={safetySummary} />}
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
