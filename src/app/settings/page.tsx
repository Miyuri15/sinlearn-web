/**
 * Settings Root Page
 * Redirects to /settings/general
 */

import { redirect } from "next/navigation";

export default function SettingsPage() {
  redirect("/settings/general");
}
