import "./globals.css";
import type { ReactNode } from "react";
import LanguageToggle from "@/components/language/LanguageToggle";

export const metadata = {
  title: "SinLearn",
  description: "AI-Powered Sinhala Educational Assistant",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="transition-colors duration-300">
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <LanguageToggle />
        </div>

        {children}
      </body>
    </html>
  );
}
