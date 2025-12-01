export const dynamic = "force-dynamic";
export const revalidate = 0;

"use client";
import "@/lib/i18n";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import SettingsSection from "@/components/settings/SettingsSection";
import LanguageSelector from "@/components/settings/LanguageSelector";
import AppearanceToggle from "@/components/settings/AppearanceToggle";
import ProfileSettings from "@/components/settings/ProfileSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import LanguageToggle from "@/components/language/LanguageToggle";
import NoSSR from "@/components/NoSSR";

export default function SettingsPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tabs = [
    { id: "general", label: t("settings.general") || "General" },
    { id: "profile", label: t("settings.profile") || "Profile" },
    { id: "notifications", label: t("settings.notifications") || "Notifications" },
    { id: "privacy", label: t("settings.privacy") || "Privacy & Security" },
    { id: "about", label: t("settings.about") || "About" },
  ];

  return (
    <NoSSR>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("settings.back") || "Back"}
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("settings.title") || "Settings"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("settings.subtitle") || "Manage your preferences and account settings"}
          </p>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden mb-6">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 whitespace-nowrap text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                {t("settings.sections") || "Settings"}
              </h3>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      activeTab === tab.id
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* General Settings */}
            <div className={activeTab === "general" ? "block" : "hidden md:block"}>
              <SettingsSection
                title={t("settings.general") || "General"}
                description={t("settings.general_desc") || "Basic application preferences"}
              >
                <LanguageSelector />
                <AppearanceToggle />
              </SettingsSection>
            </div>

            {/* Profile Settings */}
            <div className={activeTab === "profile" ? "block" : "hidden md:block"}>
              <ProfileSettings />
            </div>

            {/* Notification Settings */}
            <div className={activeTab === "notifications" ? "block" : "hidden md:block"}>
              <NotificationSettings />
            </div>

            {/* Privacy & Security */}
            <div className={activeTab === "privacy" ? "block" : "hidden md:block"}>
              <PrivacySettings />
            </div>

            {/* About */}
            <div className={activeTab === "about" ? "block" : "hidden md:block"}>
              <SettingsSection
                title={t("settings.about") || "About"}
                description={t("settings.about_desc") || "Application information"}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t("settings.version") || "Version"}</span>
                    <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t("settings.license") || "License"}</span>
                    <span className="font-medium text-gray-900 dark:text-white">MIT</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                      {t("settings.terms") || "Terms and Conditions"}
                    </button>
                    <button className="ml-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                      {t("settings.privacy_policy") || "Privacy Policy"}
                    </button>
                  </div>
                </div>
              </SettingsSection>
            </div>
          </div>
        </div>
      </div>
    </div>
    </NoSSR>
  );
}