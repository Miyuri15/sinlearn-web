import type { ChatMessage } from "@/lib/models/chat";
import { MESSAGE_STYLES } from "./styles";
import { FileContent } from "./FileContent";
import { EvaluationInputContent } from "./EvaluationInputContent";

/**
 * EvaluationModeUserMessage: User message in evaluation mode
 */
export function EvaluationModeUserMessage({
  message,
}: {
  message: ChatMessage;
}) {
  const hasFile = "file" in message && message.file;
  const hasEvaluationContent =
    typeof message.content === "object" &&
    message.content &&
    "totalMarks" in (message.content as any);
  const m = message as any;

  return (
    <div className={MESSAGE_STYLES.userMessageWrapper}>
      <div className={MESSAGE_STYLES.userMessageContentEval}>
        {hasFile ? (
          <FileContent file={m.file} />
        ) : hasEvaluationContent ? (
          <EvaluationInputContent content={m.content} />
        ) : null}
      </div>
    </div>
  );
}
