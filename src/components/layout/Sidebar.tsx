"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  Menu,
  LogOut,
  Settings,
  Pencil,
  Trash2,
  X,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { signout } from "@/lib/api/auth";
import { logout as logoutLocal, setSelectedChatType } from "@/lib/localStore";
import LogoutConfirmModal from "@/components/ui/LogoutConfirmModal";
import ActionButton from "@/components/sidebar/ActionButton";
import FooterButton from "@/components/sidebar/FooterButton";

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
  onEditChat?: (chat: ChatItem) => void;
  onDeleteChat?: (chat: ChatItem) => void;
}

export default function Sidebar({
  chats = [],
  isOpen,
  onToggle,
  onEditChat,
  onDeleteChat,
}: Readonly<SidebarProps>) {
  const [search, setSearch] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation("common");

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleChatClick = (chat: ChatItem) => {
    if (loadingChatId) return; // Prevent multiple clicks
    setLoadingChatId(chat.id);
    setSelectedChatType(chat.type);
    // Small delay to ensure localStorage is set before navigation
    setTimeout(() => {
      setLoadingChatId(null);
    }, 500);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call backend signout endpoint
      await signout();
    } catch (error) {
      console.error("Signout API call failed:", error);
    } finally {
      // Clear local storage and redirect
      logoutLocal();
      setIsLogoutModalOpen(false);
      setIsLoggingOut(false);
      router.push("/auth/sign-in");
    }
  };

  return (
    <>
      {/* Mobile backdrop when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm sm:hidden z-40 transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed sm:static left-0 top-0 h-[100dvh] z-50
          flex flex-col 
          bg-white dark:bg-gray-950 
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 ease-in-out overflow-hidden
          ${
            isOpen
              ? "w-[85vw] sm:w-72 md:w-80 translate-x-0"
              : "w-0 sm:w-20 -translate-x-full sm:translate-x-0"
          }
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <Menu
                className={`w-5 h-5 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap opacity-100 transition-opacity delay-100">
                {t("chat_history")}
              </span>
            )}
          </div>

          {/* Mobile Close Button */}
          {isOpen && (
            <button
              onClick={onToggle}
              className="sm:hidden p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* SEARCH & NEW CHAT ACTIONS */}
        <div className="p-3 space-y-3">
          {/* Search Bar - only visible when open */}
          {isOpen && (
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder={t("chat_history") + "..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <ActionButton
              icon={<BookOpen className="w-4 h-4" />}
              label={t("new_learning_chat")}
              isOpen={isOpen}
              chatType="learning"
              colorClass="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800"
            />
            <ActionButton
              icon={<ClipboardCheck className="w-4 h-4" />}
              label={t("new_evaluation_chat")}
              isOpen={isOpen}
              chatType="evaluation"
              colorClass="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800"
            />
          </div>
        </div>

        {/* CHAT LIST (Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          {filteredChats.length > 0
            ? filteredChats.map((chat) => {
                const isLoading = loadingChatId === chat.id;
                return (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    onClick={() => handleChatClick(chat)}
                    className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg
                    hover:bg-gray-100 dark:hover:bg-gray-800/50 
                    transition-all duration-200
                    ${!isOpen && "justify-center"}
                    ${isLoading ? "opacity-50 cursor-wait" : ""}
                  `}
                  >
                    {/* Icon */}
                    <div
                      className={`shrink-0 ${
                        chat.type === "learning"
                          ? "text-blue-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : chat.type === "learning" ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <ClipboardCheck className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content (Title + Date) */}
                    {isOpen && (
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {chat.title}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {chat.time}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons (Visible only on Group Hover when Open) */}
                    {isOpen && !isLoading && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onEditChat?.(chat);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onDeleteChat?.(chat);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </Link>
                );
              })
            : isOpen && (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                  <p>No chats found</p>
                </div>
              )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="space-y-1">
            <FooterButton
              icon={<Settings className="w-4 h-4" />}
              label={t("settings_text")}
              isOpen={isOpen}
              onClick={() => router.push("/settings")}
            />
            <FooterButton
              icon={<LogOut className="w-4 h-4" />}
              label={t("logout")}
              isOpen={isOpen}
              onClick={() => setIsLogoutModalOpen(true)}
              isDestructive
            />
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
