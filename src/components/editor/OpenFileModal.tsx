import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Trash2, FileText, RefreshCw, FolderOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserProjects, deleteUserProject, GSlideProject } from '@/utils/userProjectStorage';
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
  const [projects, setProjects] = useState<GSlideProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'saved' | 'themes'>('saved');

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
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        deleteUserProject(currentUsername, projectId);
        loadProjects();
      } catch (err) {
        console.error('Failed to delete project:', err);
        setError('Failed to delete project. Please try again.');
      }
    }
  };


  if (!open) return null;

  return createPortal(
    <AnimatePresence>
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                Open Project
              </h2>

              <div className="flex items-center gap-2">
                {/* Refresh */}
                <button
                  onClick={loadProjects}
                  disabled={isLoading}
                  title="Refresh projects"
                  className="keynote-icon-btn hover:rotate-180"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                {/* Close */}
                <button 
                  onClick={() => onOpenChange(false)} 
                  title="Close modal" 
                  className="keynote-icon-btn"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-gray-100/60 dark:bg-gray-700/40 rounded-xl p-1">
                <button
                  className={`keynote-tab ${activeTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('saved')}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </button>
              </div>
            </div>

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
                            <button
                              className="keynote-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(e, project.id);
                              }}
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
