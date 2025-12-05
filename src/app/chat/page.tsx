"use client";

import MarkingRubic from "./components/MarkingRubic";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import InputBar from "./components/InputBar";
import EvaluationCard from "./components/EvaluationCard";
import EvaluationInputs from "./components/EvaluationInputs";
import Sidebar from "@/components/sidebar/Sidebar";
import RubricSidebar from "@/components/chat/RubricSidebar";
import NumberInput from "@/components/ui/NumberInput";
import FilePreviewCard from "@/components/chat/FilePreviewCard";
import SyllabusPanelpage from "./components/SyllabusPanel";
import QuestionsPanelpage from "./components/QuestionsPanelpage";
import Header from "../../components/header/Header";
import RecordBar from "@/components/chat/RecordBar";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"learning" | "evaluation">("learning");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [responseLevel, setResponseLevel] = useState("Grades 9–11");

  // Evaluation inputs state
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [mainQuestions, setMainQuestions] = useState<number>(0);
  const [requiredQuestions, setRequiredQuestions] = useState<number>(0);
  const [subQuestions, setSubQuestions] = useState<number>(0);

  const [subQuestionMarks, setSubQuestionMarks] = useState<number[]>([]);
  const [isSubMarksModalOpen, setIsSubMarksModalOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
          content: {
            totalMarks,
            mainQuestions,
            requiredQuestions,
            subQuestions,
            subQuestionMarks,
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

  const handleRubricSelect = (rubricId: string) => {
    console.log("Selected rubric:", rubricId);
    // You can implement rubric selection logic here
    // For example: setSelectedRubric(rubricId);
  };

  const handleRubricUpload = () => {
    console.log("Upload rubric");
    // Implement file upload logic here
  };

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

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);

    // You can show file as a user message:
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: `📎 Uploaded file: ${file.name}`,
        file,
      },
    ]);
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

        <div className="flex flex-col flex-1 space-y-4 overflow-y-auto p-6 bg-gray-100 dark:bg-[#0C0C0C]">
          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i}>
              {m.role === "user" && (
                <div className="ml-auto max-w-xs sm:max-w-sm">
                  {/* FILE MESSAGE */}
                  {m.file ? (
                    <FilePreviewCard file={m.file} />
                  ) : (
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-[#1E3A8A] text-blue-900 dark:text-blue-100 break-words">
                      {/* EVALUATION OBJECT */}
                      {typeof m.content === "object" ? (
                        <pre className="whitespace-pre-wrap text-sm">
                          {`Total Marks: ${m.content.totalMarks}
Main Questions: ${m.content.mainQuestions}
Required Questions: ${m.content.requiredQuestions}
Sub Questions: ${m.content.subQuestions}`}
                          {m.content.subQuestionMarks &&
                            m.content.subQuestionMarks.length > 0 && (
                              <>
                                {`\nSub Question Marks: \n`}
                                {m.content.subQuestionMarks.map(
                                  (mark: number, idx: number) =>
                                    `  ${String.fromCharCode(
                                      97 + idx
                                    )}) ${mark}`
                                )}
                              </>
                            )}
                        </pre>
                      ) : (
                        m.content
                      )}
                    </div>
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
              onUpload={handleFileUpload}
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
                onUpload={handleFileUpload}
              />
            </>
          )}
        </div>
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

      {/* RUBRIC SIDEBAR */}
      <RubricSidebar
        isOpen={isRubricOpen}
        loading={loading}
        onClose={() => setIsRubricOpen(false)}
        onSelectRubric={handleRubricSelect}
        onUpload={handleRubricUpload}
      />
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