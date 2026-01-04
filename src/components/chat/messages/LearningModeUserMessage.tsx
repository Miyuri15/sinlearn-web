import type { ChatMessage } from "@/lib/models/chat";
import { MESSAGE_STYLES } from "./styles";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { MessageAttachments } from "./MessageAttachments";
import { Mic } from "lucide-react"; // Assuming you use lucide-react, or use a plain SVG

export function LearningModeUserMessage({ message }: { message: ChatMessage }) {
  const m = message as any;
  const isTextMessage = typeof m.content === "string";
  const contentStr = isTextMessage ? m.content : String(m.content);
  const isVoice = m.modality === "voice"; // Check the modality

  const resIds = m.resource_ids ?? [];

  return (
    <div className={MESSAGE_STYLES.userMessageWrapper}>
      <div 
        className={`${MESSAGE_STYLES.userMessageContent} ${
          isVoice ? "border-l-4 border-blue-400 bg-blue-50/30 dark:bg-blue-900/10" : ""
        }`}
      >
        {/* Voice Indicator Header */}
        {isVoice && (
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Mic size={14} />
            <span>Voice Transcript</span>
          </div>
        )}

        {/* Attachments */}
        {resIds.length > 0 && (
          <div className="mb-2">
            <MessageAttachments resourceIds={resIds} />
          </div>
        )}

        {isTextMessage && (
          <div className="flex flex-col">
            <div className={`leading-relaxed ${isVoice ? "italic text-gray-700 dark:text-gray-300" : ""}`}>
              <TruncatedMessage
                content={contentStr}
                expandStyle={MESSAGE_STYLES.expandButtonUser}
              />
            </div>

            <div className="mt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4 pt-1">
              {m.grade_level ? (
                <GradeLabel gradeLevel={m.grade_level} />
              ) : (
                <div />
              )}
              
              {/* Optional: Show timestamp or duration if it's voice */}
              {isVoice && m.created_at && (
                <span className="text-[10px] opacity-50">
                   {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}