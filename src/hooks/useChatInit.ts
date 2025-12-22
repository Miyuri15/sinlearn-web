"use client";

import { useEffect, useState, useMemo } from "react";
import type { ChatMessage } from "@/lib/models/chat";

type Mode = "learning" | "evaluation";

export default function useChatInit({
  chatId,
  typeParam,
  initialMessages = [],
}: {
  chatId?: string;
  typeParam?: string | null;
  initialMessages?: ChatMessage[];
}) {
  const [mode, setMode] = useState<Mode>("learning");

  const [learningMessages, setLearningMessages] = useState<ChatMessage[]>([]);
  const [evaluationMessages, setEvaluationMessages] = useState<ChatMessage[]>(
    []
  );

  const initialMessagesKey = useMemo(
    () => JSON.stringify(initialMessages),
    [initialMessages]
  );

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // When URL contains ?type=learning or ?type=evaluation
    if (typeParam === "learning") {
      setMode("learning");
    } else if (typeParam === "evaluation") {
      setMode("evaluation");
    }

    // Load initial messages into the correct store
    if (initialMessages && initialMessages.length > 0) {
      if (typeParam === "evaluation") {
        setEvaluationMessages(initialMessages);
      } else {
        setLearningMessages(initialMessages); // default
      }
    } else {
      setLearningMessages([]);
      setEvaluationMessages([]);
    }

    setIsInitializing(false);
  }, [chatId, typeParam, initialMessagesKey]);

  return {
    mode,
    setMode,
    learningMessages,
    setLearningMessages,
    evaluationMessages,
    setEvaluationMessages,
    isInitializing,
  } as const;
}
