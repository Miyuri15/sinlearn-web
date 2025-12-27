import React from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onClick: () => void;
  colorClass?: string;
}

export default function ActionButton({
  icon,
  label,
  isOpen,
  onClick,
  colorClass,
}: Readonly<ActionButtonProps>) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent
        transition-all duration-200
        ${isOpen ? "justify-start" : "justify-center"}
        bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm
        ${colorClass}
      `}
      title={!isOpen ? label : undefined}
    >
      {icon}
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}
