import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useAnimation, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useScrollAnimation } from "@/hooks/use-scroll-animations";

// Animated number component for stats
const AnimatedNumber = ({ value, className = "" }: { value: string, className?: string }) => {
  const [isInView, setIsInView] = useState(false);
  const count = useMotionValue(0);
  
  // Check if it's a fraction format (like 4.9/5)
  const isFraction = value.includes('/');
  
  let numValue = 0;
  let suffix = '';
  
  if (isFraction) {
    // For fraction format like '4.9/5', we'll just display it as is
    return (
      <span className={className}>
        {value}
      </span>
    );
  } else {
    // Handle other formats (K, M, %)
    const numMatch = value.match(/[0-9.]+/);
    numValue = numMatch ? parseFloat(numMatch[0]) : 0;
    suffix = value.replace(/[0-9.]+/g, '');
  }
  
  const isPercentage = value.includes('%');
  
  useEffect(() => {
    if (isInView && !isFraction) {
      const controls = animate(count, numValue, {
        duration: 2,
        ease: 'easeOut',
      });
      
      return () => controls.stop();
    }
  }, [isInView, numValue, count, isFraction]);
  
  const displayNumber = useTransform(count, (latest) => {
    if (value.includes('K')) {
      return latest >= 1000 ? `${(latest / 1000).toFixed(0)}K` : latest.toFixed(0);
    } else if (value.includes('M')) {
      return latest >= 1000000 ? `${(latest / 1000000).toFixed(1)}M` : latest.toFixed(0);
    } else if (isPercentage) {
      return latest.toFixed(latest >= 10 ? 0 : 1);
    }
    return latest.toFixed(0);
  });
  
  return (
    <motion.span 
      className={className}
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.span>{displayNumber}</motion.span>
      {suffix}
    </motion.span>
  );
};

interface TestimonialsProps {
  id?: string;
}

