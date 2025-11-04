import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AUTH_CONFIG } from "@/auth/config";
import { deleteCookie, getCookie, setCookie } from "@/auth/cookies";
import { isJwtExpired } from "@/auth/jwt";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, csrfToken?: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize CSRF token if missing
    ensureCsrfToken();

    const t = getCookie(AUTH_CONFIG.tokenCookie);
    if (t && !isJwtExpired(t)) {
      setToken(t);
    } else {
      if (t) deleteCookie(AUTH_CONFIG.tokenCookie);
    }
    setIsLoading(false);
  }, []);

  const login: AuthState["login"] = async (username, password, csrfToken) => {
    try {
      const isExternal = /apis\.ccbp\.in/.test(AUTH_CONFIG.loginUrl);
      const headers: Record<string, string> = {};
      if (!isExternal) {
        headers["Content-Type"] = "application/json";
        headers["X-CSRF-Token"] = csrfToken || getCookie(AUTH_CONFIG.csrfCookie) || "";
      }

      console.info("[Auth] Login request", { url: AUTH_CONFIG.loginUrl, isExternal });

      const res = await fetch(AUTH_CONFIG.loginUrl, {
        method: "POST",
        ...(Object.keys(headers).length ? { headers } : {}),
        ...(isExternal ? {} : { credentials: "include" }),
        body: JSON.stringify({ username, password }),
      });

      console.info("[Auth] Login response", res.status, res.headers.get("content-type"));

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[Auth] Login failed", { status: res.status, body: text });
        return { ok: false, message: text || `Login failed (${res.status})` };
      }

      // Expect { jwt_token: string }
      const data = await res.json().catch(() => ({}));
      const jwt = data.jwt_token as string | undefined;
      if (!jwt) {
        console.error("[Auth] Unexpected response shape", data);
        return { ok: false, message: "Unexpected response from server" };
      }

      // Store token cookie for 30 days (Secure, Path=/). Note: HttpOnly must be set by server via Set-Cookie.
      setCookie(AUTH_CONFIG.tokenCookie, jwt, 30);
      setToken(jwt);
      return { ok: true };
    } catch (e: any) {
      console.error("[Auth] Login error", e);
      return { ok: false, message: e?.message || "Network error" };
    }
  };

  const logout = () => {
    setToken(null);
    deleteCookie(AUTH_CONFIG.tokenCookie);
  };

  const value = useMemo<AuthState>(() => ({
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  }), [token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function ensureCsrfToken() {
  const existing = getCookie(AUTH_CONFIG.csrfCookie);
  if (!existing) {
    const token = cryptoRandomString(32);
    setCookie(AUTH_CONFIG.csrfCookie, token, 30);
  }
}

function cryptoRandomString(length: number) {
  const arr = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
