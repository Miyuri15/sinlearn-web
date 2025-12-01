"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "./SettingsSection";

export default function ProfileSettings() {
  const { t } = useTranslation("common");
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("Dhanuka Prabhashwara");
  const [email, setEmail] = useState("dhanuka@gmail.com");

  return (
    <SettingsSection
      title={t("settings.profile") || "Profile"}
      description={t("settings.profile_desc") || "Your account information"}
    >
      {/* User Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#0A0A0A]">
          {t("settings.user_type") || "User Type"}
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setUserType("student")}
            className={`flex-1 py-3 px-4 rounded-xl border transition ${
              userType === "student"
                ? "bg-blue-50 border-blue-600 text-blue-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            👨‍🎓 {t("role_student") || "Student"}
          </button>
          <button
            type="button"
            onClick={() => setUserType("teacher")}
            className={`flex-1 py-3 px-4 rounded-xl border transition ${
              userType === "teacher"
                ? "bg-blue-50 border-blue-600 text-blue-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            👩‍🏫 {t("role_teacher") || "Teacher"}
          </button>
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#0A0A0A]">
          {t("settings.name") || "Name"}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t("settings.name_placeholder") || "Enter your name"}
        />
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#0A0A0A]">
          {t("settings.email") || "Email"}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t("settings.email_placeholder") || "Enter your email"}
        />
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
          {t("settings.save_changes") || "Save Changes"}
        </button>
      </div>
    </SettingsSection>
  );
}