export const Testimonials = ({ id = 'testimonials' }: TestimonialsProps) => {
  const { isVisible, elementRef } = useScrollAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      });
    }
  }, [isInView, controls]);

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Product Manager at Infosys",
      content: "GlassSlide has revolutionized our presentation workflow. The intuitive interface and powerful tools help our team in Bangalore create professional slides in half the time.",
      rating: 5,
      avatar: "PS",
      color: "bg-gradient-to-br from-blue-50 to-blue-100/30"
    },
    {
      name: "Rahul Patel",
      role: "Marketing Head at Zoho",
      content: "The animation capabilities in GlassSlide are unmatched. Our investor presentations for our Chennai office have never looked more polished and professional.",
      rating: 5,
      avatar: "RP",
      color: "bg-gradient-to-br from-purple-50 to-purple-100/20"
    },
    {
      name: "Ananya Reddy",
      role: "Consultant at TCS",
      content: "GlassSlide's collaborative features have transformed how our Mumbai team works together. Real-time editing and commenting save us hours of back-and-forth across different time zones.",
      rating: 5,
      avatar: "AR",
      color: "bg-gradient-to-br from-emerald-50 to-emerald-100/20"
    },
    {
      name: "Arjun Mehta",
      role: "CEO at Freshworks",
      content: "The analytics dashboard provides incredible insights into how our presentations perform in the Indian market. We've optimized our content based on local engagement data.",
      rating: 5,
      avatar: "AM",
      color: "bg-gradient-to-br from-amber-50 to-amber-100/20"
    },
    {
      name: "Neha Kapoor",
      role: "Design Lead at Byju's",
      content: "As a designer in Bangalore, I appreciate how GlassSlide respects typography and spacing. Our educational content looks consistently beautiful across all our presentations.",
      rating: 5,
      avatar: "NK",
      color: "bg-gradient-to-br from-rose-50 to-rose-100/20"
    },
    {
      name: "Vikram Singh",
      role: "Sales Director at Flipkart",
      content: "The ability to create interactive demos within our presentations has been a game-changer for our sales team in Delhi. Our close rates have improved significantly.",
      rating: 5,
      avatar: "VS",
      color: "bg-gradient-to-br from-indigo-50 to-indigo-100/20"
    }
  ];

  return (
    <section 
      id={id}
      className="py-20 md:py-28 bg-white relative overflow-hidden scroll-mt-20"
      style={{ scrollMarginTop: '80px' }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-400/10 to-slate-500/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
            What our <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">users</span> say
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Join thousands of professionals who trust GlassSlide for their most important presentations.
          </p>
        </div>

        <div className="relative mx-auto max-w-7xl" ref={containerRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
            {testimonials.map((testimonial, index) => (
              <motion.article
                key={index}
                className="relative h-full group perspective-1000"
                initial={{ opacity: 0, y: 40, rotateY: 5 }}
                animate={isInView ? { 
                  opacity: 1, 
                  y: 0,
                  rotateY: 0,
                  transition: {
                    delay: index * 0.1,
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1]
                  }
                } : {}}
                whileHover={{
                  y: -8,
                  rotateY: 2,
                  transition: { 
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                    mass: 0.5
                  }
                }}
              >
                <div className={`h-full flex flex-col bg-white/80 backdrop-blur-lg rounded-3xl p-4 sm:p-6 border border-slate-100/80 shadow-sm hover:shadow-lg transition-all duration-500 ease-out group-hover:border-slate-200/90 overflow-hidden ${testimonial.color}`}>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Rating */}
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="flex space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 1 }}
                          whileHover={{ 
                            scale: 1.2,
                            rotate: i % 2 === 0 ? 10 : -10,
                            transition: { type: 'spring', stiffness: 500 }
                          }}
                        >
                          <Star className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quote mark */}
                  <motion.div 
                    className="text-center mb-3 sm:mb-4 opacity-20"
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={isInView ? { 
                      scale: 1, 
                      opacity: 0.2,
                      transition: { delay: 0.3 + index * 0.1 }
                    } : {}}
                  >
                    <Quote className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-slate-400" />
                  </motion.div>
                  
                  {/* Testimonial text */}
                  <motion.p 
                    className="text-slate-800 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base font-light text-center italic flex-grow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.1 + index * 0.05 }
                    } : {}}
                  >
                    {testimonial.content}
                  </motion.p>
                  
                  {/* Divider */}
                  <div className="w-12 h-0.5 bg-slate-200 mx-auto my-3 sm:my-4" />
                  
                  {/* Author */}
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.2 + index * 0.05 }
                    } : {}}
                  >
                    <div className="relative group/avatar">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 opacity-60 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3 overflow-hidden">
                        <span className="relative z-10">{testimonial.avatar}</span>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                    <h4 className="text-sm sm:text-base font-medium text-slate-900 line-clamp-1">{testimonial.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-light line-clamp-1">{testimonial.role}</p>
                  </motion.div>
                </div>
              </motion.article>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden md:flex justify-between w-full absolute top-1/2 -translate-y-1/2 left-0 right-0 px-2">
            <button 
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg border border-slate-200 hover:bg-white transition-colors -ml-4"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button 
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg border border-slate-200 hover:bg-white transition-colors -mr-4"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div 
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass-card rounded-3xl p-8 sm:p-12 max-w-6xl mx-auto border border-slate-200/30 shadow-xl bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-sm">
            <h3 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-8">Trusted by professionals worldwide</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '10K+', label: 'Active Users' },
                { value: '1M+', label: 'Slides Created' },
                { value: '100%', label: 'Uptime' },
                { value: '4.9/5', label: 'Rating' }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="p-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      delay: 0.1 * index,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-1">
                    <AnimatedNumber value={stat.value} />
                    {stat.label === 'Rating' && <span className="text-yellow-400">★</span>}
                  </div>
                  <div className="text-sm sm:text-base text-slate-500 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
