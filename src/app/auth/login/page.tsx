"use client";
import "@/lib/i18n";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import NoSSR from "@/components/NoSSR";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation"; 

export default function LoginPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const { t } = useTranslation("common");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tab === "signin") {
      console.log("Signing in...");
      // Add actual sign in logic here
      // If sign in is successful, navigate to dashboard
      router.push("/dashboard");
    } else {
      console.log(`Signing up as ${role}...`);
      // Add actual sign up logic here
      // After successful sign up, switch to sign in tab
      setTab("signin");
      // Optionally show a success message
      // alert("Account created successfully! Please sign in.");
    }
  };

  return (
    <NoSSR>
      {/* PAGE BACKGROUND */}
      <div
        className="
          min-h-screen flex items-center justify-center
          bg-linear-to-br from-[#EEF4FF] to-[#F8FAFF]
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
          <form className="space-y-4" onSubmit={handleSubmit}>
            {tab === "signup" && (
              <div>
                <label
                  className="
                    block text-sm mb-1
                    text-[#0A0A0A]
                  "
                >
                  {t("name")} 
                </label>
                <Input type="text" placeholder={t("name_placeholder") || "Your Name"} /> 
              </div>
            )}

            {/* Email input */}
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

            {/* Password input */}
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
            
            {/* Conditional Role selection (only for signup) */}
            {tab === "signup" && (
              <div className="flex gap-4">
                {/* Student Role Button */}
                <button
                  type="button" 
                  onClick={() => setRole("student")}
                  className={`
                    flex-1 py-4 flex flex-col items-center justify-center space-y-1 rounded-xl transition
                    border
                    ${
                      role === "student"
                        ? "bg-[#E0EEFF] border-blue-600 text-blue-600 shadow-inner"
                        : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-gray-50" 
                    }
                  `}
                >
                  <div className="text-2xl">📖</div> 
                  <span className="text-sm font-medium">
                    {t("role_student") || "Student"} 
                  </span>
                </button>

                {/* Teacher Role Button */}
                <button
                  type="button" 
                  onClick={() => setRole("teacher")}
                  className={`
                    flex-1 py-4 flex flex-col items-center justify-center space-y-1 rounded-xl transition
                    border
                    ${
                      role === "teacher"
                        ? "bg-[#E0EEFF] border-blue-600 text-blue-600 shadow-inner" 
                        : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-gray-50" 
                    }
                  `}
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
    </NoSSR>
  );
}