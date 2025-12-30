"use client";

import { X, Check, BookOpen, Plus, Trash2, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  setSelectedRubric,
  getSelectedRubric,
  type StoredRubric,
} from "@/lib/localStore";
import { useToast } from "@/components/ui/Toast";
import {
  listRubricsWithCriteria,
  createCustomRubric,
  type Rubric as BackendRubric,
} from "@/lib/api/rubric";

type RubricSidebarProps = Readonly<{
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSelectRubric?: (rubricId: string) => void;
  onUpload?: (customRubric?: CustomRubricData) => void;
  onRubricApplied?: (rubric: StoredRubric) => void;
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

type CustomRubricData = {
  title: string;
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
  onRubricApplied,
}: RubricSidebarProps) {
  const { t } = useTranslation("common");
  const { showToast } = useToast();
  const [selectedRubric, setSelectedRubricState] = useState<string>("");
  const [showCustomizationPopup, setShowCustomizationPopup] = useState(false);
  const [isLoadingRubrics, setIsLoadingRubrics] = useState(false);
  const [systemRubrics, setSystemRubrics] = useState<Rubric[]>([]);
  const [userRubrics, setUserRubrics] = useState<Rubric[]>([]);
  const [customRubricData, setCustomRubricData] = useState<CustomRubricData>({
    title: t("rubric.balanced_evaluation", "Balanced Evaluation"),
    categories: [
      { name: t("rubric.name_semantic", "Semantic"), percentage: 40 },
      { name: t("rubric.name_coverage", "Coverage"), percentage: 30 },
      { name: t("rubric.name_relevance", "Relevance"), percentage: 30 },
    ],
    total: 100,
  });

  // Map criterion names to translation keys
  const getCriterionName = (criterion: string): string => {
    const criterionMap: Record<string, string> = {
      Semantic: t("rubric.name_semantic", "Semantic"),
      Coverage: t("rubric.name_coverage", "Coverage"),
      Relevance: t("rubric.name_relevance", "Relevance"),
    };
    return criterionMap[criterion] || criterion;
  };

  // Reverse map: translated names back to English criterion names
  const getEnglishCriterionName = (translatedName: string): string => {
    const englishNames = [
      {
        translated: t("rubric.name_semantic", "Semantic"),
        english: "Semantic",
      },
      {
        translated: t("rubric.name_coverage", "Coverage"),
        english: "Coverage",
      },
      {
        translated: t("rubric.name_relevance", "Relevance"),
        english: "Relevance",
      },
    ];

    const found = englishNames.find(
      (item) => item.translated === translatedName
    );
    return found ? found.english : translatedName;
  };

  // Convert backend rubric to component rubric format
  const convertBackendRubric = (rubric: BackendRubric): Rubric => ({
    id: rubric.id,
    title: rubric.name,
    type: rubric.rubric_type === "system" ? "standard" : "custom",
    categories: rubric.criteria.map((c) => ({
      name: getCriterionName(c.criterion),
      percentage: c.weight_percentage,
    })),
    total: rubric.criteria.reduce((sum, c) => sum + c.weight_percentage, 0),
  });

  // Load rubrics from backend
  useEffect(() => {
    const loadRubrics = async () => {
      setIsLoadingRubrics(true);
      try {
        const backendRubrics = await listRubricsWithCriteria();

        const system = backendRubrics
          .filter((r) => r.rubric_type === "system")
          .map(convertBackendRubric);

        const user = backendRubrics
          .filter((r) => r.rubric_type === "custom")
          .map(convertBackendRubric);

        setSystemRubrics(system);
        setUserRubrics(user);
      } catch (error) {
        console.error("Failed to load rubrics", error);
        showToast(
          t("rubric.error"),
          "Failed to load rubrics from server",
          "error"
        );
      } finally {
        setIsLoadingRubrics(false);
      }
    };

    if (isOpen) {
      loadRubrics();
    }
  }, [isOpen, t, showToast]);

  // Load previously selected rubric on component mount
  useEffect(() => {
    const storedRubric = getSelectedRubric();
    if (storedRubric) {
      setSelectedRubricState(storedRubric.id);
    }
  }, []);

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

  const handleCreateCustomRubric = async () => {
    try {
      // Prepare payload for backend - convert translated names to English
      const payload = {
        name: customRubricData.title,
        description: `Custom rubric created by user`,
        criteria: customRubricData.categories.map((cat) => ({
          criterion: getEnglishCriterionName(cat.name),
          weight_percentage: cat.percentage,
        })),
      };

      // Call backend API
      const newRubric = await createCustomRubric(payload);

      // Convert to component format and add to userRubrics
      const rubricForState = convertBackendRubric(newRubric);
      setUserRubrics((prev) => [...prev, rubricForState]);

      // Call the onUpload callback if provided
      onUpload?.(customRubricData);

      // Show success toast
      showToast(
        t("rubric.success"),
        t("rubric.custom_rubric_created"),
        "success"
      );

      setShowCustomizationPopup(false);
      resetCustomRubricData();
    } catch (error) {
      console.error("Failed to create custom rubric", error);
      showToast(t("rubric.error"), t("rubric.custom_rubric_failed"), "error");
    }
  };

  const resetCustomRubricData = () => {
    setCustomRubricData({
      title: t("rubric.balanced_evaluation", "Balanced Evaluation"),
      categories: [
        { name: t("rubric.name_semantic", "Semantic"), percentage: 40 },
        { name: t("rubric.name_coverage", "Coverage"), percentage: 30 },
        { name: t("rubric.name_relevance", "Relevance"), percentage: 30 },
      ],
      total: 100,
    });
  };

  const handleApplySelectedRubric = () => {
    if (!selectedRubric) {
      // Show error toast if no rubric selected
      showToast(t("rubric.error"), t("rubric.select_a_rubric_first"), "error");
      return;
    }

    // Find the selected rubric from all available rubrics
    const allRubrics = [...systemRubrics, ...userRubrics];
    const selectedRubricData = allRubrics.find((r) => r.id === selectedRubric);

    if (selectedRubricData) {
      // Convert to StoredRubric format and save to localStorage
      const rubricToStore: Omit<StoredRubric, "selectedAt"> = {
        id: selectedRubricData.id,
        title: selectedRubricData.title,
        type: selectedRubricData.type,
        categories: selectedRubricData.categories,
        total: selectedRubricData.total,
      };

      // Save to localStorage and notify parent
      const storedRubric: StoredRubric = {
        ...rubricToStore,
        selectedAt: new Date().toISOString(),
      };

      setSelectedRubric(storedRubric);
      onRubricApplied?.(storedRubric);

      // Show success toast
      showToast(
        t("rubric.success"),
        t("rubric.rubric_applied_successfully"),
        "success"
      );

      console.log("Rubric saved to localStorage:", rubricToStore);
    } else {
      // Show error toast if rubric not found
      showToast(t("rubric.error"), t("rubric.rubric_not_found"), "error");
    }

    // Close the sidebar
    setTimeout(() => onClose(), 500);
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
                value={customRubricData.title}
                onChange={(e) => {
                  setCustomRubricData({
                    ...customRubricData,
                    title: e.target.value,
                  });
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
                    {/* Category Name - Read-only */}
                    <div className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#2A2A2A] text-gray-900 dark:text-gray-200 text-sm flex items-center">
                      {category.name}
                    </div>

                    {/* Percentage Input */}
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

                    {/* Remove button - only show if there's more than one category */}
                    {customRubricData.categories.length > 1 && (
                      <button
                        onClick={() => removeCategory(index)}
                        className="p-2 rounded-lg transition text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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

  if (loading || isLoadingRubrics) {
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
      {/* Customization Popup */}
      {showCustomizationPopup && <CustomizationPopup />}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full
      w-[85vw] sm:w-[380px] md:w-[400px]
      bg-white dark:bg-[#111111]
      border-l border-gray-200 dark:border-[#2a2a2a]
      z-30 flex flex-col p-0
      transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header (FIXED) */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              {sidebarText.selectRubric}
            </h3>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content (ONLY THIS SCROLLS) */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar p-4 sm:p-6">
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
            {userRubrics.map((rubric) => (
              <div
                key={rubric.id}
                onClick={() => handleRubricSelect(rubric.id)}
                className={`mb-4 p-4 rounded-lg border cursor-pointer transition ${
                  selectedRubric === rubric.id
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
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
          <div className="border-t dark:border-gray-700 my-6" />

          {/* Standard Rubrics Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              {sidebarText.standardRubrics}
            </h4>

            <div className="space-y-4">
              {systemRubrics.map((rubric) => (
                <div
                  key={rubric.id}
                  onClick={() => handleRubricSelect(rubric.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    selectedRubric === rubric.id
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
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

        {/* Footer (FIXED) */}
        <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a]">
          <button
            onClick={handleApplySelectedRubric}
            disabled={!selectedRubric}
            className={`w-full py-3 font-medium rounded-lg transition ${
              selectedRubric
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
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
