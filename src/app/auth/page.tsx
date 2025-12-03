"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import LanguageToggle from "@/components/language/LanguageToggle";
import Link from "next/link";
import { setUser, getUser, getLanguage } from "@/lib/localStore";
import { GraduationCap } from "lucide-react";

interface AuthPageProps {
  readonly defaultTab?: "signin" | "signup";
}

export default function AuthPage({ defaultTab = "signin" }: AuthPageProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Load stored language
  useEffect(() => {
    const lang = getLanguage();
    i18n.changeLanguage(lang).finally(() => setReady(true));
  }, [i18n]);

  if (!ready) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900"></div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const email = (
      document.querySelector('input[type="email"]') as HTMLInputElement
    )?.value;
    const name = (
      document.querySelector('input[type="text"]') as HTMLInputElement
    )?.value;

    if (tab === "signin") {
      const existing = getUser();
      setUser({
        name: existing?.name || name || "User",
        email: email || existing?.email || "",
        role: existing?.role || "student",
      });
      router.push("/chat");
    } else {
      setUser({
        name: name || "User",
        email: email || "",
        role,
      });
      router.push("/auth/sign-in");
    }
  };

  return (
    <div
      className="
        min-h-screen 
        flex items-center justify-center 
        bg-gradient-to-br 
        from-blue-50 to-gray-100 
        dark:from-gray-900 dark:to-gray-800
        px-4 sm:px-6 lg:px-8
        py-10
      "
    >
      {/* TOP RIGHT LANGUAGE SWITCH */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <LanguageToggle />
      </div>

      {/* MAIN CARD */}
      <div
        className="
          bg-white dark:bg-gray-800 
          w-full 
          max-w-sm sm:max-w-md lg:max-w-lg 
          rounded-xl sm:rounded-2xl 
          p-6 sm:p-8 lg:p-10 
          shadow-lg 
          border border-gray-200 dark:border-gray-700
        "
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center rounded-full bg-blue-600 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
            <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
          </div>
        </div>

        <h1 className="text-center text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
          {t("title")}
        </h1>

        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 mb-6">
          {t("subtitle")}
        </p>

        {/* Tabs */}
        <div
          className="
            flex 
            rounded-lg 
            p-1 mb-6 
            bg-gray-100 dark:bg-gray-700 
            border border-gray-200 dark:border-gray-600
          "
        >
          <Link
            href="/auth/sign-in"
            className={`flex-1 py-2 text-center text-sm rounded-lg font-medium transition
              ${
                tab === "signin"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }
            `}
          >
            {t("signin")}
          </Link>

          <Link
            href="/auth/sign-up"
            className={`flex-1 py-2 text-center text-sm rounded-lg font-medium transition
              ${
                tab === "signup"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300"
              }
            `}
          >
            {t("signup")}
          </Link>
        </div>

        {/* Form */}
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          {tab === "signup" && (
            <div>
              <label className="block text-sm text-gray-900 dark:text-white mb-1">
                {t("name")}
              </label>
              <Input
                type="text"
                placeholder={t("name_placeholder") || "Your Name"}
                className="text-gray-900 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-900 dark:text-white mb-1">
              {t("email")}
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              className="text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-900 dark:text-white mb-1">
              {t("password")}
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className="text-gray-900 dark:text-white"
            />
          </div>

          {/* Role selection */}
          {tab === "signup" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`
                  flex-1 py-3 
                  flex flex-col items-center justify-center 
                  rounded-lg border transition
                  ${
                    role === "student"
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300"
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  }
                `}
              >
                <div className="text-xl sm:text-2xl">📖</div>
                <span className="text-sm mt-1">{t("role_student")}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`
                  flex-1 py-3 
                  flex flex-col items-center justify-center 
                  rounded-lg border transition
                  ${
                    role === "teacher"
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300"
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  }
                `}
              >
                <div className="text-xl sm:text-2xl">🎓</div>
                <span className="text-sm mt-1">{t("role_teacher")}</span>
              </button>
            </div>
          )}

          <Button type="submit" className="w-full">
            {tab === "signin" ? t("button_signin") : t("button_signup")}
          </Button>

          <div className="pt-4 text-center border-t border-gray-200 dark:border-gray-700">
            {tab === "signin" ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("dont_have_account")}{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-blue-600 dark:text-blue-400"
                >
                  {t("signup_link")}
                </Link>
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("already_have_account")}{" "}
                <Link
                  href="/auth/sign-in"
                  className="text-blue-600 dark:text-blue-400"
                >
                  {t("signin_link")}
                </Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
