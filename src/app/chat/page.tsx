"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import InputBar from "@/components/chat/InputBar";
import EvaluationInputs from "@/components/chat/EvaluationInputs";
import EvaluationMarksModal from "@/components/chat/EvaluationMarksModal";
import Sidebar from "@/components/layout/Sidebar";
import RubricSidebar from "@/components/chat/RubricSidebar";
import SyllabusPanelpage from "@/components/chat/SyllabusPanel";
import QuestionsPanelpage from "@/components/chat/QuestionsPanelpage";
import Header from "@/components/header/Header";
import RecordBar from "@/components/chat/RecordBar";
import { ChatMessage, EvaluationResultContent } from "@/lib/models/chat";
import MessagesList from "@/components/chat/MessagesList";
import ChatAreaSkeleton from "@/components/chat/ChatAreaSkeleton";
import SubMarksModal from "@/components/chat/SubMarksModal";
import EmptyState from "@/components/chat/EmptyState";
import useChatInit from "@/hooks/useChatInit";

const RIGHT_PANEL_WIDTH_CLASS = "w-[400px]";
const RIGHT_PANEL_MARGIN_CLASS = "mr-[400px]";

interface ChatPageProps {
  chatId?: string;
  initialMessages?: ChatMessage[];
}

export default function ChatPage({
  chatId,
  initialMessages = [],
}: Readonly<ChatPageProps>) {
  const { t } = useTranslation("chat");

  const searchParams = useSearchParams();
  const typeParam = searchParams?.get("type") ?? undefined;

  // STATES
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");

  const {
    mode,
    setMode,
    learningMessages,
    setLearningMessages,
    evaluationMessages,
    setEvaluationMessages,
    isInitializing,
  } = useChatInit({
    chatId,
    typeParam,
    initialMessages,
  });

  const router = useRouter();
  const pathname = usePathname();
  const endRef = useRef<HTMLDivElement | null>(null);
  const [responseLevel, setResponseLevel] = useState("Grades 9–11");

  // Evaluation inputs state
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [mainQuestions, setMainQuestions] = useState<number>(0);
  const [requiredQuestions, setRequiredQuestions] = useState<number>(0);
  const [subQuestions, setSubQuestions] = useState<number>(0);

  const [subQuestionMarks, setSubQuestionMarks] = useState<number[][]>([]);
  const [isSubMarksModalOpen, setIsSubMarksModalOpen] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);

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

  const handleSetMode = (m: "learning" | "evaluation") => {
    setMode(m);

    try {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("type", m);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    } catch {
      router.replace(`${pathname}?type=${m}`, { scroll: false });
    }
  };

  const handleSend = () => {
    if (mode === "learning") {
      if (!message.trim()) return;

      setLearningMessages((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: mockLearningReply },
      ]);
    } else {
      setEvaluationMessages((prev) => [
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

    setTimeout(() => {
      const textarea = document.querySelector(
        "textarea.chat-input"
      ) as HTMLTextAreaElement;
      if (textarea) textarea.style.height = "auto";
    }, 0);

    setMessage("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [learningMessages, evaluationMessages]);

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

  const handleRubricSelect = (rubricId: string) => {
    console.log("Selected rubric:", rubricId);
    // You can implement rubric selection logic here
    // For example: setSelectedRubric(rubricId);
  };

  const handleRubricUpload = () => {
    console.log("Upload rubric");
    // Implement file upload logic here
  };

  // Auto-fill transcript simulation
  useEffect(() => {
    if (isRecording) {
      setTranscript("student asking about solar systems…");
    }
  }, [isRecording]);

  // Handle sub question modal logic
  useEffect(() => {
    if (subQuestions > 0) {
      setSubQuestionMarks((prev) => {
        if (prev.length === mainQuestions) return prev;
        // Initialize an array of arrays: [ [0], [0], ... ] for each main question
        return new Array(mainQuestions).fill(null).map(() => [0]);
      });
    } else {
      setSubQuestionMarks([]);
    }
  }, [mainQuestions, subQuestions]);

  const handleSubMarksChange = (marks: number[][]) => {
    setSubQuestionMarks(marks);
  };

  const handleSubMarksDone = () => {
    setIsSubMarksModalOpen(false);
  };

  const handleSubMarksCancel = () => {
    setIsSubMarksModalOpen(false);
    setSubQuestions(0);
    setSubQuestionMarks([]);
  };

  const handleFileUpload = (files: File[]) => {
    setSelectedFiles(files);

    if (mode === "learning") {
      setLearningMessages((prev) => [
        ...prev,
        ...files.map((file) => ({
          role: "user" as const,
          content: `📎 Uploaded file: ${file.name}`,
          file,
        })),
      ]);
    } else {
      setEvaluationMessages((prev) => [
        ...prev,
        ...files.map((file) => ({
          role: "user" as const,
          content: `📎 Uploaded file: ${file.name}`,
          file,
        })),
      ]);
    }
  };

  useEffect(() => {
    if (chatId) {
      console.log("Loaded chat:", chatId);
    }
  }, [chatId]);

  const renderMessageArea = () => {
    if (isInitializing) {
      return <ChatAreaSkeleton />;
    }

    if (mode === "learning") {
      return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100 dark:bg-[#0C0C0C]">
          {learningMessages.length === 0 ? (
            <EmptyState
              title={t("start_conversation")}
              subtitle={t("start_learning_conversation_sub")}
            />
          ) : (
            <MessagesList
              messages={learningMessages}
              mode="learning"
              endRef={endRef}
            />
          )}
        </div>
      );
    }

    // evaluation mode
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100 dark:bg-[#0C0C0C]">
        {evaluationMessages.length === 0 ? (
          <EmptyState
            title={t("start_conversation")}
            subtitle={t("start_evaluation_conversation_sub")}
          />
        ) : (
          <MessagesList
            messages={evaluationMessages}
            mode="evaluation"
            endRef={endRef}
          />
        )}
      </div>
    );
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
          setMode={handleSetMode}
          isRubricOpen={isRubricOpen}
          isSyllabusOpen={isSyllabusOpen}
          isQuestionsOpen={isQuestionsOpen}
          toggleRubric={toggleRubric}
          toggleSyllabus={toggleSyllabus}
          toggleQuestions={toggleQuestions}
        />

        {/* MESSAGE AREA */}
        {renderMessageArea()}

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
              onSend={handleSend}
              onUpload={handleFileUpload}
              onOpenMarks={() => setIsEvaluationModalOpen(true)}
            />
          )}

          <EvaluationMarksModal
            open={isEvaluationModalOpen}
            onClose={() => setIsEvaluationModalOpen(false)}
            totalMarks={totalMarks}
            setTotalMarks={setTotalMarks}
            mainQuestions={mainQuestions}
            setMainQuestions={setMainQuestions}
            requiredQuestions={requiredQuestions}
            setRequiredQuestions={setRequiredQuestions}
            onAllocateMarks={() => {
              // Existing logic for sub-questions
              setIsSubMarksModalOpen(true);
            }}
            onViewMarks={() => {
              // For now, toggle the sub marks modal to view
              setIsSubMarksModalOpen(true);
            }}
            onSubmit={() => {
              setIsEvaluationModalOpen(false);
              handleSend();
            }}
          />

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

      <SubMarksModal
        open={isSubMarksModalOpen}
        mainQuestions={mainQuestions}
        marks={subQuestionMarks}
        onChange={handleSubMarksChange}
        onDone={handleSubMarksDone}
        onCancel={handleSubMarksCancel}
      />

      {/* RUBRIC SIDEBAR */}
      <RubricSidebar
        isOpen={isRubricOpen}
        loading={loading}
        onClose={() => setIsRubricOpen(false)}
        onSelectRubric={handleRubricSelect}
        onUpload={handleRubricUpload}
      />

      {/* RIGHT SLIDE SIDEBARS */}
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
