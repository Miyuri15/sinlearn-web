import { ChatMessage } from "@/lib/models/chat";

const MESSAGE_HISTORY_CACHE_PREFIX = "sinlearn.messageHistory.v1.";

function getMessageHistoryCacheKey(sessionId: string): string {
  return `${MESSAGE_HISTORY_CACHE_PREFIX}${sessionId}`;
}

function serializeMessageHistory(messages: ChatMessage[]): string {
  return JSON.stringify(messages, (_key, value) => {
    if (typeof File !== "undefined" && value instanceof File) {
      return {
        name: value.name,
        size: value.size,
        type: value.type,
      };
    }

    return value;
  });
}

export function readCachedSessionMessages(sessionId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(getMessageHistoryCacheKey(sessionId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch (error) {
    console.warn("Failed to read cached session messages", error);
    return [];
  }
}

export function writeCachedSessionMessages(
  sessionId: string,
  messages: ChatMessage[],
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      getMessageHistoryCacheKey(sessionId),
      serializeMessageHistory(messages),
    );
  } catch (error) {
    console.warn("Failed to write cached session messages", error);
  }
}

export function removeCachedSessionMessages(sessionId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getMessageHistoryCacheKey(sessionId));
  } catch (error) {
    console.warn("Failed to remove cached session messages", error);
  }
}
