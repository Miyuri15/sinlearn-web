import {
  getAccessToken,
  getAuthTokens,
  isAccessTokenExpired,
  logout,
  setAuthTokens,
} from "@/lib/localStore";
import { API_BASE_URL } from "../config";

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
    console.error("Failed to refresh token:", error);
    logout();
    dispatchLogoutEvent();
    throw error;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  try {
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
      const error = await res.json().catch(() => ({}));
      const errorMessage = error.detail || error.message || "API request failed";
      throw new Error(errorMessage);
    }

    // Handle empty responses (204 No Content, etc.)
    const contentType = res.headers.get("content-type");
    if (res.status === 204 || !contentType?.includes("application/json")) {
      return {} as T;
    }

    return res.json();
  } catch (error) {
    // Re-throw Error instances as-is
    if (error instanceof Error) {
      throw error;
    }
    // Wrap unknown errors
    throw new Error(
      `Network request failed: ${
        error instanceof Object ? JSON.stringify(error) : String(error)
      }`
    );
  }
}
