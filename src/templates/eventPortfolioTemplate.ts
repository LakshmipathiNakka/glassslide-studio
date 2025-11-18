import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

// Palette for Cinematic Event & Portfolio
const COLORS = {
  DEEP_BLACK: '#1B1B1B',
  PURPLE_START: '#8E2DE2',
  PURPLE_END: '#4A00E0',
  SOFT_WHITE: '#F5F5F5',
  NEON_PURPLE: '#C084FC',
  NEON_PINK: '#FF6EC7',
};

const createTextElement = (
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {},
): Element => ({
  id,
  type: 'text',
  x,
  y,
  width,
  height,
  text,
  fontSize: 18,
  fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
  fontWeight: 'normal',
  color: COLORS.SOFT_WHITE,
  textAlign: 'left',
  lineHeight: 1.4,
  zIndex: 2,
  ...styles,
});

const createShape = (
  id: string,
  shapeType: Element['shapeType'] | 'rectangle' | 'rounded-rectangle' | 'circle' | 'triangle',
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {},
): Element => ({
  id,
  type: 'shape',
  shapeType: shapeType as any,
  x,
  y,
  width,
  height,
  fill: 'transparent',
  stroke: COLORS.SOFT_WHITE,
  strokeWidth: 1,
  opacity: 1,
  zIndex: 1,
  ...styles,
});

const createImageElement = (
  id: string,
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {},
): Element => ({
  id,
  type: 'image',
  x,
  y,
  width,
  height,
  imageUrl,
  zIndex: 0,
  ...styles,
});

const createGlassPanel = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {},
): Element =>
  createShape(id, 'rounded-rectangle', x, y, width, height, {
    fill: 'rgba(255,255,255,0.16)',
    stroke: 'rgba(255,255,255,0.6)',
    strokeWidth: 1,
    backdropFilter: 'blur(30px)',
    rx: 24,
    shadow: {
      color: 'rgba(255,255,255,0.25)',
      blur: 24,
      offsetX: 0,
      offsetY: 12,
    },
    ...styles,
  });

