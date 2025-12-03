"use client";

import ChatLanguageToggle from "@/components/language/ChatLanguageToggle";
import MarkingRubic from "./components/MarkingRubic";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import InputBar from "./components/InputBar";
import RecordBar from "./components/RecordBar";
import EvaluationCard from "./components/EvaluationCard";
import ChatThemeToggle from "./components/ChatThemeToggle";
import EvaluationInputs from "./components/EvaluationInputs";

export default function Chat() {
  const { t } = useTranslation("chat");
  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"learning" | "evaluation">("learning");
  const [messages, setMessages] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [responseLevel, setResponseLevel] = useState("Grades 9–11");

  // Evaluation inputs state (required by EvaluationInputs)
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [mainQuestions, setMainQuestions] = useState<number>(0);
  const [requiredQuestions, setRequiredQuestions] = useState<number>(0);
  const [subQuestions, setSubQuestions] = useState<number>(0);

  // --- INPUT HANDLERS ---
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

  // --- HARDCODED LEARNING MODE RESPONSE ---
  const mockLearningReply =
    "Good job! When x = 5, the expression 3x² - 2x + 4 becomes:\n3(25) - 10 + 4 = 69.";

  // --- HARDCODED EVALUATION REPORT ---
  const mockEvaluation = {
    grade: "B+",
    coverage: 76,
    accuracy: 85,
    clarity: 72,
    strengths: ["Correct substitution", "Steps shown clearly"],
    weaknesses: ["Could improve explanation clarity"],
    missing: ["Final conclusion missing"],
    feedback:
      "Your answer is mostly correct. However, adding a final conclusion would improve clarity.",
  };

  // --- SEND BUTTON HANDLER ---
  const handleSend = () => {
    if (mode === "learning") {
      if (!message.trim()) return;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: mockLearningReply },
      ]);

      setMessage("");
      return;
    }

    // Evaluation mode
    const evaluationPayload = {
      totalMarks,
      mainQuestions,
      requiredQuestions,
      subQuestions,
    };

    setMessages((prev) => [
      ...prev,
      { role: "user", content: evaluationPayload },
      { role: "evaluation", content: mockEvaluation },
    ]);
    setMessage("");
  };

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <main className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-[#0C0C0C] dark:text-gray-200 relative overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-16 bg-white border-r border-gray-200 dark:bg-[#111111] dark:border-[#2a2a2a] flex items-start justify-center p-4">
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer" />
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 min-h-screen h-screen justify-between">
        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-white dark:bg-[#111111] p-4 border-b border-gray-200 dark:border-[#2a2a2a]">
          {/* MODE TOGGLE */}
          <div className="flex items-center">
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
                {t("learning_mode")}
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
                {t("evaluation_mode")}
              </button>
            </div>
          </div>

          {/* RIGHT OPTIONS */}
          <div className="flex items-center gap-4">
            <ChatThemeToggle />
            <ChatLanguageToggle />

            <button
              onClick={() => setIsRubricOpen(true)}
              className="px-4 py-2 rounded-lg bg-white border font-medium text-gray-700 dark:bg-[#222] dark:border-[#333] dark:text-gray-200"
            >
              Rubric
            </button>

            <button className="px-4 py-2 rounded-lg bg-white border font-medium text-gray-700 dark:bg-[#222] dark:border-[#333] dark:text-gray-200">
              Syllabus
            </button>

            <button className="w-9 h-9 flex items-center justify-center border rounded-lg bg-white text-gray-700 dark:bg-[#222] dark:border-[#333] dark:text-gray-200">
              +
            </button>
          </div>
        </div>

        {/* MESSAGE AREA */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 flex flex-col bg-gray-100 dark:bg-[#0C0C0C]">
          {/* CENTER CONTENT (only show when no messages) */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                  {t("start_conversation")}
                </h2>
                <p className="text-gray-500 mt-2 dark:text-gray-400">
                  {t("start_conversation_sub")}
                </p>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i}>
              {m.role === "user" && (
                <div className="p-3 rounded-lg max-w-xl ml-auto break-all bg-blue-100 text-blue-900 dark:bg-[#1E3A8A] dark:text-blue-100">
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
                <div className="p-4 rounded-lg shadow max-w-xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1F2937] text-gray-900 dark:text-gray-200">
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
                <label className="text-sm text-gray-600 dark:text-gray-300 font-medium mr-2">
                  {t("response_level")}:
                </label>

                <select
                  value={responseLevel}
                  onChange={(e) => setResponseLevel(e.target.value)}
                  className="border rounded-lg px-3 py-1 text-sm bg-white text-gray-700 dark:bg-[#1A1A1A] dark:text-gray-200 dark:border-[#2a2a2a] dark:focus:ring-indigo-500"
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
        className={`fixed right-0 top-0 h-full transition-transform duration-300 
        ${isRubricOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <MarkingRubic
          loading={loading}
          onClose={() => setIsRubricOpen(false)}
          onSelectRubric={(id) => console.log("Selected:", id)}
          onUpload={() => console.log("Upload pressed")}
        />
      </div>
    </main>
  );
}
