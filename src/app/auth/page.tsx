"use client";
import "@/lib/i18n";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation"; 
import LanguageToggle from "@/components/language/LanguageToggle";
import Link from "next/link";

// LocalStorage helpers
import { setUser, getUser } from "@/lib/localStore";
import { setLanguage, getLanguage } from "@/lib/localStore";

interface AuthPageProps {
  defaultTab?: "signin" | "signup";
}

export default function AuthPage({ defaultTab = "signin" }: AuthPageProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  const [isI18nReady, setIsI18nReady] = useState(false);

  // Load saved language on page load
  useEffect(() => {
    const storedLang = getLanguage();
    i18n.changeLanguage(storedLang);
  }, []);

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsI18nReady(true);
    } else {
      i18n.on("initialized", () => {
        setIsI18nReady(true);
      });
    }

    return () => {
      i18n.off("initialized");
    };
  }, [i18n]);

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

  if (!isI18nReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl">
          {/* Loading skeleton */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <LanguageToggle />
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/AuthPage.png"
            alt="SinLearn Logo"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-3xl font-semibold mb-1 text-gray-900 dark:text-white">
          {t("title")}
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {t("subtitle")}
        </p>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-6 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
          <Link
            href="/auth/sign-in"
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition text-center ${
              tab === "signin"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t("signin")}
          </Link>

          <Link
            href="/auth/sign-up"
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition text-center ${
              tab === "signup"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t("signup")}
          </Link>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name only for sign-up */}
          {tab === "signup" && (
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-white">
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
            <label className="block text-sm mb-1 text-gray-900 dark:text-white">
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
            <label className="block text-sm mb-1 text-gray-900 dark:text-white">
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
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-4 flex flex-col items-center justify-center space-y-1 rounded-xl transition border ${
                  role === "student"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-inner"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="text-2xl">📖</div>
                <span className="text-sm font-medium">{t("role_student")}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex-1 py-4 flex flex-col items-center justify-center space-y-1 rounded-xl transition border ${
                  role === "teacher"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-inner"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="text-2xl">🎓</div>
                <span className="text-sm font-medium">{t("role_teacher")}</span>
              </button>
            </div>
          )}

          <Button type="submit" className="w-full">
            {tab === "signin" ? t("button_signin") : t("button_signup")}
          </Button>

          {/* Switch footer */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tab === "signin" ? (
                <>
                  {t("dont_have_account")}{" "}
                  <Link
                    href="/auth/sign-up"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    {t("signup_link")}
                  </Link>
                </>
              ) : (
                <>
                  {t("already_have_account")}{" "}
                  <Link
                    href="/auth/sign-in"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    {t("signin_link")}
                  </Link>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
