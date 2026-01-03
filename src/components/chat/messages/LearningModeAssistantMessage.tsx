import type { ChatMessage } from "@/lib/models/chat";
import { MESSAGE_STYLES } from "./styles";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { isTextMessage } from "@/lib/models/chat";
import { RegenerateButton } from "./RegenerateButton";

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

  return (
    <div className={MESSAGE_STYLES.assistantMessage}>
      <TruncatedMessage content={contentStr} />
      {(m.grade_level || onRegenerate) && (
        <div className="pt-2">
          <div className="flex items-center gap-2">
            {m.grade_level && <GradeLabel gradeLevel={m.grade_level} />}
          </div>
          <div className="pt-2">
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
