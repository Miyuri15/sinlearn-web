"use client";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import InputBar from "@/components/chat/InputBar";
import EvaluationInputs from "@/components/chat/EvaluationInputs";
import EvaluationMarksModal from "@/components/chat/EvaluationMarksModal";
import EvaluationStartScreen from "@/components/chat/EvaluationStartScreen";
import EvaluationProgressScreen from "@/components/chat/EvaluationProgressScreen";
import EvaluationResultsScreen, {
  generateMockResult,
} from "@/components/chat/EvaluationResultsScreen";
import EvaluationAnalyticsScreen from "@/components/chat/EvaluationAnalyticsScreen";
import EvaluationHistoryScreen, {
  EvaluationSession,
} from "@/components/chat/EvaluationHistoryScreen";
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
  createChatSession,
} from "@/lib/api/chat";
import {
  processMessageAttachments,
  processResourcesBatch,
  detachAnswerScriptsFromSession,
  detachAnswerSheetFromSession,
} from "@/lib/api/resource";
import {
  uploadEvaluationResources,
  createRubric,
  getChatSessionDetails,
  attachRubricToSession,
  EvaluationResourceType,
  getRubricById,
  listChatSessionResources,
  removeAttachedRubricFromSession,
  processDocumentsStream,
  getPaperConfigFromOCR,
  getPaperQuestionStructure,
  confirmPaperConfig,
  mergePaperConfigWithQuestionStructure,
  startEvaluation,
} from "@/lib/api/evaluation";
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
  const [chatType, setChatType] = useState<"learning" | "evaluation">(
    () => getSelectedChatType() || "learning"
  );
  // ✅ ADD THIS: active server session id for the current chat
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const evaluationHistoryStorageKey = (sessionId: string) =>
    `sinlearn.evaluationHistory.v1.${sessionId}`;

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

  // Helper to ensure we have a session ID before uploading
  const ensureSessionId = useCallback(async (): Promise<string | null> => {
    if (activeSessionId) return activeSessionId;

    // If no session, create one
    try {
      console.log("Creating new evaluation session on demand...");
      const session = await createChatSession({
        mode: "evaluation",
        title: "New Evaluation Chat",
      });
      console.log("Created session:", session.id);

      // Keep UI in evaluation mode (this route may not remount when using pushState)
      setChatType("evaluation");

      // Update state immediately
      setActiveSessionId(session.id);

      // Ensure the newly created session exists in sidebar list so it can be highlighted
      setChats((prev) => {
        const next = prev.filter((c) => c.id !== session.id);
        return [
          {
            id: session.id,
            title: session.title || "New Evaluation Chat",
            type: "evaluation",
            time: formatDistanceToNow(new Date(), { addSuffix: true }),
          },
          ...next,
        ];
      });

      // Update URL without full reload to keep state
      window.history.pushState({}, "", `/chat/${session.id}`);

      return session.id;
    } catch (error) {
      console.error("Failed to create session on demand", error);
      setToastMessage("Failed to create chat session. Please try again.");
      setToastType("error");
      setIsToastVisible(true);
      return null;
    }
  }, [activeSessionId]);

  // Evaluation specific states
  const [isEvaluationStarted, setIsEvaluationStarted] = useState(false);
  const [evaluationStatus, setEvaluationStatus] = useState<
    "setup" | "in_progress" | "results" | "analytics" | "history"
  >("setup");
  const [evaluationHistory, setEvaluationHistory] = useState<
    EvaluationSession[]
  >([]);
  const [currentEvaluationResult, setCurrentEvaluationResult] = useState<
    any[] | undefined
  >(undefined);
  const [rubricSet, setRubricSet] = useState(false);
  const [attachedRubricId, setAttachedRubricId] = useState<string | null>(null);
  const [syllabusSet, setSyllabusSet] = useState(false);
  const [syllabusCount, setSyllabusCount] = useState(0);
  const [questionsSet, setQuestionsSet] = useState(false);
  const [questionPaperName, setQuestionPaperName] = useState<
    string | undefined
  >(undefined);
  const [processingStatus, setProcessingStatus] = useState<
    "idle" | "processing" | "completed" | "needs_reprocessing"
  >("idle");
  const processingStatusRef = useRef(processingStatus);
  const hydratedEvaluationSessionRef = useRef<string | null>(null);

  useEffect(() => {
    processingStatusRef.current = processingStatus;
  }, [processingStatus]);

  // Sync activeSessionId with chatId prop
  useEffect(() => {
    console.log("ChatPage: chatId changed to", chatId);
    if (chatId && !chatId.startsWith("local-")) {
      console.log("ChatPage: Setting activeSessionId to", chatId);
      setActiveSessionId(chatId);
    } else {
      console.log("ChatPage: Clearing activeSessionId");
      setActiveSessionId(null);
    }
  }, [chatId]);

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

  // Fetch session details on load (hydrate setup state per chat session)
  useEffect(() => {
    if (!activeSessionId || mode !== "evaluation") return;
    if (hydratedEvaluationSessionRef.current === activeSessionId) return;

    const run = async () => {
      try {
        hydratedEvaluationSessionRef.current = activeSessionId;

        // Restore evaluation history for this chat session (client-side persistence)
        try {
          const raw = localStorage.getItem(
            evaluationHistoryStorageKey(activeSessionId)
          );
          if (raw) {
            const parsed = JSON.parse(raw) as Array<{
              id: string;
              timestamp: number;
              fileNames: string[];
              results: any[];
              averageScore: number;
            }>;

            if (Array.isArray(parsed)) {
              const restored: EvaluationSession[] = parsed
                .filter((s) => s && typeof s.id === "string")
                .map((s) => ({
                  id: s.id,
                  timestamp: Number(s.timestamp) || Date.now(),
                  files: (s.fileNames || []).map((name) => new File([], name)),
                  results: Array.isArray(s.results) ? s.results : [],
                  averageScore: Number(s.averageScore) || 0,
                }));
              setEvaluationHistory(restored);
            }
          }
        } catch (e) {
          console.warn("Failed to restore evaluation history", e);
        }

        const normalizeResourceType = (value: unknown): string => {
          const s = (value ?? "").toString().trim().toLowerCase();
          return s.replace(/[\s-]+/g, "_");
        };

        const getResourceFilename = (r: any): string => {
          return (
            r?.filename ||
            r?.file_name ||
            r?.name ||
            r?.original_filename ||
            r?.originalFilename ||
            ""
          ).toString();
        };

        const classifyByFilename = (
          filename: string
        ): "syllabus" | "question_paper" | "answer_sheet" => {
          const f = filename.toLowerCase();
          if (/syllabus|syllabi/.test(f)) return "syllabus";
          // Common names: "model paper", "question paper", "qp"
          if (
            /\bmodel\b|\bquestion\b|\bqp\b|\bquestion[_\s-]?paper\b|\bmodel[_\s-]?paper\b/.test(
              f
            )
          ) {
            return "question_paper";
          }
          return "answer_sheet";
        };

        const details = await getChatSessionDetails(activeSessionId);

        const rubricId = details?.rubric_id ?? null;
        setAttachedRubricId(rubricId);
        setRubricSet(!!rubricId);

        const qp = details?.question_paper;
        const qpFilenameFromDetails: string | undefined =
          qp?.filename || qp?.file_name || qp?.name;

        const sy = details?.syllabus;
        const syFilenameFromDetails: string | undefined =
          sy?.filename || sy?.file_name || sy?.name;

        // Prefer session.details fields, but fall back to session resources list
        let qpFilename: string | undefined = qpFilenameFromDetails;
        let hasQuestionPaper = !!qpFilenameFromDetails;
        let syllabusCountFromResources = 0;
        let hasSyllabus = !!syFilenameFromDetails;

        try {
          const resources = await listChatSessionResources(activeSessionId);
          const qpResource = (resources || []).find((r: any) => {
            const type = normalizeResourceType(r?.resource_type ?? r?.type);
            if (type) {
              return (
                type === "question_paper" ||
                type === "questionpaper" ||
                type === "question" ||
                type === "questions"
              );
            }
            const filename = getResourceFilename(r);
            return classifyByFilename(filename) === "question_paper";
          });

          const syllabusResources = (resources || []).filter((r: any) => {
            const type = normalizeResourceType(r?.resource_type ?? r?.type);
            if (type) {
              return type === "syllabus" || type === "syllabi";
            }
            const filename = getResourceFilename(r);
            return classifyByFilename(filename) === "syllabus";
          });

          syllabusCountFromResources = syllabusResources.length;
          hasSyllabus = hasSyllabus || syllabusCountFromResources > 0;

          if (!hasQuestionPaper && qpResource) {
            qpFilename = getResourceFilename(qpResource) || undefined;
            hasQuestionPaper = !!qpFilename;
          }

          // If details didn't have a syllabus filename but resources exist, mark as set.
          if (!hasSyllabus && syllabusCountFromResources > 0) {
            hasSyllabus = true;
          }
        } catch (e) {
          console.warn(
            "Failed to list session resources for setup hydration",
            e
          );
        }

        setQuestionsSet(hasQuestionPaper);
        setQuestionPaperName(qpFilename);

        setSyllabusSet(hasSyllabus);
        setSyllabusCount(
          syFilenameFromDetails ? 1 : syllabusCountFromResources
        );

        // Fetch rubric details if attached (requested API behavior)
        if (rubricId) {
          try {
            await getRubricById(rubricId);
          } catch (e) {
            console.warn("Failed to fetch rubric details", e);
          }
        }

        // Restore previously uploaded answer sheets from server resources.
        // We only hydrate if the UI doesn't already have local selections.
        if (selectedFiles.length === 0 && answerResourceIds.length === 0) {
          try {
            const resources = await listChatSessionResources(activeSessionId);
            const answerResources = (resources || []).filter((r: any) => {
              const type = normalizeResourceType(r?.resource_type ?? r?.type);
              if (type) return type === "answer_sheet";
              const filename = getResourceFilename(r);
              return classifyByFilename(filename) === "answer_sheet";
            });

            const restoredIds: string[] = [];
            const restoredFiles: File[] = [];

            answerResources.forEach((r: any, idx: number) => {
              const rid: string | undefined = r?.resource_id || r?.id;
              const filename: string | undefined =
                getResourceFilename(r) || undefined;
              if (!rid) return;
              restoredIds.push(rid);
              restoredFiles.push(
                new File([], filename || `Answer Sheet ${idx + 1}`)
              );
            });

            if (restoredIds.length > 0) {
              setAnswerResourceIds(restoredIds);
              setSelectedFiles(restoredFiles);
              setEvaluationUploadedFilesCount(restoredFiles.length);
            }
          } catch (e) {
            console.warn("Failed to restore answer sheets", e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    void run();
  }, [activeSessionId, mode]);

  // Persist evaluation history whenever it changes (per chat session)
  useEffect(() => {
    if (!activeSessionId || mode !== "evaluation") return;

    try {
      const toStore = (evaluationHistory || []).map((s) => ({
        id: s.id,
        timestamp: s.timestamp,
        fileNames: (s.files || []).map((f) => f.name),
        results: s.results ?? [],
        averageScore: s.averageScore ?? 0,
      }));
      localStorage.setItem(
        evaluationHistoryStorageKey(activeSessionId),
        JSON.stringify(toStore)
      );
    } catch (e) {
      console.warn("Failed to persist evaluation history", e);
    }
  }, [activeSessionId, mode, evaluationHistory]);

  type SidebarChatItem = {
    id: string;
    title: string;
    type: "learning" | "evaluation";
    time: string;
  };

  const router = useRouter();
  const endRef = useRef<HTMLDivElement | null>(null);
  const [responseLevel, setResponseLevel] = useState("grade_9_11");

  // Evaluation inputs state
  const [paperConfig, setPaperConfig] = useState<PaperPart[]>([]);
  const [isPaperConfigLoading, setIsPaperConfigLoading] = useState(false);
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [mainQuestions, setMainQuestions] = useState<number>(0);
  const [requiredQuestions, setRequiredQuestions] = useState<number>(0);
  const [subQuestions, setSubQuestions] = useState<number>(0);

  const [subQuestionMarks, setSubQuestionMarks] = useState<number[][]>([]);
  const [isSubMarksModalOpen, setIsSubMarksModalOpen] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [answerResourceIds, setAnswerResourceIds] = useState<string[]>([]);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [marksConfirmed, setMarksConfirmed] = useState(false);
  const [evaluationUploadedFilesCount, setEvaluationUploadedFilesCount] =
    useState(0);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ LOAD MESSAGES WHEN A SESSION IS OPENED
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;
      if (chatId.startsWith("local-") || chatId.startsWith("new-")) return;

      // Evaluation chats don't use the messages API.
      if (mode !== "learning") {
        return;
      }

      setIsLoadingMessages(true);
      try {
        const messages = await listSessionMessages(chatId);

        // ✅ SORT BY created_at (oldest → newest)
        const sorted = messages.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        setLearningMessages(sorted);
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

        // If we are on a specific chat URL, keep chatType in sync with its real session mode.
        if (
          chatId &&
          !chatId.startsWith("local-") &&
          !chatId.startsWith("new-")
        ) {
          const current = mapped.find((c) => c.id === chatId);
          if (current) {
            setChatType((prev) =>
              prev !== current.type ? current.type : prev
            );
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    loadChats();
  }, [chatId]);

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
      // Messages are only supported in learning mode.
      if (mode !== "learning") return;

      if (!message.trim()) return;

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

              setLearningMessages((prev) => [...prev, messageToRender]);
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

            setLearningMessages(sorted);
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
    // Voice QA is only supported in learning mode.
    if (mode !== "learning") return;

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
          safety_summary: data.safety_summary,
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
    if (mode !== "evaluation") return;

    const sessionId = activeSessionId ?? (await ensureSessionId());
    if (!sessionId) {
      setToastMessage("Please create an evaluation chat first.");
      setToastType("error");
      setIsToastVisible(true);
      return;
    }

    if (processingStatus !== "completed") {
      setToastMessage("Please process documents before sending.");
      setToastType("warning");
      setIsToastVisible(true);
      return;
    }

    if (!marksConfirmed) {
      setToastMessage(
        "Please confirm the paper config (marks) before sending."
      );
      setToastType("warning");
      setIsToastVisible(true);
      return;
    }

    if (answerResourceIds.length === 0) {
      setToastMessage("Please upload answer sheets before sending.");
      setToastType("warning");
      setIsToastVisible(true);
      return;
    }

    try {
      setIsAutoProcessing(true);

      // Mobile parity: start evaluation one answer sheet at a time.
      for (const resourceId of answerResourceIds) {
        await startEvaluation({
          chat_session_id: sessionId,
          answer_resource_ids: [resourceId],
        });
      }

      // Create a new evaluation session entry in history (one per Send).
      // Note: UI currently uses mock results, so we generate and persist them here.
      const results = selectedFiles.map((f) => generateMockResult(f.name));
      const avgScore =
        results.length > 0
          ? Math.round(
              results.reduce((acc, curr) => acc + curr.overallScore, 0) /
                results.length
            )
          : 0;

      const newSession: EvaluationSession = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: Date.now(),
        files: [...selectedFiles],
        results,
        averageScore: avgScore,
      };

      setEvaluationHistory((prev) => [newSession, ...prev]);
      setCurrentEvaluationResult(results);

      setIsEvaluationStarted(true);
      setEvaluationStatus("in_progress");
    } catch (error) {
      console.error("Failed to start evaluation", error);
      setToastMessage("Failed to start evaluation");
      setToastType("error");
      setIsToastVisible(true);
    } finally {
      setIsAutoProcessing(false);
    }
  };

  const handleStartNewAnswerEvaluation = useCallback(async () => {
    // Navigate back to setup screen
    setEvaluationStatus("setup");
    setIsEvaluationStarted(false);
    setCurrentEvaluationResult(undefined);

    // Snapshot ids before clearing local state
    const sessionId = activeSessionId;
    const idsFromState = [...answerResourceIds];

    // Clear ONLY answer sheets locally
    setSelectedFiles([]);
    setAnswerResourceIds([]);
    setEvaluationUploadedFilesCount(0);
    setProcessingStatus("idle");

    // Best-effort server cleanup so answer sheets don't rehydrate after relogin
    if (!sessionId) return;

    // Detach answer scripts from this chat session (do NOT delete resources).
    // This keeps already-evaluated history intact while removing answer uploads for the next run.
    try {
      await detachAnswerScriptsFromSession({ sessionId });
    } catch (e) {
      console.warn("Failed to detach answer scripts from session", e);
      // Fallback: detach ids we currently know about.
      for (const resourceId of idsFromState) {
        try {
          await detachAnswerSheetFromSession({ sessionId, resourceId });
        } catch (err) {
          console.warn("Failed to detach answer sheet resource", err);
        }
      }
    }
  }, [activeSessionId, answerResourceIds]);

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
    // Regeneration is only supported in learning mode.
    if (mode !== "learning") return;

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

  const handleRubricSelect = async (rubricId: string) => {
    console.log("Selected rubric:", rubricId);
    const isClearing = !rubricId;

    if (isClearing) {
      if (activeSessionId) {
        try {
          await removeAttachedRubricFromSession({
            chatSessionId: activeSessionId,
          });
        } catch (e) {
          console.error("Failed to detach rubric", e);
          setToastMessage("Failed to remove rubric from the server.");
          setToastType("error");
          setIsToastVisible(true);
          return;
        }
      }

      setRubricSet(false);
      setAttachedRubricId(null);
    } else {
      setRubricSet(true);
    }

    if (processingStatus === "completed") {
      setProcessingStatus("needs_reprocessing");
      setMarksConfirmed(false);
    }
  };

  const handleRubricUpload = () => {
    console.log("Upload rubric");
    setRubricSet(true);
    if (processingStatus === "completed") {
      setProcessingStatus("needs_reprocessing");
      setMarksConfirmed(false);
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

  const handleFileUpload = async (files: File[]) => {
    if (mode !== "evaluation") return;

    if (processingStatus === "completed") {
      setProcessingStatus("needs_reprocessing");
      setMarksConfirmed(false);
    }

    const MAX_ANSWER_SHEETS = 10;
    const currentCount = selectedFiles.length;
    const remainingSlots = isEvaluationStarted
      ? MAX_ANSWER_SHEETS
      : MAX_ANSWER_SHEETS - currentCount;

    if (!isEvaluationStarted && remainingSlots <= 0) {
      setToastMessage(
        "You have already uploaded the maximum of 10 answer sheets for this evaluation chat."
      );
      setToastType("error");
      setIsToastVisible(true);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (filesToUpload.length < files.length) {
      const msg = isEvaluationStarted
        ? `You can upload a maximum of ${MAX_ANSWER_SHEETS} answer sheet(s). Only the first ${MAX_ANSWER_SHEETS} file(s) will be uploaded.`
        : `You can only upload ${remainingSlots} more answer sheet(s). Only the first ${remainingSlots} file(s) will be uploaded.`;
      setToastMessage(msg);
      setToastType("warning");
      setIsToastVisible(true);
    }

    // Ensure we have a real server session id to attach resources to.
    const targetSessionId = activeSessionId ?? (await ensureSessionId());
    if (!targetSessionId) {
      setToastMessage("Please create an evaluation chat first.");
      setToastType("error");
      setIsToastVisible(true);
      return;
    }

    setIsUploading(true);
    try {
      const uploads = await uploadEvaluationResources({
        chatSessionId: targetSessionId,
        resourceType: "answer_sheet",
        files: filesToUpload,
      });

      const byName = new Map(
        uploads
          .filter((u) => typeof u?.filename === "string" && !!u.filename)
          .map((u) => [u.filename as string, u.resource_id])
      );

      const acceptedFiles: File[] = [];
      const acceptedIds: string[] = [];

      filesToUpload.forEach((file, idx) => {
        const fromName = byName.get(file.name);
        const fallback = uploads[idx]?.resource_id;
        const id = fromName || fallback;
        if (id) {
          acceptedFiles.push(file);
          acceptedIds.push(id);
        }
      });

      if (acceptedFiles.length === 0) {
        setToastMessage(
          "Answer sheet upload failed: no resource ids returned."
        );
        setToastType("error");
        setIsToastVisible(true);
        return;
      }

      if (acceptedFiles.length < filesToUpload.length) {
        setToastMessage(
          "Some answer sheets uploaded but the server did not return resource ids for all files. Please retry the missing files."
        );
        setToastType("warning");
        setIsToastVisible(true);
      }

      if (!isEvaluationStarted) {
        setSelectedFiles((prev) => {
          const next = [...prev, ...acceptedFiles];
          setEvaluationUploadedFilesCount(next.length);
          return next;
        });
        setAnswerResourceIds((prev) => [...prev, ...acceptedIds]);
      } else {
        // If evaluation already started, we treat this as a full replacement.
        // Detach old answer scripts from the session (do NOT delete resources).
        try {
          await detachAnswerScriptsFromSession({ sessionId: targetSessionId });
        } catch (e) {
          console.warn("Failed to detach previous answer scripts", e);
          // Fallback: detach known ids individually.
          const oldIds = [...answerResourceIds];
          for (const oldId of oldIds) {
            try {
              await detachAnswerSheetFromSession({
                sessionId: targetSessionId,
                resourceId: oldId,
              });
            } catch (err) {
              console.warn("Failed to detach previous answer sheet", err);
            }
          }
        }

        // If evaluation already started, replace the current batch.
        setSelectedFiles(acceptedFiles);
        setAnswerResourceIds(acceptedIds);
        setEvaluationUploadedFilesCount(acceptedFiles.length);

        setEvaluationMessages((prev) => [
          ...prev,
          ...acceptedFiles.map((file) => ({
            role: "user" as const,
            content: `📎 Uploaded file: ${file.name}`,
            file,
          })),
        ]);
      }
    } catch (error) {
      console.error("Failed to upload answer sheets", error);
      setToastMessage("Failed to upload answer sheets. Please try again.");
      setToastType("error");
      setIsToastVisible(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveEvaluationFile = async (index: number) => {
    const resourceId = answerResourceIds[index];
    if (!resourceId) {
      setSelectedFiles((prev) => {
        const next = prev.filter((_, i) => i !== index);
        setEvaluationUploadedFilesCount(next.length);
        return next;
      });
      setAnswerResourceIds((prev) => prev.filter((_, i) => i !== index));
      if (processingStatus === "completed") {
        setProcessingStatus("needs_reprocessing");
        setMarksConfirmed(false);
      }
      return;
    }

    try {
      if (activeSessionId) {
        await detachAnswerSheetFromSession({
          sessionId: activeSessionId,
          resourceId,
        });
      }
    } catch (e) {
      console.error("Failed to delete answer sheet resource", e);
      setToastMessage("Failed to remove the answer sheet from the server.");
      setToastType("error");
      setIsToastVisible(true);
      return;
    }

    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setEvaluationUploadedFilesCount(next.length);
      return next;
    });
    setAnswerResourceIds((prev) => prev.filter((_, i) => i !== index));
    if (processingStatus === "completed") {
      setProcessingStatus("needs_reprocessing");
      setMarksConfirmed(false);
    }
  };

  const handleReplaceEvaluationFile = async (index: number, file: File) => {
    if (processingStatus === "completed") {
      setProcessingStatus("needs_reprocessing");
      setMarksConfirmed(false);
    }

    const targetSessionId = activeSessionId ?? (await ensureSessionId());
    if (!targetSessionId) {
      setToastMessage("Please create an evaluation chat first.");
      setToastType("error");
      setIsToastVisible(true);
      return;
    }

    setIsUploading(true);
    try {
      const oldId = answerResourceIds[index];
      const uploads = await uploadEvaluationResources({
        chatSessionId: targetSessionId,
        resourceType: "answer_sheet",
        files: [file],
      });
      const newId = uploads[0]?.resource_id;
      if (!newId) {
        setToastMessage(
          "Failed to replace answer sheet: no resource id returned."
        );
        setToastType("error");
        setIsToastVisible(true);
        return;
      }

      if (oldId) {
        try {
          await detachAnswerSheetFromSession({
            sessionId: targetSessionId,
            resourceId: oldId,
          });
        } catch (e) {
          console.warn("Failed to detach old answer sheet resource", e);
        }
      }

      setSelectedFiles((prev) => {
        const next = [...prev];
        next[index] = file;
        setEvaluationUploadedFilesCount(next.length);
        return next;
      });
      setAnswerResourceIds((prev) => {
        const next = [...prev];
        next[index] = newId;
        return next;
      });
    } catch (error) {
      console.error("Failed to replace answer sheet", error);
      setToastMessage("Failed to replace answer sheet. Please try again.");
      setToastType("error");
      setIsToastVisible(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcessEvaluation = async () => {
    const targetSessionId = activeSessionId ?? (await ensureSessionId());
    if (!targetSessionId) {
      setToastMessage("Please create an evaluation chat first.");
      setToastType("error");
      setIsToastVisible(true);
      return;
    }

    if (answerResourceIds.length === 0) {
      setToastMessage(
        "No uploaded answer-sheet ids found. Please upload answer sheets again."
      );
      setToastType("error");
      setIsToastVisible(true);
      return;
    }

    setProcessingStatus("processing");
    // Re-processing invalidates any previous confirmation.
    setMarksConfirmed(false);
    try {
      // Mobile parity: process one answer sheet at a time.
      for (const resourceId of answerResourceIds) {
        await processDocumentsStream({
          chat_session_id: targetSessionId,
          answer_resource_ids: [resourceId],
        });
      }

      setProcessingStatus("completed");
      // After processing completes, marks must be (re)confirmed.
      setMarksConfirmed(false);
      setToastMessage("Documents processed successfully.");
      setToastType("success");
      setIsToastVisible(true);
    } catch (error) {
      console.error("Failed to process documents", error);
      setProcessingStatus("idle");
      setToastMessage("Failed to process documents. Please try again.");
      setToastType("error");
      setIsToastVisible(true);
    }
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
      setAnswerResourceIds([]);
    }
  }, [chatId]);

  // Reset file count when evaluation messages are cleared
  useEffect(() => {
    if (mode === "evaluation" && evaluationMessages.length === 0) {
      setEvaluationUploadedFilesCount(0);
      setAnswerResourceIds([]);
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
            onOpenMarks={async () => {
              const sessionId = await ensureSessionId();
              if (!sessionId) {
                setToastMessage("Please create an evaluation chat first.");
                setToastType("error");
                setIsToastVisible(true);
                return;
              }

              // If already confirmed, allow editing without re-fetch.
              // If not confirmed, refresh from backend so marks allocations are present.
              if (marksConfirmed && paperConfig.length > 0) {
                setIsEvaluationModalOpen(true);
                return;
              }

              try {
                setIsPaperConfigLoading(true);
                const cfg = await getPaperConfigFromOCR({
                  chatSessionId: sessionId,
                });
                const qs = await getPaperQuestionStructure({
                  chatSessionId: sessionId,
                  paperConfigParts: cfg,
                });

                const merged = mergePaperConfigWithQuestionStructure({
                  paperConfigParts: cfg,
                  questionStructureParts: qs,
                });

                if (merged && merged.length > 0) {
                  setPaperConfig(merged);
                } else if (cfg && cfg.length > 0) {
                  setPaperConfig(cfg);
                } else if (qs && qs.length > 0) {
                  setPaperConfig(qs);
                }
              } catch (e) {
                console.error(
                  "Failed to fetch paper config/question structure",
                  e
                );
                setToastMessage(
                  "Failed to fetch paper structure. You can still edit manually."
                );
                setToastType("warning");
                setIsToastVisible(true);
              } finally {
                setIsPaperConfigLoading(false);
                setIsEvaluationModalOpen(true);
              }
            }}
            onClearAnswerSheets={handleStartNewAnswerEvaluation}
            onUploadAnswers={handleFileUpload}
            onProcess={handleProcessEvaluation}
            onStartEvaluation={handleStartEvaluationProcess}
            onViewHistory={() => setEvaluationStatus("history")}
            uploadedFiles={selectedFiles}
            onRemoveFile={handleRemoveEvaluationFile}
            onReplaceFile={handleReplaceEvaluationFile}
            isProcessing={isAutoProcessing}
            isUploading={isUploading || isPaperConfigLoading}
            hasMarks={marksConfirmed}
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
            onStartNewAnswerEvaluation={handleStartNewAnswerEvaluation}
            onViewResults={() => {
              // History entry is created on Send; here we just navigate.
              if (
                !currentEvaluationResult ||
                currentEvaluationResult.length === 0
              ) {
                const results = selectedFiles.map((f) =>
                  generateMockResult(f.name)
                );
                setCurrentEvaluationResult(results);
              }
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
            onStartNewAnswerEvaluation={handleStartNewAnswerEvaluation}
          />
        )}

        {evaluationStatus === "analytics" && (
          <EvaluationAnalyticsScreen
            answerSheets={selectedFiles}
            onBack={() => setEvaluationStatus("results")}
            onStartNewAnswerEvaluation={handleStartNewAnswerEvaluation}
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
            onStartNewAnswerEvaluation={handleStartNewAnswerEvaluation}
          />
        )}
      </div>
    );
  };

  const handleNewChat = async (mode: "learning" | "evaluation") => {
    if (creating) return;

    // Keep the UI mode in sync immediately (important when staying on /chat and not remounting)
    setChatType(mode);

    if (mode === "evaluation") {
      setCreating(true);
      try {
        const session = await createChatSession({
          mode: "evaluation",
          title: "New Evaluation Chat",
        });

        // Optimistically add the session so sidebar can highlight it instantly
        setChats((prev) => {
          const next = prev.filter((c) => c.id !== session.id);
          return [
            {
              id: session.id,
              title: session.title || "New Evaluation Chat",
              type: "evaluation",
              time: formatDistanceToNow(new Date(), { addSuffix: true }),
            },
            ...next,
          ];
        });

        router.push(`/chat/${session.id}`);
      } catch (error) {
        console.error("Failed to create evaluation chat", error);
        setToastMessage(
          "Failed to create new evaluation chat. Please try again."
        );
        setToastType("error");
        setIsToastVisible(true);
      } finally {
        setCreating(false);
      }
      return;
    }

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

        <EvaluationMarksModal
          open={isEvaluationModalOpen}
          onClose={() => setIsEvaluationModalOpen(false)}
          onSubmit={async (config) => {
            const sessionId = await ensureSessionId();
            if (!sessionId) {
              setToastMessage("Please create an evaluation chat first.");
              setToastType("error");
              setIsToastVisible(true);
              throw new Error("No chat session");
            }

            try {
              await confirmPaperConfig({ chatSessionId: sessionId });
              setPaperConfig(config);
              setMarksConfirmed(true);
              setToastMessage("Paper config confirmed.");
              setToastType("success");
              setIsToastVisible(true);
            } catch (e) {
              console.error("Failed to confirm paper config", e);
              setToastMessage("Failed to confirm paper config.");
              setToastType("error");
              setIsToastVisible(true);
              throw e;
            }
          }}
          initialConfig={paperConfig}
        />

        {/* INPUT AREA */}
        {mode === "learning" && (
          <div className="p-4 border-t border-gray-200 bg-white dark:bg-[#111111] dark:border-[#2a2a2a]">
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
            {!pendingVoice && (
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
            )}

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
        chatSessionId={activeSessionId}
        onRequireSession={ensureSessionId}
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
          onSyllabusChange={useCallback(
            (hasSyllabus: boolean, count: number) => {
              setSyllabusSet(hasSyllabus);
              setSyllabusCount(count);
              if (processingStatusRef.current === "completed") {
                setProcessingStatus("needs_reprocessing");
              }
            },
            []
          )}
          chatSessionId={activeSessionId}
          onRequireSession={ensureSessionId}
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
          onQuestionsChange={useCallback(
            (hasQuestions: boolean, questionName?: string) => {
              setQuestionsSet(hasQuestions);
              setQuestionPaperName(questionName);
              if (processingStatusRef.current === "completed") {
                setProcessingStatus("needs_reprocessing");
              }
            },
            []
          )}
          chatSessionId={activeSessionId}
          onRequireSession={ensureSessionId}
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
