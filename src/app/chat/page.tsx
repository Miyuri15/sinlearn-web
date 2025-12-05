"use client";

import MarkingRubic from "./components/MarkingRubic";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import InputBar from "./components/InputBar";
import EvaluationCard from "./components/EvaluationCard";
import EvaluationInputs from "./components/EvaluationInputs";
import Sidebar from "@/components/sidebar/Sidebar";
import SyllabusPanelpage from "./components/SyllabusPanel";
import QuestionsPanelpage from "./components/QuestionsPanelpage";
import Header from "../../components/header/Header";

type TextMessage = {
  role: "user" | "assistant";
  content: string;
};

type EvaluationInputContent = {
  totalMarks: number;
  mainQuestions: number;
  requiredQuestions: number;
  subQuestions: number;
};

type EvaluationInputMessage = {
  role: "user";
  content: EvaluationInputContent;
};

type EvaluationResultContent = {
  grade: string;
  coverage: number;
  accuracy: number;
  clarity: number;
  strengths: string[];
  weaknesses: string[];
  missing: string[];
  feedback: string;
};

type EvaluationResultMessage = {
  role: "evaluation";
  content: EvaluationResultContent;
};

type ChatMessage = TextMessage | EvaluationInputMessage | EvaluationResultMessage;

const RIGHT_PANEL_WIDTH_CLASS = "w-[400px]";
const RIGHT_PANEL_MARGIN_CLASS = "mr-[400px]";

export default function Chat() {
  const { t } = useTranslation("chat");

  // STATES
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"learning" | "evaluation">("learning");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [responseLevel, setResponseLevel] = useState("Grades 9–11");

  // Evaluation inputs
  const [totalMarks, setTotalMarks] = useState(0);
  const [mainQuestions, setMainQuestions] = useState(0);
  const [requiredQuestions, setRequiredQuestions] = useState(0);
  const [subQuestions, setSubQuestions] = useState(0);

  const mockLearningReply =
    "Good job! When x = 5, the expression 3x² - 2x + 4 becomes:\n3(25) - 10 + 4 = 69.";

  const mockEvaluation: EvaluationResultContent = {
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
          content: { totalMarks, mainQuestions, requiredQuestions, subQuestions },
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
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Toggles for right panels
  const toggleRubric = () => {
    setIsRubricOpen((prev) => !prev);
    setIsSyllabusOpen(false);
    setIsQuestionsOpen(false);
  };
  const toggleSyllabus = () => {
    setIsSyllabusOpen((prev) => !prev);
    setIsRubricOpen(false);
    setIsQuestionsOpen(false);
  };
  const toggleQuestions = () => {
    setIsQuestionsOpen((prev) => !prev);
    setIsRubricOpen(false);
    setIsSyllabusOpen(false);
  };

  const isAnyRightPanelOpen = isRubricOpen || isSyllabusOpen || isQuestionsOpen;

  return (
    <main className="flex min-h-screen bg-gray-100 dark:bg-[#0C0C0C] text-gray-900 dark:text-gray-200">
      {/* LEFT SIDEBAR */}
      <div
        className={`transition-all duration-300 border-r dark:border-[#2a2a2a]
        bg-white dark:bg-[#111111]
        ${isSidebarOpen ? "w-64" : "w-16"}`}
      >
        {isSidebarOpen ? (
          <Sidebar
            chats={[
              { id: "1", title: "New Learning Chat", type: "learning", time: "1 minute ago" },
              { id: "2", title: "New Evaluation Chat", type: "evaluation", time: "12 minutes ago" },
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
      <div
        className={`flex flex-col flex-1 h-screen transition-[margin,width] duration-300 ${
          isAnyRightPanelOpen ? RIGHT_PANEL_MARGIN_CLASS : ""
        }`}
      >
        {/* HEADER COMPONENT */}
        <Header
          mode={mode}
          setMode={setMode}
          isRubricOpen={isRubricOpen}
          isSyllabusOpen={isSyllabusOpen}
          isQuestionsOpen={isQuestionsOpen}
          toggleRubric={toggleRubric}
          toggleSyllabus={toggleSyllabus}
          toggleQuestions={toggleQuestions}
        />

        {/* MESSAGE AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100 dark:bg-[#0C0C0C]">
          {!messages.length && (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <h2 className="text-xl font-semibold">{t("start_conversation")}</h2>
                <p className="text-gray-500 dark:text-gray-400">{t("start_conversation_sub")}</p>
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

      {/* RIGHT SLIDE SIDEBARS */}

      {/* RUBRIC PANEL */}
      <div
        className={`fixed right-0 top-0 h-full transition-transform duration-300 z-10 ${RIGHT_PANEL_WIDTH_CLASS} border-l dark:border-[#2a2a2a] bg-white dark:bg-[#111111] ${
          isRubricOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <MarkingRubic
          loading={loading}
          onClose={toggleRubric}
          onSelectRubric={() => {}}
          onUpload={() => {}}
        />
      </div>

      {/* SYLLABUS PANEL */}
      <div
        className={`fixed right-0 top-0 h-full transition-transform duration-300 z-10 ${RIGHT_PANEL_WIDTH_CLASS} border-l dark:border-[#2a2a2a] bg-white dark:bg-[#111111] ${
          isSyllabusOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <SyllabusPanelpage onClose={toggleSyllabus} />
      </div>

      {/* QUESTIONS PANEL */}
      <div
        className={`fixed right-0 top-0 h-full transition-transform duration-300 z-10 ${RIGHT_PANEL_WIDTH_CLASS} border-l dark:border-[#2a2a2a] bg-white dark:bg-[#111111] ${
          isQuestionsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <QuestionsPanelpage onClose={toggleQuestions} />
      </div>
    </main>
  );
}