/**
 * Plan Settings Component
 * Displays current tier, usage, limits, and upgrade options
 */

"use client";

import "@/lib/i18n";
import { Check, Crown, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import SettingsSection from "./SettingsSection";
import { TierBadge } from "@/components/pricing/TierBadge";
import { UsageStats, LimitWarning } from "@/components/pricing/LimitWarning";
import {
  useCurrentUser,
  useUserUsage,
  usePricingPlans,
} from "@/hooks/usePricing";
import { TIER_LIMITS, PRICING_TIERS } from "@/lib/constants";
import { PricingLimits, UserTier } from "@/types/pricing";

function formatSessionLimit(limit: number | null): string {
  return limit === null ? "Unlimited" : String(limit);
}

function getCurrentLimits(
  currentTier: UserTier,
  usageLimits?: PricingLimits,
  planLimits?: PricingLimits,
): PricingLimits {
  return usageLimits || planLimits || TIER_LIMITS[currentTier];
}

export default function PlanSettings() {
  const { t } = useTranslation("common");
  const { user, isLoading: userLoading } = useCurrentUser();
  const {
    usage,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = useUserUsage();
  const { plans, isLoading: plansLoading } = usePricingPlans();

  if (userLoading || plansLoading) {
    return (
      <SettingsSection
        title={t("settings.plan") || "Plan"}
        description={t("settings.plan_desc") || "Manage your subscription plan"}
      >
        <div className="space-y-4 animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </SettingsSection>
    );
  }

  if (!user) {
    return (
      <SettingsSection
        title={t("settings.plan") || "Plan"}
        description={t("settings.plan_desc") || "Manage your subscription plan"}
      >
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            Unable to load plan information. Please refresh the page.
          </p>
        </div>
      </SettingsSection>
    );
  }

  const currentTier = user.tier as UserTier;
  const currentPlan = plans?.plans.find((plan) => plan.tier === currentTier);
  const currentLimits = getCurrentLimits(
    currentTier,
    usage?.limits,
    currentPlan?.limits,
  );
  const planDescription =
    currentPlan?.description || PRICING_TIERS[currentTier].description;
  const planFeatures = currentPlan?.features || PRICING_TIERS[currentTier].features;

  return (
    <SettingsSection
      title={t("settings.plan") || "Plan"}
      description={t("settings.plan_desc") || "Manage your subscription plan"}
    >
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("settings.current_plan") || "Current Plan"}
          </h3>
          <TierBadge tier={currentTier} size="lg" />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {planDescription}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className="inline-flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" aria-hidden="true" />
              Active
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Joined:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(user.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {usage && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("settings.usage") || "Current Usage"}
          </h3>

          <LimitWarning usage={usage} type="learning" />
          <LimitWarning usage={usage} type="evaluation" />

          <UsageStats usage={usage} isLoading={usageLoading} />
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("settings.plan_limits") || "Your Limits"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Learning Requests/Hour
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentLimits.learningRequestsPerHour}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Resets every hour
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Evaluation Sessions/Day
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {currentLimits.evaluationSessionsPerDay}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Resets daily at midnight
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Evaluations/Session
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatSessionLimit(currentLimits.evaluationsPerSession)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {currentLimits.allowEvaluationOverage
                ? "Extra evaluations may be billed"
                : "Per evaluation session"}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("settings.plan_features") || "Included Features"}
        </h3>

        <div className="space-y-2">
          {planFeatures.map((feature) => (
            <div key={feature} className="flex items-start gap-3 text-sm">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
              <span className="text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {currentTier !== "enterprise" && (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-700 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {currentTier === "basic"
              ? "Ready to unlock more?"
              : "Upgrade to Enterprise"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {currentTier === "basic"
              ? "Upgrade to Intermediate for 20 requests/hour and 5 sessions/day, or to Enterprise for the highest limits."
              : "Enterprise users get the highest limits, overage support, and priority support."}
          </p>

          <div className="flex gap-3 flex-wrap">
            {currentTier === "basic" && (
              <>
                <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                  Upgrade to Intermediate
                </button>
                <button className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition">
                  Upgrade to Enterprise
                </button>
              </>
            )}
            {currentTier === "intermediate" && (
              <button className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition">
                Upgrade to Enterprise
              </button>
            )}
          </div>
        </div>
      )}

      {currentTier === "enterprise" && (
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-700 rounded-2xl text-center">
          <Crown
            className="mx-auto mb-2 h-8 w-8 text-amber-600"
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Enterprise Plan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You have the highest limits and priority support. Thank you for
            being a valued Enterprise customer.
          </p>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={refetchUsage}
          disabled={usageLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${usageLoading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {usageLoading ? "Refreshing..." : "Refresh Usage"}
        </button>
      </div>
    </SettingsSection>
  );
}
