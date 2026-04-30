"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              SinLearn Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-950 dark:text-white sm:text-3xl">
              Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Chat
            </Link>
            <Link
              href="/settings/general"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          </div>
        </div>

        <AdminDashboard />
      </div>
    </main>
  );
}
