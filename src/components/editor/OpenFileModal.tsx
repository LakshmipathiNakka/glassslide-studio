import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Trash2, FileText, RefreshCw, FolderOpen, Sparkles, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getUserProjects, deleteUserProject, GSlideProject } from '@/utils/userProjectStorage';
import { exportSlidesToPPTX } from '@/utils/exporter';
import { format } from 'date-fns';

interface OpenFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenProject: (project: GSlideProject) => void;
  currentUsername: string;
}

export const OpenFileModal: React.FC<OpenFileModalProps> = ({
  open,
  onOpenChange,
  onOpenProject,
  currentUsername,
}) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<GSlideProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'saved' | 'themes'>('saved');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, projectId: string | null }>({ open: false, projectId: null });
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Creative descriptions with color-coded highlights
  const headerDescription = (
    <span>
      Continue your <span className="text-blue-600 dark:text-blue-400">creative journey</span>. Pick up where you left off.
    </span>
  );

  const footerDescription = (
    <span>
      Your presentations are where <span className="text-emerald-600 dark:text-emerald-400 font-medium">ideas come to life</span>.
      Select one to begin <span className="text-amber-600 dark:text-amber-400 font-medium">crafting your next masterpiece</span>.
    </span>
  );

  const loadProjects = useCallback(() => {
    try {
      setIsLoading(true);
      const userProjects = getUserProjects(currentUsername)
        .sort((a, b) => b.lastModified - a.lastModified);
      setProjects(userProjects);
      setError(null);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUsername]);

  React.useEffect(() => {
    if (open && activeTab === 'saved') {
      loadProjects();
    }
  }, [open, activeTab, loadProjects]);

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setDeleteConfirm({ open: true, projectId });
  };

  const confirmDelete = () => {
    if (!deleteConfirm.projectId) return;

    try {
      deleteUserProject(currentUsername, deleteConfirm.projectId);
      loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project. Please try again.');
    } finally {
      setDeleteConfirm({ open: false, projectId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ open: false, projectId: null });
  };

  const handleExportPPT = async (e: React.MouseEvent, project: GSlideProject) => {
    e.stopPropagation();

    if (exportingId) return; // Prevent multiple exports at once

    setExportingId(project.id);

    try {
      // Sanitize filename by removing invalid characters
      const sanitizedName = project.name.replace(/[<>:"/\\|?*]/g, '-');
      const filename = `${sanitizedName}.pptx`;

      await exportSlidesToPPTX(project.slides, filename);

      toast({
        title: 'Export Successful!',
        description: `${project.name} has been exported to PowerPoint.`,
      });

      // Close the modal after successful export
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export presentation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExportingId(null);
    }
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
        <motion.div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 mx-4"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Presentation?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action cannot be undone. The presentation will be permanently deleted.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {open && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-6 sm:px-6 backdrop-blur-md bg-black/40"
          initial="closed"
          animate="open"
          exit="closed"
          variants={{
            open: { opacity: 1 },
            closed: { opacity: 0 }
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6 relative">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Open Presentation
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm font-normal">
                {headerDescription}
              </p>

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                title="Close modal"
                className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {/* Saved projects list (themes removed from Open modal) */}
                <>
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading projects...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center p-6">
                      <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                      <Button
                        variant="outline"
                        onClick={loadProjects}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-base font-medium">No saved projects found</p>
                      <p className="text-sm mt-1">Create a new project and save it to see it here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="
                            border border-gray-200 dark:border-gray-700
                            rounded-2xl p-4
                            bg-white/50 dark:bg-gray-800/40
                            hover:bg-gray-50/70 dark:hover:bg-gray-700/50
                            transition-all duration-200
                            cursor-pointer group
                          "
                          onClick={() => {
                            onOpenProject(project);
                            onOpenChange(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Last modified: {format(new Date(project.lastModified), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={(e) => handleExportPPT(e, project)}
                                title="Export to PowerPoint"
                                disabled={exportingId === project.id}
                              >
                                {exportingId === project.id ? (
                                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(e, project.id);
                                }}
                                title="Delete presentation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200/40">
              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6 px-4">
                {footerDescription}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
