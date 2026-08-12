import type { ApiErrorBody } from "../types/api";

// In dev, this stays "/api/v1" and Vite's proxy (vite.config.ts) forwards it
// to the local backend. In a real deployment, set VITE_API_BASE_URL (e.g. to
// https://imadi-customerp.onrender.com/api/v1) at build time, since a
// deployed static site has no dev proxy to rely on.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const REFRESH_TOKEN_KEY = "imadi_refresh_token";

// Access token lives in memory only — never persisted. It's lost on a hard
// page refresh by design; refreshAccessToken() below re-derives it.
//
// The refresh token, however, is stored in sessionStorage (per browser tab,
// cleared when the tab closes). This is a deliberate change from relying on
// the HttpOnly refresh cookie: the frontend and backend live on two
// different domains, and browsers increasingly block that cross-site cookie
// outright — which broke "stay signed in" on reload, and also meant two
// people logging in on the same browser (different tabs) stomped on each
// other's shared cookie. sessionStorage is genuinely separate per tab, so
// neither problem happens here. The tradeoff: the refresh token is now
// readable by any JS on the page rather than HttpOnly-protected, which is
// the standard tradeoff most web apps make for this pattern.
let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setRefreshToken(token: string | null) {
  if (token) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const storedRefresh = getRefreshToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      // Only ride the cookie/CSRF pair as a fallback when we have no stored
      // token of our own (e.g. an older session from before this change).
      if (!storedRefresh) {
        headers[CSRF_HEADER_NAME] = readCookie(CSRF_COOKIE_NAME) ?? "";
      }
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(storedRefresh ? { refresh_token: storedRefresh } : {}),
      });
      if (!res.ok) {
        setAccessToken(null);
        setRefreshToken(null);
        return null;
      }
      const data = await res.json();
      setAccessToken(data.access_token);
      if (data.refresh_token) setRefreshToken(data.refresh_token);
      return data.access_token as string;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Internal: prevents infinite retry loops after a refresh attempt. */
  _retried?: boolean;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, _retried = false } = opts;

  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  // Mutating requests also ride the refresh cookie's CSRF pair when a
  // caller relies on cookie auth; harmless no-op otherwise.
  if (method !== "GET") {
    const csrf = readCookie(CSRF_COOKIE_NAME);
    if (csrf) headers[CSRF_HEADER_NAME] = csrf;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !_retried) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...opts, _retried: true });
    }
  }

  if (!res.ok) {
    let errBody: ApiErrorBody | null = null;
    try {
      errBody = await res.json();
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(
      res.status,
      errBody?.error?.code ?? "unknown_error",
      errBody?.error?.message ?? `Request failed with status ${res.status}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * For endpoints that return a raw file (e.g. backup downloads) rather than
 * JSON. Triggers a real browser download using the given filename.
 */
export async function downloadFile(path: string, fileName: string): Promise<void> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let res = await fetch(url.toString(), { headers, credentials: "include" });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${refreshed}`;
      res = await fetch(url.toString(), { headers, credentials: "include" });
    }
  }

  if (!res.ok) {
    let errBody: ApiErrorBody | null = null;
    try {
      errBody = await res.json();
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(
      res.status,
      errBody?.error?.code ?? "unknown_error",
      errBody?.error?.message ?? `Download failed with status ${res.status}`,
    );
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export { refreshAccessToken };
