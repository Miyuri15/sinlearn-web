"use client";

import { usePathname } from "next/navigation";
import LanguageToggle from "./LanguageToggle";

export default function LanguageToggleClient() {
  const pathname = usePathname();

  // If pathname is not yet available (rare), don't render the toggle.
  if (!pathname) return null;

  // Hide the language toggle for the dashboard and any sub-routes under /dashboard
  if (pathname.startsWith("/dashboard")) return null;

  return <LanguageToggle />;
}
