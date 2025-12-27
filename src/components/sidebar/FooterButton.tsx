import React from "react";

interface FooterButtonProps {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onClick: () => void;
  isDestructive?: boolean;
}

export default function FooterButton({
  icon,
  label,
  isOpen,
  onClick,
  isDestructive,
}: Readonly<FooterButtonProps>) {
  const baseClass =
    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200";
  const contentClass = isDestructive
    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100";

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${contentClass} ${
        isOpen ? "justify-start" : "justify-center"
      }`}
      title={!isOpen ? label : undefined}
    >
      {icon}
      {isOpen && <span>{label}</span>}
    </button>
  );
}
