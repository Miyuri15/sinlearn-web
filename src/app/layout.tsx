import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "SinLearn",
  description: "AI-Powered Sinhala Educational Assistant",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Get stored theme or system preference
                  const stored = localStorage.getItem('theme');
                  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const theme = stored || system;
                  
                  // Apply theme immediately to prevent flash
                  document.documentElement.classList.add(theme);
                  
                  // Also add to body for Tailwind
                  if (theme === 'dark') {
                    document.body.classList.add('dark');
                  }
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
