/**
 * API Client - Pricing & Usage Endpoints
 */

import {
  UserProfile,
  UserUsage,
  PricingPlansResponse,
  LimitExceededError,
} from "@/types/pricing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Fetch current user with tier information
 * GET /api/v1/users/me
 */
export async function fetchCurrentUser(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch all available pricing plans
 * GET /api/v1/pricing/plans
 */
export async function fetchPricingPlans(): Promise<PricingPlansResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/pricing/plans`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pricing plans: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch current user's usage statistics
 * GET /api/v1/usage/me
 */
export async function fetchUserUsage(): Promise<UserUsage> {
  const response = await fetch(`${API_BASE_URL}/api/v1/usage/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 403) {
      const errorData: LimitExceededError = await response.json();
      throw new LimitExceededErrorClass(errorData);
    }
    throw new Error(`Failed to fetch usage: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update user tier (admin only)
 * PATCH /api/v1/users/{userId}/tier
 */
export async function updateUserTier(
  userId: string,
  tier: "basic" | "intermediate" | "enterprise",
): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/tier`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ tier }),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Only admins can update user tiers");
    }
    throw new Error(`Failed to update user tier: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Custom error class for limit exceeded errors
 */
export class LimitExceededErrorClass
  extends Error
  implements LimitExceededError
{
  detail: string;
  tier: "basic" | "intermediate" | "enterprise";
  limit: number;
  used: number;
  resetAt: string;
  suggestedAction?: "upgrade" | "wait";

  constructor(errorData: LimitExceededError) {
    super(errorData.detail);
    this.name = "LimitExceededError";
    this.detail = errorData.detail;
    this.tier = errorData.tier;
    this.limit = errorData.limit;
    this.used = errorData.used;
    this.resetAt = errorData.resetAt;
    this.suggestedAction = errorData.suggestedAction;
  }
}
