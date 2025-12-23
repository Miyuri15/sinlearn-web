"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  CheckSquare,
  Menu,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface ChatItem {
  id: string;
  title: string;
  type: "learning" | "evaluation";
  time: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: ChatItem[];
  onNewLearningChat: () => void;
  onNewEvaluationChat: () => void;
}


export default function Sidebar({
  chats = [],
  isOpen,
  onToggle,
}: Readonly<SidebarProps>) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { t } = useTranslation("common");

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Mobile opener when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-3 top-3 sm:hidden z-40 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-[#2a2a2a] shadow"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Mobile backdrop when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 sm:hidden z-30"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <div
          className={`h-dvh flex flex-col border-r border-gray-200 dark:border-[#2a2a2a]
          bg-white dark:bg-gray-900 
          transition-all duration-300 sm:overflow-hidden overflow-y-auto
          fixed sm:static left-0 top-0
          ${
            isOpen
              ? "w-[92vw] sm:w-72 md:w-80"
              : "w-0 sm:w-16"
          } z-40`}
        >
        {/* TOP BAR */}
        <div className="p-4 flex items-center justify-between dark:border-gray-700">
          <Menu
            onClick={onToggle}
            className={`w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer transition-transform
                ${isOpen ? "rotate-180" : ""}`}
          />

          {isOpen && (
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("chat_history")}
            </span>
          )}

          {isOpen && (
            <button
              onClick={onToggle}
              className="text-gray-700 dark:text-gray-300 text-xl leading-none"
            >
              ✖
            </button>
          )}
        </div>

        {/* SEARCH (only when expanded) */}
        {isOpen && (
          <div className="px-2 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder={t("chat_history") + "..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm 
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-gray-100 
                        border-gray-300 dark:border-gray-700
                        focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              />
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="px-2 space-y-2 mt-2">
          <button
            onClick={() => router.push("/chat?type=learning")}
            className="flex items-center gap-3 w-full border rounded-lg px-3 py-2 
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     bg-white dark:bg-gray-900
                     text-gray-900 dark:text-gray-100
                     border-gray-300 dark:border-gray-700
                     transition"
          >
            <BookOpen className="h-4 w-4" />
            {isOpen && t("new_learning_chat")}
          </button>

          <button
            onClick={() => router.push("/chat?type=evaluation")}
            className="flex items-center gap-3 w-full border rounded-lg px-3 py-2 
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     bg-white dark:bg-gray-900
                     text-gray-900 dark:text-gray-100
                     border-gray-300 dark:border-gray-700
                     transition"
          >
            <CheckSquare className="h-4 w-4" />
            {isOpen && t("new_evaluation_chat")}
          </button>
        </div>

        {/* CHAT LIST */}
        <div className="flex-1 overflow-y-auto mt-4">
          {filteredChats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}?type=${chat.type}`}
              className={`block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 
                       text-gray-900 dark:text-gray-100 
                       ${isOpen ? "" : "text-center"}`}
            >
              {isOpen ? (
                <>
                  <div className="font-medium">{chat.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {chat.time}
                  </div>
                </>
              ) : (
                <div className="text-gray-600 dark:text-gray-300">
                  {chat.type === "learning" ? "📘" : "☑️"}
                </div>
              )}
            </Link>
          ))}

          {filteredChats.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
              No chats found...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-[#2a2a2a]">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => router.push("/settings")}
              className={`flex items-center gap-3 w-full border rounded-lg px-3 py-2 
              hover:bg-gray-100 dark:hover:bg-gray-800
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              border-gray-300 dark:border-[#2a2a2a] transition`}
            >
              <Settings className="h-4 w-4" />
              {isOpen && t("settings_text")}
            </button>

            <button
              onClick={() => router.push("/logout")}
              className={`flex items-center gap-3 w-full border rounded-lg px-3 py-2 
              hover:bg-red-100 dark:hover:bg-red-900
              bg-white dark:bg-gray-900
              text-red-600 dark:text-red-400
              border-gray-300 dark:border-[#2a2a2a] transition`}
            >
              <LogOut className="h-4 w-4" />
              {isOpen && t("logout")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
