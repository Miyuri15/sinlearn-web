import type { ChatMessage } from "@/lib/models/chat";
import { MESSAGE_STYLES } from "./styles";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";

/**
 * LearningModeAssistantMessage: Assistant message in learning mode
 */
export function LearningModeAssistantMessage({
  message,
}: {
  message: ChatMessage;
}) {
  const m = message as any;
  const contentStr =
    typeof m.content === "string" ? m.content : String(m.content);

  return (
    <div className={MESSAGE_STYLES.assistantMessage}>
      <TruncatedMessage content={contentStr} />
      {m.grade_level && (
        <div className="pt-2">
          <GradeLabel gradeLevel={m.grade_level} />
        </div>
      )}
    </div>
  );
}
