import { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  Cloud, 
  CloudOff, 
  Download, 
  Upload,
  ChevronDown,
  Bell,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface UserProfileProps {
  userName: string;
  userEmail: string;
  avatar?: string;
  isOnline: boolean;
  onSettings: () => void;
  onLogout: () => void;
  onSync: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}

export const UserProfile = ({
  userName,
  userEmail,
  avatar,
  isOnline,
  onSettings,
  onLogout,
  onSync,
  onToggleDarkMode,
  isDarkMode,
}: UserProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSync = () => {
    onSync();
    setIsOpen(false);
  };

  const handleSettings = () => {
    onSettings();
    setIsOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  const handleToggleDarkMode = () => {
    onToggleDarkMode();
  };

  return (
    <div className="relative" ref={profileRef}>
      {/* Profile Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleProfileClick}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
      >
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          {/* Online Status Indicator */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium">{userName}</div>
          <div className="text-xs text-muted-foreground">{userEmail}</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-80 glass-card rounded-xl shadow-2xl border border-border/50 overflow-hidden ${
          isAnimating ? 'animate-slide-down' : ''
        }`}>
          {/* User Info Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{userName}</div>
                <div className="text-sm text-muted-foreground">{userEmail}</div>
                <div className="flex items-center space-x-1 mt-1">
                  {isOnline ? (
                    <>
                      <Cloud className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">Synced</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-10 px-3"
              onClick={handleSync}
            >
              {isOnline ? (
                <Cloud className="w-4 h-4 mr-3" />
              ) : (
                <CloudOff className="w-4 h-4 mr-3" />
              )}
              <span className="flex-1 text-left">Sync Presentations</span>
              <div className="text-xs text-muted-foreground">
                {isOnline ? 'Last synced 2m ago' : 'Offline mode'}
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-10 px-3"
              onClick={handleToggleDarkMode}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 mr-3" />
              ) : (
                <Moon className="w-4 h-4 mr-3" />
              )}
              <span className="flex-1 text-left">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-10 px-3"
              onClick={handleSettings}
            >
              <Settings className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">Settings</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-10 px-3"
            >
              <HelpCircle className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">Help & Support</span>
            </Button>

            <Separator className="my-2" />

            <Button
              variant="ghost"
              className="w-full justify-start h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">Sign Out</span>
            </Button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-muted/30 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>GlassSlide Studio</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
