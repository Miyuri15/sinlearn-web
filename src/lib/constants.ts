/**
 * Pricing Plan Constants
 */

import { UserTier } from "@/types/pricing";

export const PRICING_TIERS: Record<
  UserTier,
  {
    name: string;
    badge: string;
    color: string;
    description: string;
    features: string[];
  }
> = {
  basic: {
    name: "Starter",
    badge: "Starter",
    color: "bg-blue-50",
    description: "Free forever plan",
    features: [
      "5 learning requests/hour",
      "1 evaluation session/day",
      "10 evaluations per session",
      "Community support",
    ],
  },
  intermediate: {
    name: "Professional",
    badge: "Most Popular",
    color: "bg-purple-50",
    description: "For serious learners",
    features: [
      "20 learning requests/hour",
      "5 evaluation sessions/day",
      "Unlimited evaluations per session",
      "Priority support",
      "Advanced analytics",
    ],
  },
  enterprise: {
    name: "Enterprise",
    badge: "Best for Scale",
    color: "bg-amber-50",
    description: "For institutions and organizations",
    features: [
      "50 learning requests/hour",
      "10 evaluation sessions/day",
      "Unlimited evaluations",
      "Dedicated support",
      "Custom integrations",
      "Bulk user management",
    ],
  },
};

/**
 * Usage warning thresholds (percentage of limit)
 */
export const USAGE_WARNING_THRESHOLD = 0.8; // 80%
export const USAGE_CRITICAL_THRESHOLD = 0.95; // 95%

/**
 * Cache durations (milliseconds)
 */
export const CACHE_DURATIONS = {
  PRICING_PLANS: 7 * 24 * 60 * 60 * 1000, // 7 days
  USER_USAGE: 30 * 1000, // 30 seconds
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
};

/**
 * Usage poll intervals (milliseconds)
 */
export const USAGE_POLL_INTERVAL = 30 * 1000; // 30 seconds during active chat

/**
 * Tier-based limits (for reference/fallback)
 */
export const TIER_LIMITS = {
  basic: {
    learningRequestsPerHour: 5,
    evaluationSessionsPerDay: 1,
    evaluationsPerSession: 10,
    allowEvaluationOverage: false,
  },
  intermediate: {
    learningRequestsPerHour: 20,
    evaluationSessionsPerDay: 5,
    evaluationsPerSession: null,
    allowEvaluationOverage: false,
  },
  enterprise: {
    learningRequestsPerHour: 50,
    evaluationSessionsPerDay: 10,
    evaluationsPerSession: null,
    allowEvaluationOverage: true,
  },
};
