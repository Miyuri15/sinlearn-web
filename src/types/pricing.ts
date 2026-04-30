/**
 * Pricing Plan Types
 */

export type UserTier = "basic" | "intermediate" | "enterprise";

export interface PricingLimits {
  learningRequestsPerHour: number;
  evaluationSessionsPerDay: number;
  evaluationsPerSession: number;
}

export interface PricingPlan {
  id: string;
  tier: UserTier;
  name: string;
  description: string;
  badge: string;
  price: number;
  currency: string;
  features: string[];
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
  userId: string;
  tier: UserTier;
  currentHour: HourlyUsage;
  today: DailyUsage;
  currentSession: SessionUsage;
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
