import React from 'react';
import KeynoteModal from '@/components/ui/keynote-modal';
import KeynoteButton from '@/components/ui/KeynoteButton';
import useModal from '@/hooks/useModal';

const ModalShowcase: React.FC = () => {
  const insertModal = useModal();
  const settingsModal = useModal();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white dark:from-[#0b0b0b] dark:to-[#121212] flex items-center justify-center p-6 gap-6">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Keynote UI Primitives</h1>
        <p className="text-gray-600 dark:text-gray-400">Apple Keynote–inspired modal and buttons</p>

        <div className="flex flex-wrap gap-3 items-center justify-center">
          <KeynoteButton variant="primary" onClick={insertModal.open}>Open Insert Modal</KeynoteButton>
          <KeynoteButton variant="secondary" onClick={settingsModal.open}>Open Settings</KeynoteButton>
          <KeynoteButton variant="ghost">Ghost</KeynoteButton>
          <KeynoteButton variant="destructive">Delete</KeynoteButton>
        </div>
      </div>

      <KeynoteModal
        isOpen={insertModal.isOpen}
        title="Insert Chart"
        onClose={insertModal.close}
        footer={(
          <div className="flex gap-2">
            <KeynoteButton variant="secondary" onClick={insertModal.close}>Cancel</KeynoteButton>
            <KeynoteButton variant="primary">Insert</KeynoteButton>
          </div>
        )}
      >
        <div className="grid grid-cols-3 gap-3">
          {[{label:'Bar'},{label:'Line'},{label:'Pie'}].map((c, i) => (
            <button key={i} className="p-5 rounded-xl border border-white/20 bg-white/30 dark:bg-white/10 hover:bg-white/40 transition">
              <div className="h-16 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-white/10 dark:to-white/5 rounded-md" />
              <div className="mt-2 text-sm text-gray-800 dark:text-gray-200">{c.label} Chart</div>
            </button>
          ))}
        </div>
      </KeynoteModal>

      <KeynoteModal
        isOpen={settingsModal.isOpen}
        title="Settings"
        onClose={settingsModal.close}
        footer={<KeynoteButton variant="primary" onClick={settingsModal.close}>Done</KeynoteButton>}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Reduced motion</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show advanced options</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
        </div>
      </KeynoteModal>
    </div>
  );
};

export default ModalShowcase;
