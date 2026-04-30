/**
 * Limit Warning Component
 * Displays usage warnings when approaching limits
 */

"use client";

import React from "react";
import { AlertTriangle, Ban, Clock } from "lucide-react";
import { UserUsage } from "@/types/pricing";
import {
  USAGE_WARNING_THRESHOLD,
  USAGE_CRITICAL_THRESHOLD,
} from "@/lib/constants";

interface LimitWarningProps {
  usage: UserUsage | null;
  type: "learning" | "evaluation";
}

function getUsagePercentage(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((used / limit) * 100);
}

function getWarningLevel(percentage: number): "none" | "warning" | "critical" {
  if (percentage >= USAGE_CRITICAL_THRESHOLD * 100) return "critical";
  if (percentage >= USAGE_WARNING_THRESHOLD * 100) return "warning";
  return "none";
}

function formatLimit(limit: number): string {
  return limit < 0 ? "Unlimited" : String(limit);
}

export function LimitWarning({ usage, type }: LimitWarningProps) {
  if (!usage) return null;

  const values =
    type === "learning"
      ? {
          used: usage.currentHour.learningRequests,
          limit: usage.currentHour.limit,
          resetAt: usage.currentHour.resetAt,
          label: "learning requests this hour",
        }
      : {
          used: usage.today.evaluationSessions,
          limit: usage.today.limit,
          resetAt: usage.today.resetAt,
          label: "evaluation sessions today",
        };

  const percentage = getUsagePercentage(values.used, values.limit);
  const warningLevel = getWarningLevel(percentage);

  if (warningLevel === "none") return null;

  const remaining = Math.max(values.limit - values.used, 0);
  const isCritical = warningLevel === "critical";
  const Icon = isCritical ? AlertTriangle : Clock;
  const color = isCritical
    ? "bg-red-100 border-red-300 text-red-800"
    : "bg-yellow-100 border-yellow-300 text-yellow-800";

  return (
    <div className={`border rounded-md p-3 mb-3 ${color}`} role="status">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-semibold">
            {isCritical ? "Usage Limit Reached" : "Approaching Usage Limit"}
          </p>
          <p className="text-sm">
            {values.used} of {values.limit} {values.label} used
            {remaining > 0 && ` (${remaining} remaining)`}
          </p>
          {remaining === 0 && (
            <p className="text-sm mt-1">
              Resets at: {new Date(values.resetAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isCritical ? "bg-red-600" : "bg-yellow-600"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface LimitExceededErrorProps {
  detail: string;
  tier: string;
  limit: number;
  used: number;
  resetAt: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

export function LimitExceededErrorDisplay({
  detail,
  limit,
  used,
  resetAt,
  tier,
  onUpgrade,
  onDismiss,
}: LimitExceededErrorProps) {
  const resetDate = new Date(resetAt);

  return (
    <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Ban className="h-6 w-6 shrink-0 text-red-700" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="font-bold text-red-800 mb-1">Usage Limit Exceeded</h3>
          <p className="text-sm text-red-700 mb-2">{detail}</p>
          <div className="text-sm text-red-600 mb-3 bg-red-100 p-2 rounded">
            <p>
              <strong>Current tier:</strong> {tier}
            </p>
            <p>
              <strong>Limit:</strong> {formatLimit(limit)}
            </p>
            <p>
              <strong>Used:</strong> {used}
            </p>
            <p>
              <strong>Resets:</strong> {resetDate.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Upgrade Plan
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface UsageStatsProps {
  usage: UserUsage | null;
  isLoading?: boolean;
}

export function UsageStats({ usage, isLoading }: UsageStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      </div>
    );
  }

  if (!usage) return null;

  const evaluationLimit = usage.currentSession.limit;

  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
        <span>Learning requests this hour:</span>
        <span className="font-semibold">
          {usage.currentHour.learningRequests} / {usage.currentHour.limit}
        </span>
      </div>
      <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
        <span>Evaluation sessions today:</span>
        <span className="font-semibold">
          {usage.today.evaluationSessions} / {usage.today.limit}
        </span>
      </div>
      <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
        <span>Evaluations per session:</span>
        <span className="font-semibold">{formatLimit(evaluationLimit)}</span>
      </div>
    </div>
  );
}
