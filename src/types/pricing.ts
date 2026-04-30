/**
 * Pricing Plan Types
 */

export type UserTier = "basic" | "intermediate" | "enterprise";

export interface PricingLimits {
  learningRequestsPerHour: number;
  evaluationSessionsPerDay: number;
  evaluationsPerSession: number | null;
  allowEvaluationOverage: boolean;
}

export interface PricingPlan {
  id: string;
  tier: UserTier;
  name: string;
  description: string;
  badge: string;
  priceLabel: string;
  features: string[];
  cta: string;
  note: string;
  isPopular: boolean;
  limits: PricingLimits;
}

export interface PricingPlansResponse {
  plans: PricingPlan[];
}

/**
 * User Usage Types
 */

export interface HourlyUsage {
  learningRequests: number;
  limit: number;
  resetAt: string; // ISO 8601 timestamp
}

export interface DailyUsage {
  evaluationSessions: number;
  limit: number;
  resetAt: string; // ISO 8601 timestamp
}

export interface SessionUsage {
  evaluations: number;
  limit: number;
}

export interface UserUsage {
  tier: UserTier;
  planName: string;
  limits: PricingLimits;
  currentHour: HourlyUsage;
  today: DailyUsage;
  currentSession: SessionUsage;
  allowEvaluationOverage: boolean;
}

/**
 * User Profile with Tier
 */

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  tier: UserTier;
  role?: "user" | "admin";
  created_at?: string;
  updated_at?: string;
}

/**
 * Limit Exceeded Error Response
 */

export interface LimitExceededError {
  detail: string;
  tier: UserTier;
  limit: number;
  used: number;
  resetAt: string;
  suggestedAction?: "upgrade" | "wait";
}
