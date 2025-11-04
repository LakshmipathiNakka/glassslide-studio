import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowUp, Mail, Twitter, Github, Linkedin, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const opacity = useTransform(scrollYProgress, [0, 0.9, 1], [1, 1, 0.9]);
  
  // Always show the footer
  const isVisible = true;
  
  // Remove the inView effect since we always want to show the footer

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (error) setError('');
    
    // Real-time validation
    if (value && !validateEmail(value)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsSubmitting(false);
      setEmail('');
      setError('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="relative bg-white/80 backdrop-blur-lg border-t border-slate-200/50 pt-16 pb-8 px-6 md:px-12 lg:px-24"
      style={{ y, opacity }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-3 group mb-4">
              <div className="relative w-8 h-8">
                {/* Geometric logo shape */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg transform transition-transform duration-300 group-hover:rotate-12" 
                  style={{ 
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' 
                  }}
                />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                GlassSlide
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">Create beautiful presentations with GlassSlide, the modern presentation tool for professionals.</p>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Product</h3>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Reviews', 'Editor', 'Explore'].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <a
                      href={item.toLowerCase() === 'editor' ? '/editor' : `#${item.toLowerCase()}`}
                      className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-slate-600 hover:text-slate-900 text-sm transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Stay Updated</h3>
            <p className="text-slate-600 text-sm mb-4">Subscribe to our newsletter for the latest updates and news.</p>
            
            <AnimatePresence mode="wait">
              {isSubscribed ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200"
                >
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium">Subscribed successfully!</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="form-container"
                  className="w-full"
                  initial={{ opacity: 1, height: 'auto' }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.form
                    key="form"
                    onSubmit={handleSubscribe}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex">
                      <div className="flex-1 relative">
                        <input
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={() => {
                            if (email && !validateEmail(email)) {
                              setError('Please enter a valid email address');
                            }
                          }}
                          placeholder="Your email"
                          className={`px-4 py-2.5 text-sm border ${
                            error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'
                          } rounded-l-lg focus:outline-none focus:ring-2 ${
                            error ? 'ring-red-300' : 'ring-blue-300'
                          } focus:border-transparent w-full transition-all duration-200`}
                          disabled={isSubmitting}
                        />
                      </div>
                      <button 
                        type="submit"
                        className={`bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-2.5 rounded-r-lg text-sm font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center ${
                          isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-gray-200/50'
                        }`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Subscribing...
                          </>
                        ) : 'Subscribe'}
                      </button>
                    </div>
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          key="error-message"
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
                          className="overflow-hidden"
                        >
                          <motion.div className="flex items-center text-red-500 text-xs font-medium pl-2">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ width: 0 }}
          animate={isVisible ? { width: '100%' } : {}}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-8"
        />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-500 mb-4 md:mb-0"
          >
            {currentYear} GlassSlide. All rights reserved.
          </motion.p>

          <div className="flex space-x-6">
            {[
              { icon: Twitter, label: 'Twitter', url: '#' },
              { icon: Github, label: 'GitHub', url: '#' },
              { icon: Linkedin, label: 'LinkedIn', url: '#' },
              { icon: Mail, label: 'Email', url: 'mailto:hello@glassslide.com' },
            ].map((social, index) => (
              <motion.a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-900 transition-colors duration-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -2, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Scroll to top button */}
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors duration-200 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.footer>
  );
};

export default Footer;
