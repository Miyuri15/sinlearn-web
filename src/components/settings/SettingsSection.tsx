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
    <div className={`bg-white rounded-2xl shadow-sm p-6 mb-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#0A0A0A]">{title}</h2>
        {description && (
          <p className="text-[#64748B] text-sm mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}