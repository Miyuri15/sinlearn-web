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
}: {
  messageId?: string;
  onRegenerate?: (messageId?: string) => void;
  isLoading?: boolean;
}) {
  if (!onRegenerate) return null;

  const handleClick = () => {
    onRegenerate(messageId);
  };

  return (
    <Tooltip title="Regenerate response" arrow>
      <button
        type="button"
        onClick={handleClick}
        disabled={!messageId || isLoading}
        aria-label="Regenerate response"
        className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
      </button>
    </Tooltip>
  );
}
