/**
 * Chat models and helpers
 * Centralized types for chat messages and chat objects used across the app.
 */

export type Role = "user" | "assistant" | "evaluation";

export type SafetySummary = {
  overall_severity: "low" | "medium" | "high";
  confidence_score: number;
  reliability: "fully_supported" | "partially_supported" | "likely_unsupported";
};

// Lightweight file representation for messages that include files
export type FileMeta = {
  name: string;
  size?: number;
  type?: string;
  url?: string; // optional preview or storage URL
  resource_id?: string;
};

export interface SubQuestion {
  id: string;
  label: string;
  marks: number;
}

export interface Question {
  id: string;
  label: string;
  marks: number;
  hasSubQuestions: boolean;
  subQuestions: SubQuestion[];
}

export interface PaperPart {
  id: string;
  name: string;
  totalMarks: number;
  mainQuestionsCount: number;
  requiredQuestionsCount?: number;
  questions: Question[];
}

export type TextMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  file?: FileMeta | File;
  timestamp?: string;
  grade_level?: string;
  parent_msg_id?: string;
  safety_summary?: SafetySummary;
};

export type EvaluationInputContent = {
  totalMarks?: number;
  mainQuestions?: number;
  requiredQuestions?: number;
  subQuestions?: number;
  subQuestionMarks?: number[] | number[][];
  paperConfig?: PaperPart[];
};

export type EvaluationInputMessage = {
  id?: string;
  role: "user";
  content: EvaluationInputContent;
  timestamp?: string;
  safety_summary?: SafetySummary;
};

export type EvaluationResultContent = {
  grade: string;
  coverage: number; // percent 0-100
  accuracy: number; // percent 0-100
  clarity: number; // percent 0-100
  strengths: string[];
  weaknesses: string[];
  missing: string[];
  feedback: string;
};

export type EvaluationResultMessage = {
  id?: string;
  role: "evaluation";
  content: EvaluationResultContent;
  timestamp?: string;
  safety_summary?: SafetySummary;
};

export type ChatMessage =
  | TextMessage
  | EvaluationInputMessage
  | EvaluationResultMessage;

export type ChatType = "learning" | "evaluation";

export type Chat = {
  id: string;
  title?: string;
  type: ChatType;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  messages: ChatMessage[];
  metadata?: Record<string, any>;
};

// Helpers
export function createEmptyChat({
  id,
  title,
  type = "learning",
}: {
  id: string;
  title?: string;
  type?: ChatType;
}): Chat {
  const now = new Date().toISOString();
  return {
    id,
    title,
    type,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function addMessage(chat: Chat, message: ChatMessage): Chat {
  const next: Chat = {
    ...chat,
    messages: [...chat.messages, message],
    updatedAt: new Date().toISOString(),
  };
  return next;
}

export function isEvaluationResultMessage(
  m: ChatMessage
): m is EvaluationResultMessage {
  return (m as EvaluationResultMessage).role === "evaluation";
}

export function isEvaluationInputMessage(
  m: ChatMessage
): m is EvaluationInputMessage {
  // evaluation input messages are sent by user but carry structured content
  return (
    (m as EvaluationInputMessage).role === "user" &&
    typeof (m as any).content === "object" &&
    "totalMarks" in (m as any).content
  );
}

export function isTextMessage(m: ChatMessage): m is TextMessage {
  return (
    (m as TextMessage).role === "user" ||
    (m as TextMessage).role === "assistant"
  );
}
