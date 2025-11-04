import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  LayoutGrid, 
  Type, 
  BarChart3, 
  Download, 
  Presentation,
  Image as ImageIcon
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animations";

// Animated counter component
const AnimatedNumber = ({ value }: { value: string }) => {
  const [isInView, setIsInView] = useState(false);
  const count = useMotionValue(0);
  
  // Parse the value (handle numbers with K, M, %, etc.)
  const numMatch = value.match(/[0-9.]+/);
  const numValue = numMatch ? parseFloat(numMatch[0]) : 0;
  const suffix = value.replace(/[0-9.]+/g, '');
  const isFraction = value.includes('/');
  const isPercentage = value.includes('%');
  
  useEffect(() => {
    if (isInView) {
      const controls = animate(count, numValue, {
        duration: 2,
        ease: 'easeOut',
      });
      
      return () => controls.stop();
    }
  }, [isInView, numValue, count]);
  
  const displayNumber = useTransform(count, (latest) => {
    if (value.includes('K')) {
      return latest >= 1000 ? `${(latest / 1000).toFixed(0)}K` : latest.toFixed(0);
    } else if (value.includes('M')) {
      return latest >= 1000000 ? `${(latest / 1000000).toFixed(1)}M` : latest.toFixed(0);
    } else if (isPercentage) {
      return latest.toFixed(latest >= 10 ? 0 : 1);
    } else if (isFraction) {
      const [numerator, denominator] = value.split('/');
      // For ratings, we want to show the exact value (4.9/5) without adding extra characters
      if (denominator === '5') {
        return `${latest.toFixed(1)}/${denominator}`;
      }
      return `${latest.toFixed(1)}/${denominator}`;
    }
    return latest.toFixed(0);
  });
  
  return (
    <motion.span 
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.span>
        {displayNumber}
      </motion.span>
      {/* Only show suffix if it's not a fraction (handled in displayNumber) */}
      {!isFraction && suffix}
    </motion.span>
  );
};


interface FeaturesProps {
  id?: string;
}

export const Features = ({ id }: FeaturesProps) => {
  const { isVisible, elementRef } = useScrollAnimation();
  
  const features = [
    {
      icon: LayoutGrid,
      title: "Intuitive Builder",
      description: "Drag, drop, and arrange elements with pixel-perfect precision. Smart guides and snapping make alignment effortless.",
      color: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-500"
    },
    {
      icon: Type,
      title: "Rich Text",
      description: "Professional typography with full formatting control. Bold, italic, colors, and alignment at your fingertips.",
      color: "from-purple-500/10 to-purple-600/10",
      iconColor: "text-purple-500"
    },
    {
      icon: BarChart3,
      title: "Data Visualization",
      description: "Create stunning charts and graphs. Import data, customize styles, and watch your numbers come to life.",
      color: "from-emerald-500/10 to-emerald-600/10",
      iconColor: "text-emerald-500"
    },
    {
      icon: Download,
      title: "Export",
      description: "Download as PowerPoint (.pptx) with perfect fidelity. Share online or present from anywhere.",
      color: "from-amber-500/10 to-amber-600/10",
      iconColor: "text-amber-500"
    },
    {
      icon: Presentation,
      title: "Presentation",
      description: "Fullscreen presentations with keyboard navigation. Auto-play, slide transitions, and professional controls.",
      color: "from-rose-500/10 to-rose-600/10",
      iconColor: "text-rose-500"
    },
    {
      icon: ImageIcon,
      title: "Media Library",
      description: "Access to millions of high-quality stock photos, icons, and illustrations to enhance your slides.",
      color: "from-indigo-500/10 to-indigo-600/10",
      iconColor: "text-indigo-500"
    }
  ];

  return (
    <section 
      id={id} 
      ref={elementRef}
      className="py-20 md:py-28 bg-white relative overflow-hidden"
    >
      {/* Enhanced Parallax background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-slate-200/20 to-slate-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-slate-300/15 to-slate-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-400/10 to-slate-500/5 rounded-full blur-2xl" />
      </div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Design slides <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">faster</span> than you think
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Professional slides, zero friction. Everything you need to create presentations that stand out.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.1 * index,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1]
                }
              } : {}}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="h-full bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-slate-300/50">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-5 shadow-inner`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-[15px] font-light">
                  {feature.description}
                </p>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm border border-slate-200/50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
