import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PresentationMode from '@/pages/PresentationMode';
import { usePresentationStore } from '@/hooks/usePresentationStore';
import { PresentationDeck } from '@/types/presentation';

// Mock the presentation store
jest.mock('@/hooks/usePresentationStore');

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-hotkeys-hook
jest.mock('react-hotkeys-hook', () => ({
  useHotkeys: jest.fn(),
}));

// Mock components that might not be available in test environment
jest.mock('@/components/presentation/SlideRenderer', () => {
  return function MockSlideRenderer({ slide }: any) {
    return <div data-testid="slide-renderer">Slide: {slide?.id}</div>;
  };
});

jest.mock('@/components/presentation/PresenterView', () => {
  return function MockPresenterView({ onExit }: any) {
    return (
      <div data-testid="presenter-view">
        <button onClick={onExit}>Exit Presenter View</button>
      </div>
    );
  };
});

const mockDeck: PresentationDeck = {
  id: 'test-deck-1',
  title: 'Test Presentation',
  slides: [
    {
      id: 'slide-1',
      elements: [],
      background: '#ffffff',
      createdAt: new Date(),
      animations: [],
      transition: { type: 'fade', duration: 500, easing: 'ease-in-out' },
      title: 'Slide 1',
    },
    {
      id: 'slide-2',
      elements: [],
      background: '#f0f0f0',
      createdAt: new Date(),
      animations: [],
      transition: { type: 'slide', duration: 600, easing: 'ease-in-out' },
      title: 'Slide 2',
    },
    {
      id: 'slide-3',
      elements: [],
      background: '#e0e0e0',
      createdAt: new Date(),
      animations: [],
      transition: { type: 'zoom', duration: 400, easing: 'ease-in-out' },
      title: 'Slide 3',
    },
  ],
  theme: 'default',
  aspectRatio: '16:9',
  createdAt: new Date(),
  lastUpdated: new Date(),
  settings: {
    autoAdvance: false,
    loopPresentation: false,
    showSlideNumbers: true,
    showProgressBar: true,
    mouseClickAdvances: true,
    presenterMode: false,
    fullScreen: false,
    kioskMode: false,
  },
};

const mockStoreState = {
  deck: mockDeck,
  currentSlideIndex: 0,
  currentAnimationIndex: 0,
  isPlaying: false,
  isPaused: false,
  isFullscreen: false,
  presenterMode: false,
  dualScreenMode: false,
  accessibilityOptions: {
    highContrast: false,
    reducedMotion: false,
    keyboardOnly: false,
    screenReader: false,
    fontSize: 'medium' as const,
    focusIndicator: true,
  },
  nextSlide: jest.fn(),
  previousSlide: jest.fn(),
  goToSlide: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  enterFullscreen: jest.fn(),
  exitFullscreen: jest.fn(),
  togglePresenterMode: jest.fn(),
  loadDeck: jest.fn(),
  unloadDeck: jest.fn(),
  saveSession: jest.fn(),
  loadSession: jest.fn(),
  handleUserInteraction: jest.fn(),
  addError: jest.fn(),
};

const renderPresentationMode = (props = {}) => {
  return render(
    <BrowserRouter>
      <PresentationMode embedded={true} deck={mockDeck} {...props} />
    </BrowserRouter>
  );
};

