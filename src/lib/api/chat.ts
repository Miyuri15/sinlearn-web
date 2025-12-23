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

