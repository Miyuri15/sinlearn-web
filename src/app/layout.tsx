import "./globals.css";
import type { ReactNode } from "react";
import LanguageToggleClient from "@/components/language/LanguageToggleClient";

export const metadata = {
  title: "SinLearn",
  description: "AI-Powered Sinhala Educational Assistant",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="transition-colors duration-300">
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <LanguageToggleClient />
        </div>

        {children}
      </body>
    </html>
  );
}
