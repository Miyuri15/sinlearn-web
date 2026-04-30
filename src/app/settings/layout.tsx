import type { ReactNode } from "react";
import type { Metadata } from "next";
import SettingsNav from "@/components/settings/SettingsNav";

export const metadata: Metadata = {
  title: "Settings - SinhalaLearn",
  description:
    "Manage language, appearance, profile, notifications and privacy.",
};

export default function SettingsLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div
      className="
        min-h-screen 
        bg-gradient-to-br from-blue-50 to-gray-100
        dark:from-gray-900 dark:to-gray-800
        px-4 sm:px-6 md:px-8 lg:px-10
        py-8 sm:py-10
      "
    >
      <div className="max-w-7xl mx-auto">
        <SettingsNav children={children} />
      </div>
    </div>
  );
}
