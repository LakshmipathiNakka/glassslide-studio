export const AUTH_CONFIG = {
  // Set VITE_AUTH_URL in your environment to override
  loginUrl: (import.meta as any).env?.VITE_AUTH_URL || "/api/login",
  // Cookie names
  tokenCookie: "jwt_token",
  csrfCookie: "csrf_token",
};