describe('PresentationMode', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup the mock store
    (usePresentationStore as jest.Mock).mockReturnValue(mockStoreState);
  });

  describe('Rendering', () => {
    it('renders the presentation interface', async () => {
      renderPresentationMode();

      await waitFor(() => {
        expect(screen.getByTestId('slide-renderer')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Presentation mode')).toBeInTheDocument();
    });

    it('displays the current slide', async () => {
      renderPresentationMode();

      await waitFor(() => {
        expect(screen.getByText('Slide: slide-1')).toBeInTheDocument();
      });
    });

    it('shows presentation controls in embedded mode', async () => {
      renderPresentationMode({ embedded: true });

      await waitFor(() => {
        expect(screen.getByText('1 / 3')).toBeInTheDocument(); // Slide counter
      });
    });

    it('shows progress bar when enabled', async () => {
      renderPresentationMode();

      const progressBar = screen.getByRole('application');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('handles next slide navigation', async () => {
      renderPresentationMode();

      const nextButton = screen.getByRole('button', { name: /skip forward/i });
      fireEvent.click(nextButton);

      expect(mockStoreState.handleUserInteraction).toHaveBeenCalledWith({
        type: 'next',
      });
    });

    it('handles previous slide navigation', async () => {
      renderPresentationMode();

      const prevButton = screen.getByRole('button', { name: /skip back/i });
      fireEvent.click(prevButton);

      expect(mockStoreState.handleUserInteraction).toHaveBeenCalledWith({
        type: 'previous',
      });
    });

    it('disables previous button on first slide', async () => {
      renderPresentationMode();

      const prevButton = screen.getByRole('button', { name: /skip back/i });
      expect(prevButton).toBeDisabled();
    });

    it('disables next button on last slide', async () => {
      (usePresentationStore as jest.Mock).mockReturnValue({
        ...mockStoreState,
        currentSlideIndex: 2, // Last slide
      });

      renderPresentationMode();

      const nextButton = screen.getByRole('button', { name: /skip forward/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Playback Controls', () => {
    it('shows play button when not playing', async () => {
      renderPresentationMode();

      const playButton = screen.getByRole('button', { name: /play/i });
      expect(playButton).toBeInTheDocument();
    });

    it('shows pause button when playing', async () => {
      (usePresentationStore as jest.Mock).mockReturnValue({
        ...mockStoreState,
        isPlaying: true,
        isPaused: false,
      });

      renderPresentationMode();

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      expect(pauseButton).toBeInTheDocument();
    });

    it('handles play/pause toggle', async () => {
      renderPresentationMode();

      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);

      expect(mockStoreState.play).toHaveBeenCalled();
    });
  });

  describe('Presenter Mode', () => {
    it('renders presenter view when in presenter mode', async () => {
      (usePresentationStore as jest.Mock).mockReturnValue({
        ...mockStoreState,
        presenterMode: true,
      });

      renderPresentationMode({ embedded: false });

      await waitFor(() => {
        expect(screen.getByTestId('presenter-view')).toBeInTheDocument();
      });
    });

    it('toggles presenter mode', async () => {
      renderPresentationMode({ embedded: false });

      const presenterButton = screen.getByRole('button', { name: /monitor/i });
      fireEvent.click(presenterButton);

      expect(mockStoreState.togglePresenterMode).toHaveBeenCalled();
    });
  });

  describe('Fullscreen', () => {
    it('handles fullscreen toggle', async () => {
      renderPresentationMode({ embedded: false });

      const fullscreenButton = screen.getByRole('button', { name: /maximize/i });
      fireEvent.click(fullscreenButton);

      expect(mockStoreState.handleUserInteraction).toHaveBeenCalledWith({
        type: 'fullscreen',
      });
    });

    it('shows minimize icon when in fullscreen', async () => {
      (usePresentationStore as jest.Mock).mockReturnValue({
        ...mockStoreState,
        isFullscreen: true,
      });

      renderPresentationMode({ embedded: false });

      const minimizeButton = screen.getByRole('button', { name: /minimize/i });
      expect(minimizeButton).toBeInTheDocument();
    });
  });

  describe('Mouse Interactions', () => {
    it('advances slide on click when mouse navigation is enabled', async () => {
      renderPresentationMode();

      const presentationArea = screen.getByLabelText('Presentation mode');
      fireEvent.click(presentationArea);

      expect(mockStoreState.handleUserInteraction).toHaveBeenCalledWith({
        type: 'next',
      });
    });

    it('does not advance slide when presenter mode is active', async () => {
      (usePresentationStore as jest.Mock).mockReturnValue({
        ...mockStoreState,
        presenterMode: true,
      });

      renderPresentationMode();

      const presentationArea = screen.getByLabelText('Presentation mode');
      fireEvent.click(presentationArea);

      expect(mockStoreState.handleUserInteraction).not.toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    it('shows error message when deck is null', () => {
      (usePresentationStore as jest.Mock).mockReturnValue({
        ...mockStoreState,
        deck: null,
      });

      renderPresentationMode();

      expect(screen.getByText('Failed to load presentation')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      // Mock the loading state by not providing a deck immediately
      render(
        <BrowserRouter>
          <PresentationMode />
        </BrowserRouter>
      );

      expect(screen.getByText('Loading presentation...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', async () => {
      renderPresentationMode();

      const presentationArea = screen.getByRole('application');
      expect(presentationArea).toHaveAttribute('aria-label', 'Presentation mode');
    });

    it('announces slide changes', async () => {
      renderPresentationMode();

      const announcement = screen.getByLabelText(/slide 1 of 3/i);
      expect(announcement).toBeInTheDocument();
    });

    it('provides keyboard navigation hints', async () => {
      renderPresentationMode();

      const presentationArea = screen.getByLabelText('Presentation mode');
      expect(presentationArea).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Session Management', () => {
    it('calls saveSession on exit', () => {
      const onExit = jest.fn();
      renderPresentationMode({ onExit });

      const exitButton = screen.getByRole('button', { name: /arrow left/i });
      fireEvent.click(exitButton);

      expect(mockStoreState.saveSession).toHaveBeenCalled();
      expect(onExit).toHaveBeenCalled();
    });

    it('loads session on mount', () => {
      renderPresentationMode();

      expect(mockStoreState.loadSession).toHaveBeenCalled();
    });
  });
});

describe('PresentationMode Integration', () => {
  it('integrates with the presentation store correctly', () => {
    renderPresentationMode();

    // Verify that the store is being used
    expect(usePresentationStore).toHaveBeenCalled();

    // Verify that required store methods are available
    const storeReturn = (usePresentationStore as jest.Mock).mock.results[0].value;
    expect(storeReturn).toHaveProperty('nextSlide');
    expect(storeReturn).toHaveProperty('previousSlide');
    expect(storeReturn).toHaveProperty('handleUserInteraction');
  });

  it('handles deck loading lifecycle', async () => {
    const loadDeck = jest.fn().mockResolvedValue(undefined);
    const unloadDeck = jest.fn();

    (usePresentationStore as jest.Mock).mockReturnValue({
      ...mockStoreState,
      loadDeck,
      unloadDeck,
    });

    const { unmount } = renderPresentationMode();

    // Verify deck loading
    await waitFor(() => {
      expect(loadDeck).toHaveBeenCalledWith(mockDeck);
    });

    // Verify cleanup on unmount
    unmount();
    expect(mockStoreState.saveSession).toHaveBeenCalled();
    expect(unloadDeck).toHaveBeenCalled();
  });
});