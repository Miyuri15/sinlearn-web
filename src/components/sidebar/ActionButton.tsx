"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setSelectedChatType } from "@/lib/localStore";
import { createChatSession } from "@/lib/api/chat";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  chatType: "learning" | "evaluation";
  colorClass?: string;
}

export default function ActionButton({
  icon,
  label,
  isOpen,
  chatType,
  colorClass,
}: Readonly<ActionButtonProps>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = async () => {
    if (isLoading) return; // Prevent multiple clicks

    setIsLoading(true);
    setSelectedChatType(chatType);

    // Evaluation mode: create a real session immediately (mobile parity)
    if (chatType === "evaluation") {
      try {
        const session = await createChatSession({
          mode: "evaluation",
          channel: "text",
          title: "New Evaluation Chat",
          description: null as any,
          grade: null as any,
          subject: null as any,
        });

        router.push(`/chat/${session.id}`);
      } catch (e) {
        // Fallback: still allow a local temp chat if backend fails
        const tempId = `local-${Date.now()}-${chatType}`;
        router.push(`/chat/${tempId}`);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }

      return;
    }

    // Learning mode: keep existing local temporary chat behavior
    const tempId = `local-${Date.now()}-${chatType}`;
    router.push(`/chat/${tempId}`);

    // Reset loading state after a short delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <button
      onClick={handleNewChat}
      disabled={isLoading}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent
        transition-all duration-200
        ${isOpen ? "justify-start" : "justify-center"}
        bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm
        ${colorClass}
        ${isLoading ? "opacity-50 cursor-wait" : ""}
      `}
      title={!isOpen ? label : undefined}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}
