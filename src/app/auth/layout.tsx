import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - SinhalaLearn",
  description: "Sign in or create your SinhalaLearn account.",
};

export default function AuthLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <>{children}</>;
}
