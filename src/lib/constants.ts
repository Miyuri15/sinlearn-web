/**
 * Pricing Plan Constants
 */

import { PricingPlan, UserTier } from "@/types/pricing";

export const PRICING_TIERS: Record<
  UserTier,
  {
    name: string;
    badge: string;
    color: string;
    description: string;
    features: string[];
    priceLabel: string;
    cta: string;
    note: string;
    isPopular: boolean;
  }
> = {
  basic: {
    name: "Basic Plan",
    badge: "Starter",
    color: "bg-blue-50",
    description: "A lightweight plan for getting started with Learning Mode",
    features: [
      "Learning mode: 5 requests per hour",
      "Evaluation mode: 1 session per day",
      "Up to 10 evaluations per session",
      "Perfect for getting started",
    ],
    priceLabel: "Free / forever",
    cta: "Start Free",
    note: "No credit card required",
    isPopular: false,
  },
  intermediate: {
    name: "Intermediate Plan",
    badge: "Most Popular",
    color: "bg-purple-50",
    description: "For regular users who need more daily usage",
    features: [
      "Learning mode: 20 requests per hour",
      "Evaluation mode: 5 sessions per day",
      "Built for steady classroom or personal use",
      "Priority access during busy periods",
    ],
    priceLabel: "5000 LKR / tier",
    cta: "Choose Intermediate",
    note: "Usage resets apply",
    isPopular: true,
  },
  enterprise: {
    name: "Enterprise Plan",
    badge: "Best for Scale",
    color: "bg-amber-50",
    description: "For teams and institutions that need the highest limits",
    features: [
      "Learning mode: 50 requests per hour",
      "Evaluation mode: 10 sessions per day",
      "Next evaluations are charged",
      "Designed for larger deployments",
    ],
    priceLabel: "10000 LKR onwards / tier",
    cta: "Contact Sales",
    note: "Usage resets apply",
    isPopular: false,
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

export const DEFAULT_PRICING_PLANS: Record<UserTier, PricingPlan> = {
  basic: {
    id: "basic",
    tier: "basic",
    name: PRICING_TIERS.basic.name,
    priceLabel: PRICING_TIERS.basic.priceLabel,
    description: PRICING_TIERS.basic.description,
    badge: PRICING_TIERS.basic.badge,
    features: PRICING_TIERS.basic.features,
    cta: PRICING_TIERS.basic.cta,
    note: PRICING_TIERS.basic.note,
    isPopular: PRICING_TIERS.basic.isPopular,
    isActive: true,
    limits: TIER_LIMITS.basic,
  },
  intermediate: {
    id: "intermediate",
    tier: "intermediate",
    name: PRICING_TIERS.intermediate.name,
    priceLabel: PRICING_TIERS.intermediate.priceLabel,
    description: PRICING_TIERS.intermediate.description,
    badge: PRICING_TIERS.intermediate.badge,
    features: PRICING_TIERS.intermediate.features,
    cta: PRICING_TIERS.intermediate.cta,
    note: PRICING_TIERS.intermediate.note,
    isPopular: PRICING_TIERS.intermediate.isPopular,
    isActive: true,
    limits: TIER_LIMITS.intermediate,
  },
  enterprise: {
    id: "enterprise",
    tier: "enterprise",
    name: PRICING_TIERS.enterprise.name,
    priceLabel: PRICING_TIERS.enterprise.priceLabel,
    description: PRICING_TIERS.enterprise.description,
    badge: PRICING_TIERS.enterprise.badge,
    features: PRICING_TIERS.enterprise.features,
    cta: PRICING_TIERS.enterprise.cta,
    note: PRICING_TIERS.enterprise.note,
    isPopular: PRICING_TIERS.enterprise.isPopular,
    isActive: true,
    limits: TIER_LIMITS.enterprise,
  },
};
