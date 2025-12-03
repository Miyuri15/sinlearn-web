"use client";

import {
  Upload,
  X,
  Check,
  FileText,
  BookOpen,
  FileSpreadsheet,
  Trash2,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type SyllabusSidebarProps = Readonly<{
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSelectSyllabus?: (syllabusId: string) => void;
  onUpload?: (file: File) => void;
}>;

type Syllabus = {
  id: string;
  title: string;
  title_si: string;
  subject: string;
  subject_si: string;
  grade: string;
  grade_si: string;
  uploadedDate: string;
  uploadedDate_si: string;
  topics: string[];
  topics_si: string[];
};

export default function SyllabusSidebar({
  isOpen,
  loading = false,
  onClose,
  onSelectSyllabus,
  onUpload,
}: SyllabusSidebarProps) {
  const { t, i18n } = useTranslation("common");
  const currentLang = i18n.language || "en";
  const [selectedSyllabus, setSelectedSyllabus] = useState<string>("");
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [activeSyllabus, setActiveSyllabus] = useState<string>("");

  // Get localized text
  const getText = (en: string, si: string) => (currentLang === "si" ? si : en);

  // Sample syllabi data
  const uploadedSyllabi: Syllabus[] = [
    {
      id: "grade10-science",
      title: "Grade 10 Science Syllabus",
      title_si: "10 ශ්‍රේණිය විද්‍යාව පාඨමාලාව",
      subject: "Science",
      subject_si: "විද්‍යාව",
      grade: "Grade 10",
      grade_si: "10 ශ්‍රේණිය",
      uploadedDate: "2 days ago",
      uploadedDate_si: "දින 2 කට පෙර",
      topics: ["Physics", "Chemistry", "Biology"],
      topics_si: ["භෞතික විද්‍යාව", "රසායන විද්‍යාව", "ජීව විද්‍යාව"],
    },
    {
      id: "grade11-math",
      title: "Grade 11 Mathematics Syllabus",
      title_si: "11 ශ්‍රේණිය ගණිතය පාඨමාලාව",
      subject: "Mathematics",
      subject_si: "ගණිතය",
      grade: "Grade 11",
      grade_si: "11 ශ්‍රේණිය",
      uploadedDate: "1 week ago",
      uploadedDate_si: "සති 1 කට පෙර",
      topics: ["Algebra", "Geometry", "Trigonometry"],
      topics_si: ["ඇල්ජීබ්‍රා", "ජ්යාමිතිය", "ත්‍රිකෝණමිතිය"],
    },
    {
      id: "grade9-sinhala",
      title: "Grade 9 Sinhala Syllabus",
      title_si: "9 ශ්‍රේණිය සිංහල පාඨමාලාව",
      subject: "Sinhala",
      subject_si: "සිංහල",
      grade: "Grade 9",
      grade_si: "9 ශ්‍රේණිය",
      uploadedDate: "3 days ago",
      uploadedDate_si: "දින 3 කට පෙර",
      topics: ["Grammar", "Composition", "Literature"],
      topics_si: ["ව්‍යාකරණය", "රචනා", "සාහිත්‍ය"],
    },
  ];

  // Translation keys for sidebar
  const sidebarText = {
    teachersSyllabus: t("syllabus.teachers_syllabus", "Teachers Syllabus"),
    syllabus: t("syllabus.syllabus", "Syllabus"),
    syllabusDescription: t(
      "syllabus.syllabus_description",
      "Upload & select your syllabus. AI will provide answers based on your curriculum."
    ),
    uploadSyllabus: t("syllabus.upload_syllabus", "Upload Syllabus"),
    fileTypes: t("syllabus.file_types", "PDF, DOC, or DOCX files only"),
    clickToUpload: t("syllabus.click_to_upload", "Click to upload"),
    uploadedSyllabi: t("syllabus.uploaded_syllabi", "Uploaded Syllabi"),
    selectSyllabus: t(
      "syllabus.select_syllabus",
      "Select a syllabus for your chat"
    ),
    uploaded: t("syllabus.uploaded", "Uploaded"),
    select: t("syllabus.select", "Select"),
    preview: t("syllabus.preview", "Preview"),
    remove: t("syllabus.remove", "Remove"),
    dragAndDrop: t("syllabus.drag_and_drop", "or drag and drop"),
    maxFileSize: t("syllabus.max_file_size", "Max file size: 15MB"),
    applySyllabus: t("syllabus.apply_syllabus", "Apply Selected Syllabus"),
    syllabusSelected: t("syllabus.syllabus_selected", "Syllabus selected"),
    selectSyllabusToApply: t(
      "syllabus.select_syllabus_to_apply",
      "Select a syllabus to apply"
    ),
    responseLevel: t("syllabus.response_level", "Response Level"),
    askAGuest: t("syllabus.ask_a_guest", "Ask a guest"),
    cancel: t("syllabus.cancel", "Cancel"),
    apply: t("syllabus.apply", "Apply"),
    noSyllabusSelected: t(
      "syllabus.no_syllabus_selected",
      "No syllabus selected"
    ),
    currentSyllabus: t("syllabus.current_syllabus", "Current Syllabus"),
    change: t("syllabus.change", "Change"),
    grade: t("syllabus.grade", "Grade"),
    subject: t("syllabus.subject", "Subject"),
    topics: t("syllabus.topics", "Topics"),
  };

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSyllabusSelect = (syllabusId: string) => {
    setSelectedSyllabus(syllabusId);
    setActiveSyllabus(syllabusId);
    onSelectSyllabus?.(syllabusId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSyllabusFile(file);
      onUpload?.(file);

      // Auto-close after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleRemoveSyllabus = (syllabusId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedSyllabus === syllabusId) {
      setSelectedSyllabus("");
      setActiveSyllabus("");
    }
    // In a real app, you would call an API to remove the syllabus
    console.log("Removing syllabus:", syllabusId);
  };

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText className="w-5 h-5" />;

    if (fileName.endsWith(".pdf"))
      return <FileText className="w-5 h-5 text-red-500" />;
    if (fileName.endsWith(".docx") || fileName.endsWith(".doc"))
      return <FileText className="w-5 h-5 text-blue-500" />;

    return <FileText className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-[#111111] border-l dark:border-[#2a2a2a] p-6 z-50">
        <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 mb-6 rounded animate-pulse"></div>
        <div className="space-y-3">
          <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-[#111111] border-l dark:border-[#2a2a2a] p-6 z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {sidebarText.teachersSyllabus}
            </h2>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {sidebarText.syllabus}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {sidebarText.syllabusDescription}
        </p>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Upload Section */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {sidebarText.uploadSyllabus}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {sidebarText.fileTypes}
            </p>

            {/* File Upload Area */}
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-3" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {sidebarText.clickToUpload}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {sidebarText.dragAndDrop}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {sidebarText.maxFileSize}
                  </p>
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
            </label>

            {/* Selected File Preview */}
            {syllabusFile && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                <div className="flex items-center gap-3">
                  {getFileIcon(syllabusFile.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {syllabusFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(syllabusFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  {currentLang === "si"
                    ? "ගොනුව සාර්ථකව උඩුගත කරන ලදී"
                    : "File uploaded successfully"}
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t dark:border-gray-700 my-6"></div>

          {/* Uploaded Syllabi Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              {sidebarText.uploadedSyllabi}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {sidebarText.selectSyllabus}
            </p>

            <div className="space-y-4">
              {uploadedSyllabi.map((syllabus) => (
                <div
                  key={syllabus.id}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    selectedSyllabus === syllabus.id
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                  onClick={() => handleSyllabusSelect(syllabus.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div
                          className={`w-4 h-4 rounded border ${
                            selectedSyllabus === syllabus.id
                              ? "bg-blue-500 dark:bg-blue-400 border-blue-500 dark:border-blue-400"
                              : "border-gray-400 dark:border-gray-500"
                          }`}
                        >
                          {selectedSyllabus === syllabus.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-gray-200">
                          {currentLang === "si"
                            ? syllabus.title_si
                            : syllabus.title}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                            {currentLang === "si"
                              ? syllabus.subject_si
                              : syllabus.subject}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                            {currentLang === "si"
                              ? syllabus.grade_si
                              : syllabus.grade}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemoveSyllabus(syllabus.id, e)}
                      className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title={sidebarText.remove}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Syllabus Details */}
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center text-sm">
                      <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {sidebarText.uploaded}:{" "}
                        <span className="text-gray-800 dark:text-gray-300">
                          {currentLang === "si"
                            ? syllabus.uploadedDate_si
                            : syllabus.uploadedDate}
                        </span>
                      </span>
                    </div>

                    {/* Topics */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {sidebarText.topics}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(currentLang === "si"
                          ? syllabus.topics_si
                          : syllabus.topics
                        ).map((topic, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Level Section (if no syllabus selected) */}
          {!selectedSyllabus && (
            <>
              <div className="border-t dark:border-gray-700 my-6"></div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {sidebarText.responseLevel}
                </h4>
                <div className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {currentLang === "si"
                      ? "පාඨමාලාවක් තෝරා නොමැති විට, පිළිතුරු පොදු දැනුම මත පදනම් වේ"
                      : "When no syllabus is selected, responses are based on general knowledge"}
                  </p>
                  <button className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    {sidebarText.askAGuest}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t dark:border-gray-700">
          {/* Current Syllabus Status */}
          {activeSyllabus && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {sidebarText.currentSyllabus}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {
                      uploadedSyllabi.find((s) => s.id === activeSyllabus)
                        ?.title
                    }
                  </p>
                </div>
                <button
                  onClick={() => setActiveSyllabus("")}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {sidebarText.change}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (selectedSyllabus) {
                setActiveSyllabus(selectedSyllabus);
                setTimeout(() => onClose(), 300);
              }
            }}
            disabled={!selectedSyllabus}
            className={`w-full py-3 font-medium rounded-lg transition ${
              selectedSyllabus
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer"
                : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            {selectedSyllabus
              ? sidebarText.applySyllabus
              : sidebarText.noSyllabusSelected}
          </button>

          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedSyllabus
                ? sidebarText.syllabusSelected
                : sidebarText.selectSyllabusToApply}
            </p>
            <button
              onClick={onClose}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {sidebarText.cancel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
