import React from "react";
import type { ChatMessage } from "@/lib/models/chat";
import EvaluationCard from "@/components/chat/EvaluationCard";
import {
  LearningModeUserMessage,
  LearningModeAssistantMessage,
  EvaluationModeUserMessage,
  MESSAGE_STYLES,
} from "@/components/chat/messages";

export default function MessagesList({
  messages,
  mode,
  endRef,
  isProcessing = false,
}: Readonly<{
  messages: ChatMessage[];
  mode: "learning" | "evaluation";
  endRef?: React.RefObject<HTMLDivElement | null>;
  isProcessing?: boolean;
}>) {
  const renderMessage = (message: ChatMessage) => {
    if (mode === "learning") {
      if (message.role === "user") {
        return <LearningModeUserMessage message={message} />;
      }
      if (message.role === "assistant") {
        return <LearningModeAssistantMessage message={message} />;
      }
      return null;
    }

    // Evaluation mode
    if (message.role === "user") {
      return <EvaluationModeUserMessage message={message} />;
    }
    if (message.role === "evaluation") {
      return (
        <div className={MESSAGE_STYLES.evaluationMessage}>
          <EvaluationCard data={message.content as any} />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {messages.map((m, i) => (
        <div key={m.id ?? `msg-${i}`}>{renderMessage(m)}</div>
      ))}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 px-3 py-2">
          <span
            className="inline-block h-3 w-3 sm:h-4 sm:w-4 border-2 border-gray-400 border-t-transparent rounded-4xl sm:rounded-full animate-spin"
            aria-label="Processing"
          />
          <span>Processing attachments and generating a response…</span>
        </div>
      )}
      <div ref={endRef} />
    </>
  );
}
