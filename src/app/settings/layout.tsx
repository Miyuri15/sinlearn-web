import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - SinhalaLearn",
  description:
    "Manage language, appearance, profile, notifications and privacy.",
};

export default function SettingsLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <>{children}</>;
}
