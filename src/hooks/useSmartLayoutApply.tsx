import { useCallback, useMemo, useState } from 'react';
import { generateElementsForLayout } from '@/utils/layoutApply';
import { SlideElement } from '@/types/canvas';
import KeynoteModal from '@/components/ui/keynote-modal';
import { motion } from 'framer-motion';

interface UseSmartLayoutApplyOptions {
  getElements?: () => SlideElement[];
  setElements?: (els: SlideElement[]) => void;
  canvasSize?: { width: number; height: number };
  onApplied?: (layoutId: string) => void;
}

export function useSmartLayoutApply(options: UseSmartLayoutApplyOptions = {}) {
  const [isOpen, setOpen] = useState(false);
  const [pendingLayout, setPending] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const getEls = options.getElements || (() => []);
  const setEls = options.setElements || (() => {});

  const requestApplyLayout = useCallback((layoutId: string) => {
    const hasContent = (getEls() || []).length > 0;
    if (!hasContent) {
      // Direct apply with enter animation handled by caller via AnimatePresence
      const newEls = generateElementsForLayout(layoutId, options.canvasSize);
      setEls(newEls);
      options.onApplied?.(layoutId);
      return;
    }
    setPending(layoutId);
    setOpen(true);
  }, [getEls, setEls, options.canvasSize, options.onApplied]);

  const cancel = useCallback(() => {
    setOpen(false);
    setPending(null);
  }, []);

  const confirm = useCallback(async () => {
    if (!pendingLayout) return;
    setIsApplying(true);
    setOpen(false);

    // Exit old content: clear to trigger exit animations in caller
    setEls([]);
    await sleep(200); // allow fade-down

    const newEls = generateElementsForLayout(pendingLayout, options.canvasSize);
    setEls(newEls);

    await sleep(260); // allow slide-in
    setIsApplying(false);
    options.onApplied?.(pendingLayout);
    setPending(null);
  }, [pendingLayout, setEls, options.canvasSize, options.onApplied]);

  const Modal = useMemo(() => (
    <KeynoteModal
      isOpen={isOpen}
      onClose={cancel}
      title="Change Slide Layout"
      widthClassName="sm:max-w-lg"
      footer={(
        <div className="flex w-full justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={cancel}
            className="px-4 py-2 rounded-xl text-[13px] font-medium border border-white/30 text-gray-700 bg-white/30 hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(59,130,246,0.25)' }}
            whileTap={{ scale: 0.98 }}
            onClick={confirm}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-white/80 backdrop-blur-md shadow-lg hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            style={{ color: '#0b62ff' }}
          >
            Apply Layout
          </motion.button>
        </div>
      )}
    >
      <p className="text-[13px] leading-relaxed text-gray-700">
        Changing the layout will remove existing objects on this slide. Do you want to continue?
      </p>
    </KeynoteModal>
  ), [isOpen, confirm, cancel]);

  return {
    requestApplyLayout,
    modal: Modal,
    isApplying,
  };
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
