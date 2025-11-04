export function safeDecodeJwt(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const payload = safeDecodeJwt(token);
  if (!payload || !payload.exp) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec >= payload.exp;
}

export function hasPermission(token: string, permission: string): boolean {
  const payload = safeDecodeJwt(token);
  if (!payload) return false;
  const perms: string[] = payload.permissions || [];
  const role: string | undefined = payload.role;
  if (perms.includes(permission)) return true;
  if (permission === "editor" && (role === "admin" || role === "editor")) return true;
  return false;
}
