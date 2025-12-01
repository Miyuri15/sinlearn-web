"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "./SettingsSection";

// LocalStorage
import { getSettings, setSettings } from "@/lib/localStore";

export default function NotificationSettings() {
  const { t } = useTranslation("common");

  const [messageNotifications, setMessageNotifications] = useState(true);
  const [evaluationNotifications, setEvaluationNotifications] = useState(true);

  // Load stored preferences
  useEffect(() => {
    const s = getSettings();

    setMessageNotifications(s.notifications ?? true);
    setEvaluationNotifications(s.evaluationNotifications ?? true);
  }, []);

  // Save every time something changes
  useEffect(() => {
    setSettings({
      notifications: messageNotifications,
      evaluationNotifications: evaluationNotifications,
    });
  }, [messageNotifications, evaluationNotifications]);

  return (
    <SettingsSection
      title={t("settings.notifications") || "Notifications"}
      description={t("settings.notifications_desc") || "Manage notification preferences"}
    >
      {/* Message Notifications */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white">
            {t("settings.message_notifications") || "Message Notifications"}
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            {t("settings.message_notifications_desc") || "Notifications for new messages"}
          </p>
        </div>

        <button
          onClick={() => setMessageNotifications(!messageNotifications)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            messageNotifications ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              messageNotifications ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Evaluation Notifications */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white">
            {t("settings.evaluation_notifications") || "Evaluation Notifications"}
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            {t("settings.evaluation_notifications_desc") || "Notify when evaluations are complete"}
          </p>
        </div>

        <button
          onClick={() => setEvaluationNotifications(!evaluationNotifications)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            evaluationNotifications ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              evaluationNotifications ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </SettingsSection>
  );
}
