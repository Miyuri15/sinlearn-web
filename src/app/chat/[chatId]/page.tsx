"use client";

import ChatPage from "@/app/chat/page";
import { HARD_CODED_CHATS } from "@/data/hardcoded";
import { useParams } from "next/navigation";
import type { ChatMessage } from "@/lib/models/chat";

export default function DynamicChatPage() {
  const { chatId } = useParams();
  const initialMessages: ChatMessage[] =
    HARD_CODED_CHATS[chatId as string] ?? [];
  return (
    <ChatPage chatId={chatId as string} initialMessages={initialMessages} />
  );
}
