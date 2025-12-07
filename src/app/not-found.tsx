"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/chat/EmptyState";
import {
  MessageSquare,
  LogIn,
  UserPlus,
  Settings,
  XCircle,
} from "lucide-react";
import LanguageToggle from "@/components/header/LanguageToggle";
import ThemeToggle from "@/components/header/ThemeToggle";

export default function NotFound() {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* main content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-2xl">
          <div className="absolute top-4 left-4 z-50">
            <LanguageToggle />
          </div>
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-10 border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="rounded-full bg-red-50 dark:bg-red-900/30 w-20 h-20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <h1 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
              Oops - page not found
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>

            <div className="mb-6">
              <EmptyState
                title="Try one of these pages"
                subtitle="Or go back to the chat page."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/chat" className="w-full">
                <Button className="w-full flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </Button>
              </Link>

              <Link href="/settings" className="w-full">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>

            <div className="mt-4 flex gap-3 justify-center">
              <Link href="/auth/sign-in" className="w-36">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-center gap-3"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign in</span>
                </Button>
              </Link>

              <Link href="/auth/sign-up" className="w-36">
                <Button
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-3"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Sign up</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
