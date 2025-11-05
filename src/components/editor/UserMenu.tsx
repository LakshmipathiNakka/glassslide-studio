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
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 240;
      const menuHeight = 200; // Estimated menu height
      
      console.log('[UserMenu] Calculating position', {
        buttonRect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
        viewport: { width: viewportWidth, height: viewportHeight },
        scroll: { x: window.scrollX, y: window.scrollY }
      });
      
      // Position menu directly below the button, right-aligned
      let top = rect.bottom + 4; // Small gap below button
      let right = viewportWidth - rect.right; // Align right edge with button right edge
      
      // Adjust if menu would go off bottom of viewport
      if (top + menuHeight > viewportHeight) {
        top = rect.top - menuHeight - 4; // Position above if not enough space below
      }
      
      // Ensure menu doesn't go off left edge
      const menuLeft = viewportWidth - right - menuWidth;
      if (menuLeft < 8) {
        right = viewportWidth - menuWidth - 8; // Keep 8px padding from left edge
      }
      
      const finalPosition = {
        top: Math.max(8, top),
        right: Math.max(8, right),
        width: rect.width
      };
      
      console.log('[UserMenu] Final position:', finalPosition);
      setPosition(finalPosition);
    } else if (isOpen && !buttonRef.current) {
      console.error('[UserMenu] Button ref not available when trying to position menu');
    }
  }, [isOpen]);

  const menuContent = isOpen && typeof document !== 'undefined' && createPortal(
    <>
      <style>{`
        @keyframes menuSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes menuSlideOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
        }
        
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div 
        className="fixed inset-0 bg-black/5 backdrop-blur-[2px]"
        style={{ 
          zIndex: 9999,
          animation: 'overlayFadeIn 0.15s ease-out'
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('[UserMenu] Overlay clicked, closing menu');
          setIsOpen(false);
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
      <div 
        ref={menuRef}
        className="fixed bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-200 ease-out"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
          minWidth: '240px',
          maxWidth: '320px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 2px 12px rgba(0,0,0,0.1)',
          zIndex: 10000,
          pointerEvents: 'auto',
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          animation: 'menuSlideIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start space-x-3">
            {avatar ? (
              <img
                src={avatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  console.warn('[UserMenu] Avatar failed to load:', avatar);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-gray-200">
                <User className="w-5 h-5 text-slate-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 truncate text-sm">{userName || 'User'}</p>
              {subtitle && subtitle.trim() && (
                <p className="text-xs text-slate-600 truncate mt-0.5">{subtitle}</p>
              )}
              <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail || 'No email'}</p>
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
      </div>
    </>,
    document.body
  );

  // Debug: Log when component renders
  useEffect(() => {
    console.log('[UserMenu] Component rendered/updated', { isOpen, userName, userEmail });
  }, [isOpen, userName, userEmail]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          const newState = !isOpen;
          console.log('[UserMenu] Button clicked, changing from', isOpen, 'to', newState);
          console.log('[UserMenu] User data:', { userName, userEmail, avatar, subtitle });
          setIsOpen(newState);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ease-out cursor-pointer ${
          isOpen ? 'bg-white/90 backdrop-blur-sm shadow-md scale-[1.02]' : 'hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-sm'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
        title="User menu"
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
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-all duration-200 ease-out ${
          isOpen ? 'rotate-180 text-slate-700' : ''
        }`} />
      </button>
      {menuContent}
    </div>
  );
};
