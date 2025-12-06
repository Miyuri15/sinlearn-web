import NumberInput from "@/components/ui/NumberInput";

interface Props {
  open: boolean;
  subQuestions: number;
  marks: number[];
  onChange: (index: number, value: number) => void;
  onDone: () => void;
  onCancel: () => void;
}

export default function SubMarksModal({
  open,
  subQuestions,
  marks,
  onChange,
  onDone,
  onCancel,
}: Readonly<Props>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#111] rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          Enter marks for sub-questions
        </h2>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {Array.from({ length: subQuestions }).map((_, idx) => (
            <div
              key={`sub-${idx}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm">
                Sub-question {String.fromCodePoint(97 + idx)})
              </span>
              <NumberInput
                value={marks[idx] ?? 0}
                onChange={(v) => onChange(idx, v)}
                min={0}
                max={100}
                className="w-24"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-[#333]"
          >
            Cancel
          </button>
          <button
            onClick={onDone}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
