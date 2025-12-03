"use client";

import {
  Upload,
  X,
  Check,
  FileText,
  BookOpen,
  FileSpreadsheet,
} from "lucide-react";
import { useEffect, useState } from "react";

type RubricSidebarProps = Readonly<{
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSelectRubric?: (rubricId: string) => void;
  onUpload?: () => void;
}>;

type Rubric = {
  id: string;
  title: string;
  type: "standard" | "custom";
  categories: Array<{
    name: string;
    percentage: number;
  }>;
  total: number;
};

export default function RubricSidebar({
  isOpen,
  loading = false,
  onClose,
  onSelectRubric,
  onUpload,
}: RubricSidebarProps) {
  const [selectedRubric, setSelectedRubric] = useState<string>("");
  const [customFile, setCustomFile] = useState<File | null>(null);

  // Sample rubrics data
  const standardRubrics: Rubric[] = [
    {
      id: "science-essay",
      title: "Science Essay Rubric",
      type: "standard",
      categories: [
        { name: "Content", percentage: 40 },
        { name: "Clarity", percentage: 30 },
        { name: "Grammar", percentage: 20 },
        { name: "Creativity", percentage: 10 },
      ],
      total: 100,
    },
    {
      id: "math-problem",
      title: "Math Problem Solving Rubric",
      type: "standard",
      categories: [
        { name: "Method", percentage: 35 },
        { name: "Accuracy", percentage: 35 },
        { name: "Explanation", percentage: 20 },
        { name: "Final Answer", percentage: 10 },
      ],
      total: 100,
    },
    {
      id: "general-essay",
      title: "General Essay Rubric",
      type: "standard",
      categories: [
        { name: "Content", percentage: 40 },
        { name: "Structure", percentage: 30 },
        { name: "Language", percentage: 20 },
        { name: "Presentation", percentage: 10 },
      ],
      total: 100,
    },
  ];

  const savedRubrics: Rubric[] = [
    {
      id: "sinhala-essay",
      title: "Sinhala Essay Rubric",
      type: "custom",
      categories: [
        { name: "විෂය අන්තර්ගතය", percentage: 40 },
        { name: "වාග් විලාසය", percentage: 30 },
        { name: "ව්‍යාකරණය", percentage: 20 },
        { name: "අක්ෂර වින්‍යාසය", percentage: 10 },
      ],
      total: 100,
    },
  ];

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

  const handleRubricSelect = (rubricId: string) => {
    setSelectedRubric(rubricId);
    onSelectRubric?.(rubricId);
    // Auto-close after selection
    setTimeout(() => onClose(), 300);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      onUpload?.();
      // Auto-close after upload
      setTimeout(() => onClose(), 300);
    }
  };

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText className="w-5 h-5" />;

    if (fileName.endsWith(".pdf"))
      return <FileText className="w-5 h-5 text-red-500" />;
    if (fileName.endsWith(".docx") || fileName.endsWith(".doc"))
      return <FileText className="w-5 h-5 text-blue-500" />;
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls"))
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;

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
              Action Teachers
            </h2>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Select Rubric
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Saved Rubrics Section */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Saved Rubrics
            </h4>

            {/* Upload Custom Rubric Card */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 rounded"></div>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Upload Custom Rubric
                  </span>
                </div>
                <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-9 mb-3">
                PDF, DOCX, or Excel
              </p>

              {/* File Upload Area */}
              <label className="block cursor-pointer">
                <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <div className="flex flex-col items-center">
                    <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Upload
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Selected File Preview */}
              {customFile && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center gap-3">
                    {getFileIcon(customFile.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {customFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(customFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Saved Rubrics List */}
            {savedRubrics.map((rubric) => (
              <div
                key={rubric.id}
                className={`mb-4 p-4 rounded-lg border cursor-pointer transition ${
                  selectedRubric === rubric.id
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
                onClick={() => handleRubricSelect(rubric.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div
                        className={`w-4 h-4 rounded border ${
                          selectedRubric === rubric.id
                            ? "bg-blue-500 dark:bg-blue-400 border-blue-500 dark:border-blue-400"
                            : "border-gray-400 dark:border-gray-500"
                        }`}
                      >
                        {selectedRubric === rubric.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">
                        {rubric.title}
                      </h5>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        Custom
                      </span>
                    </div>
                  </div>
                  <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>

                {/* Categories */}
                <div className="ml-8 space-y-2">
                  {rubric.categories.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category.name}
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                        {category.percentage}%
                      </span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Total
                    </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {rubric.total}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t dark:border-gray-700 my-6"></div>

          {/* Standard Rubrics Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Standard Rubrics
            </h4>

            <div className="space-y-4">
              {standardRubrics.map((rubric) => (
                <div
                  key={rubric.id}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    selectedRubric === rubric.id
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                  onClick={() => handleRubricSelect(rubric.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div
                          className={`w-4 h-4 rounded border ${
                            selectedRubric === rubric.id
                              ? "bg-blue-500 dark:bg-blue-400 border-blue-500 dark:border-blue-400"
                              : "border-gray-400 dark:border-gray-500"
                          }`}
                        >
                          {selectedRubric === rubric.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">
                        {rubric.title}
                      </h5>
                    </div>
                    <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>

                  {/* Categories */}
                  <div className="ml-8 space-y-2">
                    {rubric.categories.map((category, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {category.name}
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                          {category.percentage}%
                        </span>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        Total
                      </span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {rubric.total}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition"
          >
            Apply Selected Rubric
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            {selectedRubric ? "Rubric selected" : "Select a rubric to apply"}
          </p>
        </div>
      </div>
    </>
  );
}
