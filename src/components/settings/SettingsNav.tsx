/**
 * Settings Navigation Header
 * Displays title, back button, and navigation tabs
 */

"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import LogoutConfirmModal from "@/components/ui/LogoutConfirmModal";
import { signout } from "@/lib/api/auth";
import { logout as logoutLocal } from "@/lib/localStore";

const tabs = [
  { id: "general", label: "settings.general" },
  { id: "profile", label: "settings.profile" },
  { id: "plan", label: "settings.plan" },
  { id: "notifications", label: "settings.notifications" },
  { id: "privacy", label: "settings.privacy" },
  { id: "about", label: "settings.about" },
];

interface SettingsNavProps {
  children?: ReactNode;
}

export default function SettingsNav({ children }: Readonly<SettingsNavProps>) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hasMountedRef = useRef(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signout();
    } catch (error) {
      console.error("Signout API call failed:", error);
    } finally {
      logoutLocal();
      setIsLogoutModalOpen(false);
      setIsLoggingOut(false);
      router.push("/auth/sign-in");
    }
  };

  // Extract active tab from pathname (/settings/[tab] -> tab)
  const activeTab = pathname.split("/").pop() || "general";

  useEffect(() => {
    // Skip artificial delay on initial mount; apply only between tab changes.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setIsTabTransitioning(true);
    const timeoutId = globalThis.setTimeout(() => {
      setIsTabTransitioning(false);
    }, 350);

    return () => globalThis.clearTimeout(timeoutId);
  }, [pathname]);

  return (
    <>
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-linear-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 sm:-mx-6 md:-mx-8 lg:-mx-10 px-4 sm:px-6 md:px-8 lg:px-10 z-10">
        <button
          onClick={() => router.push("/chat")}
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t("settings.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
              {t("settings.subtitle")}
            </p>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-sm font-medium"
            title={t("logout")}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden mb-6">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/settings/${tab.id}`}
              className={`
                px-4 py-3 whitespace-nowrap text-sm font-medium transition
                ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }
              `}
            >
              {t(tab.label)}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Layout with Sidebar and Content */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 lg:w-64 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-40">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              {t("settings.sections")}
            </h3>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={`/settings/${tab.id}`}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg transition text-sm block
                    ${
                      activeTab === tab.id
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                >
                  {t(tab.label)}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 min-w-0 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
          {isTabTransitioning ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="mt-3 h-4 w-72 max-w-full bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse space-y-4">
                <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
