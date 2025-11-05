import { useAuth } from "@/auth/AuthProvider";
import { safeDecodeJwt } from "@/auth/jwt";
import { useQuery } from "@tanstack/react-query";

export interface UserProfile {
  name: string;
  email: string;
  title?: string;
  avatarUrl?: string;
}

function deriveEmailFromName(name: string): string {
  const first = (name || "").split(/\s+/)[0] || "user";
  const normalized = first.normalize("NFKD").replace(/[^a-zA-Z]/g, "").toLowerCase();
  return `${normalized || "user"}@gmail.com`;
}

function mapProfile(data: any, jwtPayload: any | null): UserProfile {
  const src = (data && typeof data === "object") ? (data.user || data) : {};
  const localName = (typeof window !== 'undefined' && window.localStorage) ? (localStorage.getItem('auth_username') || undefined) : undefined;
  const computedName = (src.name || src.username || src.fullName || jwtPayload?.name || jwtPayload?.username || jwtPayload?.sub || localName || "User") as string;
  // Title may also be stored locally in the future (auth_title)
  const localTitle = (typeof window !== 'undefined' && window.localStorage) ? (localStorage.getItem('auth_title') || undefined) : undefined;
  const title = (src.title || src.designation || src.headline || src.bio || localTitle) as string | undefined;
  const avatarUrl = (src.avatarUrl || src.avatar || src.profile_image || src.profileImage || src.profileDP) as string | undefined;
  const emailRaw = (src.email as string | undefined) || (jwtPayload?.email as string | undefined) || deriveEmailFromName(computedName);
  const email = emailRaw.toLowerCase();
  // Capitalize first letter if computed from username
  const name = computedName ? (computedName.charAt(0).toUpperCase() + computedName.slice(1)) : "User";
  return { name, email, title, avatarUrl };
}

export function useUserProfile() {
  const { token } = useAuth();
  const payload = token ? safeDecodeJwt(token) : null;
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const url = env?.VITE_USER_URL as string | undefined;
  const isExternal = url ? (/^(https?:)?\/\//.test(url) && !url.startsWith(window.location.origin)) : false;

  return useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!url) {
        return mapProfile(null, payload);
      }
      const res = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        ...(isExternal ? {} : { credentials: "include" }),
      });
      if (!res.ok) {
        // Fallback to JWT if fetch fails
        return mapProfile(null, payload);
      }
      const data = await res.json().catch(() => ({}));
      return mapProfile(data, payload);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}