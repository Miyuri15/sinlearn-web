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
}: Readonly<{
  messages: ChatMessage[];
  mode: "learning" | "evaluation";
  endRef?: React.RefObject<HTMLDivElement | null>;
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
      <div ref={endRef} />
    </>
  );
}
