"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import LanguageToggle from "@/components/language/LanguageToggle";
import Link from "next/link";

// LocalStorage helpers
import { setUser, getUser, getLanguage } from "@/lib/localStore";

interface AuthPageProps {
  readonly defaultTab?: "signin" | "signup";
}

export default function AuthPage({ defaultTab = "signin" }: AuthPageProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  const [ready, setReady] = useState(false);

  // Load stored language ONCE (i18n is already initialized by provider)
  useEffect(() => {
    const storedLang = getLanguage();
    i18n.changeLanguage(storedLang).finally(() => setReady(true));
  }, [i18n]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"></div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailInput = (
      document.querySelector('input[type="email"]') as HTMLInputElement
    )?.value;

    const nameInput = (
      document.querySelector('input[type="text"]') as HTMLInputElement
    )?.value;

    if (tab === "signin") {
      // Load existing user if exists
      const existing = getUser();

      setUser({
        name: existing?.name || nameInput || "User",
        email: emailInput || existing?.email || "",
        role: existing?.role || "student",
      });

      router.push("/dashboard");
    } else {
      // Signup → save user
      setUser({
        name: nameInput || "User",
        email: emailInput || "",
        role: role,
      });

      router.push("/auth/sign-in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex items-center gap-2">
        <LanguageToggle />
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-sm md:max-w-md bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="flex justify-center mb-4 md:mb-6">
          <Image
            src="/images/AuthPage.png"
            alt="SinLearn Logo"
            width={64}
            height={64}
            className="w-16 h-16 md:w-20 md:h-20"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-xl md:text-2xl font-semibold mb-1 md:mb-1.5 text-gray-900 dark:text-white">
          {t("title")}
        </h1>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
          {t("subtitle")}
        </p>

        {/* TABS */}
        <div className="flex rounded-lg p-1 mb-4 md:mb-6 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
          <Link
            href="/auth/sign-in"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition text-center ${
              tab === "signin"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t("signin")}
          </Link>

          <Link
            href="/auth/sign-up"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition text-center ${
              tab === "signup"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t("signup")}
          </Link>
        </div>

        {/* FORM */}
        <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
          {/* Name only for sign-up */}
          {tab === "signup" && (
            <div>
              <label className="block text-sm mb-1 md:mb-1.5 text-gray-900 dark:text-white">
                {t("name")}
              </label>
              <Input
                type="text"
                placeholder={t("name_placeholder") || "Your Name"}
                className="text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-sm mb-1 md:mb-1.5 text-gray-900 dark:text-white">
              {t("email")}
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              className="text-gray-900 dark:text-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 md:mb-1.5 text-gray-900 dark:text-white">
              {t("password")}
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className="text-gray-900 dark:text-white"
            />
          </div>

          {/* Role selector (signup only) */}
          {tab === "signup" && (
            <div className="flex gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-3 md:py-3.5 flex flex-col items-center justify-center space-y-1 rounded-lg transition border ${
                  role === "student"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-inner"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="text-xl md:text-2xl">📖</div>
                <span className="text-sm font-medium">{t("role_student")}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex-1 py-3 md:py-3.5 flex flex-col items-center justify-center space-y-1 rounded-lg transition border ${
                  role === "teacher"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-inner"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="text-xl md:text-2xl">🎓</div>
                <span className="text-sm font-medium">{t("role_teacher")}</span>
              </button>
            </div>
          )}

          <Button type="submit" className="w-full">
            {tab === "signin" ? t("button_signin") : t("button_signup")}
          </Button>

          <div className="text-center pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
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