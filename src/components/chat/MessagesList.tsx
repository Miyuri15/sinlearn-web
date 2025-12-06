import React from "react";
import type { ChatMessage } from "@/lib/models/chat";
import FilePreviewCard from "@/components/chat/FilePreviewCard";
import EvaluationCard from "@/components/chat/EvaluationCard";

export default function MessagesList({
  messages,
  mode,
  endRef,
}: Readonly<{
  messages: ChatMessage[];
  mode: "learning" | "evaluation";
  endRef?: React.RefObject<HTMLDivElement | null>;
}>) {
  const renderUserMessageContent = (m: ChatMessage) => {
    if ("file" in m && m.file) {
      if (m.file instanceof File) return <FilePreviewCard file={m.file} />;
      const fm = m.file as any;
      return (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {fm.name || fm.url || "Attachment"}
        </div>
      );
    }

    if (typeof m.content === "string") {
      return (
        <div className="p-3 rounded-lg bg-blue-100 dark:bg-[#1E3A8A] text-blue-900 dark:text-blue-100 wrap-break-word">
          {m.content}
        </div>
      );
    }

    return null;
  };

  const renderEvaluationUserMessageContent = (m: ChatMessage) => {
    if ("file" in m && m.file) {
      if (m.file instanceof File) return <FilePreviewCard file={m.file} />;
      const fm = m.file as any;
      return (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {fm.name || fm.url || "Attachment"}
        </div>
      );
    }

    if (
      typeof m.content === "object" &&
      m.content &&
      "totalMarks" in (m.content as any)
    ) {
      const c = m.content as any;
      return (
        <pre className="whitespace-pre-wrap text-sm">
          {`Total Marks: ${c.totalMarks}
Main Questions: ${c.mainQuestions}
Required Questions: ${c.requiredQuestions}
Sub Questions: ${c.subQuestions}`}
          {c.subQuestionMarks && c.subQuestionMarks.length > 0 && (
            <>
              {`\nSub Question Marks: \n`}
              {c.subQuestionMarks.map(
                (mark: number, idx: number) =>
                  `  ${String.fromCodePoint(97 + idx)}) ${mark}`
              )}
            </>
          )}
        </pre>
      );
    }

    return m.content as any;
  };

  return (
    <>
      {messages.map((m, i) => (
        <div key={m.id ?? `msg-${i}`}>
          {mode === "learning" ? (
            <>
              {m.role === "user" && (
                <div className="ml-auto max-w-xs sm:max-w-sm">
                  {renderUserMessageContent(m)}
                </div>
              )}

              {m.role === "assistant" && (
                <div className="p-4 rounded-lg max-w-xl bg-white dark:bg-[#0F172A] border dark:border-[#1F2937]">
                  {m.content}
                </div>
              )}
            </>
          ) : (
            <>
              {m.role === "user" && (
                <div className="ml-auto max-w-xs sm:max-w-sm">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-[#1E3A8A]/60 text-sm text-blue-900 dark:text-blue-100">
                    {renderEvaluationUserMessageContent(m)}
                  </div>
                </div>
              )}

              {m.role === "evaluation" && (
                <EvaluationCard data={m.content as any} />
              )}
            </>
          )}
        </div>
      ))}

      <div ref={endRef} />
    </>
  );
}
