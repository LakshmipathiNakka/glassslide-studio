import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Lock, X, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../landing/Logo';
import { useAuth } from '@/auth/AuthProvider';
import { AUTH_CONFIG } from '@/auth/config';
import { getCookie } from '@/auth/cookies';

// Floating icon component for the background
const FloatingIcon = ({ icon: Icon, ...props }: { icon: React.ElementType; [key: string]: any }) => (
  <motion.div
    className="absolute text-white/10"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{
      opacity: [0.08, 0.12, 0.08],
      scale: [0.9, 1.1, 0.9],
      x: [0, Math.random() * 100 - 50, 0],
      y: [0, Math.random() * 100 - 50, 0],
    }}
    transition={{
      duration: 20 + Math.random() * 20,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    <Icon className="w-16 h-16 md:w-24 md:h-24" />
  </motion.div>
);

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 5;

function getAttempts(): number[] {
  try {
    const raw = localStorage.getItem('login_attempts');
    if (!raw) return [];
    const arr = JSON.parse(raw) as number[];
    const now = Date.now();
    const filtered = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    localStorage.setItem('login_attempts', JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}

function addAttempt() {
  const arr = getAttempts();
  arr.push(Date.now());
  localStorage.setItem('login_attempts', JSON.stringify(arr));
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    username: false,
    password: false
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Already logged in -> go landing
      window.location.replace('/');
    }
  }, [isAuthenticated]);

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    const attempts = getAttempts();
    if (attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
      const first = attempts[0];
      const msLeft = RATE_LIMIT_WINDOW_MS - (Date.now() - first);
      const secLeft = Math.ceil(msLeft / 1000);
      setError(`Too many attempts. Please wait ${secLeft}s and try again.`);
      return;
    }

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const csrf = getCookie(AUTH_CONFIG.csrfCookie);
      const res = await login(username, password, csrf);
      if (!res.ok) {
        addAttempt();
        setPassword(''); // keep username, clear password
        // Try to parse the error message from the response
        try {
          const errorData = JSON.parse(res.message);
          setError(errorData.error_msg || 'Invalid credentials. Please try again.');
        } catch (e) {
          // If parsing fails, use the original message or a default
          setError('Invalid credentials. Please try again.');
        }
        return;
      }
      // Emulate a 302-style redirect to Landing
      window.location.replace('/');
    } catch (err: any) {
      addAttempt();
      setPassword('');
      setError(err?.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Background icons
  const icons = [
    { icon: '📄', x: '10%', y: '20%' },
    { icon: '📊', x: '85%', y: '30%' },
    { icon: '✏️', x: '15%', y: '70%' },
    { icon: '🎨', x: '75%', y: '65%' },
    { icon: '📱', x: '50%', y: '15%' },
    { icon: '💡', x: '45%', y: '80%' },
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden relative"
    >
      {/* Background layers */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 to-transparent"
        style={{ y: y1 }}
      />
      
      {/* Floating icons */}
      {icons.map((icon, i) => (
        <motion.span
          key={i}
          className="absolute text-4xl md:text-6xl opacity-10"
          style={{
            left: icon.x,
            top: icon.y,
            y: i % 2 === 0 ? y2 : y3,
            x: useTransform(scrollYProgress, [0, 1], [0, (Math.random() - 0.5) * 100])
          }}
          animate={{
            y: [0, 15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        >
          {icon.icon}
        </motion.span>
      ))}

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.42, 0, 0.58, 1] }}
            className="w-full max-w-md"
          >
            <motion.div 
              className="bg-white/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20"
              whileHover={{ 
                boxShadow: '0 20px 80px -10px rgba(0, 0, 0, 0.1)',
                y: -2
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <div className="scale-150">
                  <Logo />
                </div>
              </div>

              {/* Test Credentials */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Test Credentials</h3>
                <p className="text-sm text-blue-700">
                  <span className="font-mono">username: raja</span>
                  <br />
                  <span className="font-mono">password: raja@2021</span>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-700 text-sm p-3 rounded-lg flex items-start justify-between"
                    role="alert"
                  >
                    <span>{error}</span>
                    <button
                      type="button"
                      aria-label="Dismiss error"
                      onClick={() => setError('')}
                      className="ml-3 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setError('');
                        }}
                        onBlur={() => setTouched({ ...touched, username: true })}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          touched.username && !username ? 'border-red-400' : 'border-slate-200'
                        } rounded-xl bg-white/50 focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all duration-200`}
                        placeholder="Enter your username"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        onBlur={() => setTouched({ ...touched, password: true })}
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          touched.password && !password ? 'border-red-400' : 'border-slate-200'
                        } rounded-xl bg-white/50 focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all duration-200`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                    {touched.password && !password && (
                      <div className="mt-1 flex items-center text-red-500 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        <span>Please fill out this field</span>
                      </div>
                    )}
                  </div>
                  {touched.username && !username && (
                    <div className="mt-1 flex items-center text-red-500 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      <span>Please fill out this field</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center text-sm">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-slate-600">
                    Remember me
                  </label>
                </div>

                <div>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 ${
                      isLoading ? 'opacity-80 cursor-not-allowed' : 'shadow-md hover:shadow-lg'
                    }`}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </motion.button>
                  <p className="text-xs text-slate-500 mt-2">This site uses cookies for authentication.</p>
                </div>
              </form>

            </motion.div>

            {/* Footer */}
            <motion.div 
              className="mt-12 text-center text-sm text-slate-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.42, 0, 0.58, 1] }}
            >
              <p>© {new Date().getFullYear()} GlassSlide. All rights reserved.</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
