"use client";

import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Shield,
  Users,
} from "lucide-react";
import {
  useCurrentUser,
  usePricingPlans,
  useUserUsage,
} from "@/hooks/usePricing";
import { TierBadge } from "@/components/pricing/TierBadge";
import { PricingPlan } from "@/types/pricing";

function formatLimit(limit: number | null): string {
  return limit === null ? "Unlimited" : String(limit);
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Shield;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{helper}</p>
    </div>
  );
}

function PlanRow({ plan }: { plan: PricingPlan }) {
  return (
    <tr className="border-t border-gray-200 dark:border-gray-700">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <TierBadge tier={plan.tier} size="sm" />
          <span className="font-medium text-gray-900 dark:text-white">
            {plan.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
        {plan.priceLabel}
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
        {plan.limits.learningRequestsPerHour}/hour
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
        {plan.limits.evaluationSessionsPerDay}/day
      </td>
      <td className="py-3 pl-4 text-gray-700 dark:text-gray-300">
        {formatLimit(plan.limits.evaluationsPerSession)}
        {plan.limits.allowEvaluationOverage && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            Overage
          </span>
        )}
      </td>
    </tr>
  );
}

export default function AdminDashboard() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { plans, isLoading: plansLoading, error: plansError } = usePricingPlans();
  const { usage, isLoading: usageLoading } = useUserUsage();

  if (userLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
        You do not have permission to view admin dashboard.
      </div>
    );
  }

  const planCount = plans?.plans.length ?? 0;
  const currentUsageLabel = usage
    ? `${usage.currentHour.learningRequests}/${usage.currentHour.limit}`
    : usageLoading
      ? "Loading"
      : "Unavailable";
  const evaluationUsageLabel = usage
    ? `${usage.today.evaluationSessions}/${usage.today.limit}`
    : usageLoading
      ? "Loading"
      : "Unavailable";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-blue-700 dark:text-blue-300" />
            <div>
              <p className="font-semibold text-blue-950 dark:text-blue-100">
                Signed in as admin
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {user.email} has backend role `admin`. Backend authorization
                still protects admin-only endpoints.
              </p>
            </div>
          </div>
          <TierBadge tier={user.tier} size="md" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Pricing Plans"
          value={plansLoading ? "..." : String(planCount)}
          helper="Plan definitions loaded from backend."
          icon={Database}
        />
        <MetricCard
          label="Learning Usage"
          value={currentUsageLabel}
          helper="Your admin account usage this hour."
          icon={BarChart3}
        />
        <MetricCard
          label="Evaluation Sessions"
          value={evaluationUsageLabel}
          helper="Your admin account sessions today."
          icon={Clock}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Pricing Plans
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Read-only view of currently enforced backend plan limits.
              </p>
            </div>
            <Link
              href="/settings/plan"
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              View Plan
            </Link>
          </div>

          {plansError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              Failed to load pricing plans.
            </div>
          )}

          {!plansError && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 dark:text-gray-400">
                    <th className="pb-3 pr-4 font-semibold">Plan</th>
                    <th className="px-4 pb-3 font-semibold">Price</th>
                    <th className="px-4 pb-3 font-semibold">Learning</th>
                    <th className="px-4 pb-3 font-semibold">Sessions</th>
                    <th className="pb-3 pl-4 font-semibold">Evaluations</th>
                  </tr>
                </thead>
                <tbody>
                  {plans?.plans.map((plan) => (
                    <PlanRow key={plan.tier} plan={plan} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <Users className="mb-3 h-5 w-5 text-purple-600" aria-hidden="true" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              User Management
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Tier changes are supported by backend, but the frontend needs an
              admin user-list endpoint to pick users.
            </p>
            <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-400">
              Needed: `GET /api/v1/users` for admins.
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <CheckCircle2
              className="mb-3 h-5 w-5 text-emerald-600"
              aria-hidden="true"
            />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Ready Now
            </h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Admin login detection</li>
              <li>Standalone admin route</li>
              <li>Pricing plan visibility</li>
            </ul>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/20">
            <AlertCircle className="mb-3 h-5 w-5 text-amber-700" aria-hidden="true" />
            <h3 className="font-semibold text-amber-950 dark:text-amber-100">
              Next Step
            </h3>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
              Add backend admin list/search endpoints, then this dashboard can
              manage user tiers directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
