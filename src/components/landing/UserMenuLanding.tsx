import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { UserMenu } from "@/components/editor/UserMenu";
import { useUserProfile } from "@/auth/useUserProfile";

interface UserProfileData {
  username: string;
  email?: string;
  avatarUrl?: string;
}

export const UserMenuLanding: React.FC = () => {
  const { data, isLoading, error } = useUserProfile();
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/30">
        <Loader2 className="w-4 h-4 animate-spin text-slate-500" aria-hidden="true" />
        <span className="text-sm text-slate-600">Loading user…</span>
      </div>
    );
  }

  // Fallback: if user fetch failed, try to derive from JWT so the menu still appears
  if (error && !data) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100" role="alert" aria-live="polite">
        <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
        <span className="text-sm text-red-700 truncate">{String(error)}</span>
      </div>
    );
  }

  const name = data?.name || 'User';
  const email = data?.email || '';
  const avatar = data?.avatarUrl;
  const subtitle = data?.title;

  return (
    <UserMenu
      userName={name}
      userEmail={email}
      avatar={avatar}
      subtitle={subtitle}
    />
  );
};
