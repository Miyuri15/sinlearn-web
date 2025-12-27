"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import LanguageToggle from "@/components/language/LanguageToggle";
import Link from "next/link";
import { getLanguage, setAuthTokens } from "@/lib/localStore";
import { GraduationCap } from "lucide-react";
import { signup, signin } from "@/lib/api/auth";

interface AuthPageProps {
  readonly defaultTab?: "signin" | "signup";
}

export default function AuthPage({ defaultTab = "signin" }: AuthPageProps) {
  const [tab] = useState(defaultTab);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  useEffect(() => {
    i18n.changeLanguage(getLanguage());
  }, [i18n]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "signup") {
        const res = await signup({
          email,
          full_name: fullName,
          password,
        });

        setAuthTokens(res);
        router.push("/chat");
      } else {
        const res = await signin(email, password);

        setAuthTokens(res);
        router.push("/chat");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
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
            <GraduationCap className="w-6 h-6 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
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
          {/* Full name (signup only) */}
          {tab === "signup" && (
            <div>
              <label className="block text-sm text-gray-900 dark:text-white mb-1">
                {t("name")}
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("name_placeholder") || "Your Name"}
                className="text-gray-900 dark:text-white"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-900 dark:text-white mb-1">
              {t("email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-900 dark:text-white mb-1">
              {t("password")}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Error message */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Please wait..."
              : tab === "signin"
              ? t("button_signin")
              : t("button_signup")}
          </Button>

          {/* Footer links */}
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
