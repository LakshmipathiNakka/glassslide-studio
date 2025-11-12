import { motion, AnimatePresence } from "framer-motion";
import { X, FolderOpen, Palette } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { presentationThemes } from "@/utils/presentationThemes";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface TemplateModalProps {
  onClose: () => void;
  onApplyTemplate?: (templateName: string) => void;
}

export default function TemplateModal({ onClose, onApplyTemplate }: TemplateModalProps) {
  const [activeTab, setActiveTab] = useState<"demos" | "themes">("demos");

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
      <div className="fixed inset-0 z-[999999] flex items-center justify-center px-4 sm:px-8 py-6 bg-black/40 backdrop-blur-md" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-gradient-to-br from-white/90 to-white/80 dark:from-gray-800/95 dark:to-gray-800/80 border border-white/40 dark:border-gray-700/60 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              Templates
            </h2>
            <button onClick={onClose} className="keynote-icon-btn" title="Close">
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

{/* Tabs */}
          <div className="grid grid-cols-2 bg-gray-100/70 dark:bg-gray-700/40 rounded-xl p-1 mb-4">
            <button
              className={`keynote-tab ${activeTab === "demos" ? "active" : ""}`}
              onClick={() => setActiveTab("demos")}
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Demos</span>
            </button>
            <button
              className={`keynote-tab ${activeTab === "themes" ? "active" : ""}`}
              onClick={() => setActiveTab("themes")}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Themes</span>
            </button>
          </div>

{/* No hidden preview targets — demos are placeholders */}

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-3">
{/* Demos (now shows Themes content) */}
            {activeTab === "demos" && (
              <motion.div
                key="demos"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {presentationThemes
                  .filter((theme) => theme.id === 'business-strategy')
                  .map((theme) => (
                  <div key={theme.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white/60 dark:bg-gray-800/40 hover:shadow-lg transition-all">
                    <div className="h-28 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/40 dark:to-gray-800/20">
                      <div className="text-center">
                        <Sparkles className="w-7 h-7 mx-auto mb-1 text-blue-500" />
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{theme.name}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{theme.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{theme.slides.length} slides</p>
                      <Button className="w-full" onClick={() => handleApplyTemplate(`THEME:${theme.id}`)}>Use This Theme</Button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Themes */}
            {activeTab === "themes" && (
              <motion.div
                key="themes"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {[
                  {
                    title: "Modern",
                    border: "border-blue-400",
                    bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-700/20",
                  },
                  {
                    title: "Minimal",
                    border: "border-gray-400",
                    bg: "bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800/50 dark:to-gray-900/20",
                  },
                  {
                    title: "Classic",
                    border: "border-amber-500",
                    bg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-800/40 dark:to-amber-700/20",
                  },
                  {
                    title: "Blank",
                    border: "border-transparent",
                    bg: "bg-white/60 dark:bg-gray-800/40",
                  },
                ].map((theme) => (
                  <div
                    key={theme.title}
                    className={`group cursor-pointer rounded-2xl border-2 ${theme.border} ${theme.bg} hover:shadow-lg transition-all p-6`}
                    onClick={() => handleApplyTemplate(theme.title)}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {theme.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {theme.title === "Blank"
                        ? "Reset to default style"
                        : "Apply cohesive theme across all slides"}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
