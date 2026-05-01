/**
 * Pricing & Usage API Client
 * Uses centralized apiFetch with token refresh, caching, and offline support
 */

import { apiFetch, ApiError } from "./api/client";
import { API_BASE_URL } from "./config";
import {
  UserProfile,
  UserUsage,
  PricingPlansResponse,
  LimitExceededError,
  UserTier,
  PricingPlan,
  PricingPlanUpdate,
  AdminUsersResponse,
} from "@/types/pricing";

type BackendPlanLimits = {
  learning_requests_per_hour: number;
  evaluation_sessions_per_day: number;
  evaluations_per_session: number | null;
  allow_evaluation_overage: boolean;
};

type BackendPricingPlan = {
  tier: UserTier;
  name: string;
  price_label: string;
  description: string;
  badge: string;
  features: string[];
  cta: string;
  note: string;
  limits: BackendPlanLimits;
  is_popular: boolean;
  is_active?: boolean;
};

type BackendPricingPlansResponse = {
  plans: BackendPricingPlan[];
};

type BackendPlanLimitsUpdate = {
  learning_requests_per_hour?: number;
  evaluation_sessions_per_day?: number;
  evaluations_per_session?: number | null;
  allow_evaluation_overage?: boolean;
};

type BackendPricingPlanUpdate = {
  name?: string;
  price_label?: string;
  description?: string;
  badge?: string;
  features?: string[];
  cta?: string;
  note?: string;
  limits?: BackendPlanLimitsUpdate;
  is_popular?: boolean;
  is_active?: boolean;
};

type BackendUsageWindow = {
  used: number;
  limit: number;
  remaining: number;
  reset_at: string;
};

type BackendUsageSummary = {
  tier: UserTier;
  plan_name: string;
  limits: BackendPlanLimits;
  learning_requests: BackendUsageWindow;
  evaluation_sessions: BackendUsageWindow;
  evaluations_per_session_limit: number | null;
  allow_evaluation_overage: boolean;
};

function normalizeLimits(limits: BackendPlanLimits) {
  return {
    learningRequestsPerHour: limits.learning_requests_per_hour,
    evaluationSessionsPerDay: limits.evaluation_sessions_per_day,
    evaluationsPerSession: limits.evaluations_per_session,
    allowEvaluationOverage: limits.allow_evaluation_overage,
  };
}

function normalizePricingPlans(
  response: BackendPricingPlansResponse,
): PricingPlansResponse {
  return {
    plans: response.plans.map(normalizePricingPlan),
  };
}

function normalizePricingPlan(plan: BackendPricingPlan): PricingPlan {
  return {
    id: plan.tier,
    tier: plan.tier,
    name: plan.name,
    priceLabel: plan.price_label,
    description: plan.description,
    badge: plan.badge,
    features: plan.features,
    cta: plan.cta,
    note: plan.note,
    isPopular: plan.is_popular,
    isActive: plan.is_active ?? true,
    limits: normalizeLimits(plan.limits),
  };
}

function serializePlanLimitsUpdate(
  limits: PricingPlanUpdate["limits"],
): BackendPlanLimitsUpdate | undefined {
  if (!limits) return undefined;

  return {
    learning_requests_per_hour: limits.learningRequestsPerHour,
    evaluation_sessions_per_day: limits.evaluationSessionsPerDay,
    evaluations_per_session: limits.evaluationsPerSession,
    allow_evaluation_overage: limits.allowEvaluationOverage,
  };
}

function serializePricingPlanUpdate(
  update: PricingPlanUpdate,
): BackendPricingPlanUpdate {
  return {
    name: update.name,
    price_label: update.priceLabel,
    description: update.description,
    badge: update.badge,
    features: update.features,
    cta: update.cta,
    note: update.note,
    limits: serializePlanLimitsUpdate(update.limits),
    is_popular: update.isPopular,
    is_active: update.isActive,
  };
}

function normalizeUsage(response: BackendUsageSummary): UserUsage {
  const evaluationsPerSessionLimit = response.evaluations_per_session_limit;

  return {
    tier: response.tier,
    planName: response.plan_name,
    limits: normalizeLimits(response.limits),
    currentHour: {
      learningRequests: response.learning_requests.used,
      limit: response.learning_requests.limit,
      resetAt: response.learning_requests.reset_at,
    },
    today: {
      evaluationSessions: response.evaluation_sessions.used,
      limit: response.evaluation_sessions.limit,
      resetAt: response.evaluation_sessions.reset_at,
    },
    currentSession: {
      evaluations: 0,
      limit: evaluationsPerSessionLimit ?? -1,
    },
    allowEvaluationOverage: response.allow_evaluation_overage,
  };
}

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
 * Fetch admin-visible users
 * GET /api/v1/users
 */
export async function fetchAdminUsers(
  params: {
    q?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<AdminUsersResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (typeof params.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }

  if (typeof params.offset === "number") {
    searchParams.set("offset", String(params.offset));
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `${API_BASE_URL}/api/v1/users?${queryString}`
    : `${API_BASE_URL}/api/v1/users`;

  return apiFetch<AdminUsersResponse>(url, {
    method: "GET",
  });
}

/**
 * Fetch all available pricing plans
 * GET /api/v1/pricing/plans
 */
export async function fetchPricingPlans(): Promise<PricingPlansResponse> {
  const response = await apiFetch<BackendPricingPlansResponse>(
    `${API_BASE_URL}/api/v1/pricing/plans`,
    {
      method: "GET",
    },
  );
  return normalizePricingPlans(response);
}

export async function fetchAdminPricingPlans(): Promise<PricingPlansResponse> {
  const response = await apiFetch<BackendPricingPlansResponse>(
    `${API_BASE_URL}/api/v1/pricing/admin/plans`,
    {
      method: "GET",
    },
  );
  return normalizePricingPlans(response);
}

/**
 * Update a pricing plan (admin only)
 * PATCH /api/v1/pricing/admin/plans/{tier}
 */
export async function updatePricingPlan(
  tier: UserTier,
  update: PricingPlanUpdate,
): Promise<PricingPlan> {
  const response = await apiFetch<BackendPricingPlan>(
    `${API_BASE_URL}/api/v1/pricing/admin/plans/${tier}`,
    {
      method: "PATCH",
      body: JSON.stringify(serializePricingPlanUpdate(update)),
    },
  );

  return normalizePricingPlan(response);
}

/**
 * Fetch current user's usage statistics
 * GET /api/v1/usage/me
 */
export async function fetchUserUsage(): Promise<UserUsage> {
  try {
    const response = await apiFetch<BackendUsageSummary>(
      `${API_BASE_URL}/api/v1/usage/me`,
      {
        method: "GET",
      },
    );
    return normalizeUsage(response);
  } catch (error) {
    // Check if it's a 403 limit exceeded error and wrap it
    if (error instanceof ApiError && error.status === 403) {
      const details = error.details as Partial<LimitExceededError> | undefined;
      if (
        details?.tier &&
        details.limit !== undefined &&
        details.used !== undefined &&
        details.resetAt
      ) {
        throw new LimitExceededErrorClass(details as LimitExceededError);
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
