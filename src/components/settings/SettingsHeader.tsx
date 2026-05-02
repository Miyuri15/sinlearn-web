/**
 * Settings Header and Sidebar Navigation
 */

"use client";

import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { id: "general", label: "settings.general" },
  { id: "profile", label: "settings.profile" },
  { id: "plan", label: "settings.plan" },
  { id: "notifications", label: "settings.notifications" },
  { id: "privacy", label: "settings.privacy" },
  { id: "about", label: "settings.about" },
];

export default function SettingsHeader() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();

  // Extract active tab from pathname
  const activeTab = pathname.split("/").pop() || "general";

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition mb-4 text-sm sm:text-base"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("settings.back")}
        </button>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {t("settings.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden mb-6">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/settings/${tab.id}`}
              className={`
                px-4 py-3 whitespace-nowrap text-sm font-medium transition
                ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }
              `}
            >
              {t(tab.label)}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              {t("settings.sections")}
            </h3>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={`/settings/${tab.id}`}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg transition text-sm block
                    ${
                      activeTab === tab.id
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                >
                  {t(tab.label)}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Container - Opens for children */}
        <div className="flex-1 min-w-0">
          {/* This div will contain the dynamic page content */}
        </div>
      </div>
    </>
  );
}
