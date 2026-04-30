/**
 * Plan Settings Component
 * Displays current tier, usage, limits, and upgrade options
 */

"use client";

import "@/lib/i18n";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SettingsSection from "./SettingsSection";
import { TierBadge, TierCard } from "@/components/pricing/TierBadge";
import { UsageStats, LimitWarning } from "@/components/pricing/LimitWarning";
import {
  useCurrentUser,
  useUserUsage,
  usePricingPlans,
} from "@/hooks/usePricing";
import { TIER_LIMITS, PRICING_TIERS } from "@/lib/constants";
import { UserTier } from "@/types/pricing";

export default function PlanSettings() {
  const { t } = useTranslation("common");
  const { user, isLoading: userLoading } = useCurrentUser();
  const {
    usage,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = useUserUsage();
  const { plans, isLoading: plansLoading } = usePricingPlans();

  // Format reset time
  const formatResetTime = (resetAt: string): string => {
    const date = new Date(resetAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;

    return date.toLocaleDateString();
  };

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
  const currentLimits = TIER_LIMITS[currentTier];

  return (
    <SettingsSection
      title={t("settings.plan") || "Plan"}
      description={t("settings.plan_desc") || "Manage your subscription plan"}
    >
      {/* Current Plan Display */}
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("settings.current_plan") || "Current Plan"}
          </h3>
          <TierBadge tier={currentTier} size="lg" />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {PRICING_TIERS[currentTier].description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              ✓ Active
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

      {/* Usage Statistics */}
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

      {/* Plan Limits */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("settings.plan_limits") || "Your Limits"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Learning Requests */}
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

          {/* Evaluation Sessions */}
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

          {/* Evaluations Per Session */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Evaluations/Session
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {currentLimits.evaluationsPerSession === -1
                ? "Unlimited"
                : currentLimits.evaluationsPerSession}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Per evaluation session
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("settings.plan_features") || "Included Features"}
        </h3>

        <div className="space-y-2">
          {PRICING_TIERS[currentTier].features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm">
              <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
              <span className="text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Section */}
      {currentTier !== "enterprise" && (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-700 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {currentTier === "basic"
              ? "Ready to unlock more?"
              : "Upgrade to Enterprise"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {currentTier === "basic"
              ? "Upgrade to Professional for 20 requests/hour and 5 sessions/day, or to Enterprise for unlimited access."
              : "Enterprise users get unlimited evaluations and priority support."}
          </p>

          <div className="flex gap-3 flex-wrap">
            {currentTier === "basic" && (
              <>
                <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                  Upgrade to Professional
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
          <div className="text-3xl mb-2">👑</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Enterprise Plan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You have unlimited access and priority support. Thank you for being
            a valued Enterprise customer!
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={refetchUsage}
          disabled={usageLoading}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          {usageLoading ? "Refreshing..." : "Refresh Usage"}
        </button>
      </div>
    </SettingsSection>
  );
}
