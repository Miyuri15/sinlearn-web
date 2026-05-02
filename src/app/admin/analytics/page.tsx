"use client";

import { useState } from "react";
import { AnalyticsHeader } from "@/components/admin/analytics/AnalyticsHeader";
import { TrendChart } from "@/components/admin/analytics/TrendChart";
import { BreakdownGrid } from "@/components/admin/analytics/BreakdownGrid";
import {
  useAdminApiUsageSummary,
} from "@/hooks/usePricing";
import {
  useAdminApiUsageTrend,
  useAdminApiUsageByService,
  useAdminApiUsageByProvider,
} from "@/hooks/useAdminAnalytics";
import { ApiUsageTrendGroup } from "@/types/admin";
import { Activity, Zap, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [groupBy, setGroupBy] = useState<ApiUsageTrendGroup>("day");
  
  const { 
    summary, 
    isLoading: summaryLoading, 
    refetch: refetchSummary 
  } = useAdminApiUsageSummary();

  const { 
    data: trendData, 
    isLoading: trendLoading, 
    refetch: refetchTrend 
  } = useAdminApiUsageTrend({ group_by: groupBy });

  const { 
    data: serviceData, 
    isLoading: serviceLoading, 
    refetch: refetchService 
  } = useAdminApiUsageByService();

  const { 
    data: providerData, 
    isLoading: providerLoading, 
    refetch: refetchProvider 
  } = useAdminApiUsageByProvider();

  const handleRefresh = () => {
    refetchSummary();
    refetchTrend();
    refetchService();
    refetchProvider();
  };

  const isRefreshing = summaryLoading || trendLoading || serviceLoading || providerLoading;

  return (
    <main className="min-h-screen bg-gray-50/50 px-4 py-8 dark:bg-gray-950/50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AnalyticsHeader 
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
        />

        {/* Summary Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Requests"
            value={summary?.total_requests?.toLocaleString() ?? "0"}
            icon={Activity}
            color="blue"
            loading={summaryLoading}
          />
          <StatCard
            label="Success Rate"
            value={`${summary?.success_rate ?? 0}%`}
            icon={CheckCircle}
            color="emerald"
            loading={summaryLoading}
          />
          <StatCard
            label="Tokens Used"
            value={summary?.total_tokens?.toLocaleString() ?? "0"}
            icon={Zap}
            color="amber"
            loading={summaryLoading}
          />
          <StatCard
            label="Avg Duration"
            value={`${summary?.avg_duration_ms ?? 0}ms`}
            icon={Clock}
            color="purple"
            loading={summaryLoading}
          />
        </div>

        {/* Charts & Breakdown */}
        <div className="space-y-8">
          <TrendChart 
            data={trendData || []} 
            title="Request Trend" 
            isLoading={trendLoading} 
          />
          
          <BreakdownGrid 
            services={serviceData || []}
            providers={providerData || []}
            isLoading={serviceLoading || providerLoading}
          />
        </div>
      </div>
    </main>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  loading 
}: { 
  label: string; 
  value: string; 
  icon: any; 
  color: "blue" | "emerald" | "amber" | "purple";
  loading: boolean;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-blue-500/10",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 shadow-emerald-500/10",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 shadow-amber-500/10",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 shadow-purple-500/10",
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
            {loading ? "..." : value}
          </p>
        </div>
        <div className={`rounded-2xl p-3 shadow-inner ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className={`h-full w-2/3 rounded-full ${color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-purple-500'}`} />
        </div>
      </div>
    </div>
  );
}
