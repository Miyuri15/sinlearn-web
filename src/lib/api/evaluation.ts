import { API_BASE_URL } from "../config";
import { getAccessToken } from "../localStore";
import { apiFetch } from "./client";

export type EvaluationResourceType =
  | "question_paper"
  | "syllabus"
  | "answer_sheet";

export type UploadedResource = {
  resource_id: string;
  filename?: string;
  size_bytes?: number;
  mime_type?: string;
};

function extractUploads(payload: any): UploadedResource[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as UploadedResource[];

  const candidates = [
    payload.uploads,
    payload.uploaded_resources,
    payload.uploaded,
    payload.resources,
    payload.data,
    payload.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as UploadedResource[];
    if (candidate && Array.isArray(candidate.uploads))
      return candidate.uploads as UploadedResource[];
    if (candidate && Array.isArray(candidate.resources))
      return candidate.resources as UploadedResource[];
  }

  return [];
}

export async function uploadEvaluationResources(params: {
  chatSessionId: string;
  resourceType: EvaluationResourceType;
  files: File[];
}): Promise<UploadedResource[]> {
  const { chatSessionId, resourceType, files } = params;
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const payload = await apiFetch<any>(
    `${API_BASE_URL}/api/v1/resources/upload?resource_type=${encodeURIComponent(
      resourceType
    )}&chat_session_id=${encodeURIComponent(chatSessionId)}`,
    {
      method: "POST",
      body: formData,
    }
  );

  return extractUploads(payload);
}

export type RubricCriterion = {
  criterion: string;
  weight_percentage: number;
};

export type CreateRubricPayload = {
  name: string;
  rubric_type: "system" | "custom";
  criteria: RubricCriterion[];
  description?: string;
  source?: string;
};

function extractRubricId(payload: any): string | null {
  if (!payload) return null;
  const direct = payload.id || payload.rubric_id || payload.rubricId;
  if (typeof direct === "string") return direct;

  const nestedCandidates = [payload.rubric, payload.data, payload.result];
  for (const n of nestedCandidates) {
    if (!n) continue;
    const nested = n.id || n.rubric_id || n.rubricId;
    if (typeof nested === "string") return nested;
  }

  return null;
}

export async function createRubric(params: {
  chatSessionId: string;
  payload: CreateRubricPayload;
}): Promise<string> {
  const { chatSessionId, payload } = params;

  const resp = await apiFetch<any>(
    `${API_BASE_URL}/api/v1/rubrics/?chat_session_id=${encodeURIComponent(
      chatSessionId
    )}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  const rubricId = extractRubricId(resp);
  if (!rubricId) {
    throw new Error("Rubric creation succeeded but no rubric id returned");
  }

  return rubricId;
}

export async function attachRubricToSession(params: {
  chatSessionId: string;
  rubricId: string;
}): Promise<void> {
  const { chatSessionId, rubricId } = params;
  await apiFetch<void>(`${API_BASE_URL}/api/v1/chat/sessions/${chatSessionId}`, {
    method: "PUT",
    body: JSON.stringify({ rubric_id: rubricId }),
  });
}

export type ChatSessionDetails = {
  id: string;
  rubric_id?: string | null;
  resources?: any[];
  question_paper?: any;
  syllabus?: any;
};

export async function getChatSessionDetails(sessionId: string) {
  return apiFetch<ChatSessionDetails>(
    `${API_BASE_URL}/api/v1/chat/sessions/${sessionId}`
  );
}

export async function listChatSessionResources(sessionId: string) {
  return apiFetch<any[]>(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/resources`);
}

export type ProcessDocumentsRequest = {
  chat_session_id: string;
  answer_resource_ids: string[];
};

export async function processDocumentsStream(
  body: ProcessDocumentsRequest
): Promise<string> {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE_URL}/api/v1/evaluation/process-documents/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to process documents");
  }

  // Web client treats it as plain text (mobile parity).
  return await res.text();
}

export type StartEvaluationRequest = {
  chat_session_id: string;
  answer_resource_ids: string[];
};

export type EvaluationProgressStep =
  | "evaluating_answer_sheets"
  | "calculating_marks"
  | "generating_feedback"
  | "preparing_report"
  | "completed";

export type StreamProgressEvent = {
  raw: string;
  step?: EvaluationProgressStep;
};

function guessStepFromLine(line: string): EvaluationProgressStep | undefined {
  const s = line.toLowerCase();
  if (s.includes("evaluat") && s.includes("answer")) return "evaluating_answer_sheets";
  if (s.includes("calculat") && s.includes("mark")) return "calculating_marks";
  if (s.includes("feedback")) return "generating_feedback";
  if (s.includes("report")) return "preparing_report";
  if (s.includes("complete") || s.includes("done") || s.includes("success")) return "completed";
  return undefined;
}

export async function startEvaluationStream(params: {
  body: StartEvaluationRequest;
  onEvent: (evt: StreamProgressEvent) => void;
  signal?: AbortSignal;
}): Promise<any> {
  const { body, onEvent, signal } = params;
  const token = getAccessToken();

  const res = await fetch(`${API_BASE_URL}/api/v1/evaluation/start/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to start evaluation stream");
  }

  const reader = res.body?.getReader();
  if (!reader) {
    // Fallback: no streaming body
    const text = await res.text();
    onEvent({ raw: text, step: guessStepFromLine(text) });
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split on newlines, process complete lines
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // SSE-like: "data: ..."
      const payload = trimmed.startsWith("data:")
        ? trimmed.slice("data:".length).trim()
        : trimmed;

      onEvent({ raw: payload, step: guessStepFromLine(payload) });
    }
  }

  // Attempt to parse final buffer as JSON result
  const finalText = buffer.trim();
  if (finalText) {
    onEvent({ raw: finalText, step: guessStepFromLine(finalText) });
    try {
      return JSON.parse(finalText);
    } catch {
      return finalText;
    }
  }

  return null;
}

export async function startEvaluation(body: StartEvaluationRequest): Promise<any> {
  return apiFetch<any>(`${API_BASE_URL}/api/v1/evaluation/start`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getEvaluationResult(answerDocumentId: string): Promise<any> {
  return apiFetch<any>(
    `${API_BASE_URL}/api/v1/evaluation/answers/${answerDocumentId}/result`
  );
}
