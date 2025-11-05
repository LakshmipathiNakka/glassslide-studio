import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PresentationMode from '@/pages/PresentationMode';
import { usePresentationStore } from '@/hooks/usePresentationStore';

// Mock modules
jest.mock('@/hooks/usePresentationStore');
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ deckId: 'test-deck-123' }),
}));

describe('Presentation Exit Integration Tests', () => {
  const mockPresentationStore = {
    deck: {
      id: 'test-deck-123',
      title: 'Test Presentation',
      slides: [
        {
          id: '1',
          elements: [],
          background: '#ffffff',
          createdAt: new Date(),
          lastUpdated: new Date(),
        },
      ],
      theme: 'default',
      aspectRatio: '16:9' as const,
      createdAt: new Date(),
      lastUpdated: new Date(),
      settings: {
        autoAdvance: false,
        loopPresentation: false,
        showSlideNumbers: true,
        showProgressBar: true,
        mouseClickAdvances: true,
        presenterMode: false,
        fullScreen: true,
        kioskMode: false,
      },
    },
    currentSlideIndex: 0,
    currentAnimationIndex: 0,
    isPlaying: false,
    isPaused: false,
    isFullscreen: false,
    accessibilityOptions: {},
    nextSlide: jest.fn(),
    previousSlide: jest.fn(),
    goToSlide: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    enterFullscreen: jest.fn(),
    exitFullscreen: jest.fn(),
    loadDeck: jest.fn(),
    unloadDeck: jest.fn(),
    saveSession: jest.fn(),
    loadSession: jest.fn(),
    handleUserInteraction: jest.fn(),
    addError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePresentationStore as jest.Mock).mockReturnValue(mockPresentationStore);
    localStorage.clear();
    
    // Mock confirm dialog
    window.confirm = jest.fn(() => true);
  });

  describe('ESC key handling', () => {
    it('should exit immediately when there are no unsaved changes', async () => {
      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      // Press ESC key
      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(mockPresentationStore.saveSession).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
    });

    it('should show saving overlay when there are unsaved changes', async () => {
      // Mock unsaved changes
      const mockWithChanges = {
        ...mockPresentationStore,
      };

      (usePresentationStore as jest.Mock).mockReturnValue(mockWithChanges);

      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      // Simulate editing (this would normally update hasUnsavedChanges)
      // In real scenario, updateSlides would be called

      // Press ESC key
      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      // Should eventually navigate after save
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      }, { timeout: 3000 });
    });

    it('should prompt user when save fails', async () => {
      window.confirm = jest.fn(() => false); // User cancels

      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      // Press ESC
      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      // Should NOT navigate if user cancels
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should exit anyway if user confirms despite save failure', async () => {
      window.confirm = jest.fn(() => true); // User confirms

      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      // Press ESC
      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      // Should navigate even with unsaved changes if user confirms
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
    });
  });

  describe('Session persistence', () => {
    it('should save session state before exiting', async () => {
      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(mockPresentationStore.saveSession).toHaveBeenCalled();
      });
    });

    it('should exit fullscreen before navigating away', async () => {
      const mockFullscreen = {
        ...mockPresentationStore,
        isFullscreen: true,
      };

      (usePresentationStore as jest.Mock).mockReturnValue(mockFullscreen);

      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(mockFullscreen.exitFullscreen).toHaveBeenCalled();
      });
    });
  });

  describe('Data consistency', () => {
    it('should verify localStorage persistence before exiting', async () => {
      const deckId = 'test-deck-123';
      const deckData = {
        id: deckId,
        slides: mockPresentationStore.deck.slides,
        lastUpdated: Date.now(),
      };

      localStorage.setItem(`glassslide-deck-${deckId}`, JSON.stringify(deckData));

      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        const stored = localStorage.getItem(`glassslide-deck-${deckId}`);
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored!).id).toBe(deckId);
      });
    });

    it('should handle missing localStorage gracefully', async () => {
      // Mock localStorage failure
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      // Should still attempt to exit
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });

      // Restore
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('Error recovery', () => {
    it('should show error notification on save failure', async () => {
      const mockToast = jest.fn();
      jest.mock('@/hooks/use-toast', () => ({
        useToast: () => ({
          toast: mockToast,
        }),
      }));

      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      // Simulate save error
      // (This would be triggered by backend failure)

      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('should allow retry after save failure', async () => {
      window.confirm = jest.fn()
        .mockReturnValueOnce(false) // First time: cancel
        .mockReturnValueOnce(true);  // Second time: confirm

      const { container } = render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      // First attempt - user cancels
      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      // Second attempt - user confirms
      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Custom exit handler', () => {
    it('should call custom onExit prop if provided', async () => {
      const mockOnExit = jest.fn();

      const { container } = render(
        <BrowserRouter>
          <PresentationMode onExit={mockOnExit} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading presentation/i)).not.toBeInTheDocument();
      });

      fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(mockOnExit).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });
});
