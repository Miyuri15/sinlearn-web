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
        {/* Attachments */}
        {resIds.length > 0 && (
          <div className="mb-2">
            <MessageAttachments resourceIds={resIds} />
          </div>
        )}

        {isTextMessage && (
          <div className="flex flex-col">
            <div className="leading-relaxed">
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
