import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "SinLearn",
  description: "AI-Powered Sinhala Educational Assistant",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="transition-colors duration-300">

        {children}
      </body>
    </html>
  );
}
