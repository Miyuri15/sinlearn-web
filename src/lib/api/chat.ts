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
  return apiFetch<ChatSessionResponse>(`${API_BASE_URL}/api/v1/chat/sessions`, {
    method: "POST",
    body: JSON.stringify({
      channel: "text",
      ...payload,
    }),
  });
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
  resource_ids?: string[];
};

export type ResourceUploadResponse = {
  resource_id: string;
  filename: string;
  size_bytes: number;
  mime_type: string;
};

export const uploadResources = (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return apiFetch<ResourceUploadResponse[]>(
    `${API_BASE_URL}/api/v1/resources/upload/batch`,
    {
      method: "POST",
      body: formData,
    }
  );
};

export const postMessage = (
  sessionId: string | undefined,
  payload: PostMessagePayload
) => {
  // ✅ FORCE backend to receive "undefined" string when no session exists
  const sid =
    !sessionId || sessionId.startsWith("local-") ? "undefined" : sessionId;

  return apiFetch<any>(`${API_BASE_URL}/api/v1/messages/sessions/${sid}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const listSessionMessages = (sessionId: string) => {
  return apiFetch<any[]>(
    `${API_BASE_URL}/api/v1/messages/sessions/${sessionId}`,
    {
      method: "GET",
    }
  );
};

export type UpdateChatSessionPayload = {
  title?: string;
};

export const updateChatSession = (
  sessionId: string,
  payload: UpdateChatSessionPayload
) => {
  return apiFetch<ChatSessionResponse>(
    `${API_BASE_URL}/api/v1/chat/sessions/${sessionId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
};

export const deleteChatSession = (sessionId: string) => {
  return apiFetch<void>(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}`, {
    method: "DELETE",
  });
};

export type VoiceQAResponse = {
  session_id: string;
  question: string;
  answer: string;
  retrieved_chunks?: any[];
};

export async function postVoiceQA(
  params: {
    audio: Blob;
    session_id: string;
    resource_ids?: string[];
    top_k?: number;
  }
): Promise<VoiceQAResponse> {
  const {
    audio,
    session_id,
    resource_ids = [],
    top_k = 3,
  } = params;

  const formData = new FormData();
  formData.append("audio", audio, "voice.wav");
  formData.append("session_id", session_id);

  if (resource_ids.length > 0) {
    formData.append("resource_ids", resource_ids.join(","));
  }

  return apiFetch<VoiceQAResponse>(
    `${API_BASE_URL}/api/v1/voice/qa?top_k=${top_k}`,
    {
      method: "POST",
      body: formData,
    }
  );
}