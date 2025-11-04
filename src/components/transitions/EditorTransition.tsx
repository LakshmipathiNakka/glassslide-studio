import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TRANSITION_DURATION = 3; // 3000ms

const transitionVariants = {
  initial: (direction: 'in' | 'out') => ({
    clipPath: direction === 'in' ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
    opacity: direction === 'in' ? 0 : 1,
  }),
  animate: (direction: 'in' | 'out') => ({
    clipPath: direction === 'in' ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
    opacity: direction === 'in' ? 1 : 0,
    transition: {
      duration: direction === 'in' ? TRANSITION_DURATION : TRANSITION_DURATION * 0.8,
      ease: [0.42, 0, 0.58, 1],
    },
  }),
};

export function EditorTransition({ children, isActive = false }: { children: React.ReactNode; isActive?: boolean }) {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      navigate('/editor');
    }, TRANSITION_DURATION * 1000);

    return () => clearTimeout(timer);
  }, [isActive, navigate]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key="overlay"
            ref={overlayRef}
            className={cn(
              'fixed inset-0 z-50 bg-white flex items-center justify-center',
              'pointer-events-none'
            )}
            initial="initial"
            animate="animate"
            exit="exit"
            custom="in"
            variants={transitionVariants}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white to-gray-50"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: TRANSITION_DURATION,
                ease: [0.42, 0, 0.58, 1],
              }}
            />
            <motion.div
              className="relative z-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.42, 0, 0.58, 1],
              }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl mb-6 mx-auto flex items-center justify-center shadow-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              >
                <motion.div
                  className="w-10 h-10 bg-white rounded-lg"
                  animate={{
                    scale: [1, 0.8, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
              </motion.div>
              <motion.p
                className="text-lg font-medium text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Preparing your workspace...
              </motion.p>
              <motion.div
                className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto"
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: TRANSITION_DURATION - 0.5,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
