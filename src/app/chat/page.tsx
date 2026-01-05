"use client";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import InputBar from "@/components/chat/InputBar";
import EvaluationInputs from "@/components/chat/EvaluationInputs";
import EvaluationMarksModal from "@/components/chat/EvaluationMarksModal";
import EvaluationStartScreen from "@/components/chat/EvaluationStartScreen";
import EvaluationProgressScreen from "@/components/chat/EvaluationProgressScreen";
import EvaluationResultsScreen, { generateMockResult } from "@/components/chat/EvaluationResultsScreen";
import EvaluationAnalyticsScreen from "@/components/chat/EvaluationAnalyticsScreen";
import EvaluationHistoryScreen, { EvaluationSession } from "@/components/chat/EvaluationHistoryScreen";
import Sidebar from "@/components/layout/Sidebar";
import RubricSidebar from "@/components/chat/RubricSidebar";
import SyllabusPanelpage from "@/components/chat/SyllabusPanel";
import QuestionsPanelpage from "@/components/chat/QuestionsPanelpage";
import Header from "@/components/header/Header";
import RecordBar from "@/components/chat/RecordBar";
import { ChatMessage, PaperPart } from "@/lib/models/chat";
import MessagesList from "@/components/chat/MessagesList";
import ChatAreaSkeleton from "@/components/chat/ChatAreaSkeleton";
import SubMarksModal from "@/components/chat/SubMarksModal";
import EmptyState from "@/components/chat/EmptyState";
import UpdatedToast from "@/components/ui/updatedtoast";
import EditModal from "@/components/ui/EditModal";
import DeleteModal from "@/components/ui/DeleteModal";
import useChatInit from "@/hooks/useChatInit";
import {
  postMessage,
  listChatSessions,
  listSessionMessages,
  updateChatSession,
  deleteChatSession,
  uploadResources,
  ResourceUploadResponse,
  postVoiceQA,
  generateMessageResponse,
} from "@/lib/api/chat";
import {
  processMessageAttachments,
  processResourcesBatch,
} from "@/lib/api/resource";
import { formatDistanceToNow } from "date-fns";
import { getSelectedChatType } from "@/lib/localStore";

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
  const chatType = getSelectedChatType() || "learning";
  // ✅ ADD THIS: active server session id for the current chat
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // STATES
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [chats, setChats] = useState<SidebarChatItem[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChat, setEditingChat] = useState<SidebarChatItem | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingChat, setDeletingChat] = useState<SidebarChatItem | null>(
    null
  );
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [pendingVoice, setPendingVoice] = useState<Blob | null>(null);
  const [isMessageGenerating, setIsMessageGenerating] = useState(false);
  const [isSyncingMessages, setIsSyncingMessages] = useState(false);
  
  // Evaluation specific states
  const [isEvaluationStarted, setIsEvaluationStarted] = useState(false);
  const [evaluationStatus, setEvaluationStatus] = useState<"setup" | "in_progress" | "results" | "analytics" | "history">("setup");
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationSession[]>([]);
  const [currentEvaluationResult, setCurrentEvaluationResult] = useState<any[] | undefined>(undefined);
  const [rubricSet, setRubricSet] = useState(false);
  const [syllabusSet, setSyllabusSet] = useState(false);
  const [syllabusCount, setSyllabusCount] = useState(0);
  const [questionsSet, setQuestionsSet] = useState(false);
  const [questionPaperName, setQuestionPaperName] = useState<string | undefined>(undefined);
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "completed" | "needs_reprocessing">("idle");
  const processingStatusRef = useRef(processingStatus);

  useEffect(() => {
    processingStatusRef.current = processingStatus;
  }, [processingStatus]);

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
    chatType: chatType,
    initialMessages,
  });

  const router = useRouter();
  const endRef = useRef<HTMLDivElement | null>(null);
  const [responseLevel, setResponseLevel] = useState("grade_9_11");

  // Evaluation inputs state
  const [paperConfig, setPaperConfig] = useState<PaperPart[]>([]);
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
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ LOAD MESSAGES WHEN A SESSION IS OPENED
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;
      if (chatId.startsWith("local-") || chatId.startsWith("new-")) return;

      setIsLoadingMessages(true);
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
          if (sorted.length > 0) {
            setIsEvaluationStarted(true);
          }
        }
      } catch {
        router.replace("/chat");
        setToastMessage("Failed to load chat messages. Please try again.");
        setToastType("error");
        setIsToastVisible(true);
      } finally {
        setTimeout(() => {
          setIsLoadingMessages(false);
        }, 500);
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

  const handleSend = (configOverride?: PaperPart[]) => {
    const run = async () => {
      if (mode === "learning" && !message.trim()) return;

      if (pendingVoice) {
        await handleVoiceSend(pendingVoice);
        setPendingVoice(null);
        return;
      }
      /**
       * CHANGE 1️⃣
       * We no longer treat "existing chat" differently.
       * Backend is ALWAYS the source of truth.
       */
      setCreating(true);

      let uploadedResources: ResourceUploadResponse[] = [];
      let pendingNavigateSessionId: string | null = null;

      // Upload pending files before sending the message so backend receives resource ids
      const filesToUpload = mode === "learning" ? pendingFiles : selectedFiles;
      if (filesToUpload.length > 0) {
        setIsUploading(true);
        try {
          uploadedResources = await uploadResources(filesToUpload);
        } catch (error) {
          console.error("Failed to upload files", error);
          let message = "Failed to upload files. Please try again.";
          if (error instanceof Error) {
            message = error.message;
          }
          setToastMessage(message);
          setToastType("error");
          setIsToastVisible(true);
          setCreating(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      try {
        /**
         * CHANGE 2️⃣
         * Optimistically render the user's message
         * so UI updates instantly.
         */
        if (mode === "learning") {
          setLearningMessages((prev) => [
            ...prev,
            {
              role: "user",
              content: message,
              grade_level: responseLevel,
              resource_ids: uploadedResources.map((r) => r.resource_id),
            },
          ]);
        } else {
          const evalContent = configOverride
            ? { paperConfig: configOverride }
            : paperConfig.length > 0
            ? { paperConfig }
            : {
                totalMarks,
                mainQuestions,
                requiredQuestions,
                subQuestions,
                subQuestionMarks,
              };

          // If we are starting evaluation, add the files to the message
          const fileMessages = selectedFiles.map((file) => ({
            role: "user" as const,
            content: `📎 Uploaded file: ${file.name}`,
            file,
          }));

          // If we haven't started yet, we need to show the files as messages now
          if (!isEvaluationStarted && fileMessages.length > 0) {
             setEvaluationMessages((prev) => [...prev, ...fileMessages]);
          }

          setEvaluationMessages((prev) => [
            ...prev,
            {
              role: "user",
              content: evalContent,
            },
          ]);
          
          setIsEvaluationStarted(true);
        }

        /**
         * CHANGE 3️⃣
         * Build backend payload ONLY for message creation.
         * Session creation is backend responsibility.
         */
        let payload: any;

        if (mode === "learning") {
          const resourceAttachments = uploadedResources.map((item, index) => ({
            resource_id: item.resource_id,
            display_name: pendingFiles[index]?.name ?? "Attachment",
            attachment_type: pendingFiles[index]?.type?.startsWith("image/")
              ? "image"
              : "file",
          }));

          payload = {
            content: message,
            modality: "text",
            grade_level: responseLevel,
            ...(resourceAttachments.length
              ? { attachments: resourceAttachments }
              : {}),
          };
        } else {
          const evalContent = configOverride
            ? { paperConfig: configOverride }
            : paperConfig.length > 0
            ? { paperConfig }
            : {
                totalMarks,
                mainQuestions,
                requiredQuestions,
                subQuestions,
                subQuestionMarks,
              };

          const resourceAttachments = uploadedResources.map((item, index) => ({
            resource_id: item.resource_id,
            display_name: selectedFiles[index]?.name ?? "Attachment",
            attachment_type: selectedFiles[index]?.type?.startsWith("image/")
              ? "image"
              : "file",
          }));

          payload = {
            content: evalContent,
            modality: "text",
            ...(resourceAttachments.length
              ? { attachments: resourceAttachments }
              : {}),
          };
        }
        /**
         * CHANGE 4️⃣
         * ALWAYS call backend.
         * If chatId is undefined / local-xxx → backend creates session.
         */
        const resp = await postMessage(activeSessionId ?? undefined, payload);

        // Extract identifiers from the backend response for follow-up actions
        const newSessionId =
          resp?.session_id || resp?.session?.id || resp?.chat_id || resp?.id;
        const createdMessageId =
          resp?.message_id || resp?.message?.id || resp?.id || null;

        if (newSessionId) {
          setActiveSessionId(newSessionId);

          if (chatId?.startsWith("local-")) {
            pendingNavigateSessionId = newSessionId;
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

        /**
         * NEW: process message attachments, then refresh to pick up the AI response
         * emitted by the backend after attachments are processed.
         */
        const sessionToRefresh = newSessionId ?? activeSessionId;

        if (createdMessageId) {
          setIsAutoProcessing(true);
          try {
            await processMessageAttachments(createdMessageId);
          } catch (err) {
            console.error("Failed to process attachments", err);
            setToastMessage(
              (err instanceof Error ? err.message : null) ||
                "Failed to process attachments."
            );
            setToastType("error");
            setIsToastVisible(true);
          } finally {
            setIsAutoProcessing(false);
          }
        }

        if (createdMessageId) {
          setIsMessageGenerating(true);
          try {
            const generated = await generateMessageResponse(createdMessageId);
            const generatedMessage = generated?.message;

            if (generatedMessage) {
              const messageToRender: ChatMessage = {
                id: generatedMessage.id,
                role: (generatedMessage.role ?? "assistant") as
                  | "user"
                  | "assistant",
                content: generatedMessage.content ?? "",
                grade_level: generatedMessage.grade_level,
                safety_summary: generatedMessage.safety_summary,
              };

              if (mode === "learning") {
                setLearningMessages((prev) => [...prev, messageToRender]);
              } else {
                setEvaluationMessages((prev) => [...prev, messageToRender]);
              }
            }
          } catch (err) {
            console.error("Failed to generate assistant reply", err);
            setToastMessage("Failed to generate assistant reply.");
            setToastType("error");
            setIsToastVisible(true);
          } finally {
            setIsMessageGenerating(false);
          }
        }

        if (sessionToRefresh) {
          setIsSyncingMessages(true);
          try {
            const messages = await listSessionMessages(sessionToRefresh);
            const sorted = messages.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );

            if (mode === "learning") {
              setLearningMessages(sorted);
            } else {
              setEvaluationMessages(sorted);
            }
          } catch (err) {
            console.error("Failed to refresh messages", err);
          } finally {
            setIsSyncingMessages(false);
          }
        }

        if (pendingNavigateSessionId) {
          router.replace(`/chat/${pendingNavigateSessionId}`);
        }
      } catch (error) {
        console.error("Failed to send message", error);
        setToastMessage("Failed to send message. Please try again.");
        setToastType("error");
        setIsToastVisible(true);
      } finally {
        setCreating(false);
        setMessage("");
        clearPendingFiles();
      }
    };

    void run();
  };

  const handleVoiceSend = async (audioBlob: Blob) => {
    try {
      setCreating(true);
      setIsAutoProcessing(true);

      let uploadedResources: ResourceUploadResponse[] = [];
      if (pendingFiles.length > 0) {
        uploadedResources = await uploadResources(pendingFiles);
      }

      if (uploadedResources.length > 0) {
        setIsAutoProcessing(true);
        try {
          await processResourcesBatch(
            uploadedResources.map((r) => r.resource_id)
          );
        } catch (err) {
          console.error("Failed to process resources batch", err);
          setToastMessage("Failed to process uploaded resources.");
          setToastType("error");
          setIsToastVisible(true);
          return;
        } finally {
          setIsAutoProcessing(false);
        }
      }

      const data = await postVoiceQA({
        audio: audioBlob,
        session_id: activeSessionId ?? "undefined",
        resource_ids: uploadedResources.map((r) => r.resource_id),
        top_k: 3,
      });

      // Sync session if voice-first
      if (data.session_id && !activeSessionId) {
        setActiveSessionId(data.session_id);
        router.replace(`/chat/${data.session_id}`);
      }

      setLearningMessages((prev) => [
        ...prev,
        {
          role: "user",
          modality: "voice",
          content: data.question,
          resource_ids: uploadedResources.map((r) => r.resource_id),
        },
        {
          role: "assistant",
          modality: "text",
          content: data.answer,
        },
      ]);
    } catch (error) {
      console.error(error);
      setToastMessage("Voice processing failed");
      setToastType("error");
      setIsToastVisible(true);
    } finally {
      setCreating(false);
      setIsAutoProcessing(false);
      clearPendingFiles();
    }
  };

  const handleStartEvaluationProcess = async () => {
    // 1. Set status to in_progress
    setEvaluationStatus("in_progress");
    setIsEvaluationStarted(true);

    // 2. Trigger endpoint (mock for now)
    try {
      // await api.startEvaluation(...)
      console.log("Starting evaluation process...");
    } catch (error) {
      console.error("Failed to start evaluation", error);
      setToastMessage("Failed to start evaluation");
      setToastType("error");
      setIsToastVisible(true);
    }
  };

  const handleUnifiedSend = (configOverride?: PaperPart[]) => {
    // 🎙️ Voice has priority
    if (pendingVoice) {
      handleVoiceSend(pendingVoice);
      setPendingVoice(null);
      return;
    }

    // ✍️ Otherwise, text
    handleSend(configOverride);
  };

  const handleRegenerateAssistant = async (messageId?: string) => {
    if (!messageId) {
      setToastMessage("Cannot regenerate this message right now.");
      setToastType("error");
      setIsToastVisible(true);
      return;
    }

    setIsMessageGenerating(true);

    try {
      const generated = await generateMessageResponse(messageId);
      const generatedMessage = generated?.message;

      if (generatedMessage) {
        const nextMessage: ChatMessage = {
          id: generatedMessage.id ?? messageId,
          role: (generatedMessage.role ?? "assistant") as "assistant" | "user",
          content: generatedMessage.content ?? "",
          grade_level: generatedMessage.grade_level,
          safety_summary: generatedMessage.safety_summary,
        };

        setLearningMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? nextMessage : msg))
        );
      }
    } catch (error) {
      console.error("Failed to regenerate assistant reply", error);
      setToastMessage("Failed to regenerate assistant reply.");
      setToastType("error");
      setIsToastVisible(true);
    } finally {
      setIsMessageGenerating(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    learningMessages,
    evaluationMessages,
    isAutoProcessing,
    isMessageGenerating,
  ]);

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
    setRubricSet(true);
    if (processingStatus === "completed") {
      setProcessingStatus("needs_reprocessing");
    }
  };

  const handleRubricUpload = () => {
    console.log("Upload rubric");
    setRubricSet(true);
    if (processingStatus === "completed") {
      setProcessingStatus("needs_reprocessing");
    }
  };

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
      if (processingStatus === "completed") {
        setProcessingStatus("needs_reprocessing");
      }
      // Check if adding these files would exceed the 10-file limit
      const remainingSlots = 10 - evaluationUploadedFilesCount;

      if (remainingSlots <= 0) {
        setToastMessage(
          "You have already uploaded the maximum of 10 files for this evaluation chat."
        );
        setToastType("error");
        setIsToastVisible(true);
        return;
      }

      // Only take files that fit within the limit
      const filesToUpload = files.slice(0, remainingSlots);

      if (filesToUpload.length < files.length) {
        setToastMessage(
          `You can only upload ${remainingSlots} more file(s). Only the first ${remainingSlots} file(s) will be uploaded.`
        );
        setToastType("error");
        setIsToastVisible(true);
      }

      if (!isEvaluationStarted) {
        setSelectedFiles((prev) => [...prev, ...filesToUpload]);
        setEvaluationUploadedFilesCount((prev) => prev + filesToUpload.length);
      } else {
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
      }
    }
  };

  const handleRemoveEvaluationFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setEvaluationUploadedFilesCount((prev) => prev - 1);
    if (processingStatus === "completed") {
      setProcessingStatus("needs_reprocessing");
    }
  };

  const handleReplaceEvaluationFile = (index: number, file: File) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });
    if (processingStatus === "completed") {
      setProcessingStatus("needs_reprocessing");
    }
  };

  const handleProcessEvaluation = async () => {
    setProcessingStatus("processing");
    
    // Simulate processing steps
    // In a real app, this would be connected to backend events or polling
    await new Promise(resolve => setTimeout(resolve, 1500)); // Answer sheets
    await new Promise(resolve => setTimeout(resolve, 1500)); // Question paper
    await new Promise(resolve => setTimeout(resolve, 1500)); // Syllabus
    
    setProcessingStatus("completed");
    
    // After processing is complete, we can enable the "Marks" button
    // The user will then click "Marks" to open the modal, and then "Send" to start the chat
  };

  // Handle adding files to pending queue in learning mode
  const handlePendingFilesAdd = (files: File[]) => {
    setPendingFiles((prev) => [...prev, ...files]);
  };

  // Handle removing a pending file
  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear pending files after sending
  const clearPendingFiles = () => {
    setPendingFiles([]);
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
    if (isInitializing || isLoadingMessages) {
      return <ChatAreaSkeleton />;
    }

    if (mode === "learning") {
      return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4 w-full max-w-[320px] min-[350]:max-w-[380] min-[425]:max-w-[425] sm:max-w-full bg-gray-100 dark:bg-[#0C0C0C] custom-scrollbar">
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
              isProcessing={isAutoProcessing}
              isMessageGenerating={isMessageGenerating}
              onRegenerateAssistant={handleRegenerateAssistant}
            />
          )}
        </div>
      );
    }

    // evaluation mode
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100 dark:bg-[#0C0C0C] custom-scrollbar">
        {evaluationStatus === "setup" && (
          <EvaluationStartScreen
            onOpenRubric={() => setIsRubricOpen(true)}
            onOpenSyllabus={() => setIsSyllabusOpen(true)}
            onOpenQuestions={() => setIsQuestionsOpen(true)}
            onOpenMarks={() => setIsEvaluationModalOpen(true)}
            onUploadAnswers={handleFileUpload}
            onProcess={handleProcessEvaluation}
            onStartEvaluation={handleStartEvaluationProcess}
            onViewHistory={() => setEvaluationStatus("history")}
            uploadedFiles={selectedFiles}
            onRemoveFile={handleRemoveEvaluationFile}
            onReplaceFile={handleReplaceEvaluationFile}
            isProcessing={isAutoProcessing}
            hasMarks={paperConfig.length > 0 || totalMarks > 0}
            rubricSet={rubricSet}
            syllabusSet={syllabusSet}
            questionsSet={questionsSet}
            processingStatus={processingStatus}
          />
        )}

        {evaluationStatus === "in_progress" && (
          <EvaluationProgressScreen
            answerSheets={selectedFiles}
            questionPaperName={questionPaperName}
            syllabusCount={syllabusCount}
            hasRubric={rubricSet}
            onViewResults={() => {
              // Generate results and save to history
              const results = selectedFiles.map(f => generateMockResult(f.name));
              const avgScore = Math.round(results.reduce((acc, curr) => acc + curr.overallScore, 0) / results.length);
              
              const newSession: EvaluationSession = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                files: [...selectedFiles],
                results: results,
                averageScore: avgScore
              };
              
              setEvaluationHistory(prev => [newSession, ...prev]);
              setCurrentEvaluationResult(results);
              setEvaluationStatus("results");
            }}
          />
        )}

        {evaluationStatus === "results" && (
          <EvaluationResultsScreen
            answerSheets={selectedFiles}
            results={currentEvaluationResult}
            onAnalysisClick={() => setEvaluationStatus("analytics")}
            onViewHistory={() => setEvaluationStatus("history")}
          />
        )}

        {evaluationStatus === "analytics" && (
          <EvaluationAnalyticsScreen
            answerSheets={selectedFiles}
            onBack={() => setEvaluationStatus("results")}
          />
        )}

        {evaluationStatus === "history" && (
          <EvaluationHistoryScreen
            history={evaluationHistory}
            onSelectSession={(session) => {
              setSelectedFiles(session.files);
              setCurrentEvaluationResult(session.results);
              setEvaluationStatus("results");
            }}
            onBack={() => setEvaluationStatus("setup")}
          />
        )}
      </div>
    );
  };

  const handleNewChat = async (mode: "learning" | "evaluation") => {
    if (creating) return;
    // Don't create server session here. Open a local temporary chat UI.
    const tempId = `local-${Date.now()}-${mode}`;
    try {
      router.push(`/chat/${tempId}`);
    } catch (error) {
      console.error("Failed to open new chat UI", error);
      setToastMessage("Failed to open a new chat. Please try again.");
      setToastType("error");
      setIsToastVisible(true);
    }
  };

  const handleEditChat = (chat: SidebarChatItem) => {
    setEditingChat(chat);
    setEditingTitle(chat.title);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    const nextTitle = editingTitle.trim();

    if (!nextTitle || !editingChat) {
      setIsEditModalOpen(false);
      return;
    }

    const run = async () => {
      try {
        await updateChatSession(editingChat.id, { title: nextTitle });

        setChats((prev) =>
          prev.map((item) =>
            item.id === editingChat.id ? { ...item, title: nextTitle } : item
          )
        );

        setToastMessage("Chat title updated successfully");
        setToastType("success");
        setIsToastVisible(true);
        setIsEditModalOpen(false);
      } catch (error) {
        console.error("Failed to update chat title", error);
        setToastMessage("Failed to update chat title. Please try again.");
        setToastType("error");
        setIsToastVisible(true);
      }
    };

    void run();
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingChat(null);
    setEditingTitle("");
  };

  const handleDeleteChat = (chat: SidebarChatItem) => {
    setDeletingChat(chat);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingChat) return;

    const run = async () => {
      setIsDeletingChat(true);
      try {
        await deleteChatSession(deletingChat.id);

        setChats((prev) => prev.filter((item) => item.id !== deletingChat.id));

        if (chatId === deletingChat.id) {
          router.push("/chat");
        }

        setToastMessage("Chat deleted successfully");
        setToastType("success");
        setIsToastVisible(true);
        setIsDeleteModalOpen(false);
        setDeletingChat(null);
      } catch (error) {
        console.error("Failed to delete chat", error);
        setToastMessage("Failed to delete chat. Please try again.");
        setToastType("error");
        setIsToastVisible(true);
      } finally {
        setIsDeletingChat(false);
      }
    };

    void run();
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingChat(null);
    setIsDeletingChat(false);
  };

  // Determine active step for header pulsing
  const getActiveStep = () => {
    if (evaluationStatus !== "setup") return undefined;
    if (!rubricSet) return "rubric";
    if (!syllabusSet) return "syllabus";
    if (!questionsSet) return "questions";
    return undefined;
  };

  return (
    <main className="flex h-dvh bg-gray-100 dark:bg-[#0C0C0C] text-gray-900 dark:text-gray-200">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        activeChatId={chatId ?? activeSessionId}
        onNewLearningChat={() => handleNewChat("learning")}
        onNewEvaluationChat={() => handleNewChat("evaluation")}
        onEditChat={handleEditChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* MAIN AREA */}
      <div
        className={`flex flex-col flex-1 h-full transition-[margin,width] duration-300 ${
          isAnyRightPanelOpen ? RIGHT_PANEL_MARGIN_CLASS : ""
        }`}
      >
        {/* HEADER COMPONENT */}
        <Header
          mode={mode}
          isRubricOpen={isRubricOpen}
          isSyllabusOpen={isSyllabusOpen}
          isQuestionsOpen={isQuestionsOpen}
          isSyncingMessages={isSyncingMessages}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          toggleRubric={toggleRubric}
          toggleSyllabus={toggleSyllabus}
          toggleQuestions={toggleQuestions}
          activeStep={getActiveStep()}
        />

        {/* MESSAGE AREA */}
        {renderMessageArea()}

        {/* INPUT AREA */}
        {mode === "learning" && (
          <div className="p-4 border-t border-gray-200 bg-white dark:bg-[#111111] dark:border-[#2a2a2a]">
            <EvaluationMarksModal
              open={isEvaluationModalOpen}
              onClose={() => setIsEvaluationModalOpen(false)}
              onSubmit={(config) => {
                setPaperConfig(config);
                setIsEvaluationModalOpen(false);
              }}
              initialConfig={paperConfig}
            />

            {isRecording && (
              <RecordBar
                onCancelRecording={() => {
                  setIsRecording(false);
                }}
                onStopRecording={(audioBlob) => {
                  setIsRecording(false);
                  setPendingVoice(audioBlob);
                }}
              />
            )}

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
              onSend={handleUnifiedSend}
              onFilesSelected={handlePendingFilesAdd}
              pendingFiles={pendingFiles}
              onRemoveFile={handleRemovePendingFile}
              onClearFiles={clearPendingFiles}
              pendingVoice={pendingVoice}
              onClearPendingVoice={() => setPendingVoice(null)}
              isUploading={isUploading}
              isFirstMessage={learningMessages.length === 0}
            />
          </div>
        )}
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
        className={`fixed right-0 top-0 h-full transition-transform duration-300 z-10 ${RIGHT_PANEL_WIDTH_CLASS} border-l border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111111] ${
          isSyllabusOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <SyllabusPanelpage 
          onClose={toggleSyllabus} 
          onSyllabusChange={useCallback((hasSyllabus: boolean, count: number) => {
            setSyllabusSet(hasSyllabus);
            setSyllabusCount(count);
            if (processingStatusRef.current === "completed") {
              setProcessingStatus("needs_reprocessing");
            }
          }, [])}
        />
      </div>

      {/* QUESTIONS PANEL */}
      <div
        className={`fixed right-0 top-0 h-full transition-transform duration-300 z-10 ${RIGHT_PANEL_WIDTH_CLASS} border-l border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111111] ${
          isQuestionsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <QuestionsPanelpage 
          onClose={toggleQuestions} 
          onQuestionsChange={useCallback((hasQuestions: boolean, questionName?: string) => {
            setQuestionsSet(hasQuestions);
            setQuestionPaperName(questionName);
            if (processingStatusRef.current === "completed") {
              setProcessingStatus("needs_reprocessing");
            }
          }, [])}
        />
      </div>

      <UpdatedToast
        message={toastMessage}
        isVisible={isToastVisible}
        type={toastType}
        onClose={() => setIsToastVisible(false)}
      />

      {/* EDIT CHAT TITLE MODAL */}
      <EditModal
        isOpen={isEditModalOpen}
        title="Edit Chat Title"
        placeholder="Enter new title"
        value={editingTitle}
        onChange={setEditingTitle}
        onConfirm={handleConfirmEdit}
        onCancel={handleCancelEdit}
        confirmLabel="Save"
        cancelLabel="Cancel"
      />

      {/* DELETE CHAT MODAL */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        title="Delete Chat"
        message={`Are you sure you want to delete "${deletingChat?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeletingChat}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconColor="red"
      />
    </main>
  );
}
