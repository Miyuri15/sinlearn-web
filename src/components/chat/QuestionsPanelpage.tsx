import Image from "next/image";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "@/components/ui/updatedtoast";
import PDFViewer from "@/components/ui/PDFViewer";
import HelpIcon from "@mui/icons-material/Help";
import CloseIcon from "@mui/icons-material/Close";

type ToastState = {
  message: string;
  isVisible: boolean;
  type: "success" | "error";
};

type QuestionsPanelProps = Readonly<{
  onClose: () => void;
}>;

type QuestionItemType = {
  id: number;
  title: string;
  subject: string;
  uploaded: string;
  details: string;
  fileUrl?: string;
  fileType?: string;
};

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
    className="p-3 border border-gray-200 rounded-lg mb-3 cursor-pointer hover:bg-gray-50 transition duration-150 flex justify-between items-start"
  >
    <div className="flex-1">
      <div className="flex items-center mb-1">
        {/* Document Icon */}
        <Image
          src="/icons/document.svg"
          alt="Document Icon"
          width={16}
          height={16}
        />
        <h5 className="font-medium text-sm text-gray-800 ml-2">{title}</h5>
      </div>
      {/* Details */}
      <p className="text-xs text-gray-500 ml-6">
        {t("subject")}: {subject}
      </p>
      <p className="text-xs text-gray-500 ml-6">
        {t("uploaded")}: {uploaded}
      </p>
      {/* Additional Details */}
      <p className="text-xs text-gray-600 ml-6 mt-1">{details}</p>
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

const QuestionsPanelpage = ({ onClose }: QuestionsPanelProps) => {
  const { t } = useTranslation("questions");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedQuestion, setUploadedQuestion] =
    useState<QuestionItemType | null>(null);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    isVisible: false,
    type: "success",
  });
  const [viewingPDF, setViewingPDF] = useState<{
    fileName: string;
    fileUrl: string;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, isVisible: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileName = file.name;
      const validExtensions = ["pdf", "doc", "docx"];
      const fileExt = fileName.split(".").pop()?.toLowerCase();

      if (fileExt && validExtensions.includes(fileExt)) {
        if (uploadedQuestion?.fileUrl) {
          URL.revokeObjectURL(uploadedQuestion.fileUrl);
        }
        const fileUrl = URL.createObjectURL(file);

        const newQuestion: QuestionItemType = {
          id: 1,
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
        };

        setUploadedQuestion(newQuestion);
        showToast(t("upload_success", { title: newQuestion.title }), "success");
      } else {
        showToast(t("invalid_file_type"), "error");
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteQuestion = (id: number, title: string) => {
    if (uploadedQuestion?.fileUrl) {
      URL.revokeObjectURL(uploadedQuestion.fileUrl);
    }
    setUploadedQuestion(null);
    showToast(t("delete_success", { title }), "success");
  };

  const handleViewQuestion = () => {
    if (
      uploadedQuestion &&
      uploadedQuestion.fileType === "pdf" &&
      uploadedQuestion.fileUrl
    ) {
      setViewingPDF({
        fileName: `${uploadedQuestion.title}.pdf`,
        fileUrl: uploadedQuestion.fileUrl,
      });
    } else if (uploadedQuestion && uploadedQuestion.fileType !== "pdf") {
      showToast(
        t("preview_not_available", {
          fileType: uploadedQuestion.fileType?.toUpperCase(),
        }),
        "error"
      );
    } else {
      showToast(t("preview_not_available"), "error");
    }
  };

  return (
    <>
      <div className="h-full w-[400px] bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-[#2a2a2a] flex flex-col p-0">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx"
        />

        <div className="p-6 grow overflow-y-scroll hidden-scrollbar">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
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

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("description")}
          </p>

          {/* Upload Question Section */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t("upload_section_title")}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {t("upload_section_subtitle")}
            </p>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-10 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition duration-150"
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
                {t("click_to_upload")}
              </span>
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
        {/* Footer / Cancel Button - Fixed at the bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#111111]">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition duration-150"
          >
            {t("cancel")}
          </button>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewingPDF && (
        <PDFViewer
          fileName={viewingPDF.fileName}
          fileUrl={viewingPDF.fileUrl}
          onClose={() => setViewingPDF(null)}
        />
      )}
    </>
  );
};

export default QuestionsPanelpage;
