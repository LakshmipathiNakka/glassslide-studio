import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, FileText, PlayCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animations";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EditorTransition } from "@/components/transitions/EditorTransition";
import { useNavigate } from "react-router-dom";

// Apple-style button component
const AppleButton = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full text-lg font-medium transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95',
    secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:bg-gray-100',
    tertiary: 'bg-transparent text-blue-500 hover:bg-blue-50 active:bg-blue-100',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98, y: 1 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const AnimatedText = ({ children, delay = 0 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: delay,
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1]
        }
      }}
      viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
    >
      {children}
    </motion.span>
  );
};

interface CTAProps {
  id?: string;
}

export const CTA = ({ id = 'cta' }: CTAProps) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const navigate = useNavigate();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTransitioning(true);
    // Smoothly transition then navigate to /editor
    setTimeout(() => navigate('/editor'), 300);
  };
  
  return (
    <EditorTransition isActive={isTransitioning}>
      <section 
        id={id}
        ref={ref}
        className="py-24 md:py-40 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden"
      >
      {/* Enhanced Background elements with animations */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 1, ease: [0.6, 0.01, 0.05, 0.95] }
          }
        }}
      >
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] bg-gradient-to-br from-slate-200/10 to-slate-300/5 rounded-full blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            transition: { 
              delay: 0.2, 
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1]
            }
          }}
        />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-40 h-40 md:w-64 md:h-64 bg-gradient-to-br from-slate-300/15 to-slate-400/10 rounded-full blur-2xl"
          initial={{ x: -50, y: -50, opacity: 0 }}
          animate={{ 
            x: 0, 
            y: 0, 
            opacity: 1,
            transition: { 
              delay: 0.4, 
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1]
            }
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-80 md:h-80 bg-gradient-to-br from-slate-400/10 to-slate-500/5 rounded-full blur-2xl"
          initial={{ x: 50, y: 50, opacity: 0 }}
          animate={{ 
            x: 0, 
            y: 0, 
            opacity: 1,
            transition: { 
              delay: 0.6, 
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1]
            }
          }}
        />
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-5xl mx-auto text-center space-y-8 md:space-y-12"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
              }
            }
          }}
        >
          <div className="space-y-4 md:space-y-6">
            <motion.h2 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 leading-[1.1] tracking-tight"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1]
                  }
                }
              }}
            >
              <AnimatedText>Ready to create</AnimatedText>{' '}
              <AnimatedText delay={0.1}>something amazing?</AnimatedText>
            </motion.h2>
            
            <motion.p 
              className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    delay: 0.3,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1]
                  }
                }
              }}
            >
              Join thousands of professionals who design faster, present better, and deliver impact.
            </motion.p>
          </div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6 md:pt-8 px-4"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.5,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }
              }
            }}
          >
            <AppleButton 
              onClick={handleGetStarted}
              className="px-8 py-5 md:px-10 md:py-6 text-base md:text-lg font-medium"
              variant="primary"
              disabled={isTransitioning}
            >
              {isTransitioning ? (
                <span className="flex items-center">
                  <motion.span
                    className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Preparing...
                </span>
              ) : (
                <>
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 md:ml-3 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </AppleButton>
            
            <AppleButton 
              variant="secondary"
              className="px-8 py-5 md:px-10 md:py-6 text-base md:text-lg font-medium group"
            >
              <PlayCircle className="w-5 h-5 mr-2 md:mr-3 text-blue-500 group-hover:text-blue-600 transition-colors" />
              Watch Demo
            </AppleButton>
          </motion.div>

          <motion.div 
            className="flex flex-wrap items-center justify-center gap-4 pt-6 text-sm text-slate-500"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: {
                  delay: 0.7,
                  duration: 0.8
                }
              }
            }}
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-2 font-medium">4.9/5</span>
              <span className="mx-2 text-slate-300">•</span>
            </div>
            <span>Trusted by 10,000+ professionals</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
    </EditorTransition>
  );
};
