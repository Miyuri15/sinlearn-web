"use client";

import { X, Check, BookOpen, Plus, Save } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
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

// --- Constants (Defined outside to prevent memory churn) ---
// These IDs match what the Backend expects.
// The 'i18nKey' maps to your en.json/sin.json translation files.
const CRITERIA_CONFIG = [
  { id: "Semantic", i18nKey: "rubric.name_semantic", defaultWeight: 40 },
  { id: "Coverage", i18nKey: "rubric.name_coverage", defaultWeight: 30 },
  { id: "Relevance", i18nKey: "rubric.name_relevance", defaultWeight: 30 },
] as const;

// --- Types ---
type RubricSidebarProps = Readonly<{
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSelectRubric?: (rubricId: string) => void;
  onUpload?: (customRubric: any) => void;
  onRubricApplied?: (rubric: StoredRubric) => void;
}>;

type Rubric = {
  id: string;
  title: string; // Display title (Translated for system, raw for custom)
  isSystem: boolean;
  // We keep English keys here for logic, translated names are for display only
  categories: Array<{ id: string; percentage: number }>;
  total: number;
};

// --- Sub-Component: RubricCustomizer ---
// PERFORMANCE FIX: Isolated component prevents Sidebar re-renders while typing
const RubricCustomizer = ({
  onClose,
  onSave,
  t,
}: {
  onClose: () => void;
  onSave: (title: string, weights: Record<string, number>) => void;
  t: any;
}) => {
  const [title, setTitle] = useState(
    t("rubric.balanced_evaluation", "Balanced Evaluation")
  );

  // State uses Stable English IDs as keys: { "Semantic": 40, "Coverage": 30 ... }
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    CRITERIA_CONFIG.forEach((c) => (initial[c.id] = c.defaultWeight));
    return initial;
  });

  const total = useMemo(
    () => Object.values(weights).reduce((sum, val) => sum + val, 0),
    [weights]
  );

  const handleWeightChange = (id: string, val: number) => {
    setWeights((prev) => ({ ...prev, [id]: Math.min(100, Math.max(0, val)) }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] rounded-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {t("rubric.customize_rubric", "Customize Rubric")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t(
                "rubric.adjust_percentages",
                "Adjust weights for the 3 criteria"
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("rubric.rubric_title", "Rubric Title")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-gray-200"
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("rubric.customize_marks", "Customize Marks")}
            </h4>

            {/* Render Fixed 3 Categories */}
            {CRITERIA_CONFIG.map((config) => (
              <div key={config.id} className="flex items-center gap-4">
                {/* TRANSLATION FIX: We translate the label here, but keep ID for state */}
                <div className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-gray-200 text-sm font-medium">
                  {t(config.i18nKey)}
                </div>

                <div className="relative w-28">
                  <input
                    type="number"
                    value={weights[config.id]}
                    onChange={(e) =>
                      handleWeightChange(
                        config.id,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-gray-200 text-sm text-right pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {t("rubric.total_percentage", "Total Percentage")}
            </span>
            <div className="text-right">
              <span
                className={`text-xl font-bold ${
                  total === 100 ? "text-green-600" : "text-red-500"
                }`}
              >
                {total}%
              </span>
              {total !== 100 && (
                <p className="text-xs text-red-500">
                  {t("rubric.must_equal_100", "Must equal 100%")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("rubric.cancel", "Cancel")}
          </button>
          <button
            onClick={() => onSave(title, weights)}
            disabled={total !== 100}
            className={`flex-1 py-3 rounded-lg flex justify-center items-center gap-2 font-medium ${
              total !== 100
                ? "bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Save className="w-4 h-4" />
            {t("rubric.save_customization", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
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

  const [selectedRubricId, setSelectedRubricId] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);
  const [rubrics, setRubrics] = useState<{
    system: Rubric[];
    custom: Rubric[];
  }>({ system: [], custom: [] });
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Get Translated Name for Display
  const getLocalizedName = useCallback(
    (englishId: string) => {
      const config = CRITERIA_CONFIG.find((c) => c.id === englishId);
      return config ? t(config.i18nKey) : englishId;
    },
    [t]
  );

  // Load previously selected rubric when sidebar opens
  useEffect(() => {
    if (isOpen) {
      const storedRubric = getSelectedRubric();
      if (storedRubric) {
        setSelectedRubricId(storedRubric.id);
      }
    }
  }, [isOpen]);

  // Load Rubrics
  useEffect(() => {
    if (isOpen) {
      const fetchRubrics = async () => {
        setIsLoading(true);
        try {
          const data = await listRubricsWithCriteria();

          const processRubric = (r: BackendRubric): Rubric => ({
            id: r.id,
            title: r.name, // NOTE: If system rubric, this might need translation mapping too
            isSystem: r.rubric_type === "system",
            categories: r.criteria.map((c) => ({
              id: c.criterion, // Keep English ID (e.g., "Semantic")
              percentage: c.weight_percentage,
            })),
            total: r.criteria.reduce((s, c) => s + c.weight_percentage, 0),
          });

          setRubrics({
            system: data
              .filter((r) => r.rubric_type === "system")
              .map(processRubric),
            custom: data
              .filter((r) => r.rubric_type === "custom")
              .map(processRubric),
          });
        } catch {
          showToast(t("rubric.error"), "Failed to load rubrics", "error");
        } finally {
          setIsLoading(false);
        }
      };
      fetchRubrics();
    }
  }, [isOpen, t]);

  // Handle Save from Popup
  const handleSaveCustomRubric = async (
    title: string,
    weights: Record<string, number>
  ) => {
    try {
      if (!title.trim()) return;

      // TRANSLATION FIX: We send English IDs to backend
      const payload = {
        name: title,
        description: "Custom rubric",
        criteria: Object.entries(weights).map(([id, weight]) => ({
          criterion: id, // Sends "Semantic", NOT "අර්ථය"
          weight_percentage: weight,
        })),
      };

      const newRubricRaw = await createCustomRubric(payload);

      const newRubric: Rubric = {
        id: newRubricRaw.id,
        title: newRubricRaw.name,
        isSystem: false,
        categories: newRubricRaw.criteria.map((c) => ({
          id: c.criterion,
          percentage: c.weight_percentage,
        })),
        total: 100,
      };

      setRubrics((prev) => ({ ...prev, custom: [...prev.custom, newRubric] }));
      onUpload?.(payload as any);
      showToast(
        t("rubric.success"),
        t("rubric.custom_rubric_created"),
        "success"
      );
      setShowPopup(false);
    } catch (error) {
      showToast(t("rubric.error"), t("rubric.custom_rubric_failed"), "error");
    }
  };

  const handleApply = () => {
    const all = [...rubrics.system, ...rubrics.custom];
    const selected = all.find((r) => r.id === selectedRubricId);

    if (selected) {
      // Prepare stored rubric with Localized Category Names for the UI that consumes this
      const storedRubric: StoredRubric = {
        id: selected.id,
        title: selected.title,
        type: selected.isSystem ? "standard" : "custom",
        categories: selected.categories.map((c) => ({
          name: getLocalizedName(c.id), // Convert ID to Sinhala here
          percentage: c.percentage,
        })),
        total: selected.total,
        selectedAt: new Date().toISOString(),
      };

      setSelectedRubric(storedRubric);
      onRubricApplied?.(storedRubric);
      showToast(
        t("rubric.success"),
        t("rubric.rubric_applied_successfully"),
        "success"
      );
      onClose();
    }
  };

  if (loading || isLoading) return null; // Or skeleton

  return (
    <>
      {showPopup && (
        <RubricCustomizer
          onClose={() => setShowPopup(false)}
          onSave={handleSaveCustomRubric}
          t={t}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-[85vw] sm:w-[380px] bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-[#2a2a2a] z-30 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-[#2a2a2a] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-gray-500" />
            {t("rubric.select_rubric", "Select Rubric")}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Create Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowPopup(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-500">
                  {t("rubric.create_custom_rubric", "Create Custom")}
                </span>
              </div>
              <p className="text-sm text-gray-500 ml-9">
                {t("rubric.customize_marks")}
              </p>
            </button>
          </div>

          {/* Render Lists */}
          {[...rubrics.custom, ...rubrics.system].map((rubric) => (
            <div
              key={rubric.id}
              onClick={() =>
                setSelectedRubricId((prev) =>
                  prev === rubric.id ? "" : rubric.id
                )
              }
              className={`mb-4 p-4 rounded-lg border cursor-pointer transition ${
                selectedRubricId === rubric.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      selectedRubricId === rubric.id
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedRubricId === rubric.id && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <h5 className="font-medium text-gray-800 dark:text-gray-200">
                    {rubric.title}
                  </h5>
                </div>
              </div>

              {/* Categories List */}
              <div className="ml-8 space-y-2">
                {rubric.categories.map((cat) => (
                  <div key={cat.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {getLocalizedName(cat.id)} {/* Display Sinhala */}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a]">
          <button
            onClick={handleApply}
            disabled={!selectedRubricId}
            className={`w-full py-3 font-medium rounded-lg transition ${
              selectedRubricId
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {t("rubric.apply_selected_rubric")}
          </button>
        </div>
      </div>
    </>
  );
}
