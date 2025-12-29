"use client";

import ChatPage from "@/app/chat/page";
import { HARD_CODED_CHATS } from "@/data/hardcoded";
import { useParams } from "next/navigation";
import type { ChatMessage } from "@/lib/models/chat";

export default function DynamicChatPage() {
  const { chatId } = useParams();
  let initialMessages: ChatMessage[] = [];

  try {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(`chatMessages:${chatId}`) : null;
    if (stored) {
      initialMessages = JSON.parse(stored) as ChatMessage[];
      // Remove the stored draft once loaded so it doesn't persist forever
      try {
        sessionStorage.removeItem(`chatMessages:${chatId}`);
      } catch {}
    } else {
      initialMessages = HARD_CODED_CHATS[chatId as string] ?? [];
    }
  } catch (e) {
    console.warn("Failed to read persisted chat messages", e);
    initialMessages = HARD_CODED_CHATS[chatId as string] ?? [];
  }

  return <ChatPage chatId={chatId as string} initialMessages={initialMessages} />;
}
