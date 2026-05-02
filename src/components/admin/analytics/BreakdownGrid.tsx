"use client";

import { ApiUsageByService, ApiUsageByProvider } from "@/types/admin";
import { Database, Cloud, Zap, ShieldCheck } from "lucide-react";

interface BreakdownGridProps {
  services: ApiUsageByService[];
  providers: ApiUsageByProvider[];
  isLoading: boolean;
}

export function BreakdownGrid({ services, providers, isLoading }: BreakdownGridProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Services Breakdown */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Service Breakdown</h3>
            <p className="text-xs text-gray-500">Usage distributed by feature</p>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))
          ) : services.length > 0 ? (
            services.map((s) => (
              <div key={s.service_name} className="group relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">
                    {s.service_name || "Unknown"}
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    {s.request_count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-1000 group-hover:bg-purple-400"
                    style={{
                      width: `${Math.min(
                        100,
                        (s.request_count / Math.max(...services.map((x) => x.request_count))) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" /> {s.total_tokens.toLocaleString()} tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> {((s.success_count / s.request_count) * 100).toFixed(1)}% success
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-sm text-gray-500">No service data found</div>
          )}
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Provider Breakdown</h3>
            <p className="text-xs text-gray-500">Distribution across LLM providers</p>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))
          ) : providers.length > 0 ? (
            providers.map((p) => (
              <div key={p.provider} className="group relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">
                    {p.provider || "Unknown"}
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    {p.request_count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-1000 group-hover:bg-blue-400"
                    style={{
                      width: `${Math.min(
                        100,
                        (p.request_count / Math.max(...providers.map((x) => x.request_count))) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" /> {p.total_tokens.toLocaleString()} tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> {((p.success_count / p.request_count) * 100).toFixed(1)}% success
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-sm text-gray-500">No provider data found</div>
          )}
        </div>
      </div>
    </div>
  );
}
