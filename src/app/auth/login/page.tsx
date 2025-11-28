"use client";
import "@/lib/i18n";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import NoSSR from "@/components/NoSSR";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const { t } = useTranslation("common");

  return (
    <NoSSR>
      {/* PAGE BACKGROUND */}
      <div
        className="
          min-h-screen flex items-center justify-center
          bg-gradient-to-br from-[#EEF4FF] to-[#F8FAFF]
        "
      >
        {/* LOGIN CARD */}
        <div
          className="
            w-full max-w-md 
            bg-white
            rounded-3xl p-10 shadow-xl
          "
        >
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
          <h1
            className="
              text-center text-3xl font-semibold mb-1
              text-[#0A0A0A]
            "
          >
            {t("title")}
          </h1>

          <p
            className="
              text-center text-[#64748B]
              mb-6
            "
          >
            {t("subtitle")}
          </p>

          {/* Tabs */}
          <div
            className="
              flex rounded-xl p-1 mb-6
              bg-[#F1F5F9]
              border border-[#E2E8F0]
            "
          >
            <button
              onClick={() => setTab("signin")}
              className={`
                flex-1 py-2 rounded-xl text-sm font-medium transition
                ${
                  tab === "signin"
                    ? "bg-white text-[#0A0A0A] shadow-sm"
                    : "text-[#64748B]"
                }
              `}
            >
              {t("signin")}
            </button>

            <button
              onClick={() => setTab("signup")}
              className={`
                flex-1 py-2 rounded-xl text-sm font-medium transition
                ${
                  tab === "signup"
                    ? "bg-white text-[#0A0A0A] shadow-sm"
                    : "text-[#64748B]"
                }
              `}
            >
              {t("signup")}
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <div>
              <label
                className="
                  block text-sm mb-1
                  text-[#0A0A0A]
                "
              >
                {t("email")}
              </label>
              <Input type="email" placeholder="example@email.com" />
            </div>

            <div>
              <label
                className="
                  block text-sm mb-1
                  text-[#0A0A0A]
                "
              >
                {t("password")}
              </label>
              <Input type="password" placeholder="••••••••" />
            </div>

            <Button>
              {tab === "signin" ? t("button_signin") : t("button_signup")}
            </Button>
          </form>
        </div>
      </div>
    </NoSSR>
  );
}
