import "./globals.css";
import type { ReactNode } from "react";
import I18nProvider from "./providers/I18nProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata = {
  title: "SinLearn",
  description: "AI-Powered Sinhala Educational Assistant",
};

export default function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Standard responsive viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function() {
        try {
          const stored = localStorage.getItem("sinlearn_theme");
          const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          const theme = stored || system;

          document.documentElement.classList.add(theme);
        } catch (e) {}
      })();
    `,
          }}
        />
      </head>
      <body className="min-h-screen transition-colors duration-300">
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}