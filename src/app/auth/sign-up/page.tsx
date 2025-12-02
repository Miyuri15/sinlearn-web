
"use client";
import NoSSR from "@/components/NoSSR";
import AuthPage from "../page";

export default function SignUpPage() {
  return <NoSSR>
  <AuthPage defaultTab="signup" />;
  </NoSSR>
}