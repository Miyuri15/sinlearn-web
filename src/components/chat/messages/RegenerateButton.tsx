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
    <div className={MESSAGE_STYLES.regenerateButton}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!messageId || isLoading}
        className={MESSAGE_STYLES.regenerateButtonText}
      >
        {isLoading ? "Regenerating..." : "Regenerate"}
      </button>
    </div>
  );
}
