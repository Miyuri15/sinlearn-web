"use client";

import ChatLanguageToggle from "@/components/language/ChatLanguageToggle";
import MarkingRubic from "./components/MarkingRubic";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import InputBar from "./components/InputBar";
import RecordBar from "./components/RecordBar";
import EvaluationCard from "./components/EvaluationCard";
import ChatThemeToggle from "./components/ChatThemeToggle";
import EvaluationInputs from "./components/EvaluationInputs";
import Sidebar from "@/components/sidebar/Sidebar";
import NumberInput from "@/components/ui/NumberInput";

export default function Chat() {
  const { t } = useTranslation("chat");

  // STATES
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"learning" | "evaluation">("learning");
  const [messages, setMessages] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [responseLevel, setResponseLevel] = useState("Grades 9–11");

  // Evaluation inputs
  const [totalMarks, setTotalMarks] = useState(0);
  const [mainQuestions, setMainQuestions] = useState(0);
  const [requiredQuestions, setRequiredQuestions] = useState(0);
  const [subQuestions, setSubQuestions] = useState(0);

  const [subQuestionMarks, setSubQuestionMarks] = useState<number[]>([]);
  const [isSubMarksModalOpen, setIsSubMarksModalOpen] = useState(false);

  const mockLearningReply =
    "Good job! When x = 5, the expression 3x² - 2x + 4 becomes:\n3(25) - 10 + 4 = 69.";

  const mockEvaluation = {
    grade: "B+",
    coverage: 76,
    accuracy: 85,
    clarity: 72,
    strengths: ["Correct substitution", "Steps shown clearly"],
    weaknesses: ["Could improve explanation clarity"],
    missing: ["Final conclusion missing"],
    feedback:
      "Your answer is mostly correct. Adding a final conclusion will improve clarity.",
  };

  const handleSend = () => {
    if (mode === "learning") {
      if (!message.trim()) return;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: mockLearningReply },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: {
            totalMarks,
            mainQuestions,
            requiredQuestions,
            subQuestions,
          },
        },
        { role: "evaluation", content: mockEvaluation },
      ]);
    }

    setMessage("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    if (value.trim() === "") {
      e.target.style.height = "auto";
      return;
    }
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setMessage(transcript);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setTranscript("");
  };

  // Reset chat when switching modes
  useEffect(() => {
    setMessages([]); // clear chat history
    setMessage(""); // clear input box
    setTranscript(""); // should clear voice transcript

    // Reset evaluation inputs
    setTotalMarks(0);
    setMainQuestions(0);
    setRequiredQuestions(0);
    setSubQuestions(0);
  }, [mode]);

  useEffect(() => {
    if (isRecording) {
      setTranscript("student asking about solar systems…");
    }
  }, [isRecording]);

  useEffect(() => {
    if (subQuestions > 0) {
      setSubQuestionMarks((prev) => {
        if (prev.length === subQuestions) return prev;
        const arr = new Array(subQuestions).fill(0);
        return arr;
      });
      setIsSubMarksModalOpen(true);
    } else {
      setIsSubMarksModalOpen(false);
      setSubQuestionMarks([]);
    }
  }, [subQuestions]);

  // handlers for modal inputs
  const handleSubMarkChange = (index: number, value: number) => {
    const num = Number(value);
    const next = [...subQuestionMarks];
    next[index] = isNaN(num) ? 0 : num;
    setSubQuestionMarks(next);
  };

  const handleSubMarksDone = () => {
    setIsSubMarksModalOpen(false);
  };

  const handleSubMarksCancel = () => {
    setIsSubMarksModalOpen(false);
    setSubQuestions(0);
    setSubQuestionMarks([]);
  };

  return (
    <main className="flex h-dvh bg-gray-100 dark:bg-[#0C0C0C] text-gray-900 dark:text-gray-200">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={[
          {
            id: "1",
            title: "New Learning Chat",
            type: "learning",
            time: "1 minute ago",
          },
          {
            id: "2",
            title: "New Evaluation Chat",
            type: "evaluation",
            time: "12 minutes ago",
          },
        ]}
      />
      {/* MAIN AREA */}
      <div className="flex flex-col flex-1">
        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-white dark:bg-[#111111] p-4 border-b border-gray-200 dark:border-[#2a2a2a]">
          {/* MODE TOGGLE */}
          <div className="hidden md:flex items-center">
            <div className="flex bg-blue-50 border border-gray-50 dark:border-[#2a2a2a] dark:bg-[#111] rounded-full p-1 shadow-sm">
              {/* LEARNING */}
              <button
                onClick={() => setMode("learning")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full transition font-medium ${
                  mode === "learning"
                    ? "bg-white dark:bg-[#222] shadow text-blue-700 dark:text-blue-200"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <span className="text-lg">📖</span>
                <span>{t("learning_mode")}</span>
              </button>

              {/* EVALUATION */}
              <button
                onClick={() => setMode("evaluation")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full transition font-medium ${
                  mode === "evaluation"
                    ? "bg-white dark:bg-[#222] shadow text-blue-700 dark:text-blue-200"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <span className="text-lg">📝</span>
                <span>{t("evaluation_mode")}</span>
              </button>
            </div>
          </div>

          {/* RIGHT TOOLS */}
          <div className="flex items-center gap-4">
            <ChatThemeToggle />
            <ChatLanguageToggle />

            <button
              onClick={() => setIsRubricOpen(true)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-[#222] border dark:border-[#333]"
            >
              Rubric
            </button>

            <button className="px-4 py-2 rounded-lg bg-white dark:bg-[#222] border dark:border-[#333]">
              Syllabus
            </button>

            <button className="w-9 h-9 flex items-center justify-center bg-white dark:bg-[#222] border dark:border-[#333] rounded-lg">
              +
            </button>
          </div>
        </div>

        {/* MESSAGE AREA */}
        {/* Empty State */}
        {!messages.length && (
          <div className="flex flex-1 flex-col overflow-y-auto p-6 bg-gray-100 dark:bg-[#0C0C0C]">
            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {t("start_conversation")}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("start_conversation_sub")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-4 overflow-y-auto p-6 bg-gray-100 dark:bg-[#0C0C0C]">
          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i}>
              {m.role === "user" && (
                <div className="p-3 rounded-lg max-w-xl ml-auto bg-blue-100 dark:bg-[#1E3A8A] text-blue-900 dark:text-blue-100">
                  {typeof m.content === "string" ? (
                    m.content
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm">
                      {`Total Marks: ${m.content.totalMarks}
Main Questions: ${m.content.mainQuestions}
Required Questions: ${m.content.requiredQuestions}
Sub Questions: ${m.content.subQuestions}
`}
                    </pre>
                  )}
                </div>
              )}

              {m.role === "assistant" && (
                <div className="p-4 rounded-lg max-w-xl bg-white dark:bg-[#0F172A] border dark:border-[#1F2937]">
                  {m.content}
                </div>
              )}

              {m.role === "evaluation" && <EvaluationCard data={m.content} />}
            </div>
          ))}

          <div ref={endRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-4 border-t border-gray-200 bg-white dark:bg-[#111111] dark:border-[#2a2a2a]">
          {mode === "evaluation" && (
            <EvaluationInputs
              totalMarks={totalMarks}
              setTotalMarks={setTotalMarks}
              mainQuestions={mainQuestions}
              setMainQuestions={setMainQuestions}
              requiredQuestions={requiredQuestions}
              setRequiredQuestions={setRequiredQuestions}
              subQuestions={subQuestions}
              setSubQuestions={setSubQuestions}
              onSend={handleSend}
            />
          )}
          {isRecording && (
            <RecordBar
              onCancelRecording={handleCancelRecording}
              onStopRecording={handleStopRecording}
            />
          )}
          {mode === "learning" && (
            <>
              <div className="mb-3">
                <label className="mr-2 text-sm">{t("response_level")}:</label>
                <select
                  value={responseLevel}
                  onChange={(e) => setResponseLevel(e.target.value)}
                  className="border rounded-lg px-3 py-1 bg-white dark:bg-[#1A1A1A]"
                >
                  <option>Grades 1–5</option>
                  <option>Grades 6–8</option>
                  <option>Grades 9–11</option>
                  <option>Grades 12–13</option>
                  <option>University Level</option>
                </select>
              </div>

              <InputBar
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                transcript={transcript}
                message={message}
                handleInputChange={handleInputChange}
                onSend={handleSend}
              />
            </>
          )}
        </div>
      </div>

      {/* RIGHT SLIDE SIDEBAR */}
      <div
        className={`fixed right-0 top-0 h-full transition-transform duration-300 ${
          isRubricOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <MarkingRubic
          loading={loading}
          onClose={() => setIsRubricOpen(false)}
          onSelectRubric={() => {}}
          onUpload={() => {}}
        />
      </div>

      {isSubMarksModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#111] rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Enter marks for sub-questions
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {Array.from({ length: subQuestions }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm">
                    Sub-question {String.fromCharCode(97 + idx)}){" "}
                    {/* a, b, c... */}
                  </span>
                  <NumberInput
                    value={subQuestionMarks[idx] ?? 0}
                    onChange={(v) => handleSubMarkChange(idx, v)}
                    min={0}
                    max={100}
                    className="w-24"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSubMarksCancel}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-[#333]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubMarksDone}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
