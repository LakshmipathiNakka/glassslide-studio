import { motion, AnimatePresence } from "framer-motion";
import { X, FolderOpen, Palette } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { presentationThemes } from "@/utils/presentationThemes";
import SimplePowerPointCanvas from "@/components/canvas/SimplePowerPointCanvas";

interface TemplateModalProps {
  onClose: () => void;
  onApplyTemplate?: (templateName: string) => void;
}

export default function TemplateModal({ onClose, onApplyTemplate }: TemplateModalProps) {
  const [activeTab, setActiveTab] = useState<"demo" | "themes">("demo");

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
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const hiddenRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setHiddenRef = (id: string) => (el: HTMLDivElement | null) => { hiddenRefs.current[id] = el; };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!mounted) return;
      try {
        const { default: html2canvas } = await import('html2canvas');
        for (const t of presentationThemes) {
          if (previews[t.id]) continue;
          const el = hiddenRefs.current[t.id];
          if (el) {
            const canvas = await html2canvas(el, { backgroundColor: null, scale: 1, useCORS: true });
            if (cancelled) return;
            setPreviews((p) => ({ ...p, [t.id]: canvas.toDataURL('image/png') }));
          }
        }
      } catch (e) {
        console.warn('Thumbnail generation skipped:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [mounted]);

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
              className={`keynote-tab ${activeTab === "demo" ? "active" : ""}`}
              onClick={() => setActiveTab("demo")}
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Demo Presentations</span>
            </button>
            <button
              className={`keynote-tab ${activeTab === "themes" ? "active" : ""}`}
              onClick={() => setActiveTab("themes")}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Themes</span>
            </button>
          </div>

          {/* Hidden preview render targets for thumbnails */}
          <div style={{ position: 'absolute', left: -9999, top: -9999 }} aria-hidden>
            {presentationThemes.map((t) => {
              const slide = t.slides?.[0];
              if (!slide) return null;
              return (
                <div key={`hidden-${t.id}`} ref={setHiddenRef(t.id)} style={{ width: 240, height: 135 }}>
                  <SimplePowerPointCanvas
                    elements={slide.elements as any}
                    background={slide.background}
                    slideWidth={960}
                    slideHeight={540}
                    zoom={240 / 960}
                  />
                </div>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-3">
            {/* Demo Presentations */}
            {activeTab === "demo" && (
              <motion.div
                key="demo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {presentationThemes.map((t) => (
                  <div
                    key={t.id}
                    className="group cursor-pointer rounded-2xl overflow-hidden bg-white/60 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                    onClick={() => handleApplyTemplate(`THEME:${t.id}`)}
                  >
                    <img
                      src={previews[t.id] || t.thumbnail || `https://via.placeholder.com/300x180/2e86de/fff?text=${encodeURIComponent(t.name)}`}
                      alt={t.name}
                      className="w-full h-36 object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {t.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.description}
                      </p>
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
