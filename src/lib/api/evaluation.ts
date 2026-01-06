import { API_BASE_URL } from "../config";
import { getAccessToken } from "../localStore";
import { apiFetch } from "./client";
import type { PaperPart, Question, SubQuestion } from "@/lib/models/chat";

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
  chatSessionId?: string;
  resourceType?: EvaluationResourceType;
  files: File[];
}): Promise<UploadedResource[]> {
  const { chatSessionId, resourceType, files } = params;
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  let url = `${API_BASE_URL}/api/v1/resources/upload`;
  const queryParams = new URLSearchParams();
  
  if (resourceType) {
    queryParams.append("resource_type", resourceType);
  }
  if (chatSessionId) {
    queryParams.append("chat_session_id", chatSessionId);
  }

  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  const payload = await apiFetch<any>(
    url,
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

export async function detachRubricFromSession(params: {
  chatSessionId: string;
}): Promise<void> {
  const { chatSessionId } = params;
  await apiFetch<void>(`${API_BASE_URL}/api/v1/chat/sessions/${chatSessionId}`, {
    method: "PUT",
    body: JSON.stringify({ rubric_id: null }),
  });
}

export async function removeAttachedRubricFromSession(params: {
  chatSessionId: string;
}): Promise<void> {
  const { chatSessionId } = params;
  await apiFetch<void>(
    `${API_BASE_URL}/api/v1/chat/sessions/${encodeURIComponent(chatSessionId)}/rubric`,
    { method: "DELETE" }
  );
}

export async function removeAttachedResourceFromSession(params: {
  chatSessionId: string;
  resourceType: "syllabus" | "question_paper" | "answer_sheet";
}): Promise<void> {
  const { chatSessionId, resourceType } = params;
  await apiFetch<void>(
    `${API_BASE_URL}/api/v1/chat/sessions/${encodeURIComponent(
      chatSessionId
    )}/resources/${encodeURIComponent(resourceType)}`,
    { method: "DELETE" }
  );
}

export type ChatSessionDetails = {
  id: string;
  rubric_id?: string | null;
  resources?: any[];
  question_paper?: any;
  syllabus?: any;
};

export async function getRubricById(rubricId: string) {
  return apiFetch<any>(`${API_BASE_URL}/api/v1/rubrics/${encodeURIComponent(rubricId)}`);
}

export async function getChatSessionDetails(sessionId: string) {
  return apiFetch<ChatSessionDetails>(
    `${API_BASE_URL}/api/v1/chat/sessions/${sessionId}`
  );
}

export async function listChatSessionResources(sessionId: string) {
  return apiFetch<any[]>(`${API_BASE_URL}/api/v1/chat/sessions/${sessionId}/resources`);
}

function coerceNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function normalizePaperConfigPayload(payload: any): PaperPart[] {
  const raw =
    payload?.paper_config ??
    payload?.paperConfig ??
    payload?.config ??
    payload?.data?.paper_config ??
    payload?.data?.paperConfig ??
    payload?.result?.paper_config ??
    payload?.result?.paperConfig ??
    payload;

  if (!raw) return [];
  const parts = Array.isArray(raw) ? raw : raw?.paper_parts ?? raw?.parts ?? [];
  if (!Array.isArray(parts)) return [];

  return parts.map((p: any, partIndex: number) => {
    const partId = String(p?.id ?? p?.part_id ?? `ocr-part-${partIndex}`);
    const name = String(
      p?.paper_part ??
        p?.paperPart ??
        p?.name ??
        p?.title ??
        p?.part_name ??
        `Paper_${partIndex + 1}`
    );
    const totalMarks = coerceNumber(p?.totalMarks ?? p?.total_marks ?? p?.total ?? p?.marks, 0);
    const mainQuestionsCount = coerceNumber(
      p?.total_main_questions ??
        p?.mainQuestionsCount ??
        p?.main_questions_count ??
        p?.main_questions ??
        p?.mainQuestions,
      0
    );
    const selectionRules = p?.selection_rules ?? p?.selectionRules ?? null;
    const chooseAny =
      selectionRules && typeof selectionRules === "object"
        ? coerceNumber(
            (selectionRules as any).choose_any ??
              (selectionRules as any).chooseAny ??
              (selectionRules as any).choose,
            0
          )
        : 0;
    const requiredQuestionsCount =
      chooseAny > 0
        ? chooseAny
        : coerceNumber(
            p?.requiredQuestionsCount ??
              p?.required_questions_count ??
              p?.required_questions ??
              p?.requiredQuestions,
            0
          );

    const rawQuestions = Array.isArray(p?.questions)
      ? p.questions
      : Array.isArray(p?.main_questions)
        ? p.main_questions
        : Array.isArray(p?.items)
          ? p.items
          : [];

    const questions: Question[] = rawQuestions.map((q: any, qIndex: number) => {
      const questionId = String(q?.id ?? q?.question_id ?? `ocr-q-${partIndex}-${qIndex}`);
      const label = String(q?.label ?? q?.name ?? q?.question_label ?? q?.question_no ?? `Q${qIndex + 1}`);

      const rawSub = Array.isArray(q?.subQuestions)
        ? q.subQuestions
        : Array.isArray(q?.sub_questions)
          ? q.sub_questions
          : Array.isArray(q?.subparts)
            ? q.subparts
            : [];

      const subQuestions: SubQuestion[] = rawSub.map((sq: any, sqIndex: number) => ({
        id: String(sq?.id ?? sq?.sub_question_id ?? `ocr-sq-${partIndex}-${qIndex}-${sqIndex}`),
        label: String(sq?.label ?? sq?.name ?? sq?.sub_label ?? String.fromCharCode(97 + sqIndex)),
        marks: coerceNumber(sq?.marks ?? sq?.mark ?? sq?.score ?? 0, 0),
      }));

      const hasSubQuestions =
        typeof q?.hasSubQuestions === "boolean"
          ? q.hasSubQuestions
          : typeof q?.has_sub_questions === "boolean"
            ? q.has_sub_questions
            : subQuestions.length > 0;

      const marks = hasSubQuestions
        ? subQuestions.reduce((sum, s) => sum + (s.marks || 0), 0)
        : coerceNumber(q?.marks ?? q?.mark ?? q?.score ?? 0, 0);

      return {
        id: questionId,
        label,
        marks,
        hasSubQuestions,
        subQuestions,
      };
    });

    return {
      id: partId,
      name,
      totalMarks,
      mainQuestionsCount: mainQuestionsCount || questions.length,
      requiredQuestionsCount: requiredQuestionsCount || 0,
      questions,
    };
  });
}

function normalizePaperQuestionsPayload(payload: any): PaperPart[] {
  if (!payload) return [];

  const root =
    payload?.data ??
    payload?.result ??
    payload?.paper_structure ??
    payload?.paperStructure ??
    payload;

  const rawParts = Array.isArray(root)
    ? root
    : Array.isArray(root?.parts)
      ? root.parts
      : Array.isArray(root?.paper_parts)
        ? root.paper_parts
        : Array.isArray(root?.sections)
          ? root.sections
          : Array.isArray(root?.paperParts)
            ? root.paperParts
            : [];

  if (!Array.isArray(rawParts)) return [];

  return rawParts.map((p: any, partIndex: number) => {
    const partId = String(p?.id ?? p?.part_id ?? `qs-part-${partIndex}`);
    const name = String(
      p?.name ??
        p?.part_name ??
        p?.title ??
        p?.section ??
        p?.section_name ??
        `Part ${partIndex + 1}`
    );

    const totalMarks = coerceNumber(
      p?.totalMarks ?? p?.total_marks ?? p?.marks ?? p?.total ?? 0,
      0
    );

    const mainQuestionsCount = coerceNumber(
      p?.mainQuestionsCount ?? p?.main_questions ?? p?.main_question_count ?? p?.questions_count ?? 0,
      0
    );

    const requiredQuestionsCount = coerceNumber(
      p?.requiredQuestionsCount ?? p?.required_questions ?? p?.choose ?? p?.choose_count ?? 0,
      0
    );

    const rawQuestions = Array.isArray(p?.questions)
      ? p.questions
      : Array.isArray(p?.main_questions)
        ? p.main_questions
        : Array.isArray(p?.items)
          ? p.items
          : Array.isArray(p?.question_structure)
            ? p.question_structure
            : Array.isArray(p?.questionStructure)
              ? p.questionStructure
              : [];

    const questions: Question[] = (rawQuestions as any[]).map((q: any, qIndex: number) => {
      const questionId = String(q?.id ?? q?.question_id ?? `qs-q-${partIndex}-${qIndex}`);
      const label = String(
        q?.label ??
          q?.name ??
          q?.question_label ??
          q?.question_no ??
          q?.question_number ??
          q?.question ??
          `Q${qIndex + 1}`
      );

      const rawSub = Array.isArray(q?.subQuestions)
        ? q.subQuestions
        : Array.isArray(q?.sub_questions)
          ? q.sub_questions
          : Array.isArray(q?.subparts)
            ? q.subparts
            : Array.isArray(q?.sub)
              ? q.sub
              : [];

      const subQuestions: SubQuestion[] = (rawSub as any[]).map((sq: any, sqIndex: number) => ({
        id: String(sq?.id ?? sq?.sub_question_id ?? `qs-sq-${partIndex}-${qIndex}-${sqIndex}`),
        label: String(
          sq?.label ?? sq?.name ?? sq?.sub_label ?? sq?.sub_question_no ?? String.fromCharCode(97 + sqIndex)
        ),
        marks: coerceNumber(sq?.marks ?? sq?.mark ?? sq?.score ?? 0, 0),
      }));

      const hasSubQuestions =
        typeof q?.hasSubQuestions === "boolean"
          ? q.hasSubQuestions
          : typeof q?.has_sub_questions === "boolean"
            ? q.has_sub_questions
            : subQuestions.length > 0;

      const marks = hasSubQuestions
        ? subQuestions.reduce((sum, s) => sum + (s.marks || 0), 0)
        : coerceNumber(q?.marks ?? q?.mark ?? q?.score ?? 0, 0);

      return {
        id: questionId,
        label,
        marks,
        hasSubQuestions,
        subQuestions,
      };
    });

    return {
      id: partId,
      name,
      totalMarks,
      mainQuestionsCount: mainQuestionsCount || questions.length,
      requiredQuestionsCount: requiredQuestionsCount || 0,
      questions,
    };
  });
}

type FlatQuestionApi = {
  id?: string;
  question_id?: string;
  question_number?: string | number;
  question_text?: string;
  max_marks?: number;
  sub_questions?: Array<{
    id?: string;
    sub_question_id?: string;
    label?: string;
    max_marks?: number;
    sub_question_text?: string;
    children?: any[];
  }>;
};

function looksLikeFlatQuestionsArray(payload: any): payload is FlatQuestionApi[] {
  if (!Array.isArray(payload) || payload.length === 0) return false;
  const first = payload[0];
  return (
    first &&
    ("question_number" in first || "question_text" in first || "max_marks" in first)
  );
}

function normalizeFlatQuestions(payload: any): Question[] {
  if (!looksLikeFlatQuestionsArray(payload)) return [];

  return payload.map((q: FlatQuestionApi, idx: number) => {
    const qNo = q?.question_number ?? idx + 1;
    const qNoStr = String(qNo);
    const label = qNoStr.toLowerCase().startsWith("q") ? qNoStr : `Q${qNoStr}`;

    const rawSubs = Array.isArray(q?.sub_questions) ? q.sub_questions : [];
    const subQuestions: SubQuestion[] = rawSubs.map((sq, sidx) => ({
      id: String(sq?.id ?? sq?.sub_question_id ?? `qs-sq-${idx}-${sidx}`),
      label: String(sq?.label ?? String.fromCharCode(97 + sidx)),
      marks: coerceNumber(sq?.max_marks ?? 0, 0),
    }));

    const hasSubQuestions = subQuestions.length > 0;
    const marks = hasSubQuestions
      ? subQuestions.reduce((sum, s) => sum + (s.marks || 0), 0)
      : coerceNumber(q?.max_marks ?? 0, 0);

    return {
      id: String(q?.id ?? q?.question_id ?? `qs-q-${idx}`),
      label,
      marks,
      hasSubQuestions,
      subQuestions,
    };
  });
}

function sortQuestionsByNumber(questions: Question[]): Question[] {
  const parse = (label: string) => {
    const m = String(label).match(/(\d+)/);
    return m ? Number(m[1]) : Number.NaN;
  };
  return [...questions].sort((a, b) => {
    const na = parse(a.label);
    const nb = parse(b.label);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return a.label.localeCompare(b.label);
  });
}

function splitFlatQuestionsIntoParts(params: {
  paperConfigParts: PaperPart[];
  flatQuestions: Question[];
}): PaperPart[] {
  const { paperConfigParts, flatQuestions } = params;
  if (!Array.isArray(paperConfigParts) || paperConfigParts.length === 0) {
    return [];
  }

  const sorted = sortQuestionsByNumber(flatQuestions);
  let cursor = 0;

  return paperConfigParts.map((p, idx) => {
    const take = Math.max(0, p.mainQuestionsCount || 0);
    const slice = take > 0 ? sorted.slice(cursor, cursor + take) : [];
    cursor += slice.length;

    // If counts don't add up, put leftovers into the last part.
    const questions =
      idx === paperConfigParts.length - 1 && cursor < sorted.length
        ? [...slice, ...sorted.slice(cursor)]
        : slice;

    if (idx === paperConfigParts.length - 1) {
      cursor = sorted.length;
    }

    return {
      id: p.id,
      name: p.name,
      totalMarks: p.totalMarks,
      mainQuestionsCount: p.mainQuestionsCount,
      requiredQuestionsCount: p.requiredQuestionsCount,
      questions,
    };
  });
}

function normalizeMatchKey(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function findQuestionByLabel(questions: Question[], label: string): Question | undefined {
  const key = normalizeMatchKey(label);
  if (!key) return undefined;
  return questions.find((q) => normalizeMatchKey(q.label) === key);
}

export function mergePaperConfigWithQuestionStructure(params: {
  paperConfigParts: PaperPart[];
  questionStructureParts: PaperPart[];
}): PaperPart[] {
  const { paperConfigParts, questionStructureParts } = params;
  if (!Array.isArray(paperConfigParts) || paperConfigParts.length === 0) {
    return Array.isArray(questionStructureParts) ? questionStructureParts : [];
  }
  if (!Array.isArray(questionStructureParts) || questionStructureParts.length === 0) {
    return paperConfigParts;
  }

  return paperConfigParts.map((basePart, partIndex) => {
    const matched =
      questionStructureParts.find((p) => p.id === basePart.id) ??
      questionStructureParts.find((p) => normalizeMatchKey(p.name) === normalizeMatchKey(basePart.name)) ??
      questionStructureParts[partIndex];

    if (!matched) return basePart;

    const mergedQuestions: Question[] =
      basePart.questions && basePart.questions.length > 0
        ? basePart.questions.map((baseQ) => {
            const q2 =
              matched.questions.find((q) => q.id === baseQ.id) ??
              findQuestionByLabel(matched.questions, baseQ.label);

            if (!q2) return baseQ;

            // Keep label/id from base (user-visible), but pull marks allocations from structure.
            return {
              ...baseQ,
              marks: typeof q2.marks === "number" ? q2.marks : baseQ.marks,
              hasSubQuestions: q2.hasSubQuestions ?? baseQ.hasSubQuestions,
              subQuestions: Array.isArray(q2.subQuestions) && q2.subQuestions.length > 0 ? q2.subQuestions : baseQ.subQuestions,
            };
          })
        : matched.questions;

    return {
      ...basePart,
      // Prefer base counts/totals (from paper-config), but fall back if missing.
      totalMarks: basePart.totalMarks || matched.totalMarks,
      mainQuestionsCount: basePart.mainQuestionsCount || matched.mainQuestionsCount,
      requiredQuestionsCount: basePart.requiredQuestionsCount || matched.requiredQuestionsCount,
      questions: mergedQuestions,
    };
  });
}

export async function getPaperConfigFromOCR(params: {
  chatSessionId: string;
}): Promise<PaperPart[]> {
  const { chatSessionId } = params;
  const payload = await apiFetch<any>(
    `${API_BASE_URL}/api/v1/evaluation/sessions/${encodeURIComponent(chatSessionId)}/paper-config`,
    { method: "GET" }
  );
  return normalizePaperConfigPayload(payload);
}

export async function getPaperQuestionStructure(params: {
  chatSessionId: string;
  paperConfigParts?: PaperPart[];
}): Promise<PaperPart[]> {
  const { chatSessionId, paperConfigParts } = params;
  const payload = await apiFetch<any>(
    `${API_BASE_URL}/api/v1/evaluation/sessions/${encodeURIComponent(chatSessionId)}/questions`,
    { method: "GET" }
  );

  // Your backend currently returns a flat list of questions.
  if (looksLikeFlatQuestionsArray(payload)) {
    const flat = normalizeFlatQuestions(payload);
    if (paperConfigParts && paperConfigParts.length > 0) {
      return splitFlatQuestionsIntoParts({
        paperConfigParts,
        flatQuestions: flat,
      });
    }

    // Fallback: one part containing all questions.
    return [
      {
        id: "questions",
        name: "Questions",
        totalMarks: flat.reduce((sum, q) => sum + (q.marks || 0), 0),
        mainQuestionsCount: flat.length,
        requiredQuestionsCount: 0,
        questions: flat,
      },
    ];
  }

  // Backward/alternative shape support (already grouped into parts)
  return normalizePaperQuestionsPayload(payload);
}

export async function confirmPaperConfig(params: {
  chatSessionId: string;
}): Promise<void> {
  const { chatSessionId } = params;
  await apiFetch<void>(
    `${API_BASE_URL}/api/v1/evaluation/sessions/${encodeURIComponent(chatSessionId)}/paper-config/confirm`,
    { method: "POST", body: JSON.stringify({}) }
  );
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
