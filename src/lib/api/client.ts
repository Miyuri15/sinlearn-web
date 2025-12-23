import { getAccessToken, isAccessTokenExpired, logout } from "@/lib/localStore";

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ? Object.fromEntries(Object.entries(options.headers)) : {}),
  };

  // Attach Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized globally
  if (res.status === 401) {
    console.error("Unauthorized – logging out");
    logout();
    window.location.href = "/auth/sign-in";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "API request failed");
  }

  return res.json();
}
