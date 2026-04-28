// lib/api/chat.ts

import { ApiError, apiFetch } from "./client";
import { API_BASE_URL } from "../config";
import type { SafetySummary } from "../models/chat";

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
    `${API_BASE_URL}/api/v1/chat/sessions`,
  );
};

export type PostMessagePayload = {
  role?: string;
  content: any;
  mode?: "learning" | "evaluation";
  modality?: "text" | "voice" | string;
  grade_level?: string;
  attachments?: Array<{
    resource_id: string;
    display_name?: string;
    attachment_type?: string;
  }>;
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
    `${API_BASE_URL}/api/v1/resources/upload-only/batch`,
    {
      method: "POST",
      body: formData,
    },
  );
};

export const postMessage = (
  sessionId: string | undefined,
  payload: PostMessagePayload,
) => {
  // ✅ FORCE backend to receive "undefined" string when no session exists
  const sid =
    !sessionId || sessionId.startsWith("local-") ? "undefined" : sessionId;

  return apiFetch<any>(`${API_BASE_URL}/api/v1/messages/sessions/${sid}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const listSessionMessages = async (sessionId: string) => {
  try {
    return await apiFetch<any[]>(
      `${API_BASE_URL}/api/v1/messages/sessions/${sessionId}`,
      {
        method: "GET",
      },
    );
  } catch (error) {
    // If the backend is temporarily broken (e.g., schema drift), treat as "no history"
    // so the UI can still function.
    if (error instanceof ApiError && error.status >= 500) {
      return [];
    }
    throw error;
  }
};

export type UpdateChatSessionPayload = {
  title?: string;
};

export const updateChatSession = (
  sessionId: string,
  payload: UpdateChatSessionPayload,
) => {
  return apiFetch<ChatSessionResponse>(
    `${API_BASE_URL}/api/v1/chat/sessions/${sessionId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
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
  safety_summary?: SafetySummary;
};

export type GeneratedMessageResponse = {
  id: string;
  session_id: string;
  role: string;
  modality: string;
  content?: string;
  grade_level?: string;
  audio_url?: string;
  transcript?: string;
  audio_duration_sec?: number;
  created_at: string;
  resource_ids: string[];
  safety_summary?: SafetySummary;
};

export async function postVoiceQA(params: {
  audio: Blob;
  session_id: string;
  resource_ids?: string[];
}): Promise<VoiceQAResponse> {
  const { audio, session_id, resource_ids = []} = params;

  const formData = new FormData();
  formData.append("audio", audio, "voice.wav");
  formData.append("session_id", session_id);

  if (resource_ids.length > 0) {
    formData.append("resource_ids", resource_ids.join(","));
  }

  return apiFetch<VoiceQAResponse>(
    `${API_BASE_URL}/api/v1/voice/qa`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function postVoiceQAFromText(params: {
  text: string;
  session_id: string;
  resource_ids?: string[];
}): Promise<VoiceQAResponse> {
  const { text, session_id, resource_ids = []} = params;

  const formData = new FormData();
  formData.append("text", text);  // Send text instead of audio
  formData.append("session_id", session_id);

  if (resource_ids.length > 0) {
    formData.append("resource_ids", resource_ids.join(","));
  }

  return apiFetch<VoiceQAResponse>(
    `${API_BASE_URL}/api/v1/voice/qa-from-text`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function postVoiceTranscribe(audioBlob: Blob): Promise<{
  raw: string;
  normalized: string;
  standard: string;
}> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "voice.wav");

  const response = await apiFetch<{
    raw: string;
    normalized: string;
    standard: string;
  }>(`${API_BASE_URL}/api/v1/voice/transcribe`, {
    method: "POST",
    body: formData,
  });

  return response;
}

export const generateMessageResponse = async (messageId: string) => {
  const message = await apiFetch<GeneratedMessageResponse>(
    `${API_BASE_URL}/api/v1/messages/${messageId}/generate`,
    {
      method: "POST",
    },
  );

  return {
    role: message.role,
    content: message.content,
    grade_level: message.grade_level,
    message,
  };
};

export const getExplanationForMessage = async (messageId: string) => {
  return apiFetch<any>(`${API_BASE_URL}/api/v1/messages/${messageId}/xai`, {
    method: "GET",
  });
};

export const getMessageAttchmentLog = async (messageId: string) => {
  return apiFetch<any>(
    `${API_BASE_URL}/api/v1/messages/${messageId}/processing-logs`,
    {
      method: "GET",
    },
  );
};
