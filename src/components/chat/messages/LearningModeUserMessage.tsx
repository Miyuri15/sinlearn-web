import type { ChatMessage } from "@/lib/models/chat";
import { MESSAGE_STYLES } from "./styles";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { MessageAttachments } from "./MessageAttachments";

export function LearningModeUserMessage({ message }: { message: ChatMessage }) {
  const m = message as any;
  const isTextMessage = typeof m.content === "string";

  const files = m.files || [];

  return (
    <div className={MESSAGE_STYLES.userMessageWrapper}>
      <div className={MESSAGE_STYLES.userMessageContent}>
        <MessageAttachments files={files} />

        {isTextMessage && (
          <div className="flex flex-col">
            <TruncatedMessage content={m.content} />

            {m.grade_level && (
              <div className="pt-2">
                <GradeLabel gradeLevel={m.grade_level} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
