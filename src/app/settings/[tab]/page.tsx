/**
 * Settings Dynamic Route
 * Renders the appropriate settings page based on the [tab] parameter
 */

"use client";

import { useTranslation } from "react-i18next";
import SettingsSection from "@/components/settings/SettingsSection";
import LanguageSelector from "@/components/settings/LanguageSelector";
import AppearanceToggle from "@/components/settings/AppearanceToggle";
import ProfileSettings from "@/components/settings/ProfileSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import PlanSettings from "@/components/settings/PlanSettings";
import AdminSettings from "@/components/settings/AdminSettings";
import { useParams } from "next/navigation";

export default function SettingsTabPage() {
  const { t } = useTranslation("common");
  const params = useParams();
  const tab = (params?.tab as string) || "general";

  // Render content based on tab
  const renderContent = () => {
    switch (tab) {
      case "general":
        return (
          <SettingsSection
            title={t("settings.general")}
            description={t("settings.general_desc")}
          >
            <LanguageSelector />
            <AppearanceToggle />
          </SettingsSection>
        );

      case "profile":
        return <ProfileSettings />;

      case "plan":
        return <PlanSettings />;

      case "admin":
        return <AdminSettings />;

      case "notifications":
        return <NotificationSettings />;

      case "privacy":
        return <PrivacySettings />;

      case "about":
        return (
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
        );

      default:
        return (
          <SettingsSection
            title={t("settings.not_found")}
            description="The requested settings page was not found."
          >
            <p className="text-gray-600 dark:text-gray-400">
              Please select a valid settings tab.
            </p>
          </SettingsSection>
        );
    }
  };

  return renderContent();
}
