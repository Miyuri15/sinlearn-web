import React, { useState, useEffect } from "react";
import { Check, Edit2, Save, X, AlertCircle, Loader2, ClipboardCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { 
  getMarkingScheme, 
  updateMarkingReference, 
  approveMarkingScheme,
  MarkingReferenceResponse 
} from "@/lib/api/evaluation";

interface MarkingSchemeReviewScreenProps {
  evaluationSessionId: string;
  onApprove: () => void;
  onCancel: () => void;
}

export default function MarkingSchemeReviewScreen({
  evaluationSessionId,
  onApprove,
  onCancel
}: MarkingSchemeReviewScreenProps) {
  const { t } = useTranslation("chat");
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [references, setReferences] = useState<MarkingReferenceResponse[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarkingScheme();
  }, [evaluationSessionId]);

  const fetchMarkingScheme = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarkingScheme(evaluationSessionId);
      setReferences(data);
    } catch (err) {
      console.error("Failed to fetch marking scheme", err);
      setError("Failed to load marking scheme. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ref: MarkingReferenceResponse) => {
    setEditingId(ref.id);
    setEditValue(ref.reference_answer);
  };

  const handleSave = async (id: string) => {
    try {
      const updated = await updateMarkingReference(id, editValue);
      setReferences(prev => prev.map(r => r.id === id ? updated : r));
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update reference", err);
      setError("Failed to save changes.");
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveMarkingScheme(evaluationSessionId);
      onApprove();
    } catch (err) {
      console.error("Failed to approve marking scheme", err);
      setError("Failed to approve. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 dark:text-gray-400">Extracting marking scheme from syllabus...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" />
            Review Marking Scheme
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please verify the ground truth answers extracted from the syllabus. These will be used for grading.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel} className="px-6 py-2">
            Cancel
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-800 dark:text-red-200">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        {references.map((ref) => (
          <div 
            key={ref.id}
            className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-5 shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded">
                  {ref.question_number}
                </span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {ref.question_text}
                </h3>
              </div>
              {editingId !== ref.id ? (
                <button 
                  onClick={() => handleEdit(ref)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              ) : null}
            </div>

            {editingId === ref.id ? (
              <div className="space-y-3">
                <textarea
                  className="w-full min-h-[100px] p-3 bg-gray-50 dark:bg-[#1a1a1a] border border-blue-300 dark:border-blue-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button 
                    onClick={() => handleSave(ref.id)}
                    className="flex items-center gap-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap italic">
                {ref.reference_answer || "No reference answer found."}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 flex justify-center">
         <Button 
            onClick={handleApprove} 
            disabled={approving || editingId !== null} 
            className="max-w-md py-6 text-lg"
          >
            {approving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Approving...
              </div>
            ) : "Approve & Start Grading"}
          </Button>
      </div>
    </div>
  );
}
