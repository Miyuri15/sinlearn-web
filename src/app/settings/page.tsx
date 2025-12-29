"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import SettingsSection from "@/components/settings/SettingsSection";
import LanguageSelector from "@/components/settings/LanguageSelector";
import AppearanceToggle from "@/components/settings/AppearanceToggle";
import ProfileSettings from "@/components/settings/ProfileSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";

export default function SettingsPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: t("settings.general") },
    { id: "profile", label: t("settings.profile") },
    { id: "notifications", label: t("settings.notifications") },
    { id: "privacy", label: t("settings.privacy") },
    { id: "about", label: t("settings.about") },
  ];

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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 whitespace-nowrap text-sm font-medium transition
                  ${
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                {t("settings.sections")}
              </h3>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition text-sm
                      ${
                        activeTab === tab.id
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === "general" && (
              <SettingsSection
                title={t("settings.general")}
                description={t("settings.general_desc")}
              >
                <LanguageSelector />
                <AppearanceToggle />
              </SettingsSection>
            )}

            {activeTab === "profile" && <ProfileSettings />}

            {activeTab === "notifications" && <NotificationSettings />}

            {activeTab === "privacy" && <PrivacySettings />}

            {activeTab === "about" && (
              <SettingsSection
                title={t("settings.about")}
                description={t("settings.about_desc")}
              >
                <div className="space-y-4 text-sm sm:text-base">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("settings.version")}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      1.0.0
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("settings.license")}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      MIT
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-6">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                      {t("settings.terms")}
                    </button>

                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                      {t("settings.privacy_policy")}
                    </button>
                  </div>
                </div>
              </SettingsSection>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
