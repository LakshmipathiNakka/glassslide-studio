import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useAnimationControls, useReducedMotion, Variants } from 'framer-motion';
import { X, FolderOpen, Palette, Sparkles, Briefcase, BookOpen, PlusCircle, Eye, Minus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { presentationThemes } from '@/utils/presentationThemes';
import { Button } from '@/components/ui/button';

// Animation variants for tab content
const tabContentVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.15 },
    },
  }),
};

// Tab indicator animation
const tabIndicatorVariants = {
  active: (custom: string) => ({
    x: custom === 'demos' ? '0%' : '100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  })
};

// Haptic feedback helper
const vibrate = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate?.(5);
  }
};

interface TemplateModalProps {
  onClose: () => void;
  onApplyTemplate?: (templateName: string) => void;
}

// Helper function to get creative subtitles for each theme
const getThemeSubtitle = (themeId: string) => {
  const subtitles = {
    modern: (
      <span>Perfect for <span className="text-blue-500 font-medium">startups</span> and <span className="text-blue-400">tech</span> presentations</span>
    ),
    minimal: (
      <span>Ideal for <span className="text-gray-600 font-medium">elegant</span> and <span className="text-gray-500">focused</span> content</span>
    ),
    corporate: (
      <span>Designed for <span className="text-slate-600 font-medium">business</span> and <span className="text-slate-500">enterprise</span> use</span>
    ),
    creative: (
      <span>For <span className="text-purple-500 font-medium">bold</span> and <span className="text-purple-400">innovative</span> ideas</span>
    ),
    academic: (
      <span>Structured for <span className="text-amber-500 font-medium">educational</span> and <span className="text-amber-400">research</span> content</span>
    ),
    blank: (
      <span>Your <span className="text-gray-500 font-medium">canvas</span> for <span className="text-gray-400">unlimited</span> creativity</span>
    )
  };
  return subtitles[themeId as keyof typeof subtitles] || '';
};

export default function TemplateModal({ onClose, onApplyTemplate }: TemplateModalProps) {
  const [activeTab, setActiveTab] = useState<'demos' | 'themes'>('demos');
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Minimal icon component to match Lucide's style
  const MinimalIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );
  const prevActiveTab = useRef(activeTab);
  const tabControls = useAnimationControls();
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isAnimating = useRef(false);

  // Style definitions for the modal content container
  const contentContainerStyle = {
    flex: '1 1 auto',
    overflow: 'auto',
    minHeight: 0, // Allows the container to shrink below content size
  };
  
  const modalContentStyle = {
    height: '85vh', // Increased from 70vh to 85vh
    width: '100%',
    maxWidth: '80rem', // Increased from 64rem to 80rem
    maxHeight: '95vh', // Increased from 90vh to 95vh
    display: 'flex',
    flexDirection: 'column' as const,
    '@media (minHeight: 900px)': {
      height: '90vh', // Slightly smaller height on very tall screens
    },
    '@media (maxHeight: 700px)': {
      height: '90vh', // Use more of the viewport on smaller screens
      maxHeight: '98vh',
    },
  };

  // Handle tab change with animation
  const handleTabChange = useCallback((newTab: 'demos' | 'themes') => {
    if (isAnimating.current || newTab === activeTab) return;
    
    const newDirection = newTab === 'themes' ? 1 : -1;
    setDirection(newDirection);
    
    // Start exit animation
    isAnimating.current = true;
    tabControls.start('exit').then(() => {
      // Update active tab after exit animation
      setActiveTab(newTab);
      
      // Preload content for smooth transition
      requestAnimationFrame(() => {
        tabControls.start('enter').then(() => {
          tabControls.start('center').then(() => {
            isAnimating.current = false;
            vibrate(); // Haptic feedback
          });
        });
      });
    });
  }, [activeTab, tabControls]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeTab === 'themes') {
        handleTabChange('demos');
      } else if (e.key === 'ArrowRight' && activeTab === 'demos') {
        handleTabChange('themes');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleTabChange, onClose]);

  // Preload images and content
  useEffect(() => {
    const preloadImages = () => {
      const imageUrls = [
        // Add any image URLs that need to be preloaded
      ];
      
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };

    preloadImages();
  }, []);

  // Update previous tab ref
  useEffect(() => {
    prevActiveTab.current = activeTab;
  }, [activeTab]);

  // Memoize descriptions to prevent unnecessary re-renders
  const headerDescription = useMemo(() => (
    <span>
      Jumpstart your presentation with <span className="text-blue-600 dark:text-blue-400">stunning designs</span> and <span className="text-emerald-600 dark:text-emerald-400">professional layouts</span>
    </span>
  ), []);
  
  const demosDescription = useMemo(() => (
    <span>
      Choose from our <span className="text-amber-600 dark:text-amber-400 font-medium">pre-designed templates</span> to create presentations that <span className="text-blue-600 dark:text-blue-400 font-medium">impress and engage</span>
    </span>
  ), []);
  
  const themesDescription = useMemo(() => (
    <span>
      Select a <span className="text-emerald-600 dark:text-emerald-400 font-medium">color scheme</span> that matches your <span className="text-amber-600 dark:text-amber-400 font-medium">brand and style</span>
    </span>
  ), []);

  const handleApplyTemplate = (templateName: string) => {
    try {
      console.log(`[TEMPLATE] Applying: ${templateName}`);
      
      // If a custom handler is provided, use it
      if (onApplyTemplate) {
        onApplyTemplate(templateName);
      } else {
        // Fallback behavior
        console.log(`Template applied: ${templateName}`);
      }
      
      // Close the modal after applying
      onClose();
    } catch (err) {
      console.error("Template load failed:", err);
      alert("Failed to apply template. Please try again.");
    }
  };

  // Create portal target
  const [mounted, setMounted] = useState(false);
