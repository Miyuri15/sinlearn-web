import "./globals.css";
import type { ReactNode } from "react";
import I18nProvider from "./providers/I18nProvider";
import { ToastProvider } from "@/components/ui/Toast";
import AuthListener from "@/components/auth/AuthListener";
import AuthenticatedLayout from "./AuthenticatedLayout";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";

export const metadata = {
  title: "SinhalaLearn",
  description: "AI-Powered Sinhala Educational Assistant",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/Icon.png",
  },
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

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
      <body className="h-dvh transition-colors duration-300">
        <I18nProvider>
          <ToastProvider>
            <ServiceWorkerRegistration />
            <AuthListener />
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
