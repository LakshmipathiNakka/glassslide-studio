import { motion, useInView, useAnimation, Variants, Variant } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Check, Zap, Clock, BarChart3, Palette, Image as ImageIcon, Code2, MousePointerClick } from 'lucide-react';

interface PricingProps {
  id?: string;
}

const features = [
  { icon: <Zap className="w-6 h-6" />, text: 'Lightning-fast performance' },
  { icon: <Palette className="w-6 h-6" />, text: 'Unlimited custom themes' },
  { icon: <ImageIcon className="w-6 h-6" />, text: '1GB storage' },
  { icon: <BarChart3 className="w-6 h-6" />, text: 'Basic analytics' },
  { icon: <MousePointerClick className="w-6 h-6" />, text: 'Drag & drop editor' },
  { icon: <Code2 className="w-6 h-6" />, text: 'Developer API access' },
];

const PricingCard = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  } as const;

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]  // cubic-bezier equivalent to easeInOut
      },
    },
  } as const;

  return (
    <motion.div
      id="pricing-card"
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={container}
      className="relative max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-100 shadow-lg overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      
      {/* Badge */}
      <motion.div
        variants={item}
        className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 border border-green-100 mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ 
          scale: 1, 
          opacity: 1,
          transition: { 
            type: 'spring',
            stiffness: 400,
            damping: 10,
            delay: 0.4
          }
        }}
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white mr-2">
          <Check className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-green-700">Free Forever</span>
      </motion.div>

      <motion.h2 
        variants={item}
        className="text-4xl md:text-5xl font-bold text-gray-900 mb-2"
      >
        $0
        <span className="text-xl font-normal text-gray-500">/month</span>
      </motion.h2>

      <motion.p variants={item} className="text-gray-500 mb-8">
        No credit card required. Access all essential features at zero cost.
      </motion.p>

      <motion.div variants={item} className="mb-8">
        <button 
          className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-medium text-lg hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center"
        >
          Get Started Free
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </motion.div>

      <motion.div variants={item} className="space-y-4">
        {features.map((feature, index) => (
          <motion.div 
            key={index} 
            className="flex items-center space-x-3 text-gray-700"
            variants={item}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              {feature.icon}
            </div>
            <span>{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={item}
        className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center text-sm text-gray-500"
      >
        <Clock className="w-4 h-4 mr-2" />
        No time limit. No hidden fees.
      </motion.div>
    </motion.div>
  );
};

interface PricingProps {
  id?: string;
}

export const Pricing = ({ id = 'pricing' }: PricingProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <section 
      id={id}
      ref={ref} 
      className="py-20 md:py-32 bg-white relative overflow-hidden scroll-mt-20"
      style={{ scrollMarginTop: '80px' }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full blur-3xl opacity-70" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1]  // cubic-bezier equivalent to easeInOut
            }
          }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create stunning presentations. No surprises.
          </p>
        </motion.div>

        <PricingCard />
      </div>
    </section>
  );
};
