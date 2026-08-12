import { apiRequest } from "./client";
import type { CurrentUserResponse, LoginResponse, TwoFactorRequiredResponse } from "../types/api";

export function login(email: string, password: string, totp_code?: string) {
  return apiRequest<LoginResponse | TwoFactorRequiredResponse>("/auth/login", {
    method: "POST",
    body: { email, password, totp_code: totp_code || undefined },
  });
}

export function loginTwoFactor(two_factor_token: string, totp_code: string) {
  return apiRequest<LoginResponse>(
    `/auth/login/2fa?two_factor_token=${encodeURIComponent(two_factor_token)}&totp_code=${encodeURIComponent(totp_code)}`,
    { method: "POST" },
  );
}

export function logout(refresh_token?: string) {
  return apiRequest<void>("/auth/logout", { method: "POST", body: { refresh_token } });
}

export function getMe() {
  return apiRequest<CurrentUserResponse>("/auth/me");
}

export function isTwoFactorRequired(
  result: LoginResponse | TwoFactorRequiredResponse,
): result is TwoFactorRequiredResponse {
  return "two_factor_required" in result;
}
