import { useState, useCallback, useEffect } from 'react';

export interface PresentationFile {
  id: string;
  name: string;
  slides: any[];
  createdAt: Date;
  modifiedAt: Date;
  version: number;
}

export interface FileManagerState {
  currentFile: PresentationFile | null;
  recentFiles: PresentationFile[];
  isDirty: boolean;
  autoSaveEnabled: boolean;
}

export const useFileManager = () => {
  const [state, setState] = useState<FileManagerState>({
    currentFile: null,
    recentFiles: [],
    isDirty: false,
    autoSaveEnabled: true,
  });

  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load recent files from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('presentation-recent-files');
    if (saved) {
      try {
        const recentFiles = JSON.parse(saved).map((file: any) => ({
          ...file,
          createdAt: new Date(file.createdAt),
          modifiedAt: new Date(file.modifiedAt),
        }));
        setState(prev => ({ ...prev, recentFiles }));
      } catch (error) {
        console.error('Failed to load recent files:', error);
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (state.autoSaveEnabled && state.currentFile && state.isDirty) {
      const timeoutId = setTimeout(() => {
        saveFile();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [state.currentFile, state.isDirty, state.autoSaveEnabled]);

  const newFile = useCallback(() => {
    const newFile: PresentationFile = {
      id: `presentation-${Date.now()}`,
      name: 'Untitled Presentation',
      slides: [{
        id: 'slide-1',
        elements: [],
        background: '#FFFFFF',
        createdAt: new Date(),
      }],
      createdAt: new Date(),
      modifiedAt: new Date(),
      version: 1,
    };

    setState(prev => ({
      ...prev,
      currentFile: newFile,
      isDirty: false,
    }));

    setHistory([newFile]);
    setHistoryIndex(0);

    return newFile;
  }, []);

  const openFile = useCallback((file: PresentationFile) => {
    setState(prev => ({
      ...prev,
      currentFile: file,
      isDirty: false,
    }));

    setHistory([file]);
    setHistoryIndex(0);
  }, []);

  const saveFile = useCallback(() => {
    if (!state.currentFile) return;

    const updatedFile = {
      ...state.currentFile,
      modifiedAt: new Date(),
      version: state.currentFile.version + 1,
    };

    // Save to localStorage
    const savedFiles = JSON.parse(localStorage.getItem('presentation-files') || '{}');
    savedFiles[updatedFile.id] = updatedFile;
    localStorage.setItem('presentation-files', JSON.stringify(savedFiles));

    // Update recent files
    const recentFiles = [updatedFile, ...state.recentFiles.filter(f => f.id !== updatedFile.id)].slice(0, 10);
    localStorage.setItem('presentation-recent-files', JSON.stringify(recentFiles));

    setState(prev => ({
      ...prev,
      currentFile: updatedFile,
      recentFiles,
      isDirty: false,
    }));

    return updatedFile;
  }, [state.currentFile, state.recentFiles]);

  const saveAsFile = useCallback((name: string) => {
    if (!state.currentFile) return;

    const newFile: PresentationFile = {
      ...state.currentFile,
      id: `presentation-${Date.now()}`,
      name,
      createdAt: new Date(),
      modifiedAt: new Date(),
      version: 1,
    };

    const savedFiles = JSON.parse(localStorage.getItem('presentation-files') || '{}');
    savedFiles[newFile.id] = newFile;
    localStorage.setItem('presentation-files', JSON.stringify(savedFiles));

    const recentFiles = [newFile, ...state.recentFiles].slice(0, 10);
    localStorage.setItem('presentation-recent-files', JSON.stringify(recentFiles));

    setState(prev => ({
      ...prev,
      currentFile: newFile,
      recentFiles,
      isDirty: false,
    }));

    return newFile;
  }, [state.currentFile, state.recentFiles]);

  const downloadFile = useCallback((format: 'pptx' | 'json' = 'json') => {
    if (!state.currentFile) return;

    const data = JSON.stringify(state.currentFile, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentFile.name}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.currentFile]);

  const updateCurrentFile = useCallback((updates: Partial<PresentationFile>) => {
    if (!state.currentFile) return;

    const updatedFile = {
      ...state.currentFile,
      ...updates,
      modifiedAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      currentFile: updatedFile,
      isDirty: true,
    }));

    // Add to history
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(updatedFile);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [state.currentFile, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setState(prev => ({
        ...prev,
        currentFile: history[newIndex],
        isDirty: true,
      }));
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setState(prev => ({
        ...prev,
        currentFile: history[newIndex],
        isDirty: true,
      }));
    }
  }, [historyIndex, history]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    ...state,
    newFile,
    openFile,
    saveFile,
    saveAsFile,
    downloadFile,
    updateCurrentFile,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
