"use client";

import {
  Upload,
  X,
  Check,
  FileText,
  BookOpen,
  FileSpreadsheet,
  Edit,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type RubricSidebarProps = Readonly<{
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSelectRubric?: (rubricId: string) => void;
  onUpload?: (file: File, customRubric?: CustomRubricData) => void;
}>;

type Rubric = {
  id: string;
  title: string;
  title_si: string;
  type: "standard" | "custom";
  categories: Array<{
    name: string;
    name_si: string;
    percentage: number;
  }>;
  total: number;
};

type CustomRubricData = {
  title: string;
  title_si: string;
  categories: Array<{
    name: string;
    name_si: string;
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
  const { t, i18n } = useTranslation("common");
  const currentLang = i18n.language || "en";
  const [selectedRubric, setSelectedRubric] = useState<string>("");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [showCustomizationPopup, setShowCustomizationPopup] = useState(false);
  const [customRubricData, setCustomRubricData] = useState<CustomRubricData>({
    title: "",
    title_si: "",
    categories: [
      { name: "Content", name_si: "අන්තර්ගතය", percentage: 40 },
      { name: "Structure", name_si: "ව්‍යුහය", percentage: 30 },
      { name: "Language", name_si: "භාෂාව", percentage: 20 },
      { name: "Presentation", name_si: "ඉදිරිපත් කිරීම", percentage: 10 },
    ],
    total: 100,
  });
  const [uploadOption, setUploadOption] = useState<"asIs" | "customize">(
    "asIs"
  );

  // Get localized text
  const getText = (en: string, si: string) => (currentLang === "si" ? si : en);

  // Sample rubrics data
  const standardRubrics: Rubric[] = [
    {
      id: "science-essay",
      title: "Science Essay Rubric",
      title_si: "විද්‍යාත්මක රචනා ඇගයීම් මාපකය",
      type: "standard",
      categories: [
        { name: "Content", name_si: "අන්තර්ගතය", percentage: 40 },
        { name: "Clarity", name_si: "පැහැදිලිබව", percentage: 30 },
        { name: "Grammar", name_si: "ව්‍යාකරණය", percentage: 20 },
        { name: "Creativity", name_si: "අභිනවතාව", percentage: 10 },
      ],
      total: 100,
    },
    {
      id: "math-problem",
      title: "Math Problem Solving Rubric",
      title_si: "ගණිත ගැටලු විසඳුම් ඇගයීම් මාපකය",
      type: "standard",
      categories: [
        { name: "Method", name_si: "ක්‍රමය", percentage: 35 },
        { name: "Accuracy", name_si: "නිරවද්‍යතාව", percentage: 35 },
        { name: "Explanation", name_si: "පැහැදිලි කිරීම", percentage: 20 },
        { name: "Final Answer", name_si: "අවසාන පිළිතුර", percentage: 10 },
      ],
      total: 100,
    },
    {
      id: "general-essay",
      title: "General Essay Rubric",
      title_si: "සාමාන්‍ය රචනා ඇගයීම් මාපකය",
      type: "standard",
      categories: [
        { name: "Content", name_si: "අන්තර්ගතය", percentage: 40 },
        { name: "Structure", name_si: "ව්‍යුහය", percentage: 30 },
        { name: "Language", name_si: "භාෂාව", percentage: 20 },
        { name: "Presentation", name_si: "ඉදිරිපත් කිරීම", percentage: 10 },
      ],
      total: 100,
    },
  ];

  const savedRubrics: Rubric[] = [
    {
      id: "sinhala-essay",
      title: "Sinhala Essay Rubric",
      title_si: "සිංහල රචනා ඇගයීම් මාපකය",
      type: "custom",
      categories: [
        { name: "Content", name_si: "විෂය අන්තර්ගතය", percentage: 40 },
        { name: "Language Style", name_si: "වාග් විලාසය", percentage: 30 },
        { name: "Grammar", name_si: "ව්‍යාකරණය", percentage: 20 },
        { name: "Spelling", name_si: "අක්ෂර වින්‍යාසය", percentage: 10 },
      ],
      total: 100,
    },
  ];

  // Translation keys for sidebar
  const sidebarText = {
    actionTeachers: t("rubric.action_teachers", "Action Teachers"),
    selectRubric: t("rubric.select_rubric", "Select Rubric"),
    savedRubrics: t("rubric.saved_rubrics", "Saved Rubrics"),
    uploadCustomRubric: t(
      "rubric.upload_custom_rubric",
      "Upload Custom Rubric"
    ),
    fileTypes: t("rubric.file_types", "PDF, DOCX, or Excel"),
    upload: t("rubric.upload", "Upload"),
    standardRubrics: t("rubric.standard_rubrics", "Standard Rubrics"),
    customLabel: t("rubric.custom", "Custom"),
    total: t("rubric.total", "Total"),
    applySelectedRubric: t(
      "rubric.apply_selected_rubric",
      "Apply Selected Rubric"
    ),
    rubricSelected: t("rubric.rubric_selected", "Rubric selected"),
    selectRubricToApply: t(
      "rubric.select_rubric_to_apply",
      "Select a rubric to apply"
    ),
    viewGuidelines: t("rubric.view_guidelines", "View rubric guidelines"),
    dragAndDrop: t("rubric.drag_and_drop", "or drag and drop"),
    maxFileSize: t("rubric.max_file_size", "Max file size: 10MB"),
    recentUploads: t("rubric.recent_uploads", "Recent Uploads"),
    use: t("rubric.use", "Use"),
    uploaded: t("rubric.uploaded", "Uploaded"),
    daysAgo: t("rubric.days_ago", "days ago"),
    needHelp: t("rubric.need_help", "Need help?"),
    customizeRubric: t("rubric.customize_rubric", "Customize Rubric"),
    uploadAsIs: t("rubric.upload_as_is", "Upload as-is"),
    customizeMarks: t("rubric.customize_marks", "Customize Marks"),
    rubricTitle: t("rubric.rubric_title", "Rubric Title"),
    titlePlaceholder: t("rubric.title_placeholder", "Enter rubric title"),
    categoryName: t("rubric.category_name", "Category Name"),
    percentage: t("rubric.percentage", "Percentage"),
    addCategory: t("rubric.add_category", "Add Category"),
    remove: t("rubric.remove", "Remove"),
    saveCustomization: t("rubric.save_customization", "Save Customization"),
    totalPercentage: t("rubric.total_percentage", "Total Percentage"),
    mustEqual100: t("rubric.must_equal_100", "Must equal 100%"),
    howToUpload: t("rubric.how_to_upload", "How would you like to upload?"),
    customizeDescription: t(
      "rubric.customize_description",
      "Adjust percentages and categories before saving"
    ),
    asIsDescription: t(
      "rubric.as_is_description",
      "Upload file without modifications"
    ),
    cancel: t("rubric.cancel", "Cancel"),
    proceed: t("rubric.proceed", "Proceed"),
    customize: t("rubric.customize", "Customize"),
  };

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (showCustomizationPopup) {
          setShowCustomizationPopup(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, showCustomizationPopup]);

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
    setTimeout(() => onClose(), 300);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);

      // Auto-fill title from filename (without extension)
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setCustomRubricData((prev) => ({
        ...prev,
        title: fileName,
        title_si: fileName,
      }));

      setShowCustomizationPopup(true);
    }
  };

  const handlePercentageChange = (index: number, value: number) => {
    const newCategories = [...customRubricData.categories];
    newCategories[index].percentage = Math.min(100, Math.max(0, value));

    const newTotal = newCategories.reduce(
      (sum, cat) => sum + cat.percentage,
      0
    );

    setCustomRubricData({
      ...customRubricData,
      categories: newCategories,
      total: newTotal,
    });
  };

  const handleCategoryNameChange = (index: number, value: string) => {
    const newCategories = [...customRubricData.categories];
    newCategories[index].name = value;
    setCustomRubricData({
      ...customRubricData,
      categories: newCategories,
    });
  };

  const addCategory = () => {
    const newCategory = {
      name: currentLang === "si" ? "නව කාණ්ඩය" : "New Category",
      name_si: "නව කාණ්ඩය",
      percentage: 0,
    };

    setCustomRubricData({
      ...customRubricData,
      categories: [...customRubricData.categories, newCategory],
    });
  };

  const removeCategory = (index: number) => {
    if (customRubricData.categories.length > 1) {
      const newCategories = customRubricData.categories.filter(
        (_, i) => i !== index
      );
      const newTotal = newCategories.reduce(
        (sum, cat) => sum + cat.percentage,
        0
      );

      setCustomRubricData({
        ...customRubricData,
        categories: newCategories,
        total: newTotal,
      });
    }
  };

  const handleUpload = () => {
    if (!customFile) return;

    if (uploadOption === "asIs") {
      // Upload without customization
      onUpload?.(customFile);
      setTimeout(() => onClose(), 300);
    } else {
      // Upload with customization
      onUpload?.(customFile, customRubricData);
      setTimeout(() => onClose(), 300);
    }

    setShowCustomizationPopup(false);
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

  const CustomizationPopup = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {sidebarText.customizeRubric}
            </h3>
            <button
              onClick={() => setShowCustomizationPopup(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {customFile?.name}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Upload Options */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {sidebarText.howToUpload}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUploadOption("asIs")}
                className={`p-4 rounded-xl border-2 transition ${
                  uploadOption === "asIs"
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {sidebarText.uploadAsIs}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {sidebarText.asIsDescription}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setUploadOption("customize")}
                className={`p-4 rounded-xl border-2 transition ${
                  uploadOption === "customize"
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <Edit className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {sidebarText.customizeMarks}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {sidebarText.customizeDescription}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Customization Form (only shown when customize option is selected) */}
          {uploadOption === "customize" && (
            <div className="space-y-4">
              {/* Rubric Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {sidebarText.rubricTitle}
                </label>
                <input
                  type="text"
                  value={
                    currentLang === "si"
                      ? customRubricData.title_si
                      : customRubricData.title
                  }
                  onChange={(e) => {
                    if (currentLang === "si") {
                      setCustomRubricData({
                        ...customRubricData,
                        title_si: e.target.value,
                      });
                    } else {
                      setCustomRubricData({
                        ...customRubricData,
                        title: e.target.value,
                      });
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder={sidebarText.titlePlaceholder}
                />
              </div>

              {/* Categories */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {sidebarText.customizeMarks}
                  </h4>
                  <button
                    onClick={addCategory}
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Plus className="w-4 h-4" />
                    {sidebarText.addCategory}
                  </button>
                </div>

                <div className="space-y-3">
                  {customRubricData.categories.map((category, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={
                          currentLang === "si"
                            ? category.name_si
                            : category.name
                        }
                        onChange={(e) =>
                          handleCategoryNameChange(index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-gray-200 text-sm"
                        placeholder={sidebarText.categoryName}
                      />
                      <div className="relative w-24">
                        <input
                          type="number"
                          value={category.percentage}
                          onChange={(e) =>
                            handlePercentageChange(
                              index,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-gray-200 text-sm text-right pr-7"
                          min="0"
                          max="100"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                          %
                        </span>
                      </div>
                      <button
                        onClick={() => removeCategory(index)}
                        disabled={customRubricData.categories.length <= 1}
                        className={`p-2 rounded-lg transition ${
                          customRubricData.categories.length <= 1
                            ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                            : "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total Percentage */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {sidebarText.totalPercentage}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          customRubricData.total === 100
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {customRubricData.total}%
                      </span>
                      {customRubricData.total !== 100 && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {sidebarText.mustEqual100}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={() => setShowCustomizationPopup(false)}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {sidebarText.cancel}
            </button>
            <button
              onClick={handleUpload}
              disabled={
                uploadOption === "customize" && customRubricData.total !== 100
              }
              className={`flex-1 py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                uploadOption === "customize" && customRubricData.total !== 100
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              }`}
            >
              {uploadOption === "customize" ? (
                <>
                  <Save className="w-4 h-4" />
                  {sidebarText.saveCustomization}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {sidebarText.upload}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

      {/* Customization Popup */}
      {showCustomizationPopup && <CustomizationPopup />}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-[#111111] border-l dark:border-[#2a2a2a] p-6 z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {sidebarText.actionTeachers}
            </h2>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {sidebarText.selectRubric}
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
              {sidebarText.savedRubrics}
            </h4>

            {/* Upload Custom Rubric Card */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 rounded"></div>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {sidebarText.uploadCustomRubric}
                  </span>
                </div>
                <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-9 mb-3">
                {sidebarText.fileTypes}
              </p>

              {/* File Upload Area */}
              <label className="block cursor-pointer">
                <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <div className="flex flex-col items-center">
                    <Upload className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {sidebarText.upload}
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
                  accept=".pdf,.docx,.doc,.xlsx,.xls"
                  onChange={handleFileSelect}
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCustomizationPopup(true)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition"
                        title={sidebarText.customize}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
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
                        {currentLang === "si" ? rubric.title_si : rubric.title}
                      </h5>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        {sidebarText.customLabel}
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
                        {currentLang === "si"
                          ? category.name_si
                          : category.name}
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                        {category.percentage}%
                      </span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {sidebarText.total}
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
              {sidebarText.standardRubrics}
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
                        {currentLang === "si" ? rubric.title_si : rubric.title}
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
                          {currentLang === "si"
                            ? category.name_si
                            : category.name}
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                          {category.percentage}%
                        </span>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {sidebarText.total}
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

          {/* Recent Uploads */}
          {customFile && (
            <div className="mt-8">
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-3">
                {sidebarText.recentUploads}
              </p>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(customFile.name)}
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                          {customFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {sidebarText.uploaded} 2 {sidebarText.daysAgo}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCustomizationPopup(true)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      {sidebarText.customize}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t dark:border-gray-700">
          <button
            onClick={() => {
              if (selectedRubric) {
                onClose();
              }
            }}
            disabled={!selectedRubric}
            className={`w-full py-3 font-medium rounded-lg transition ${
              selectedRubric
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer"
                : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            {sidebarText.applySelectedRubric}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            {selectedRubric
              ? sidebarText.rubricSelected
              : sidebarText.selectRubricToApply}
          </p>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <a
              href="#"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm block text-center"
            >
              {sidebarText.viewGuidelines}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
