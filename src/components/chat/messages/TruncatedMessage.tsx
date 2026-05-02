import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { MESSAGE_STYLES } from "./styles";

interface TruncatedMessageProps {
  content: string;
  maxLength?: number;
  expandStyle?: string;
}
/**
 * TruncatedMessage: Renders Markdown content with optional "Read more"
 */
export function TruncatedMessage({
  content,
  maxLength = 300,
  expandStyle,
}: Readonly<TruncatedMessageProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = content.length > maxLength;
  const buttonStyle = expandStyle || MESSAGE_STYLES.expandButton;

  const visibleContent =
    !shouldTruncate || isExpanded ? content : content.slice(0, maxLength);

  return (
    <div className="break-words leading-relaxed">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            ol: ({ children }) => (
              <ol className="space-y-4 list-decimal pl-6">{children}</ol>
            ),

            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),

            strong: ({ children }) => {
              const text = String(children);

              // Detect "පිළිතුර:"
              if (text.includes("පිළිතුර")) {
                return (
                  <div className="mt-2 font-semibold text-gray-900 dark:text-gray-100">
                    {children}
                  </div>
                );
              }

              return (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {children}
                </span>
              );
            },

            p: ({ children }) => (
              <p className="mt-1 text-gray-800 dark:text-gray-200">
                {children}
              </p>
            ),
          }}
        >
          {visibleContent}
        </ReactMarkdown>
      </div>

      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={buttonStyle}
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}
