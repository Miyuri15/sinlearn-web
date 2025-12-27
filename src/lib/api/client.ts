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

async function refreshAccessToken(): Promise<void> {
  const authTokens = getAuthTokens();

  if (!authTokens?.refresh_token) {
    logout();
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: authTokens.refresh_token }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const newTokens = await response.json();
    setAuthTokens(newTokens);
  } catch (error) {
    console.error("Failed to refresh token:", error);
    logout();
    throw error;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Check if token is expired and refresh if needed (but not for auth endpoints)
  const isAuthEndpoint =
    url.includes("/auth/signin") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/refresh");

  if (!isAuthEndpoint && isAccessTokenExpired()) {
    // If already refreshing, wait for it
    if (isRefreshing && refreshPromise) {
      await refreshPromise;
    } else {
      // Start refresh process
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
      await refreshPromise;
    }
  }

  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers
      ? Object.fromEntries(Object.entries(options.headers))
      : {}),
  };

  // Attach Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized - try to refresh once
  if (res.status === 401 && !isAuthEndpoint) {
    try {
      await refreshAccessToken();

      // Retry the original request with new token
      const newToken = getAccessToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
      }

      const retryRes = await fetch(url, {
        ...options,
        headers,
      });

      if (!retryRes.ok) {
        const error = await retryRes.json().catch(() => ({}));
        throw new Error(error.detail || "API request failed");
      }

      return retryRes.json();
    } catch {
      console.error("Unauthorized – logging out");
      logout();
      throw new Error("Unauthorized");
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "API request failed");
  }

  return res.json();
}
