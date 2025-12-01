import { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function SettingsSection({
  title,
  description,
  children,
  className = "",
}: SettingsSectionProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}