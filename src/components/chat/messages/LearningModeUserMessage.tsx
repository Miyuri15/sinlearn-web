import type { ChatMessage } from "@/lib/models/chat";
import { MESSAGE_STYLES } from "./styles";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { FileContent } from "./FileContent";

/**
 * LearningModeUserMessage: User message in learning mode
 */
export function LearningModeUserMessage({ message }: { message: ChatMessage }) {
  const hasFile = "file" in message && message.file;
  const isTextMessage = typeof message.content === "string";
  const m = message as any;

  return (
    <div className={MESSAGE_STYLES.userMessageWrapper}>
      <div className={MESSAGE_STYLES.userMessageContent}>
        {hasFile ? (
          <FileContent file={m.file} />
        ) : isTextMessage ? (
          <>
            <TruncatedMessage content={m.content} />
            {m.grade_level && (
              <div className="pt-2">
                <GradeLabel gradeLevel={m.grade_level} />
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
