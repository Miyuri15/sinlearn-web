import Image from "next/image";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "@/components/ui/updatedtoast";
import FilePreviewModal from "@/components/chat/uploads/FilePreviewModal";
import HelpIcon from "@mui/icons-material/Help";
import CloseIcon from "@mui/icons-material/Close";

import {
  getChatSessionDetails,
  listChatSessionResources,
  removeAttachedResourceFromSession,
  uploadEvaluationResources,
} from "@/lib/api/evaluation";
import { getResourceExtractedText, viewResource } from "@/lib/api/resource";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

type ToastState = {
  message: string;
  isVisible: boolean;
  type: "success" | "error";
};

type QuestionsPanelProps = Readonly<{
  onClose: () => void;
  onQuestionsChange?: (hasQuestions: boolean, questionName?: string) => void;
  chatSessionId?: string | null;
  onRequireSession?: () => Promise<string | null>;
}>;

type QuestionItemType = {
  id: number;
  resourceId?: string;
  title: string;
  subject: string;
  uploaded: string;
  details: string;
  fileUrl?: string;
  fileType?: string;
  mimeType?: string;
};

type SessionResourceSummary = {
  resource_id?: string;
  id?: string;
  resource_type?: string;
  type?: string;
  filename?: string;
  file_name?: string;
  name?: string;
  original_filename?: string;
  originalFilename?: string;
  mime_type?: string;
  mimeType?: string;
};

type PreviewType = "image" | "video" | "audio" | "pdf" | "file";