const createEventPortfolioTemplate = (): Slide[] => {
  const createdAt = new Date();

  // Real-image backgrounds (royalty-free Unsplash; users can swap later)
  const HERO_IMG =
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80'; // concert crowd
  const PORTRAIT_IMG =
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1600&q=80'; // portrait
  const HIGHLIGHTS_IMG =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80'; // stage
  const SCHEDULE_IMG =
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80'; // audience
  const SPONSORS_IMG =
    'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1600&q=80'; // city night
  const TEAM_IMG =
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80'; // team
  const GALLERY_1 =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80';
  const GALLERY_2 =
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=80';
  const GALLERY_3 =
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80';
  const TESTIMONIAL_IMG =
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80';
  const CLOSING_IMG =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80';

  // 1. Title – Event Name
  const titleSlide: Slide = {
    id: 'event-title',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createImageElement('hero-bg', HERO_IMG, 0, 0, 960, 540, {
        opacity: 0.7,
      }),
      // Simple solid overlay (no gradient) so it renders identically in presentation mode
      createShape('gradient-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(74,0,224,0.75)',
        stroke: 'transparent',
        zIndex: 0,
      }),
      // Vertical light streak (clamped to canvas)
      createShape('light-streak', 'rectangle', 120, 0, 40, 540, {
        fill:
          'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0) 100%)',
        stroke: 'transparent',
        opacity: 0.45,
      }),
      // Glass title panel - stronger and clearly separated in presentation
      createGlassPanel('title-glass', 140, 150, 680, 220, {
        fill: 'rgba(255,255,255,0.22)',
        stroke: 'rgba(245,245,245,0.8)',
        strokeWidth: 1.5,
        zIndex: 2,
      }),
      // Chrome-like outline
      createShape('title-outline', 'rounded-rectangle', 140, 150, 680, 220, {
        fill: 'transparent',
        stroke:
          'linear-gradient(135deg, rgba(245,245,245,0.9), rgba(192,132,252,0.9))',
        strokeWidth: 2,
        rx: 26,
        opacity: 0.9,
      }),
      createTextElement('title-text', 'EVENT NAME HERE', 170, 185, 620, 80, {
        fontSize: 44,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 3,
      }),
      createTextElement(
        'subtitle-text',
        'Modern Cinematic Experience & Portfolio Showcase',
        170,
        255,
        620,
        40,
        {
          fontSize: 20,
          color: 'rgba(245,245,245,0.85)',
          textAlign: 'center',
        },
      ),
      createTextElement('meta-text', 'Location  •  Date  •  Presenter Name', 170, 300, 620, 40, {
        fontSize: 14,
        color: 'rgba(245,245,245,0.7)',
        textAlign: 'center',
      }),
    ],
  };

  // 2. About / Bio
  const aboutSlide: Slide = {
    id: 'event-about',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createImageElement('about-bg', PORTRAIT_IMG, 0, 0, 960, 540, {
        opacity: 0.85,
      }),
      createShape('about-gradient', 'rectangle', 0, 0, 960, 540, {
        fill: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.9) 100%)',
        stroke: 'transparent',
      }),
      // Right glass block
      createGlassPanel('about-glass', 520, 90, 360, 360, {}),
      // Purple glowing frame behind content
      createShape('about-glow-frame', 'rounded-rectangle', 510, 80, 380, 380, {
        fill: 'transparent',
        stroke: 'rgba(142,45,226,0.9)',
        strokeWidth: 1,
        rx: 32,
        shadow: {
          color: 'rgba(142,45,226,0.85)',
          blur: 24,
          offsetX: 0,
          offsetY: 0,
        },
      }),
      createTextElement('about-title', 'ABOUT THE EVENT', 540, 110, 320, 40, {
        fontSize: 22,
        fontWeight: '600',
        letterSpacing: 2,
      }),
      createTextElement(
        'about-body',
        'Use this space to introduce your event or portfolio. Describe the story, the vision, and what makes this experience cinematic and memorable.',
        540,
        155,
        320,
        120,
        {
          fontSize: 14,
          color: 'rgba(245,245,245,0.85)',
        },
      ),
      createTextElement(
        'about-bio',
        'Add a short bio for the host, artist, or speaker. Highlight key achievements, past events, or signature works that define your style.',
        540,
        285,
        320,
        140,
        {
          fontSize: 13,
          color: 'rgba(245,245,245,0.75)',
        },
      ),
    ],
  };

  // 3. Highlights (Image Grid)
  const highlightsSlide: Slide = {
    id: 'event-highlights',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createImageElement('highlights-bg', HIGHLIGHTS_IMG, 0, 0, 960, 540, {
        opacity: 0.5,
      }),
      createShape('highlights-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(27,27,27,0.9))',
        stroke: 'transparent',
        zIndex: 0,
      }),
      // Glass header bar
      createGlassPanel('highlights-header', 80, 60, 800, 70, {
        rx: 18,
      }),
      createTextElement('highlights-title', 'EVENT HIGHLIGHTS', 100, 72, 760, 26, {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 3,
      }),
      createTextElement(
        'highlights-subtitle',
        'Showcase your strongest scenes, shots, or portfolio moments in this cinematic grid.',
        120,
        104,
        720,
        24,
        {
          fontSize: 13,
          color: 'rgba(245,245,245,0.75)',
          textAlign: 'center',
        },
      ),
      // 3x2 grid placeholders for images
      ...[0, 1, 2].map((col) =>
        createImageElement(
          `highlight-img-top-${col}`,
          GALLERY_1,
          80 + col * 270,
          160,
          240,
          120,
          {
            borderRadius: 18,
            opacity: 0.95,
            zIndex: 1,
            shadow: {
              color: 'rgba(0,0,0,0.8)',
              blur: 24,
              offsetX: 0,
              offsetY: 16,
            },
          },
        ),
      ),
      ...[0, 1, 2].map((col) =>
        createImageElement(
          `highlight-img-bottom-${col}`,
          GALLERY_2,
          80 + col * 270,
          300,
          240,
          120,
          {
            borderRadius: 18,
            opacity: 0.95,
            zIndex: 1,
            shadow: {
              color: 'rgba(0,0,0,0.8)',
              blur: 24,
              offsetX: 0,
              offsetY: 16,
            },
          },
        ),
      ),
      // Optional captions for each highlight slot
      ...[0, 1, 2].map((col) =>
        createTextElement(
          `highlight-caption-top-${col}`,
          `Highlight 0${col + 1}`,
          80 + col * 270,
          285,
          240,
          20,
          {
            fontSize: 11,
            color: 'rgba(245,245,245,0.75)',
            textAlign: 'center',
          },
        ),
      ),
      ...[0, 1, 2].map((col) =>
        createTextElement(
          `highlight-caption-bottom-${col}`,
          `Highlight 0${col + 4}`,
          80 + col * 270,
          425,
          240,
          20,
          {
            fontSize: 11,
            color: 'rgba(245,245,245,0.75)',
            textAlign: 'center',
          },
        ),
      ),
    ],
  };

  // 4. Schedule (Table)
  const scheduleSlide: Slide = {
    id: 'event-schedule',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      // For maximum clarity, do NOT show the background image directly under the table (match Sports schedule slide)
      createShape('schedule-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: COLORS.DEEP_BLACK,
        stroke: 'transparent',
      }),
      // Solid card behind the table to isolate it visually
      createGlassPanel('schedule-glass', 80, 80, 800, 380, {
        fill: COLORS.SOFT_WHITE,
        stroke: 'rgba(0,0,0,0.08)',
      }),
      createTextElement('schedule-title', 'EVENT SCHEDULE', 100, 100, 760, 32, {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'left',
        color: COLORS.PURPLE_START,
      }),
      {
        id: 'schedule-table',
        type: 'table',
        x: 100,
        y: 150,
        width: 760,
        height: 280,
        rows: 6,
        cols: 3,
        header: true,
        headerBg: COLORS.PURPLE_START,
        headerTextColor: COLORS.SOFT_WHITE,
        // Match Sports schedule: light body with dark text
        backgroundColor: COLORS.SOFT_WHITE,
        rowAltBg: '#FFFFFF',
        borderColor: 'rgba(0,0,0,0.12)',
        borderWidth: 1,
        borderRadius: 18,
        cellPadding: 10,
        cellTextAlign: 'left',
        color: COLORS.DEEP_BLACK,
        zIndex: 2,
        tableData: [
          ['Time', 'Session', 'Speaker'],
          ['10:00', 'Opening Titles & Intro', 'Host Name'],
          ['10:30', 'Keynote / Main Act', 'Speaker / Artist'],
          ['11:15', 'Portfolio Showcase', 'You / Team'],
          ['12:00', 'Q&A + Networking', 'All'],
          ['12:30', 'Closing Moments', 'Host Name'],
        ],
      } as Element,
    ],
  };

  // 5. Sponsors (Logos Grid)
  const sponsorsSlide: Slide = {
    id: 'event-sponsors',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createImageElement('sponsors-bg', SPONSORS_IMG, 0, 0, 960, 540, {
        opacity: 0.4,
      }),
      createShape('sponsors-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.8))',
        stroke: 'transparent',
      }),
      // Title bar with cinematic glow
      createGlassPanel('sponsors-title-glass', 80, 60, 800, 70, {
        rx: 20,
      }),
      createTextElement('sponsors-title', 'SPONSORS & PARTNERS', 100, 82, 760, 30, {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 3,
      }),
      // 3x2 logo cards
      ...[0, 1, 2].flatMap((col) =>
        [0, 1].map((row) =>
          createGlassPanel(
            `sponsor-card-${col}-${row}`,
            120 + col * 260,
            170 + row * 130,
            220,
            90,
            {
              shadow: {
                color: 'rgba(142,45,226,0.5)',
                blur: 20,
                offsetX: 0,
                offsetY: 10,
              },
            },
          ),
        ),
      ),
      ...[0, 1, 2].flatMap((col) =>
        [0, 1].map((row) =>
          createTextElement(
            `sponsor-label-${col}-${row}`,
            'LOGO HERE',
            120 + col * 260,
            200 + row * 130,
            220,
            40,
            {
              fontSize: 14,
              textAlign: 'center',
              color: 'rgba(245,245,245,0.8)',
            },
          ),
        ),
      ),
    ],
  };

  // 6. Team / Crew
  const teamSlide: Slide = {
    id: 'event-team',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createImageElement('team-bg', TEAM_IMG, 0, 0, 960, 540, {
        opacity: 0.4,
      }),
      createShape('team-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(27,27,27,0.95))',
        stroke: 'transparent',
      }),
      createTextElement('team-title', 'TEAM & CREW', 80, 60, 800, 40, {
        fontSize: 24,
        fontWeight: '600',
      }),
      // 3x2 grid of portraits in glass cards
      ...[0, 1, 2].flatMap((col) =>
        [0, 1].map((row) => {
          const baseX = 80 + col * 280;
          const baseY = 130 + row * 180;
          return [
            createGlassPanel(
              `team-card-${col}-${row}`,
              baseX,
              baseY,
              240,
              150,
              {},
            ),
            createImageElement(
              `team-img-${col}-${row}`,
              PORTRAIT_IMG,
              baseX + 10,
              baseY + 10,
              70,
              70,
              {
                borderRadius: 999,
                opacity: 0.95,
              },
            ),
            createTextElement(
              `team-name-${col}-${row}`,
              'Name Here',
              baseX + 90,
              baseY + 18,
              140,
              26,
              {
                fontSize: 14,
                fontWeight: '600',
              },
            ),
            createTextElement(
              `team-role-${col}-${row}`,
              'Role / Title',
              baseX + 90,
              baseY + 44,
              140,
              22,
              {
                fontSize: 12,
                color: 'rgba(245,245,245,0.75)',
              },
            ),
          ] as Element[];
        }),
      ).flat(),
    ],
  };

  // 7. Awards or Stats
  const statsSlide: Slide = {
    id: 'event-stats',
    // Deep black base so we can fake a "radial" purple glow consistently in both canvas and presentation
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      // Solid dark base layer (no gradient strings)
      createShape('stats-bg', 'rectangle', 0, 0, 960, 540, {
        fill: COLORS.DEEP_BLACK,
        stroke: 'transparent',
      }),
      // Purple glow at the top using a large semi-transparent circle so both renderers draw it identically
      createShape('stats-glow', 'circle', 200, -200, 560, 560, {
        fill: 'rgba(142,45,226,0.8)',
        stroke: 'transparent',
      }),
      createTextElement('stats-title', 'AWARDS & NUMBERS', 80, 60, 800, 40, {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
      }),
      // 3 stats in glass circles
      ...[0, 1, 2].map((index) => {
        const centerX = 160 + index * 260;
        return createShape(
          `stat-circle-${index}`,
          'circle',
          centerX,
          170,
          160,
          160,
          {
            fill: 'rgba(0,0,0,0.4)',
            stroke: 'rgba(192,132,252,0.9)',
            strokeWidth: 2,
            shadow: {
              color: 'rgba(192,132,252,0.8)',
              blur: 24,
              offsetX: 0,
              offsetY: 8,
            },
          },
        );
      }),
      createTextElement('stat-1-number', '12', 190, 210, 100, 40, {
        fontSize: 36,
        fontWeight: '600',
        textAlign: 'center',
      }),
      createTextElement('stat-1-label', 'Major Awards', 190, 250, 100, 40, {
        fontSize: 14,
        textAlign: 'center',
        color: 'rgba(245,245,245,0.75)',
      }),
      createTextElement('stat-2-number', '2M', 450, 210, 100, 40, {
        fontSize: 36,
        fontWeight: '600',
        textAlign: 'center',
      }),
      createTextElement('stat-2-label', 'Attendees / Views', 430, 250, 140, 40, {
        fontSize: 14,
        textAlign: 'center',
        color: 'rgba(245,245,245,0.75)',
      }),
      createTextElement('stat-3-number', '50+', 710, 210, 100, 40, {
        fontSize: 36,
        fontWeight: '600',
        textAlign: 'center',
      }),
      createTextElement('stat-3-label', 'Projects / Events', 700, 250, 120, 40, {
        fontSize: 14,
        textAlign: 'center',
        color: 'rgba(245,245,245,0.75)',
      }),
    ],
  };

  // 8. Gallery / Moments
  const gallerySlide: Slide = {
    id: 'event-gallery',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createImageElement('gallery-bg', GALLERY_3, 0, 0, 960, 540, {
        opacity: 0.45,
      }),
      createShape('gallery-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.7))',
        stroke: 'transparent',
        zIndex: 0,
      }),
      createTextElement('gallery-title', 'GALLERY / MOMENTS', 80, 60, 800, 30, {
        fontSize: 22,
        fontWeight: '600',
      }),
      createTextElement(
        'gallery-subtitle',
        'Capture live, behind-the-scenes, and signature shots that define the experience.',
        80,
        92,
        800,
        24,
        {
          fontSize: 13,
          color: 'rgba(245,245,245,0.75)',
        },
      ),
      // Collage images
      createImageElement('gallery-main', GALLERY_1, 80, 120, 420, 260, {
        borderRadius: 22,
        opacity: 0.95,
        zIndex: 1,
      }),
      createImageElement('gallery-side-1', GALLERY_2, 520, 120, 320, 120, {
        borderRadius: 18,
        opacity: 0.95,
        zIndex: 1,
      }),
      createImageElement('gallery-side-2', GALLERY_3, 520, 260, 320, 120, {
        borderRadius: 18,
        opacity: 0.95,
        zIndex: 1,
      }),
      // Diagonal glossy streaks
      createShape('streak-1', 'rectangle', 40, 80, 280, 4, {
        fill:
          'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))',
        stroke: 'transparent',
        opacity: 0.5,
      }),
      createGlassPanel('gallery-tag', 80, 410, 160, 40, {
        rx: 20,
      }),
      createTextElement('gallery-tag-text', 'MOMENTS', 80, 417, 160, 26, {
        fontSize: 14,
        textAlign: 'center',
        letterSpacing: 3,
      }),
    ],
  };

  // 9. Testimonials
  const testimonialsSlide: Slide = {
    id: 'event-testimonials',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createImageElement('testimonials-bg', TESTIMONIAL_IMG, 0, 0, 960, 540, {
        opacity: 0.4,
      }),
      createShape('testimonials-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(27,27,27,0.95))',
        stroke: 'transparent',
      }),
      createTextElement('testimonials-title', 'WHAT PEOPLE SAY', 80, 60, 800, 40, {
        fontSize: 24,
        fontWeight: '600',
      }),
      // Three testimonial glass cards
      ...[0, 1, 2].map((index) => {
        const x = 80 + index * 290;
        return createGlassPanel(`test-card-${index}`, x, 130, 260, 260, {
          rx: 20,
        });
      }),
      ...[0, 1, 2].map((index) =>
        createTextElement(
          `test-quote-${index}`,
          '“Beautiful visuals, seamless flow, and truly cinematic.”',
          100 + index * 290,
          150,
          220,
          120,
          {
            fontSize: 13,
            color: 'rgba(245,245,245,0.9)',
          },
        ),
      ),
      ...[0, 1, 2].map((index) =>
        createTextElement(
          `test-name-${index}`,
          'Name / Company',
          100 + index * 290,
          280,
          220,
          26,
          {
            fontSize: 12,
            fontWeight: '600',
            color: 'rgba(245,245,245,0.9)',
          },
        ),
      ),
    ],
  };

  // 10. Closing
  const closingSlide: Slide = {
    id: 'event-closing',
    background: COLORS.DEEP_BLACK,
    createdAt,
    elements: [
      createImageElement('closing-bg', CLOSING_IMG, 0, 0, 960, 540, {
        opacity: 0.6,
      }),
      createShape('closing-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.95))',
        stroke: 'transparent',
      }),
      createTextElement('closing-title', 'THANK YOU FOR JOINING US', 80, 150, 800, 50, {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 4,
      }),
      // Frosted-glass ribbon panel
      createGlassPanel('closing-ribbon', 200, 220, 560, 70, {
        rx: 999,
      }),
      createTextElement(
        'closing-subtitle',
        'Follow for more events, projects, and behind-the-scenes.',
        220,
        238,
        520,
        34,
        {
          fontSize: 14,
          textAlign: 'center',
          color: 'rgba(245,245,245,0.85)',
        },
      ),
      // QR code placeholder
      createShape('qr-frame', 'rounded-rectangle', 80, 320, 120, 120, {
        fill: 'rgba(0,0,0,0.4)',
        stroke: 'rgba(142,45,226,0.9)',
        strokeWidth: 2,
        rx: 24,
        shadow: {
          color: 'rgba(142,45,226,0.9)',
          blur: 20,
          offsetX: 0,
          offsetY: 0,
        },
      }),
      createTextElement('qr-note', 'Insert QR code', 80, 448, 120, 24, {
        fontSize: 11,
        textAlign: 'center',
        color: 'rgba(245,245,245,0.7)',
      }),
      createTextElement('closing-meta', 'Website  •  @handle  •  contact@email', 240, 330, 640, 24, {
        fontSize: 13,
        textAlign: 'left',
      }),
    ],
  };

  return [
    titleSlide,
    aboutSlide,
    highlightsSlide,
    scheduleSlide,
    sponsorsSlide,
    teamSlide,
    statsSlide,
    gallerySlide,
    testimonialsSlide,
    closingSlide,
  ];
};

export default createEventPortfolioTemplate;
