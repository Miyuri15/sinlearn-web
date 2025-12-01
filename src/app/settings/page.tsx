"use client";
import "@/lib/i18n";
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
    { id: "general", label: t("settings.general") || "General" },
    { id: "profile", label: t("settings.profile") || "Profile" },
    { id: "notifications", label: t("settings.notifications") || "Notifications" },
    { id: "privacy", label: t("settings.privacy") || "Privacy & Security" },
    { id: "about", label: t("settings.about") || "About" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF4FF] to-[#F8FAFF] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#64748B] hover:text-[#0A0A0A] transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("settings.back") || "Back"}
          </button>
          
          <h1 className="text-3xl font-bold text-[#0A0A0A]">{t("settings.title") || "Settings"}</h1>
          <p className="text-[#64748B] mt-2">
            {t("settings.subtitle") || "Manage your preferences and account settings"}
          </p>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden mb-6">
          <div className="flex overflow-x-auto border-b border-[#E2E8F0]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 whitespace-nowrap text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-[#64748B] hover:text-[#0A0A0A]"
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
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-4">
                {t("settings.sections") || "Settings"}
              </h3>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-[#64748B] hover:bg-gray-50 hover:text-[#0A0A0A]"
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
            {(activeTab === "general" || window.innerWidth >= 768) && (
              <div className={`${activeTab !== "general" ? "hidden md:block" : ""}`}>
                <SettingsSection
                  title={t("settings.general") || "General"}
                  description={t("settings.general_desc") || "Basic application preferences"}
                >
                  <LanguageSelector />
                  <AppearanceToggle />
                </SettingsSection>
              </div>
            )}

            {/* Profile Settings */}
            {(activeTab === "profile" || window.innerWidth >= 768) && (
              <div className={`${activeTab !== "profile" ? "hidden md:block" : ""}`}>
                <ProfileSettings />
              </div>
            )}

            {/* Notification Settings */}
            {(activeTab === "notifications" || window.innerWidth >= 768) && (
              <div className={`${activeTab !== "notifications" ? "hidden md:block" : ""}`}>
                <NotificationSettings />
              </div>
            )}

            {/* Privacy & Security */}
            {(activeTab === "privacy" || window.innerWidth >= 768) && (
              <div className={`${activeTab !== "privacy" ? "hidden md:block" : ""}`}>
                <PrivacySettings />
              </div>
            )}

            {/* About */}
            {(activeTab === "about" || window.innerWidth >= 768) && (
              <div className={`${activeTab !== "about" ? "hidden md:block" : ""}`}>
                <SettingsSection
                  title={t("settings.about") || "About"}
                  description={t("settings.about_desc") || "Application information"}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">{t("settings.version") || "Version"}</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">{t("settings.license") || "License"}</span>
                      <span className="font-medium">MIT</span>
                    </div>
                    
                    <div className="pt-4 border-t border-[#E2E8F0]">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        {t("settings.terms") || "Terms and Conditions"}
                      </button>
                      <button className="ml-6 text-blue-600 hover:text-blue-700 text-sm">
                        {t("settings.privacy_policy") || "Privacy Policy"}
                      </button>
                    </div>
                  </div>
                </SettingsSection>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}