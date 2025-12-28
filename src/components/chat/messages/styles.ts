/**
 * Centralized Tailwind CSS classes for message components
 */

export const MESSAGE_STYLES = {
  // Wrappers
  userMessageWrapper: "ml-auto w-full sm:max-w-sm",

  // Message containers
  userMessageContent:
    "p-3 rounded-lg bg-blue-100 dark:bg-[#1E3A8A] text-blue-900 dark:text-blue-100 break-words",
  userMessageContentEval:
    "p-3 rounded-lg bg-blue-100 dark:bg-[#1E3A8A]/60 text-xs sm:text-sm text-blue-900 dark:text-blue-100 break-words",
  assistantMessage:
    "p-4 rounded-lg w-full sm:max-w-xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1F2937] break-words",
  evaluationMessage: "w-full sm:max-w-xl",

  // Grade label
  gradeLabel:
    "pt-2 mt-1 border-t border-black/10 dark:border-white/10 flex items-center gap-2",
  gradeLabelText:
    "text-[10px] uppercase tracking-wider font-semibold opacity-60",
  gradeLabelBadge:
    "text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded",
  gradeInfo: "mt-2 text-xs text-gray-500 dark:text-gray-400",

  // File content
  fileContent: "text-sm text-gray-700 dark:text-gray-300",

  // Buttons and interactive
  expandButton:
    "ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm",

  // Text content
  evaluationInputPre: "whitespace-pre-wrap text-sm",
} as const;
