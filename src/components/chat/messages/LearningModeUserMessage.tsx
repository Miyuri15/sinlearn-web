import type { ChatMessage } from "@/lib/models/chat";
import { MESSAGE_STYLES } from "./styles";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { MessageAttachments } from "./MessageAttachments";

export function LearningModeUserMessage({ message }: { message: ChatMessage }) {
  const m = message as any;
  const isTextMessage = typeof m.content === "string";
  const contentStr = isTextMessage ? m.content : String(m.content);

  const resIds = m.resource_ids ?? [];

  return (
    <div className={MESSAGE_STYLES.userMessageWrapper}>
      <div className={MESSAGE_STYLES.userMessageContent}>
        <MessageAttachments resourceIds={resIds} />

        {isTextMessage && (
          <div className="flex flex-col">
            <div>
              <TruncatedMessage
                content={contentStr}
                expandStyle={MESSAGE_STYLES.expandButtonUser}
              />
            </div>

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
