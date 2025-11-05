import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export const EditorLoader = ({ onLoadingComplete }: { onLoadingComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let start: number;
    const duration = 5000; // 5 seconds
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const newProgress = Math.min(elapsed / duration * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress < 100) {
        requestAnimationFrame(animate);
      } else if (!isComplete) {
        setIsComplete(true);
        setTimeout(() => {
          onLoadingComplete();
        }, 300); // Small delay for exit animation
      }
    };

    const frameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isComplete, onLoadingComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div 
          className="fixed inset-0 bg-white z-[9999] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeInOut' }
          }}
          aria-live="polite"
          aria-busy={!isComplete}
        >
          <div className="text-center">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
              }}
              aria-hidden="true"
            >
              <motion.div 
                className="w-4 h-4 bg-white rounded-full"
                animate={{
                  x: [0, 4, 0, -4, 0],
                  y: [0, -4, 0, 4, 0],
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
              />
            </motion.div>
            
            <motion.div 
              className="text-2xl font-semibold text-gray-800 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Preparing your workspace
            </motion.div>
            
            <motion.p 
              className="text-gray-500 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Loading tools and resources...
            </motion.p>
            
            <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-auto">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            
            <motion.p 
              className="text-sm text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(progress)}% complete
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
