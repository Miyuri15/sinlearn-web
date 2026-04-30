"use client";

import "@/lib/i18n";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap, School } from "lucide-react";
import SettingsSection from "./SettingsSection";
import { TierBadge } from "@/components/pricing/TierBadge";
import { useCurrentUser } from "@/hooks/usePricing";
import { getUser, setUser } from "@/lib/localStore";

export default function ProfileSettings() {
  const { t } = useTranslation("common");
  const { user } = useCurrentUser();

  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUserType(u.role || "student");
      setName(u.name || "");
      setEmail(u.email);
    }
  }, []);

  const handleSave = () => {
    setUser({
      name,
      email,
      role: userType,
    });

    alert(t("settings.saved") || "Changes saved!");
  };

  return (
    <SettingsSection
      title={t("settings.profile") || "Profile"}
      description={t("settings.profile_desc") || "Your account information"}
    >
      {user && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Your Plan
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Manage your subscription in the Plan settings
            </p>
          </div>
          <TierBadge tier={user.tier} size="lg" />
        </div>
      )}

      <div className="space-y-2 opacity-60 cursor-not-allowed">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {t("settings.user_type") || "User Type"}
        </label>

        <div className="flex gap-4 pointer-events-none">
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-xl border transition ${
              userType === "student"
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            }`}
          >
            <GraduationCap
              className="mr-2 inline h-5 w-5"
              aria-hidden="true"
            />
            {t("role_student") || "Student"}
          </button>

          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-xl border transition ${
              userType === "teacher"
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            }`}
          >
            <School className="mr-2 inline h-5 w-5" aria-hidden="true" />
            {t("role_teacher") || "Teacher"}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("settings.user_type_locked") ||
            "Cannot be changed after registration."}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {t("settings.name") || "Name"}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder={t("settings.name_placeholder") || "Your Name"}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {t("settings.email") || "Email"}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder={t("settings.email_placeholder") || "Your Email"}
        />
      </div>

      <div className="pt-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium"
        >
          {t("settings.save_changes") || "Save Changes"}
        </button>
      </div>
    </SettingsSection>
  );
}
