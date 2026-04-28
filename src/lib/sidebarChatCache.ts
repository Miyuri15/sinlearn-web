export type SidebarChatItem = {
  id: string;
  title: string;
  type: "learning" | "evaluation";
  time: string;
};

const SIDEBAR_CHAT_CACHE_KEY = "sinlearn.sidebarChats.v1";

export function readCachedSidebarChats(): SidebarChatItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(SIDEBAR_CHAT_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is SidebarChatItem =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        (item.type === "learning" || item.type === "evaluation") &&
        typeof item.time === "string",
    );
  } catch {
    return [];
  }
}

export function writeCachedSidebarChats(chats: SidebarChatItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SIDEBAR_CHAT_CACHE_KEY, JSON.stringify(chats));
  } catch {
    // Best-effort cache only.
  }
}
