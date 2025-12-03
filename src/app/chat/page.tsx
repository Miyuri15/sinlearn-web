"use client";

import ChatLanguageToggle from "@/components/language/ChatLanguageToggle";
import RubricSidebar from "@/components/chat/RubricSidebar"; // Updated import
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import InputBar from "./components/InputBar";
import RecordBar from "./components/RecordBar";
import EvaluationCard from "./components/EvaluationCard";
import ChatThemeToggle from "./components/ChatThemeToggle";
import EvaluationInputs from "./components/EvaluationInputs";
import Sidebar from "@/components/sidebar/Sidebar";

export default function Chat() {
  const { t } = useTranslation("chat");

  // STATES
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"learning" | "evaluation">("learning");
  const [messages, setMessages] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [responseLevel, setResponseLevel] = useState("Grades 9–11");

  // Evaluation inputs state
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

  // --- HARDCODED RESPONSES ---
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

  const handleRubricSelect = (rubricId: string) => {
    console.log("Selected rubric:", rubricId);
    // You can implement rubric selection logic here
    // For example: setSelectedRubric(rubricId);
  };

  const handleRubricUpload = () => {
    console.log("Upload rubric");
    // Implement file upload logic here
  };

  return (
    <main className="flex min-h-screen bg-gray-100 dark:bg-[#0C0C0C] text-gray-900 dark:text-gray-200">
      {/* LEFT SIDEBAR — PUSHES LAYOUT LIKE CHATGPT */}
      <div
        className={`transition-all duration-300 border-r dark:border-[#2a2a2a]
        bg-white dark:bg-[#111111]
        ${isSidebarOpen ? "w-64" : "w-16"}`}
      >
        {isSidebarOpen ? (
          <Sidebar
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
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        ) : (
          <div className="p-4">
            <Menu
              onClick={() => setIsSidebarOpen(true)}
              className="w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 h-screen">
        {/* TOP BAR */}
        <div className="flex items-center justify-between bg-white dark:bg-[#111111] p-4 border-b border-gray-200 dark:border-[#2a2a2a]">
          {/* MODE TOGGLE */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode("learning")}
              className={`px-4 py-2 rounded-lg font-medium border ${
                mode === "learning"
                  ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-[#1E3A8A]/40 dark:text-blue-200 dark:border-blue-900"
                  : "bg-gray-100 text-gray-700 dark:bg-[#222] dark:text-gray-300 dark:border-[#333]"
              }`}
            >
              {t("learning_mode")}
            </button>

            <button
              onClick={() => setMode("evaluation")}
              className={`px-4 py-2 rounded-lg font-medium border ${
                mode === "evaluation"
                  ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-[#1E3A8A]/40 dark:text-blue-200 dark:border-blue-900"
                  : "bg-gray-100 text-gray-700 dark:bg-[#222] dark:text-gray-300 dark:border-[#333]"
              }`}
            >
              {t("evaluation_mode")}
            </button>
          </div>

          {/* RIGHT TOOLS */}
          <div className="flex items-center gap-4">
            <ChatThemeToggle />
            <ChatLanguageToggle />

            <button
              onClick={() => setIsRubricOpen(true)}
              className="px-4 py-2 rounded-lg bg-white border font-medium text-gray-700 dark:bg-[#222] dark:border-[#333] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Rubric
            </button>

            <button className="px-4 py-2 rounded-lg bg-white border font-medium text-gray-700 dark:bg-[#222] dark:border-[#333] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Syllabus
            </button>

            <button className="w-9 h-9 flex items-center justify-center border rounded-lg bg-white text-gray-700 dark:bg-[#222] dark:border-[#333] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              +
            </button>
          </div>
        </div>

        {/* MESSAGE AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100 dark:bg-[#0C0C0C]">
          {/* Empty State */}
          {!messages.length && (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {t("start_conversation")}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("start_conversation_sub")}
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i}>
              {m.role === "user" && (
                <div className="p-3 rounded-lg max-w-xl ml-auto bg-blue-100 dark:bg-[#1E3A8A] text-blue-900 dark:text-blue-100">
                  {typeof m.content === "string" ? (
                    m.content
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(m.content, null, 2)}
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
          {mode === "evaluation" ? (
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
          ) : (
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

      {/* RUBRIC SIDEBAR */}
      <RubricSidebar
        isOpen={isRubricOpen}
        loading={loading}
        onClose={() => setIsRubricOpen(false)}
        onSelectRubric={handleRubricSelect}
        onUpload={handleRubricUpload}
      />
    </main>
  );
}
