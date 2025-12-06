"use client";

import { useEffect, useState } from "react";
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
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages && initialMessages.length > 0 ? initialMessages : []
  );

  useEffect(() => {
    // prioritize explicit type param (from /chat?type=...)
    if (typeParam === "learning") {
      setMode("learning");
      setMessages([
        {
          id: "init-learning",
          role: "assistant",
          content:
            "Starting a new learning chat — ask a question or upload a file to begin.",
        },
      ]);
      return;
    }

    if (typeParam === "evaluation") {
      setMode("evaluation");
      setMessages([
        {
          id: "init-evaluation",
          role: "assistant",
          content:
            "Starting a new evaluation chat — set the evaluation inputs or upload the student's answers to begin.",
        },
      ]);
      return;
    }

    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      setMessages([]);
    }
  }, [chatId, typeParam, JSON.stringify(initialMessages)]);

  return { mode, setMode, messages, setMessages } as const;
}
