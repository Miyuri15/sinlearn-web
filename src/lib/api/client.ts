import {
  getAccessToken,
  getAuthTokens,
  isAccessTokenExpired,
  logout,
  setAuthTokens,
} from "@/lib/localStore";
import { API_BASE_URL } from "../config";

export class ApiError extends Error {
  status: number;
  url: string;
  details: unknown;

  constructor(
    message: string,
    params: { status: number; url: string; details?: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = params.status;
    this.url = params.url;
    this.details = params.details;
  }
}

export class OfflineError extends Error {
  url?: string;

  constructor(
    message = "You are offline. Please reconnect and try again.",
    url?: string,
  ) {
    super(message);
    this.name = "OfflineError";
    this.url = url;
  }
}

export function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function isOfflineError(error: unknown): error is OfflineError {
  return error instanceof OfflineError;
}

export function isLikelyNetworkError(error: unknown): boolean {
  if (error instanceof OfflineError) return true;
  if (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "AbortError"
  ) {
    return false;
  }
  return error instanceof TypeError;
}

export function assertOnline(url?: string): void {
  if (isBrowserOffline()) {
    throw new OfflineError(undefined, url);
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  offlineMessage = "You are offline. Please reconnect and try again.",
): string {
  if (error instanceof OfflineError) return offlineMessage;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

const API_CACHE_PREFIX = "sinlearn.apiCache.v1.";
const API_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

type CachedApiResponse = {
  cachedAt: number;
  data: unknown;
};

function isGetRequest(options: RequestInit): boolean {
  return (options.method || "GET").toUpperCase() === "GET";
}

function getApiCacheKey(url: string): string {
  return `${API_CACHE_PREFIX}${url}`;
}

function readCachedApiResponse<T>(url: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getApiCacheKey(url));
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedApiResponse;
    if (!cached || typeof cached.cachedAt !== "number") return null;

    if (Date.now() - cached.cachedAt > API_CACHE_MAX_AGE_MS) {
      localStorage.removeItem(getApiCacheKey(url));
      return null;
    }

    return cached.data as T;
  } catch {
    return null;
  }
}

function writeCachedApiResponse(url: string, data: unknown): void {
  if (typeof window === "undefined") return;

  try {
    const cached: CachedApiResponse = {
      cachedAt: Date.now(),
      data,
    };
    localStorage.setItem(getApiCacheKey(url), JSON.stringify(cached));
  } catch {
    // Cache writes are best-effort only.
  }
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Dispatch logout event for components to handle redirect
function dispatchLogoutEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }
}

async function ensureAccessTokenRefreshed(): Promise<void> {
  if (isRefreshing && refreshPromise) {
    await refreshPromise;
  } else {
    isRefreshing = true;
    refreshPromise = refreshAccessToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
    await refreshPromise;
  }
}

async function refreshAccessToken(): Promise<void> {
  const authTokens = getAuthTokens();

  if (!authTokens?.refresh_token) {
    logout();
    dispatchLogoutEvent();
    throw new Error("No refresh token available");
  }

  assertOnline(`${API_BASE_URL}/api/v1/auth/refresh`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: authTokens.refresh_token }),
    });

    if (!response.ok) throw new Error("Token refresh failed");

    const newTokens = await response.json();
    setAuthTokens(newTokens);
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      throw new OfflineError(undefined, `${API_BASE_URL}/api/v1/auth/refresh`);
    }

    console.error("Failed to refresh token:", error);
    logout();
    dispatchLogoutEvent();
    throw error;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const canUseCache = isGetRequest(options);

  try {
    if (canUseCache && isBrowserOffline()) {
      const cached = readCachedApiResponse<T>(url);
      if (cached !== null) return cached;
    }

    assertOnline(url);

    const isAuthEndpoint =
      url.includes("/auth/signin") ||
      url.includes("/auth/signup") ||
      url.includes("/auth/refresh");

    // 1. Proactive Refresh
    if (!isAuthEndpoint && isAccessTokenExpired()) {
      await ensureAccessTokenRefreshed();
    }

    // 2. Prepare Headers (Robust Method)
    const token = getAccessToken();
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(url, { ...options, headers });

    // 3. Reactive Refresh (401 Handling)
    if (res.status === 401 && !isAuthEndpoint && !isRetry) {
      try {
        await ensureAccessTokenRefreshed();

        // Retry with new token
        return apiFetch<T>(url, options, true);
      } catch {
        dispatchLogoutEvent();
        throw new Error("Session expired");
      }
    }

    if (!res.ok) {
      let errorBody: unknown = undefined;

      try {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          errorBody = await res.json();
        } else {
          errorBody = await res.text();
        }
      } catch {
        errorBody = undefined;
      }

      let errorMessage = "API request failed";
      if (typeof errorBody === "string" && errorBody.trim()) {
        errorMessage = errorBody;
      } else if (errorBody && typeof errorBody === "object") {
        const maybe = errorBody as any;
        errorMessage = maybe.detail || maybe.message || errorMessage;
      }

      throw new ApiError(errorMessage, {
        status: res.status,
        url,
        details: errorBody,
      });
    }

    // Handle empty responses (204 No Content, etc.)
    const contentType = res.headers.get("content-type");
    if (res.status === 204 || !contentType?.includes("application/json")) {
      return {} as T;
    }

    const data = await res.json();
    if (canUseCache) {
      writeCachedApiResponse(url, data);
    }

    return data;
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      if (canUseCache) {
        const cached = readCachedApiResponse<T>(url);
        if (cached !== null) return cached;
      }

      throw error instanceof OfflineError
        ? error
        : new OfflineError(undefined, url);
    }

    // Re-throw Error instances as-is
    if (error instanceof Error) {
      throw error;
    }
    // Wrap unknown errors
    throw new Error(
      `Network request failed: ${
        error instanceof Object ? JSON.stringify(error) : String(error)
      }`,
    );
  }
}
