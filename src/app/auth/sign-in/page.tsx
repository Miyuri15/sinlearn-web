"use client";

import NoSSR from "@/components/NoSSR";
import AuthPage from "../page";

export default function SignInPage() {
  return <NoSSR>
  <AuthPage defaultTab="signin" />;
  </NoSSR>
}