import React, { useState } from "react";
import { MESSAGE_STYLES } from "./styles";

interface TruncatedMessageProps {
  content: string;
  maxLength?: number;
  expandStyle?: string;
}
/**
 * TruncatedMessage: Renders text content with optional "Read more" button
 */
export function TruncatedMessage({
  content,
  maxLength = 300,
  expandStyle,
}: Readonly<TruncatedMessageProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > maxLength;
  const buttonStyle = expandStyle || MESSAGE_STYLES.expandButton;

  if (!shouldTruncate) {
    return <>{content}</>;
  }

  return (
    <>
      {isExpanded ? content : `${content.slice(0, maxLength)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={buttonStyle}
      >
        {isExpanded ? "Read less" : "Read more"}
      </button>
    </>
  );
}
