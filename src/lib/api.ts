/**
 * Pricing & Usage API Client
 * Uses centralized apiFetch with token refresh, caching, and offline support
 */

import { apiFetch } from "./api/client";
import { API_BASE_URL } from "./config";
import {
  UserProfile,
  UserUsage,
  PricingPlansResponse,
  LimitExceededError,
} from "@/types/pricing";

/**
 * Fetch current user with tier information
 * GET /api/v1/users/me
 */
export async function fetchCurrentUser(): Promise<UserProfile> {
  return apiFetch<UserProfile>(`${API_BASE_URL}/api/v1/users/me`, {
    method: "GET",
  });
}

/**
 * Fetch all available pricing plans
 * GET /api/v1/pricing/plans
 */
export async function fetchPricingPlans(): Promise<PricingPlansResponse> {
  return apiFetch<PricingPlansResponse>(
    `${API_BASE_URL}/api/v1/pricing/plans`,
    {
      method: "GET",
    },
  );
}

/**
 * Fetch current user's usage statistics
 * GET /api/v1/usage/me
 */
export async function fetchUserUsage(): Promise<UserUsage> {
  try {
    return await apiFetch<UserUsage>(`${API_BASE_URL}/api/v1/usage/me`, {
      method: "GET",
    });
  } catch (error) {
    // Check if it's a 403 limit exceeded error and wrap it
    if (error instanceof Error && "status" in error && error.status === 403) {
      try {
        // Try to parse the error details from the response
        const details = (error as any).details as LimitExceededError;
        if (details && "tier" in details) {
          throw new LimitExceededErrorClass(details);
        }
      } catch (e) {
        // If parsing fails, re-throw the original error
        throw error;
      }
    }
    throw error;
  }
}

/**
 * Update user tier (admin only)
 * PATCH /api/v1/users/{userId}/tier
 */
export async function updateUserTier(
  userId: string,
  tier: "basic" | "intermediate" | "enterprise",
): Promise<UserProfile> {
  return apiFetch<UserProfile>(`${API_BASE_URL}/api/v1/users/${userId}/tier`, {
    method: "PATCH",
    body: JSON.stringify({ tier }),
  });
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
