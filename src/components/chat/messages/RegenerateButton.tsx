import { RefreshCw } from "lucide-react";
import Tooltip from "@mui/material/Tooltip";
import { MESSAGE_STYLES } from "./styles";

/**
 * RegenerateButton: Allows regenerating an assistant message
 */
export function RegenerateButton({
  messageId,
  onRegenerate,
  isLoading = false,
  compact = false, // Add compact prop with default false
}: {
  messageId?: string;
  onRegenerate?: (messageId?: string) => void;
  isLoading?: boolean;
  compact?: boolean; // Add compact to type definition
}) {
  if (!onRegenerate) return null;

  const handleClick = () => {
    onRegenerate(messageId);
  };

  // Different styling based on compact mode
  const buttonClasses = compact
    ? "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    : "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";

  return (
    <Tooltip title="Regenerate response" arrow>
      <button
        type="button"
        onClick={handleClick}
        disabled={!messageId || isLoading}
        aria-label="Regenerate response"
        className={buttonClasses}
      >
        <RefreshCw
          size={compact ? 12 : 14}
          className={isLoading ? "animate-spin" : ""}
        />
        {compact && <span>Regenerate</span>}
      </button>
    </Tooltip>
  );
}
