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

export function signout() {
  return apiFetch<{ success: boolean }>(`${API_BASE_URL}/api/v1/auth/signout`, {
    method: "POST",
  });
}
