/**
 * Pricing Hook - Manage pricing plans and user usage
 */

import { useEffect, useState, useCallback } from "react";
import {
  UserProfile,
  UserUsage,
  PricingPlansResponse,
  LimitExceededError,
} from "@/types/pricing";
import {
  fetchPricingPlans,
  fetchAdminPricingPlans,
  fetchUserUsage,
  fetchCurrentUser,
} from "@/lib/api";
import { LimitExceededErrorClass } from "@/lib/api";
import { CACHE_DURATIONS } from "@/lib/constants";

interface PricingContextData {
  plans: PricingPlansResponse | null;
  currentUser: UserProfile | null;
  usage: UserUsage | null;
  isLoading: boolean;
  error: Error | null;
  refetchPlans: (options?: { force?: boolean }) => Promise<void>;
  refetchUsage: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

class PricingCache {
  private plans: PricingPlansResponse | null = null;
  private adminPlans: PricingPlansResponse | null = null;
  private adminPlansExpiry: number = 0;
  private plansExpiry: number = 0;
  private user: UserProfile | null = null;
  private userExpiry: number = 0;

  getPlans(): PricingPlansResponse | null {
    if (this.plans && this.plansExpiry > Date.now()) {
      return this.plans;
    }
    return null;
  }

  setPlans(plans: PricingPlansResponse): void {
    this.plans = plans;
    this.plansExpiry = Date.now() + CACHE_DURATIONS.PRICING_PLANS;
  }

  clearPlans(): void {
    this.plans = null;
    this.plansExpiry = 0;
  }

  getUser(): UserProfile | null {
    if (this.user && this.userExpiry > Date.now()) {
      return this.user;
    }
    return null;
  }

  setUser(user: UserProfile): void {
    this.user = user;
    this.userExpiry = Date.now() + CACHE_DURATIONS.USER_PROFILE;
  }

  clearAll(): void {
    this.plans = null;
    this.adminPlans = null;
    this.user = null;
    this.plansExpiry = 0;
    this.adminPlansExpiry = 0;
    this.userExpiry = 0;
  }

  getAdminPlans(): PricingPlansResponse | null {
    if (this.adminPlans && this.adminPlansExpiry > Date.now()) {
      return this.adminPlans;
    }
    return null;
  }

  setAdminPlans(plans: PricingPlansResponse): void {
    this.adminPlans = plans;
    this.adminPlansExpiry = Date.now() + CACHE_DURATIONS.PRICING_PLANS;
  }

  clearAdminPlans(): void {
    this.adminPlans = null;
    this.adminPlansExpiry = 0;
  }
}

const pricingCache = new PricingCache();

/**
 * Hook: usePricingPlans
 * Fetch and cache all available pricing plans
 */
export function usePricingPlans() {
  const [plans, setPlans] = useState<PricingPlansResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (options: { force?: boolean } = {}) => {
    if (options.force) {
      pricingCache.clearPlans();
    }

    // Check cache first
    const cached = pricingCache.getPlans();
    if (cached) {
      setPlans(cached);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPricingPlans();
      pricingCache.setPlans(data);
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { plans, isLoading, error, refetch };
}

/**
 * Hook: useAdminPricingPlans
 * Fetch and cache all pricing plans for admin panel
 */
export function useAdminPricingPlans() {
  const [plans, setPlans] = useState<PricingPlansResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (options: { force?: boolean } = {}) => {
    if (options.force) {
      pricingCache.clearAdminPlans();
    }

    const cached = pricingCache.getAdminPlans();
    if (cached) {
      setPlans(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAdminPricingPlans();
      pricingCache.setAdminPlans(data);
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { plans, isLoading, error, refetch };
}

/**
 * Hook: useCurrentUser
 * Fetch and cache current user with tier info
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    // Check cache first
    const cached = pricingCache.getUser();
    if (cached) {
      setUser(cached);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentUser();
      pricingCache.setUser(data);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { user, isLoading, error, refetch };
}

/**
 * Hook: useUserUsage
 * Fetch current user's usage statistics (no caching, always fresh)
 */
export function useUserUsage(autoRefreshInterval?: number) {
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [limitError, setLimitError] = useState<LimitExceededError | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLimitError(null);
    try {
      const data = await fetchUserUsage();
      setUsage(data);
    } catch (err) {
      if (err instanceof LimitExceededErrorClass) {
        setLimitError(err);
      } else {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();

    if (autoRefreshInterval) {
      const interval = setInterval(refetch, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [refetch, autoRefreshInterval]);

  return { usage, isLoading, error, limitError, refetch };
}

/**
 * Hook: useUserTier
 * Get current user's tier (convenience hook)
 */
export function useUserTier() {
  const { user, isLoading, error } = useCurrentUser();

  return {
    tier: user?.tier || "basic",
    isLoading,
    error,
  };
}

/**
 * Hook: useIsTierLimited
 * Check if a feature is limited for the current tier
 */
export function useIsTierLimited(feature: "learning" | "evaluation") {
  const { tier } = useUserTier();

  if (feature === "learning") {
    return tier === "basic";
  }

  if (feature === "evaluation") {
    return tier === "basic";
  }

  return false;
}

/**
 * Hook: Combined pricing context
 */
export function usePricingContext(): PricingContextData {
  const plansResult = usePricingPlans();
  const userResult = useCurrentUser();
  const usageResult = useUserUsage();

  return {
    plans: plansResult.plans,
    currentUser: userResult.user,
    usage: usageResult.usage,
    isLoading: plansResult.isLoading || userResult.isLoading,
    error: plansResult.error || userResult.error,
    refetchPlans: plansResult.refetch,
    refetchUser: userResult.refetch,
    refetchUsage: usageResult.refetch,
  };
}
