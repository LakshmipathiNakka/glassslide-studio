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
  const name = (src.name || src.username || src.fullName || jwtPayload?.name || jwtPayload?.username || jwtPayload?.sub || "User") as string;
  const title = (src.title || src.designation || src.headline || src.bio) as string | undefined;
  const avatarUrl = (src.avatarUrl || src.avatar || src.profile_image || src.profileImage || src.profileDP) as string | undefined;
  const emailRaw = (src.email as string | undefined) || (jwtPayload?.email as string | undefined) || deriveEmailFromName(name);
  const email = emailRaw.toLowerCase();
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