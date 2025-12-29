import { MESSAGE_STYLES } from "./styles";
import { formatGradeLabel } from "./utils";

/**
 * GradeLabel: Displays the grade level badge for a message
 */
export function GradeLabel({ gradeLevel }: { gradeLevel: string }) {
  return (
    <div className={MESSAGE_STYLES.gradeLabel}>
      <span className={MESSAGE_STYLES.gradeLabelText}>Target Audience</span>
      <span className={MESSAGE_STYLES.gradeLabelBadge}>
        {formatGradeLabel(gradeLevel)}
      </span>
    </div>
  );
}
