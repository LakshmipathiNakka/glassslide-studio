import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '@/auth/AuthProvider';

interface UserMenuProps {
  userName: string;
  userEmail: string;
  avatar?: string;
  subtitle?: string;
}

export const UserMenu = ({ userName, userEmail, avatar, subtitle }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    console.info('[UserMenu] Sign-out clicked');
    setIsLoggingOut(true);
    try {
      const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
      const signoutUrl = env?.VITE_SIGNOUT_URL as string | undefined;
      if (signoutUrl) {
        const isExternal = /^(https?:)?\/\//.test(signoutUrl) && !signoutUrl.startsWith(window.location.origin);
        console.info('[UserMenu] Calling sign-out endpoint', { signoutUrl, isExternal });
        await fetch(signoutUrl, {
          method: 'POST',
          ...(isExternal ? {} : { credentials: 'include' }),
        }).then(async (r) => {
          console.info('[UserMenu] Sign-out response', r.status);
          try { await r.text(); } catch {}
        }).catch((e) => {
          console.warn('[UserMenu] Sign-out request failed (ignored)', e);
        });
      }
    } catch (e) {
      console.error('[UserMenu] Unexpected error during sign-out', e);
    } finally {
      // Always clear client session and redirect
      // Best-effort: remove app cookie
      document.cookie = 'jwt_token=; Max-Age=0; path=/';
      try { logout(); } catch (e) { console.warn('[UserMenu] logout() error (ignored)', e); }
      // Close menu to avoid overlay intercepting clicks
      setIsOpen(false);
      // Attempt SPA navigation first
      try { navigate('/login', { replace: true }); } catch {}
      // Hard redirect fallback
      setTimeout(() => {
        try { window.location.replace('/login'); } catch {}
        try { window.location.assign('/login'); } catch {}
      }, 0);
      console.info('[UserMenu] Redirected to /login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  const menuContent = isOpen && createPortal(
    <div 
      className="fixed inset-0 z-[9999]" 
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="absolute bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in"
        style={{
          top: `${position.top + 4}px`,
          right: `calc(100% - ${position.left}px + 8px)`,
          minWidth: '220px',
          transform: 'translateY(0)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-start space-x-3">
            {avatar ? (
              <img
                src={avatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-white/20">
                <User className="w-5 h-5 text-slate-600" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-slate-900 truncate">{userName}</p>
              {subtitle && (
                <p className="text-xs text-slate-600/90 truncate">{subtitle}</p>
              )}
              <p className="text-xs text-slate-500/90 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
        
        <div className="p-1.5">
          <button
            type="button"
            onMouseDown={(e) => { e.stopPropagation(); console.info('[UserMenu] Sign-out mousedown'); }}
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
            aria-label="Sign out"
          >
            <span className="font-medium group-hover:text-red-700">Sign Out</span>
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
            ) : (
              <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" />
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
          isOpen ? 'bg-white/80 backdrop-blur-sm shadow-sm' : 'hover:bg-white/60 hover:backdrop-blur-sm'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={userName}
            className="w-7 h-7 rounded-full object-cover border-2 border-white/30"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-white/30">
            <User className="w-3.5 h-3.5 text-slate-600" />
          </div>
        )}
        <span className="text-sm font-medium text-slate-800 hidden sm:inline">
          {userName.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {menuContent}
    </div>
  );
};
