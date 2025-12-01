"use client";
import "@/lib/i18n";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation"; 
import LanguageToggle from "@/components/language/LanguageToggle";

export default function LoginPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsI18nReady(true);
    } else {
      i18n.on('initialized', () => {
        setIsI18nReady(true);
      });
    }

    return () => {
      i18n.off('initialized');
    };
  }, [i18n]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tab === "signin") {
      console.log("Signing in...");
      router.push("/dashboard");
    } else {
      console.log(`Signing up as ${role}...`);
      setTab("signin");
    }
  };

  if (!isI18nReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl">
          {/* Loading skeleton - same as before */}
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
        {/* Logo - REMOVED the dark:invert filter */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/AuthPage.png"
            alt="SinLearn Logo"
            width={80}
            height={80}
            priority
            // Removed: className="dark:invert dark:brightness-90"
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
          <button
            onClick={() => setTab("signin")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
              tab === "signin"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t("signin")}
          </button>

          <button
            onClick={() => setTab("signup")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
              tab === "signup"
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t("signup")}
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {tab === "signup" && (
            <div>
              <label className="block text-sm mb-1 text-gray-900 dark:text-white">
                {t("name")} 
              </label>
              <Input type="text" placeholder={t("name_placeholder") || "Your Name"} /> 
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-sm mb-1 text-gray-900 dark:text-white">
              {t("email")}
            </label>
            <Input type="email" placeholder="example@email.com" />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm mb-1 text-gray-900 dark:text-white">
              {t("password")}
            </label>
            <Input type="password" placeholder="••••••••" />
          </div>
          
          {/* Conditional Role selection */}
          {tab === "signup" && (
            <div className="flex gap-4">
              <button
                type="button" 
                onClick={() => setRole("student")}
                className={`flex-1 py-4 flex flex-col items-center justify-center space-y-1 rounded-xl transition border ${
                  role === "student"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-inner"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600" 
                }`}
              >
                <div className="text-2xl">📖</div> 
                <span className="text-sm font-medium">
                  {t("role_student") || "Student"} 
                </span>
              </button>

              <button
                type="button" 
                onClick={() => setRole("teacher")}
                className={`flex-1 py-4 flex flex-col items-center justify-center space-y-1 rounded-xl transition border ${
                  role === "teacher"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-inner" 
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600" 
                }`}
              >
                <div className="text-2xl">🎓</div> 
                <span className="text-sm font-medium">
                  {t("role_teacher") || "Teacher"}
                </span>
              </button>
            </div>
          )}

          <Button type="submit">
            {tab === "signin" ? t("button_signin") : t("button_signup")}
          </Button>
        </form>
      </div>
    </div>
  );
}