"use client";

import {
  X,
  Check,
  BookOpen,
  Edit,
  Plus,
  Trash2,
  Save,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  setSelectedRubric,
  getSelectedRubric,
  getCustomRubrics,
  addCustomRubric,
  type StoredRubric,
} from "@/lib/localStore"; // Adjust the import path as needed

type RubricSidebarProps = Readonly<{
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSelectRubric?: (rubricId: string) => void;
  onUpload?: (customRubric?: CustomRubricData) => void;
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
  const [selectedRubric, setSelectedRubricState] = useState<string>("");
  const [showCustomizationPopup, setShowCustomizationPopup] = useState(false);
  const [customRubricData, setCustomRubricData] = useState<CustomRubricData>({
    title: t("rubric.balanced_evaluation", "Balanced Evaluation"),
    title_si: t("rubric.balanced_evaluation", "Balanced Evaluation"),
    categories: [
      { name: "Semantic", name_si: "අර්ථ පදනම්", percentage: 40 },
      { name: "Coverage", name_si: "විෂය ආවරණය", percentage: 30 },
      { name: "Relevance", name_si: "අදාළත්වය", percentage: 30 },
    ],
    total: 100,
  });

  // Load previously selected rubric on component mount
  useEffect(() => {
    const storedRubric = getSelectedRubric();
    if (storedRubric) {
      setSelectedRubricState(storedRubric.id);
    }

    // Load saved custom rubrics from localStorage
    const savedCustomRubrics = getCustomRubrics();
    // You might want to update the savedRubrics state with these
    console.log("Loaded custom rubrics:", savedCustomRubrics);
  }, []);

  // Get localized text
  const getText = (en: string, si: string) => (currentLang === "si" ? si : en);

  // Sample rubrics data
  const standardRubrics: Rubric[] = [
    {
      id: "balanced",
      title: t("rubric.balanced_evaluation", "Balanced Evaluation"),
      title_si: t("rubric.balanced_evaluation", "Balanced Evaluation"),
      type: "standard",
      categories: [
        { name: "Semantic", name_si: "අර්ථ පදනම්", percentage: 40 },
        { name: "Coverage", name_si: "විෂය ආවරණය", percentage: 30 },
        { name: "Relevance", name_si: "අදාළත්වය", percentage: 30 },
      ],
      total: 100,
    },
    {
      id: "understanding_focused",
      title: t("rubric.understanding_focused", "Understanding Focused"),
      title_si: t("rubric.understanding_focused", "Understanding Focused"),
      type: "standard",
      categories: [
        { name: "Semantic", name_si: "අර්ථ පදනම්", percentage: 60 },
        { name: "Coverage", name_si: "විෂය ආවරණය", percentage: 20 },
        { name: "Relevance", name_si: "අදාළත්වය", percentage: 20 },
      ],
      total: 100,
    },
    {
      id: "content_focused",
      title: t("rubric.content_focused", "Content Focused"),
      title_si: t("rubric.content_focused", "Content Focused"),
      type: "standard",
      categories: [
        { name: "Semantic", name_si: "අර්ථ පදනම්", percentage: 30 },
        { name: "Coverage", name_si: "විෂය ආවරණය", percentage: 50 },
        { name: "Relevance", name_si: "අදාළත්වය", percentage: 20 },
      ],
      total: 100,
    },
    {
      id: "advanced",
      title: t("rubric.advanced_evaluation", "Advanced Evaluation"),
      title_si: t("rubric.advanced_evaluation", "Advanced Evaluation"),
      type: "standard",
      categories: [
        { name: "Semantic", name_si: "අර්ථ පදනම්", percentage: 35 },
        { name: "Coverage", name_si: "විෂය ආවරණය", percentage: 25 },
        { name: "Relevance", name_si: "අදාළත්වය", percentage: 20 },
        { name: "Structure", name_si: "ව්‍යුහය", percentage: 10 },
        { name: "Examples", name_si: "උදාහරණ", percentage: 10 },
      ],
      total: 100,
    },
  ];

  // Initialize saved rubrics with data from localStorage
  const [savedRubrics, setSavedRubrics] = useState<Rubric[]>([
    {
      id: "custom-1",
      title: t("rubric.custom_rubric", "Custom Rubric"),
      title_si: t("rubric.custom_rubric", "Custom Rubric"),
      type: "custom",
      categories: [
        { name: "Semantic", name_si: "අර්ථ පදනම්", percentage: 40 },
        { name: "Coverage", name_si: "විෂය ආවරණය", percentage: 30 },
        { name: "Relevance", name_si: "අදාළත්වය", percentage: 30 },
      ],
      total: 100,
    },
  ]);

  // Translation keys for sidebar
  const sidebarText = {
    selectRubric: t("rubric.select_rubric", "Select Rubric"),
    savedRubrics: t("rubric.saved_rubrics", "Saved Rubrics"),
    createCustomRubric: t(
      "rubric.create_custom_rubric",
      "Create Custom Rubric"
    ),
    customizeRubric: t("rubric.customize_rubric", "Customize Rubric"),
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
    customizeMarks: t("rubric.customize_marks", "Customize Marks"),
    rubricTitle: t("rubric.rubric_title", "Rubric Title"),
    titlePlaceholder: t("rubric.title_placeholder", "Enter rubric title"),
    categoryName: t("rubric.category_name", "Category Name"),
    percentage: t("rubric.percentage", "Percentage"),
    remove: t("rubric.remove", "Remove"),
    saveCustomization: t("rubric.save_customization", "Save Customization"),
    totalPercentage: t("rubric.total_percentage", "Total Percentage"),
    mustEqual100: t("rubric.must_equal_100", "Must equal 100%"),
    howToCreate: t("rubric.how_to_create", "Create Custom Rubric"),
    cancel: t("rubric.cancel", "Cancel"),
    proceed: t("rubric.proceed", "Proceed"),
    customize: t("rubric.customize", "Customize"),
    createNew: t("rubric.create_new", "Create New Rubric"),
    balanced_evaluation: t("rubric.balanced_evaluation", "Balanced Evaluation"),
    understanding_focused: t(
      "rubric.understanding_focused",
      "Understanding Focused"
    ),
    content_focused: t("rubric.content_focused", "Content Focused"),
    advanced_evaluation: t("rubric.advanced_evaluation", "Advanced Evaluation"),
    custom_rubric: t("rubric.custom_rubric", "Custom Rubric"),
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
    // Toggle selection: if already selected, deselect it
    const newSelection = selectedRubric === rubricId ? "" : rubricId;
    setSelectedRubricState(newSelection);
    onSelectRubric?.(newSelection);
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

  const handleCreateCustomRubric = () => {
    // Generate a unique ID for the custom rubric
    const customRubricId = `custom-${Date.now()}`;

    // Create the rubric object
    const newCustomRubric: Omit<StoredRubric, "selectedAt"> = {
      id: customRubricId,
      title: customRubricData.title,
      title_si: customRubricData.title_si,
      type: "custom",
      categories: customRubricData.categories,
      total: customRubricData.total,
    };

    // Save to localStorage
    const savedRubric = addCustomRubric(newCustomRubric);

    // Update the saved rubrics list in state
    const rubricForState: Rubric = {
      id: savedRubric.id,
      title: savedRubric.title,
      title_si: savedRubric.title_si,
      type: savedRubric.type,
      categories: savedRubric.categories,
      total: savedRubric.total,
    };

    setSavedRubrics((prev) => [...prev, rubricForState]);

    // Call the onUpload callback if provided
    onUpload?.(customRubricData);

    setTimeout(() => onClose(), 300);
    setShowCustomizationPopup(false);
  };

  const resetCustomRubricData = () => {
    setCustomRubricData({
      title: t("rubric.balanced_evaluation", "Balanced Evaluation"),
      title_si: t("rubric.balanced_evaluation", "Balanced Evaluation"),
      categories: [
        { name: "Semantic", name_si: "අර්ථ පදනම්", percentage: 40 },
        { name: "Coverage", name_si: "විෂය ආවරණය", percentage: 30 },
        { name: "Relevance", name_si: "අදාළත්වය", percentage: 30 },
      ],
      total: 100,
    });
  };

  const handleApplySelectedRubric = () => {
    if (!selectedRubric) return;

    // Find the selected rubric from all available rubrics
    const allRubrics = [...standardRubrics, ...savedRubrics];
    const selectedRubricData = allRubrics.find((r) => r.id === selectedRubric);

    if (selectedRubricData) {
      // Convert to StoredRubric format and save to localStorage
      const rubricToStore: Omit<StoredRubric, "selectedAt"> = {
        id: selectedRubricData.id,
        title: selectedRubricData.title,
        title_si: selectedRubricData.title_si,
        type: selectedRubricData.type,
        categories: selectedRubricData.categories,
        total: selectedRubricData.total,
      };

      // Save to localStorage
      setSelectedRubric({
        ...rubricToStore,
        selectedAt: new Date().toISOString(),
      });

      console.log("Rubric saved to localStorage:", rubricToStore);
    }

    // Close the sidebar
    onClose();
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
              onClick={() => {
                setShowCustomizationPopup(false);
                resetCustomRubricData();
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {sidebarText.howToCreate}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
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
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {sidebarText.customizeMarks}
              </h4>

              <div className="space-y-3">
                {customRubricData.categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={
                        currentLang === "si" ? category.name_si : category.name
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
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCustomizationPopup(false);
                resetCustomRubricData();
              }}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {sidebarText.cancel}
            </button>
            <button
              onClick={handleCreateCustomRubric}
              disabled={customRubricData.total !== 100}
              className={`flex-1 py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                customRubricData.total !== 100
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              }`}
            >
              <Save className="w-4 h-4" />
              {sidebarText.saveCustomization}
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
      {/* Backdrop - REMOVED onClick handler to prevent closing on backdrop click */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
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

            {/* Create Custom Rubric Card */}
            <div className="mb-6">
              <button
                onClick={() => setShowCustomizationPopup(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {sidebarText.createCustomRubric}
                    </span>
                  </div>
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">
                  {sidebarText.customizeMarks}
                </p>
              </button>
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
        </div>

        {/* Footer */}
        <div className="pt-6 border-t dark:border-gray-700">
          <button
            onClick={handleApplySelectedRubric}
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
        </div>
      </div>
    </>
  );
}
