import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat - SinhalaLearn",
  description: "Conversational learning and evaluation chat sessions.",
};

export default function ChatLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <>{children}</>;
}
