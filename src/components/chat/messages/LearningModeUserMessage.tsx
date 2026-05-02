// src/components/chat/messages/LearningModeUserMessage.tsx

import type { ChatMessage } from "@/lib/models/chat";
import { MESSAGE_STYLES } from "./styles";
import { TruncatedMessage } from "./TruncatedMessage";
import { GradeLabel } from "./GradeLabel";
import { ProcessingLogButton } from "./ProcessingLogButton";
import { MessageAttachments } from "./MessageAttachments";
import { Clock, Loader2, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LearningModeUserMessage({ message }: { message: ChatMessage }) {
  const { t } = useTranslation("chat");
  const m = message as any;
  const isTextMessage = typeof m.content === "string";
  const contentStr = isTextMessage ? m.content : String(m.content);
  const isVoice = m.modality === "voice";
  const resIds = m.resource_ids ?? [];
  const offlineFiles = Array.isArray(m.offline_files) ? m.offline_files : [];
  const hasProcessingLog = m.has_processing_log === true;
  const offlineStatus = m.offline_status as "pending" | "syncing" | undefined;

  return (
    <div className={MESSAGE_STYLES.userMessageWrapper}>
      <div
        className={`${MESSAGE_STYLES.userMessageContent} ${
          isVoice
            ? "border-l-4 border-blue-400 bg-blue-50/30 dark:bg-blue-900/10"
            : ""
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

        {offlineFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {offlineFiles.map((file: any, index: number) => (
              <span
                key={`${file.name}-${index}`}
                className="inline-flex max-w-full items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-800 dark:border-amber-800/70 dark:bg-amber-900/20 dark:text-amber-200"
                title={file.name}
              >
                <Clock className="h-3 w-3 shrink-0" />
                <span className="truncate">{file.name}</span>
              </span>
            ))}
          </div>
        )}

        {isTextMessage && (
          <div className="flex flex-col">
            <div
              className={`leading-relaxed ${isVoice ? "italic text-gray-700 dark:text-gray-300" : ""}`}
            >
              <TruncatedMessage
                content={contentStr}
                expandStyle={MESSAGE_STYLES.expandButtonUser}
              />
            </div>

            <div className="mt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4 pt-1">
              {/* Left side: Grade Label */}
              {m.grade_level ? (
                <GradeLabel gradeLevel={m.grade_level} />
              ) : (
                <div />
              )}

              {/* Right side: Processing Log and Timestamp */}
              <div className="flex items-center gap-3">
                {offlineStatus && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300">
                    {offlineStatus === "syncing" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {offlineStatus === "syncing"
                      ? t("offline_message_syncing")
                      : t("offline_message_pending")}
                  </span>
                )}

                {hasProcessingLog && (
                  <ProcessingLogButton
                    messageId={m.id}
                    hasProcessingLog={hasProcessingLog}
                  />
                )}

                {isVoice && m.created_at && (
                  <span className="text-[10px] opacity-50">
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
