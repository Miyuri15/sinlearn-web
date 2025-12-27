import { apiFetch } from "./client";
import { API_BASE_URL } from "../config";
import { SignupRequest, TokenResponse } from "@/types/auth";

export function signup(data: SignupRequest) {
  return apiFetch<TokenResponse>(`${API_BASE_URL}/api/v1/auth/signup`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function signin(email: string, password: string) {
  return apiFetch<TokenResponse>(`${API_BASE_URL}/api/v1/auth/signin`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshToken(refresh_token: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json() as Promise<TokenResponse>;
}

export function signout() {
  return apiFetch<{ success: boolean }>(`${API_BASE_URL}/api/v1/auth/signout`, {
    method: "POST",
  });
}
