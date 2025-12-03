"use client";

import Link from "next/link";
import LanguageToggle from "@/components/language/LanguageToggle";
import Button from "@/components/ui/Button";
import { GraduationCap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl border border-gray-200 dark:border-gray-700 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center rounded-full bg-blue-600 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
            <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
          Page not found
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/" className="w-36">
            <Button className="w-full">Home</Button>
          </Link>

          <Link href="/dashboard" className="w-36">
            <Button className="w-full">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