// No demo previews generated — placeholder content only.

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/40 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-gradient-to-br from-white/90 to-white/80 dark:from-gray-800/95 dark:to-gray-800/80 border border-white/40 dark:border-gray-700/60 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl p-6 sm:p-8 flex flex-col overflow-hidden"
          style={modalContentStyle}
        >
          {/* Header */}
          <div className="flex flex-col mb-5">
            <div className="flex items-center justify-between mb-1 relative w-full">
              <div className="w-full text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                  Template Gallery
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="text-blue-500 font-medium">Demos</span> for inspiration • <span className="text-purple-500 font-medium">Themes</span> for branding
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close template gallery"
              >
                <X className="w-5 h-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" />
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="relative mb-6">
              <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-1">
                  {['demos', 'themes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab as 'demos' | 'themes')}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    aria-selected={activeTab === tab}
                    role="tab"
                    id={`${tab}-tab`}
                    aria-controls={`${tab}-tabpanel`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <motion.span
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 dark:bg-blue-400"
                        layoutId="tabIndicator"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    )}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div style={contentContainerStyle} className="px-6 pb-6">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={activeTab}
                custom={direction}
                variants={prefersReducedMotion ? {} : tabContentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="h-full min-h-0"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.15 },
                }}
                role="tabpanel"
                aria-labelledby={`${activeTab}-tab`}
                tabIndex={0}
              >
                {activeTab === 'demos' && (
                  <div className="h-full overflow-y-auto">
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                        {[
                          {
                            id: 'business-strategy',
                            title: 'Business Strategy',
                            description: 'Premium Apple Keynote-grade business strategy deck with glass overlays and professional data visuals',
                            icon: <Briefcase className="w-5 h-5 text-blue-500" />,
                            bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10',
                            themeId: 'business-strategy'
                          },
                          {
                            id: 'modern-corporate',
                            title: 'Modern Corporate',
                            description: 'Clean and professional templates for business presentations',
                            icon: <Briefcase className="w-5 h-5 text-indigo-500" />,
                            bgGradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/10',
                            themeId: 'modern-corporate'
                          },
                          {
                            id: 'education-pro',
                            title: 'Education Pro',
                            description: 'Academic and educational templates with clean layouts',
                            icon: <BookOpen className="w-5 h-5 text-amber-500" />,
                            bgGradient: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10',
                            themeId: 'education-pro'
                          }
                        ].map((item, i) => (
                          <motion.article
                            key={i}
                            className={`group relative flex flex-col h-[280px] bg-white dark:bg-gray-800/80 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700/50 ${item.bgGradient || ''}`}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                              delay: i * 0.03,
                              type: 'spring',
                              stiffness: 400,
                              damping: 20
                            }}
                            whileHover={{ 
                              y: -4, 
                              boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.1)',
                              borderColor: 'rgba(0, 0, 0, 0.1)'
                            }}
                            aria-labelledby={`card-${i}-title`}
                          >
                            {/* Preview Area */}
                            <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 overflow-hidden">
                              {item.id === 1 ? (
                                <div className="absolute inset-0 p-4 flex flex-col">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                      <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                                      <div className="w-2 h-2 rounded-full bg-blue-200"></div>
                                    </div>
                                    <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Strategy Deck</div>
                                  </div>
                                  <div className="flex-1 grid grid-cols-3 gap-2">
                                    <div className="bg-white/80 dark:bg-white/10 rounded p-2 flex flex-col">
                                      <div className="h-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-2"></div>
                                      <div className="h-1 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-1"></div>
                                      <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded mt-2"></div>
                                    </div>
                                    <div className="bg-white/80 dark:bg-white/10 rounded p-2 flex flex-col">
                                      <div className="h-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-2"></div>
                                      <div className="h-1 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-1"></div>
                                      <div className="h-1 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-1"></div>
                                      <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded mt-2"></div>
                                    </div>
                                    <div className="bg-white/80 dark:bg-white/10 rounded p-2 flex flex-col">
                                      <div className="h-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-2"></div>
                                      <div className="h-1 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-1"></div>
                                      <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded mt-2"></div>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-[10px] text-blue-600/70 dark:text-blue-300/70 text-center">
                                    Business Strategy Template
                                  </div>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                  <div className="w-full h-full rounded-lg bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-inner overflow-hidden">
                                    <div className="h-3 flex items-center px-2 border-b border-gray-100 dark:border-gray-700/50">
                                      <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></div>
                                      <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></div>
                                      <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                    </div>
                                    <div className="p-3 h-[calc(100%-12px)]">
                                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-2"></div>
                                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 mb-3"></div>
                                      <div className="grid grid-cols-3 gap-2 mb-2">
                                        <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                                        <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                                        <div className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                                      </div>
                                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6 mb-1"></div>
                                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3"></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {item.id !== 1 && (
                                <div className="absolute top-3 right-3 flex items-center gap-1">
                                  <span className="bg-white/90 dark:bg-gray-800/90 text-[11px] font-medium px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-200 shadow-sm">
                                    Demo {item.id}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="p-4 flex-1 flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {item.icon && (
                                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                                      {item.icon}
                                    </div>
                                  )}
                                  <h3 
                                    id={`card-${i}-title`}
                                    className="text-[15px] font-semibold text-gray-900 dark:text-white truncate"
                                  >
                                    {item.title || 'Presentation Template'}
                                  </h3>
                                </div>
                                <button 
                                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                  aria-label="Quick preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                <div className="flex flex-col gap-2">
                                  {item.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-[13px] h-8 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-300 transition-colors duration-200 border-gray-200 dark:border-gray-600"
                                    onClick={() => handleApplyTemplate(`DEMO:${item.title?.toUpperCase().replace(/\s+/g, '_') || i + 1}`)}
                                    aria-label={item.title ? `Use ${item.title} template` : `Use demo template ${i + 1}`}
                                  >
                                    <span className="group-hover:translate-x-0.5 transition-transform duration-200 mr-1">
                                      →
                                    </span>
                                    <span className="text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                      {item.title ? 'Use Template' : 'Use This'}
                                    </span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.article>
                        ))}
                      </div>
                    )}
                    
                    {/* Demos Section Footer */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-start">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg mr-4">
                          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Inspiration at Your Fingertips</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Our demo templates are designed to spark your creativity. Each one is fully customizable to match your unique style and content needs. 
                            <span className="block mt-2 text-blue-600 dark:text-blue-400 font-medium">
                              Tip: Hover over any template to see a quick preview!
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'themes' && (
                  <div className="h-full overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                      {[
                        {
                          id: 'modern',
                          title: "Modern",
                          description: "Clean, professional slides with a modern aesthetic",
                          category: "Professional",
                          icon: <Palette className="w-5 h-5" />,
                          bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10",
                          accent: "text-blue-500"
                        },
                        {
                          id: 'minimal',
                          title: "Minimal",
                          description: "Elegant designs with ample white space and focus on content",
                          category: "Clean",
                          icon: <MinimalIcon />,
                          bg: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-900/10",
                          accent: "text-gray-500"
                        },
                        {
                          id: 'corporate',
                          title: "Corporate",
                          description: "Formal layouts perfect for business presentations",
                          category: "Professional",
                          icon: <Briefcase className="w-5 h-5" />,
                          bg: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-900/10",
                          accent: "text-slate-600"
                        },
                        {
                          id: 'creative',
                          title: "Creative",
                          description: "Bold designs with vibrant colors and modern typography",
                          category: "Modern",
                          icon: <Sparkles className="w-5 h-5" />,
                          bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10",
                          accent: "text-purple-500"
                        },
                        {
                          id: 'academic',
                          title: "Academic",
                          description: "Structured layouts ideal for educational content",
                          category: "Formal",
                          icon: <BookOpen className="w-5 h-5" />,
                          bg: "bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-900/20 dark:to-amber-800/10",
                          accent: "text-amber-500"
                        },
                        {
                          id: 'blank',
                          title: "Blank",
                          description: "Start with a clean slate and full creative control",
                          category: "Custom",
                          icon: <PlusCircle className="w-5 h-5" />,
                          bg: "bg-white dark:bg-gray-800/40 border-2 border-dashed border-gray-200 dark:border-gray-700",
                          accent: "text-gray-400"
                        }
                      ].map((theme, index) => (
                        <motion.article
                          key={theme.id}
                          className="group relative flex flex-col h-[280px] bg-white dark:bg-gray-800/80 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700/50"
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            delay: Math.min(index * 0.03, 0.3),
                            type: 'spring',
                            stiffness: 400,
                            damping: 20
                          }}
                          whileHover={{ 
                            y: -4, 
                            boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.1)',
                            borderColor: 'rgba(0, 0, 0, 0.1)'
                          }}
                          aria-labelledby={`theme-${theme.id}-title`}
                        >
                          {/* Preview Area */}
                          <div className={`relative h-40 ${theme.bg} overflow-hidden`}>
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                              <div className="w-full h-full rounded-lg bg-white/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-inner overflow-hidden">
                                <div className="h-3 flex items-center px-2 border-b border-gray-100 dark:border-gray-700/50">
                                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></div>
                                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></div>
                                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                </div>
                                <div className="p-3 h-[calc(100%-12px)]">
                                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-2"></div>
                                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 mb-3"></div>
                                  <div className="grid grid-cols-3 gap-2 mb-2">
                                    <div className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded" style={{ backgroundColor: theme.bg.match(/from-([a-z]+)-/)?.[1] ? `var(--${theme.bg.match(/from-([a-z]+)-/)[1]}-100)` : 'var(--gray-100)' }}></div>
                                    <div className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded" style={{ backgroundColor: theme.bg.match(/to-([a-z]+)-/)?.[1] ? `var(--${theme.bg.match(/to-([a-z]+)-/)[1]}-100)` : 'var(--gray-100)' }}></div>
                                    <div className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded" style={{ backgroundColor: theme.accent ? `var(--${theme.accent.split('-')[1]}-100)` : 'var(--gray-100)' }}></div>
                                  </div>
                                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6 mb-1"></div>
                                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3"></div>
                                </div>
                              </div>
                            </div>
                            <span className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 text-[11px] font-medium px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-200 shadow-sm">
                              {theme.category}
                            </span>
                          </div>

                          {/* Theme Info */}
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <h3 
                                id={`theme-${theme.id}-title`}
                                className="text-[15px] font-semibold text-gray-900 dark:text-white truncate"
                              >
                                {theme.title} Theme
                              </h3>
                              <button 
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                aria-label="Quick preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
                              <Button 
                                variant="outline"
                                size="sm"
                                className="w-full text-[13px] h-8 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-300 transition-colors duration-200 border-gray-200 dark:border-gray-600"
                                onClick={() => handleApplyTemplate(theme.title.toUpperCase())}
                                aria-label={`Apply ${theme.title} theme`}
                              >
                                <span className="group-hover:translate-x-0.5 transition-transform duration-200 mr-1">
                                  →
                                </span>
                                <span className="text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                  Use Theme
                                </span>
                              </Button>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                    
                    {/* Themes Section Footer */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/5 rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <div className="flex items-start">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-lg mr-4">
                          <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Find Your Perfect Style</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Each theme includes carefully curated color palettes, typography, and layout styles that work together harmoniously. 
                            <span className="block mt-2 text-purple-600 dark:text-purple-400 font-medium">
                              Pro Tip: Mix and match elements from different themes for a unique look!
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
