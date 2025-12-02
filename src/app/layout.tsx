import "./globals.css";
import type { ReactNode } from "react";
import I18nProvider from "./providers/I18nProvider";

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
      <body className="min-h-screen">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
