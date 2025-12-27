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
import {
  postMessage,
  listChatSessions,
  listSessionMessages,
} from "@/lib/api/chat";
import { formatDistanceToNow } from "date-fns";

const RIGHT_PANEL_WIDTH_CLASS = "w-[85vw] md:w-[400px]";
const RIGHT_PANEL_MARGIN_CLASS = "md:mr-[400px]";

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
  // ✅ ADD THIS: active server session id for the current chat
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // STATES
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [chats, setChats] = useState<SidebarChatItem[]>([]);

  type SidebarChatItem = {
    id: string;
    title: string;
    type: "learning" | "evaluation";
    time: string;
  };

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
  const [evaluationUploadedFilesCount, setEvaluationUploadedFilesCount] =
    useState(0);

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

    // Reset file count when switching to evaluation mode
    if (m === "evaluation") {
      setEvaluationUploadedFilesCount(0);
    }

    try {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("type", m);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    } catch {
      router.replace(`${pathname}?type=${m}`, { scroll: false });
    }
  };

  // ✅ LOAD MESSAGES WHEN A SESSION IS OPENED
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;
      if (chatId.startsWith("local-") || chatId.startsWith("new-")) return;

      try {
        const messages = await listSessionMessages(chatId);

        // ✅ SORT BY created_at (oldest → newest)
        const sorted = messages.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        if (mode === "learning") {
          setLearningMessages(sorted);
        } else {
          setEvaluationMessages(sorted);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    loadMessages();
  }, [chatId, mode]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const sessions = await listChatSessions();

        const mapped = sessions.map((s) => ({
          id: s.id,
          title: s.title || "Untitled Chat",
          type: s.mode,
          time: formatDistanceToNow(new Date(s.updated_at || s.created_at), {
            addSuffix: true,
          }),
        }));

        setChats(mapped);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    // ✅ If URL contains a real UUID chatId, use it
    if (chatId && !chatId.startsWith("local-") && !chatId.startsWith("new-")) {
      setActiveSessionId(chatId);
    } else {
      setActiveSessionId(null);
    }
  }, [chatId]);

  const handleSend = () => {
    const run = async () => {
      if (mode === "learning" && !message.trim()) return;

      /**
       * CHANGE 1️⃣
       * We no longer treat "existing chat" differently.
       * Backend is ALWAYS the source of truth.
       */
      setCreating(true);

      try {
        /**
         * CHANGE 2️⃣
         * Optimistically render the user's message
         * so UI updates instantly.
         */
        if (mode === "learning") {
          setLearningMessages((prev) => [
            ...prev,
            { role: "user", content: message },
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
          ]);
        }

        /**
         * CHANGE 3️⃣
         * Build backend payload ONLY for message creation.
         * Session creation is backend responsibility.
         */
        let payload: any;

        if (mode === "learning") {
          payload = {
            content: message,
            modality: "text",
            grade_level: responseLevel
              .toLowerCase()
              .replace(/[–—]/g, "_")
              .replace("grades ", "grade_"),
          };
        } else {
          payload = {
            content: {
              totalMarks,
              mainQuestions,
              requiredQuestions,
              subQuestions,
              subQuestionMarks,
            },
            modality: "text",
          };
        }

        /**
         * CHANGE 4️⃣
         * ALWAYS call backend.
         * If chatId is undefined / local-xxx → backend creates session.
         */
        const resp = await postMessage(activeSessionId ?? undefined, payload);

        /**
         * CHANGE 5️⃣
         * Extract session id safely from backend response.
         */
        const newSessionId =
          resp?.session_id || resp?.session?.id || resp?.chat_id || resp?.id;

        if (newSessionId) {
          setActiveSessionId(newSessionId);

          if (chatId?.startsWith("local-")) {
            router.replace(`/chat/${newSessionId}?type=${mode}`);
          }
        }

        /**
         * CHANGE 7️⃣
         * Append assistant reply ONLY if backend returns it.
         * (No mocked replies anymore)
         */
        if (resp?.assistant_message) {
          if (mode === "learning") {
            setLearningMessages((prev) => [...prev, resp.assistant_message]);
          } else {
            setEvaluationMessages((prev) => [...prev, resp.assistant_message]);
          }
        }
      } catch (error) {
        console.error("Failed to send message", error);
        alert("Failed to send message. Please try again.");
      } finally {
        setCreating(false);
        setMessage("");
      }
    };

    void run();
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
    if (mode === "evaluation") {
      // Check if adding these files would exceed the 10-file limit
      const remainingSlots = 10 - evaluationUploadedFilesCount;

      if (remainingSlots <= 0) {
        alert(
          "You have already uploaded the maximum of 10 files for this evaluation chat."
        );
        return;
      }

      // Only take files that fit within the limit
      const filesToUpload = files.slice(0, remainingSlots);

      if (filesToUpload.length < files.length) {
        alert(
          `You can only upload ${remainingSlots} more file(s). Only the first ${remainingSlots} file(s) will be uploaded.`
        );
      }

      setSelectedFiles(filesToUpload);
      setEvaluationUploadedFilesCount((prev) => prev + filesToUpload.length);

      setEvaluationMessages((prev) => [
        ...prev,
        ...filesToUpload.map((file) => ({
          role: "user" as const,
          content: `📎 Uploaded file: ${file.name}`,
          file,
        })),
      ]);
    } else {
      // Learning mode - no limit
      setSelectedFiles(files);

      setLearningMessages((prev) => [
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
      // Reset file count when loading a new chat
      setEvaluationUploadedFilesCount(0);
    }
  }, [chatId]);

  // Reset file count when evaluation messages are cleared
  useEffect(() => {
    if (mode === "evaluation" && evaluationMessages.length === 0) {
      setEvaluationUploadedFilesCount(0);
    }
  }, [mode, evaluationMessages.length]);

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

  const handleNewChat = async (mode: "learning" | "evaluation") => {
    if (creating) return;
    // Don't create server session here. Open a local temporary chat UI.
    const tempId = `local-${Date.now()}`;
    try {
      router.push(`/chat/${tempId}?type=${mode}`);
    } catch (error) {
      console.error("Failed to open new chat UI", error);
      alert("Failed to open a new chat. Please try again.");
    }
  };

  const handleEditChat = (chat: SidebarChatItem) => {
    const nextTitle = prompt("Edit chat title", chat.title)?.trim();

    if (!nextTitle) return;

    setChats((prev) =>
      prev.map((item) =>
        item.id === chat.id ? { ...item, title: nextTitle } : item
      )
    );
  };

  const handleDeleteChat = (chat: SidebarChatItem) => {
    const confirmed = confirm(`Delete "${chat.title}"?`);

    if (!confirmed) return;

    setChats((prev) => prev.filter((item) => item.id !== chat.id));

    if (chatId === chat.id) {
      router.push("/chat");
    }
  };

  return (
    <main className="flex h-dvh bg-gray-100 dark:bg-[#0C0C0C] text-gray-900 dark:text-gray-200">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        onNewLearningChat={() => handleNewChat("learning")}
        onNewEvaluationChat={() => handleNewChat("evaluation")}
        onEditChat={handleEditChat}
        onDeleteChat={handleDeleteChat}
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
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
              uploadedFilesCount={evaluationUploadedFilesCount}
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
                  <option value="grade_6_8">Grades 6–8</option>
                  <option value="grade_9_11">Grades 9–11</option>
                  <option value="grade_12_13">Grades 12–13</option>
                  <option value="university">University Level</option>
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
