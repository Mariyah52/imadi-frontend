import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe, logout as apiLogout } from "../api/auth";
import { refreshAccessToken, setAccessToken } from "../api/client";
import type { CurrentUserResponse } from "../types/api";

interface AuthContextValue {
  user: CurrentUserResponse | null;
  status: "loading" | "authenticated" | "unauthenticated";
  hasPermission: (perm: string) => boolean;
  setSession: (token: string, user: CurrentUserResponse) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  // On boot, there's no access token in memory (page was reloaded), but a
  // valid session may still exist via the HttpOnly refresh cookie — try
  // silently restoring it before falling back to the login screen.
  useEffect(() => {
    (async () => {
      const token = await refreshAccessToken();
      if (!token) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const me = await getMe();
        setUser(me);
        setStatus("authenticated");
      } catch {
        setAccessToken(null);
        setStatus("unauthenticated");
      }
    })();
  }, []);

  function setSession(token: string, u: CurrentUserResponse) {
    setAccessToken(token);
    setUser(u);
    setStatus("authenticated");
  }

  async function signOut() {
    try {
      await apiLogout();
    } catch {
      /* best-effort — clear local state regardless */
    }
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }

  function hasPermission(perm: string) {
    return user?.permissions.includes(perm) ?? false;
  }

  return (
    <AuthContext.Provider value={{ user, status, hasPermission, setSession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
