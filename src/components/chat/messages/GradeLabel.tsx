import { MESSAGE_STYLES } from "./styles";
import { formatGradeLabel } from "./utils";

/**
 * GradeLabel: Displays the grade level badge for a message
 */
export function GradeLabel({ gradeLevel }: { gradeLevel: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">
        Target Audience
      </span>
      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
        {formatGradeLabel(gradeLevel)}
      </span>
    </div>
  );
}
