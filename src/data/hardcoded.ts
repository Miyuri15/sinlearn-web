import type { ChatMessage } from "@/lib/models/chat";

export const HARD_CODED_CHATS: Record<string, ChatMessage[]> = {
  "1": [
    { role: "user", content: "Hi, can you explain solar energy?" },
    { role: "assistant", content: "Solar energy is produced by the sun…" },
  ],

  "2": [
    {
      role: "user",
      content: {
        totalMarks: 50,
        mainQuestions: 5,
        requiredQuestions: 3,
        subQuestions: 2,
        subQuestionMarks: [5, 3],
      },
    },
    {
      role: "evaluation",
      content: {
        grade: "A",
        coverage: 88,
        accuracy: 90,
        clarity: 82,
        strengths: ["Good structure", "Accurate marking"],
        weaknesses: [],
        missing: [],
        feedback: "Great job!",
      },
    },
  ],

  "solar-energy": [
    { role: "user", content: "Explain solar panels." },
    {
      role: "assistant",
      content: "Solar panels convert sunlight into electricity…",
    },
  ],
};
