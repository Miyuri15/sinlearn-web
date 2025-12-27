import { apiFetch } from "./client";
import { API_BASE_URL } from "../config";

export type CreateChatPayload = {
    mode: "learning" | "evaluation";
    channel?: "text" | "voice" | "mixed";
    title?: string;
    description?: string;
    grade?: number;
    subject?: string;
};

export type ChatSessionResponse = {
    id: string;
    mode: "learning" | "evaluation";
    channel: string;
    created_at: string;
    updated_at: string;
    title?: string;
};

export const createChatSession = (payload: CreateChatPayload) => {
    return apiFetch<ChatSessionResponse>(
        `${API_BASE_URL}/api/v1/chat/sessions`,
        {
            method: "POST",
            body: JSON.stringify({
                channel: "text",
                ...payload,
            }),
        }
    );
};

export const listChatSessions = () => {
    return apiFetch<ChatSessionResponse[]>(
        `${API_BASE_URL}/api/v1/chat/sessions`
    );
};

export type PostMessagePayload = {
    role?: string;
    content: any;
    mode?: "learning" | "evaluation";
    // include other fields as needed (files, metadata)
};

export const postMessage = (
  sessionId: string | undefined,
  payload: PostMessagePayload
) => {
  // ✅ FORCE backend to receive "undefined" string when no session exists
  const sid =
    !sessionId || sessionId.startsWith("local-")
      ? "undefined"
      : sessionId;

  return apiFetch<any>(
    `${API_BASE_URL}/api/v1/messages/sessions/${sid}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

export const listSessionMessages = (sessionId: string) => {
  return apiFetch<any[]>(
    `${API_BASE_URL}/api/v1/messages/sessions/${sessionId}`,
    {
      method: "GET",
    }
  );
};


