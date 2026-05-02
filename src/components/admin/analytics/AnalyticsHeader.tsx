"use client";

import { ChevronLeft, Calendar, Filter, RefreshCw } from "lucide-react";
import Link from "next/link";
import { ApiUsageTrendGroup } from "@/types/admin";

interface AnalyticsHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  groupBy: ApiUsageTrendGroup;
  setGroupBy: (group: ApiUsageTrendGroup) => void;
}

export function AnalyticsHeader({
  onRefresh,
  isRefreshing,
  groupBy,
  setGroupBy,
}: AnalyticsHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-5 w-5 text-gray-500 transition-transform group-hover:-translate-x-0.5" />
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            System Monitoring
          </p>
          <h1 className="text-3xl font-black text-gray-950 dark:text-white">
            Usage Analytics
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white/50 p-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {(["hour", "day", "month"] as ApiUsageTrendGroup[]).map((group) => (
              <button
                key={group}
                onClick={() => setGroupBy(group)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                  groupBy === group
                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Last 30 Days</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