const QuestionItem = ({
  id,
  title,
  subject,
  uploaded,
  details,
  onClickDelete,
  onClickView,
  t,
}: QuestionItemType & {
  onClickDelete: (id: number, title: string) => void;
  onClickView: (id: number) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}) => (
  <div
    onClick={() => onClickView(id)}
    className="p-3 sm:p-4 border border-gray-200 rounded-lg mb-3 cursor-pointer hover:bg-gray-50 transition duration-150 flex justify-between items-start gap-2 break-words"
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center mb-1">
        {/* Document Icon */}
        <Image
          src="/icons/document.svg"
          alt="Document Icon"
          width={16}
          height={16}
        />
        <h5 className="font-medium text-sm sm:text-base text-gray-800 ml-2 truncate">
          {title}
        </h5>
      </div>
      {/* Details */}
      <p className="text-xs sm:text-sm text-gray-500 ml-6">
        {t("subject")}: {subject}
      </p>
      <p className="text-xs sm:text-sm text-gray-500 ml-6">
        {t("uploaded")}: {uploaded}
      </p>
      {/* Additional Details */}
      <p className="text-xs sm:text-sm text-gray-600 ml-6 mt-1 break-words">
        {details}
      </p>
    </div>
    {/* Delete Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClickDelete(id, title);
      }}
      className="text-red-400 hover:text-red-600 p-1 rounded transition duration-150 ml-2"
      aria-label={`Delete ${title}`}
    >
      <Image src="/icons/trash.svg" alt="Delete Icon" width={16} height={16} />
    </button>
  </div>
);

const QuestionsPanelpage = ({
  onClose,
  onQuestionsChange,
  chatSessionId,
  onRequireSession,
}: QuestionsPanelProps) => {
  const { t } = useTranslation("questions");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedQuestion, setUploadedQuestion] =
    useState<QuestionItemType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hydrationDone, setHydrationDone] = useState(false);

  const normalizeResourceType = (value: unknown): string => {
    const s = (value ?? "").toString().trim().toLowerCase();
    return s.replace(/[\s-]+/g, "_");
  };

  const getResourceFilename = (r: SessionResourceSummary): string => {
    return (
      r.filename ||
      r.file_name ||
      r.name ||
      r.original_filename ||
      r.originalFilename ||
      ""
    ).toString();
  };

  // Hydrate previously uploaded question paper for this chat session (if any)
  React.useEffect(() => {
    if (!chatSessionId) return;
    if (uploadedQuestion) return;

    const run = async () => {
      try {
        const details = await getChatSessionDetails(chatSessionId);
        const qp = details?.question_paper;
        let filename: string | undefined =
          qp?.filename || qp?.file_name || qp?.name;

        // Prefer session resources list for stable resource_id + filename.
        let resourceId: string | undefined = qp?.resource_id || qp?.id;
        try {
          const resources = (await listChatSessionResources(
            chatSessionId,
          )) as SessionResourceSummary[];
          const fromList = (resources || []).find((r) => {
            const type = normalizeResourceType(r.resource_type || r.type);
            if (type) {
              return (
                type === "question_paper" ||
                type === "questionpaper" ||
                type === "question" ||
                type === "questions"
              );
            }
            const f = getResourceFilename(r).toLowerCase();
            return /\bmodel\b|\bquestion\b|\bqp\b|\bquestion[_\s-]?paper\b|\bmodel[_\s-]?paper\b/.test(
              f,
            );
          });
          resourceId = resourceId || fromList?.resource_id || fromList?.id;
          filename =
            filename || (fromList ? getResourceFilename(fromList) : undefined);
        } catch (e) {
          console.warn(
            "Failed to list session resources for question paper",
            e,
          );
        }

        if (!filename) return;

        const ext = filename.split(".").pop()?.toLowerCase();
        setUploadedQuestion({
          id: 1,
          resourceId,
          title: filename.replace(ext ? `.${ext}` : "", ""),
          subject: "N/A",
          uploaded: new Date().toLocaleDateString("en-US"),
          details: `File: ${(ext || "N/A").toUpperCase()} | (Previously uploaded)`,
          fileType: ext,
          mimeType: qp?.mime_type || qp?.mimeType,
        });
      } catch (e) {
        // Non-fatal: don't block UI if hydration fails
        console.warn("Failed to hydrate question paper", e);
      } finally {
        setHydrationDone(true);
      }
    };

    void run();
  }, [chatSessionId, uploadedQuestion]);

  // Notify parent about questions status on mount and changes
  React.useEffect(() => {
    if (!hydrationDone) return;
    onQuestionsChange?.(!!uploadedQuestion, uploadedQuestion?.title);
  }, [uploadedQuestion, onQuestionsChange, hydrationDone]);

  const [toast, setToast] = useState<ToastState>({
    message: "",
    isVisible: false,
    type: "success",
  });
  const [previewQuestion, setPreviewQuestion] = useState<{
    resourceId: string;
    url: string;
    type: PreviewType;
    extractedText: string;
    isExtracting: boolean;
    extractedTextError: string | null;
    extractedTextPage: number;
    extractedTextPageSize: number;
    extractedTextTotalPages: number;
    extractedTextReturnedPages: number;
    extractedTextHasNext: boolean;
    extractedTextHasPrevious: boolean;
  } | null>(null);

  React.useEffect(() => {
    return () => {
      if (previewQuestion?.url) {
        URL.revokeObjectURL(previewQuestion.url);
      }
    };
  }, [previewQuestion?.url]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, isVisible: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const formatUploadError = (fileName: string, error: unknown): string => {
    const basePrefix = `Validation error for ${fileName}: `;

    if (error instanceof ApiError) {
      const msg = error.message || "Upload failed";

      const detailsText = (() => {
        const details = error.details;
        if (!details) return "";
        if (typeof details === "string") return details.trim();
        try {
          return JSON.stringify(details);
        } catch {
          return "";
        }
      })();

      if (error.status >= 500) {
        const suffix =
          detailsText && detailsText !== msg ? ` Details: ${detailsText}` : "";
        return basePrefix + `Server error (${error.status}) from API.` + suffix;
      }

      if (/poppler|page count/i.test(msg)) {
        return (
          basePrefix +
          "PDF text extraction failed on the API server (Poppler missing). Install Poppler and ensure it's in PATH, then retry. Details: " +
          msg
        );
      }

      if (detailsText && detailsText !== msg) {
        return basePrefix + msg + ` Details: ${detailsText}`;
      }

      return basePrefix + msg;
    }

    if (error instanceof Error && error.message) {
      return basePrefix + error.message;
    }

    return basePrefix + "Upload failed.";
  };

  const resolvePreviewType = (question: QuestionItemType): PreviewType => {
    const mime = (question.mimeType || "").toLowerCase();
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.includes("pdf")) return "pdf";

    const fileType = (question.fileType || "").toLowerCase();
    if (fileType === "pdf") return "pdf";
    if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(fileType))
      return "image";
    if (["mp4", "webm", "mov", "avi", "mkv"].includes(fileType))
      return "video";
    if (["mp3", "wav", "ogg", "m4a", "aac"].includes(fileType))
      return "audio";
    return "file";
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileName = file.name;
      const validExtensions = ["pdf", "doc", "docx"];
      const fileExt = fileName.split(".").pop()?.toLowerCase();

      if (fileExt && validExtensions.includes(fileExt)) {
        let targetSessionId = chatSessionId;
        if (!targetSessionId && onRequireSession) {
          targetSessionId = await onRequireSession();
        }

        let uploadedResourceId: string | undefined;
        let uploadedMimeType: string | undefined;

        if (!targetSessionId) {
          showToast("Please create an evaluation chat first.", "error");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        try {
          setIsUploading(true);
          setUploadProgress(15);

          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev >= 85) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + 5;
            });
          }, 400);

          // If there was an existing uploaded question paper (server-side), remove it first.
          if (uploadedQuestion?.resourceId) {
            try {
              await removeAttachedResourceFromSession({
                chatSessionId: targetSessionId,
                resourceType: "question_paper",
              });
            } catch (e) {
              console.warn("Failed to remove previous question paper", e);
            }
          }

          const uploads = await uploadEvaluationResources({
            chatSessionId: targetSessionId,
            resourceType: "question_paper",
            files: [file],
          });

          clearInterval(progressInterval);
          setUploadProgress(100);

          const newResourceId = uploads[0]?.resource_id;
          if (!newResourceId) {
            showToast("Upload succeeded but no resource id returned.", "error");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }

          uploadedResourceId = newResourceId;
          uploadedMimeType = uploads[0]?.mime_type;
        } catch (error) {
          console.error("Failed to upload question paper", error);
          showToast(formatUploadError(fileName, error), "error");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        } finally {
          setIsUploading(false);
        }

        if (uploadedQuestion?.fileUrl) {
          URL.revokeObjectURL(uploadedQuestion.fileUrl);
        }
        const fileUrl = URL.createObjectURL(file);

        const newQuestion: QuestionItemType = {
          id: 1,
          resourceId: uploadedResourceId,
          title: fileName.replace(`.${fileExt}`, ""),
          subject: "N/A",
          uploaded: new Date().toLocaleDateString("en-US"),
          details: `File: ${fileExt.toUpperCase()} | Size: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)} MB`,
          fileUrl: fileUrl,
          fileType: fileExt,
          mimeType: uploadedMimeType || file.type,
        };

        setUploadedQuestion(newQuestion);
        showToast(t("upload_success", { title: newQuestion.title }), "success");

        // Auto-close panel after successful upload
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showToast(t("invalid_file_type"), "error");
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteQuestion = async (id: number, title: string) => {
    if (uploadedQuestion?.fileUrl) {
      URL.revokeObjectURL(uploadedQuestion.fileUrl);
    }

    if (chatSessionId) {
      try {
        await removeAttachedResourceFromSession({
          chatSessionId,
          resourceType: "question_paper",
        });
      } catch (e) {
        console.error("Failed to delete attached question paper", e);
        showToast("Failed to remove question paper from server.", "error");
        return;
      }
    }

    setUploadedQuestion(null);
    showToast(t("delete_success", { title }), "success");
  };

  const handleViewQuestion = async () => {
    if (!uploadedQuestion) {
      showToast(t("preview_not_available"), "error");
      return;
    }

    if (!uploadedQuestion.resourceId) {
      showToast(t("preview_not_available"), "error");
      return;
    }

    try {
      const [blobResult, extractedTextResult] = await Promise.allSettled([
        viewResource(uploadedQuestion.resourceId),
        getResourceExtractedText(uploadedQuestion.resourceId, {
          page: 1,
          pageSize: 1,
        }),
      ]);

      if (blobResult.status === "rejected") {
        throw blobResult.reason;
      }

      let extractedText = "";
      let extractedTextError: string | null = null;
      let extractedTextMeta = {
        page: 1,
        pageSize: 1,
        totalPages: 0,
        returnedPages: 0,
        hasNext: false,
        hasPrevious: false,
      };

      if (extractedTextResult.status === "fulfilled") {
        extractedText = extractedTextResult.value.extracted_text || "";
        extractedTextMeta = {
          page: extractedTextResult.value.page || 1,
          pageSize: extractedTextResult.value.page_size || 1,
          totalPages: extractedTextResult.value.total_pages || 0,
          returnedPages: extractedTextResult.value.returned_pages || 0,
          hasNext: extractedTextResult.value.has_next,
          hasPrevious: extractedTextResult.value.has_previous,
        };
      } else {
        console.error("Failed to load extracted text", extractedTextResult.reason);
        extractedTextError = getApiErrorMessage(
          extractedTextResult.reason,
          "Failed to load extracted text.",
        );
      }

      const url = URL.createObjectURL(blobResult.value);
      setPreviewQuestion((prev) => {
        if (prev?.url) {
          URL.revokeObjectURL(prev.url);
        }
        return {
          resourceId: uploadedQuestion.resourceId || "",
          url,
          type: resolvePreviewType(uploadedQuestion),
          extractedText,
          isExtracting: false,
          extractedTextError,
          extractedTextPage: extractedTextMeta.page,
          extractedTextPageSize: extractedTextMeta.pageSize,
          extractedTextTotalPages: extractedTextMeta.totalPages,
          extractedTextReturnedPages: extractedTextMeta.returnedPages,
          extractedTextHasNext: extractedTextMeta.hasNext,
          extractedTextHasPrevious: extractedTextMeta.hasPrevious,
        };
      });
    } catch (error) {
      console.error("Failed to preview question paper", error);
      showToast(
        getApiErrorMessage(error, "Failed to preview question paper."),
        "error",
      );
    }
  };

  return (
    <>
      <div className="h-full w-full sm:w-[380px] md:w-[400px] bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-[#2a2a2a] flex flex-col p-0">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx"
        />

        {/* Header (FIXED) */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
              <HelpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              {t("title")}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            >
              <CloseIcon />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t("description")}
          </p>
        </div>

        {/* Content (ONLY THIS SCROLLS) */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar p-4 sm:p-6">
          {/* Upload Question Section */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t("upload_section_title")}
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t("upload_section_subtitle")}
            </p>
            <div
              onClick={() => {
                if (isUploading) return;
                fileInputRef.current?.click();
              }}
              className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 sm:p-10 text-center transition duration-150 ${
                isUploading
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer hover:border-blue-500 dark:hover:border-blue-500"
              }`}
            >
              <div className="flex justify-center mb-2">
                {/* Upload Icon */}
                <Image
                  src="/icons/upload.svg"
                  alt="Upload Icon"
                  width={24}
                  height={24}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isUploading ? "Uploading…" : t("click_to_upload")}
              </span>

              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-600 font-medium">
                      Uploading document...
                    </span>
                    <span className="text-blue-600 font-bold">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Question Section */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t("uploaded_section_title")}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {t("uploaded_section_subtitle")}
            </p>

            {uploadedQuestion && (
              <QuestionItem
                // ... (Existing props)
                key={uploadedQuestion.id}
                id={uploadedQuestion.id}
                title={uploadedQuestion.title}
                subject={uploadedQuestion.subject}
                uploaded={uploadedQuestion.uploaded}
                details={uploadedQuestion.details}
                fileType={uploadedQuestion.fileType}
                onClickDelete={handleDeleteQuestion}
                onClickView={handleViewQuestion}
                t={t}
              />
            )}

            {!uploadedQuestion && (
              <p className="text-sm text-gray-400 italic mt-4">
                {t("no_questions")}
              </p>
            )}
          </div>
        </div>
        {/* Toast Notification */}
        <Toast
          message={toast.message}
          isVisible={toast.isVisible}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
        {/* Footer / Cancel Button */}
        <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111111]">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition duration-150"
          >
            {t("cancel")}
          </button>
        </div>
      </div>

      {/* Question Preview Modal */}
      {previewQuestion && (
        <FilePreviewModal
          resourceId={previewQuestion.resourceId}
          url={previewQuestion.url}
          type={previewQuestion.type}
          extractedText={previewQuestion.extractedText}
          isExtracting={previewQuestion.isExtracting}
          extractedTextError={previewQuestion.extractedTextError}
          extractedTextPage={previewQuestion.extractedTextPage}
          extractedTextPageSize={previewQuestion.extractedTextPageSize}
          extractedTextTotalPages={previewQuestion.extractedTextTotalPages}
          extractedTextReturnedPages={previewQuestion.extractedTextReturnedPages}
          extractedTextHasNext={previewQuestion.extractedTextHasNext}
          extractedTextHasPrevious={previewQuestion.extractedTextHasPrevious}
          onClose={() => {
            URL.revokeObjectURL(previewQuestion.url);
            setPreviewQuestion(null);
          }}
        />
      )}
    </>
  );
};

export default QuestionsPanelpage;
