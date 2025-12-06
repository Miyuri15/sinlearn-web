"use client";

import ChatPage from "@/app/chat/page";
import { useParams } from "next/navigation";

export default function DynamicChatPage() {
  const { chatId } = useParams();

  return <ChatPage chatId={chatId as string} />;
}
