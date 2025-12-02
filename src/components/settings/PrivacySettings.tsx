"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "./SettingsSection";

// LocalStorage
import { getSettings, setSettings } from "@/lib/localStore";

export default function PrivacySettings() {
  const { t } = useTranslation("common");

  const [saveChatHistory, setSaveChatHistory] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const s = getSettings();

    setSaveChatHistory(s.saveHistory ?? true);
    setDataCollection(s.dataCollection ?? false);
  }, []);

  // Save changes automatically
  useEffect(() => {
    setSettings({
      saveHistory: saveChatHistory,
      dataCollection: dataCollection,
    });
  }, [saveChatHistory, dataCollection]);

  const handleDeleteChats = () => {
    if (
      confirm(
        t("settings.delete_confirm") ||
          "Are you sure you want to delete all chat history?"
      )
    ) {
      console.log("Chat history deletion triggered");
    }
  };

  return (
    <SettingsSection
      title={t("settings.privacy") || "Privacy & Security"}
      description={t("settings.privacy_desc") || "Data and privacy settings"}
    >
      {/* Save Chat History */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white">
            {t("settings.save_history") || "Save Chat History"}
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            {t("settings.save_history_desc") || "Save conversations locally"}
          </p>
        </div>

        <button
          onClick={() => setSaveChatHistory(!saveChatHistory)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            saveChatHistory ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              saveChatHistory ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Data Collection */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white">
            {t("settings.data_collection") || "Data Collection"}
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            {t("settings.data_collection_desc") || "Used for improving experience"}
          </p>
        </div>

        <button
          onClick={() => setDataCollection(!dataCollection)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            dataCollection ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              dataCollection ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Delete chats */}
      <div className="pt-6 border-t border-[#E2E8F0]">
        <button
          onClick={handleDeleteChats}
          className="px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium border border-red-200"
        >
          {t("settings.delete_chats") || "Delete All Chats"}
        </button>
      </div>
    </SettingsSection>
  );
}
