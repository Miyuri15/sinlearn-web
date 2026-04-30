"use client";

import { Shield, Users, BarChart3 } from "lucide-react";
import { useCurrentUser } from "@/hooks/usePricing";
import SettingsSection from "./SettingsSection";

export default function AdminSettings() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <SettingsSection
        title="Admin"
        description="Manage users, tiers, and system visibility"
      >
        <div className="space-y-4 animate-pulse">
          <div className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </SettingsSection>
    );
  }

  if (user?.role !== "admin") {
    return (
      <SettingsSection
        title="Admin"
        description="Manage users, tiers, and system visibility"
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          You do not have permission to view admin settings.
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Admin"
      description="Manage users, tiers, and system visibility"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Shield className="mb-3 h-5 w-5 text-blue-600" aria-hidden="true" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Admin Access
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Your account is recognized as an admin from the backend role.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Users className="mb-3 h-5 w-5 text-purple-600" aria-hidden="true" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            User Tiers
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Ready for user listing once the admin user-list endpoint is added.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <BarChart3 className="mb-3 h-5 w-5 text-emerald-600" aria-hidden="true" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Usage Overview
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Per-user usage requires a backend admin usage endpoint.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
