import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

// Palette for Cinematic Film Production
const COLORS = {
  CINEMATIC_BLACK: '#0D0D0D',
  CINEMATIC_GOLD: '#D4AF37',
  DEEP_CRIMSON: '#7B0000',
  SOFT_SILVER: '#E5E5E5',
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
  color: COLORS.SOFT_SILVER,
  textAlign: 'left',
  lineHeight: 1.4,
  zIndex: 2,
  ...styles,
});

const createShape = (
  id: string,
  shapeType: Element['shapeType'] | 'rectangle' | 'rounded-rectangle' | 'circle' | 'triangle' | 'line',
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
  stroke: COLORS.SOFT_SILVER,
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
    fill: 'rgba(13,13,13,0.45)',
    stroke: 'rgba(212,175,55,0.9)',
    strokeWidth: 1,
    backdropFilter: 'blur(30px)',
    rx: 24,
    shadow: {
      color: 'rgba(212,175,55,0.55)',
      blur: 26,
      offsetX: 0,
      offsetY: 12,
    },
    ...styles,
  });

const createChart = (
  id: string,
  chartType: 'bar' | 'line' | 'pie',
  x: number,
  y: number,
  width: number,
  height: number,
  chartData: any,
  options: any = {},
): Element => ({
  id,
  type: 'chart',
  chartType,
  x,
  y,
  width,
  height,
  chartData,
  ...(options ? { options } : {}),
  zIndex: 2,
});

const createFilmProductionTemplate = (): Slide[] => {
  const createdAt = new Date();

  // Real film-related Unsplash images (user can replace later)
  const SET_IMG =
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80'; // film set
  const CREW_IMG =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80'; // crew / equipment
  const CAMERA_IMG =
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80';
  const SCRIPT_IMG =
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80'; // script pages
  const BTS_1 =
    'https://images.unsplash.com/photo-1518895949257-7621c3c786d4?auto=format&fit=crop&w=1600&q=80'; // BTS
  const BTS_2 =
    'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=1600&q=80';
  const BTS_3 =
    'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=80';
  const CAST_IMG =
    'https://images.unsplash.com/photo-1521383899078-7e84d90a2372?auto=format&fit=crop&w=1600&q=80';
  const AWARDS_IMG =
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80';
  const CLOSING_IMG =
    'https://images.unsplash.com/photo-1518895949257-7621c3c786d4?auto=format&fit=crop&w=1600&q=80';

  // 1. Opening Title – Film / Production Name
  const openingSlide: Slide = {
    id: 'film-opening-title',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      createImageElement('opening-bg', SET_IMG, 0, 0, 960, 540, {
        opacity: 0.6,
      }),
      // Solid cinematic overlay (no gradient string) so canvas & presentation match
      createShape('opening-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(13,13,13,0.92)',
        stroke: 'transparent',
        zIndex: 0,
      }),
      // Lower subtle film grain bar
      createShape('grain-bar', 'rectangle', 0, 440, 960, 100, {
        fill: 'rgba(0,0,0,0.65)',
        stroke: 'transparent',
      }),
      // Title glass block
      createGlassPanel('opening-title-glass', 120, 150, 720, 210, {}),
      // Golden headline
      createTextElement('opening-title', 'FILM / PRODUCTION TITLE', 150, 180, 660, 70, {
        fontSize: 40,
        fontWeight: '600',
        textAlign: 'center',
        color: COLORS.CINEMATIC_GOLD,
        letterSpacing: 3,
      }),
      createTextElement(
        'opening-subtitle',
        'A cinematic presentation for film production, pitch decks, and studio showcases.',
        170,
        240,
        620,
        50,
        {
          fontSize: 16,
          textAlign: 'center',
          color: 'rgba(229,229,229,0.9)',
        },
      ),
      // Lower third strip with director / production info
      createShape('lower-third', 'rectangle', 70, 460, 820, 40, {
        fill: 'rgba(13,13,13,0.85)',
        stroke: 'rgba(212,175,55,0.7)',
        strokeWidth: 1,
      }),
      createTextElement('lower-third-text', 'Directed by: Name Here   •   Produced by: Studio Name', 90, 467, 780, 26, {
        fontSize: 13,
        textAlign: 'center',
        color: COLORS.SOFT_SILVER,
      }),
    ],
  };

  // 2. About the Production House / Studio Bio
  const studioBioSlide: Slide = {
    id: 'film-studio-bio',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      createImageElement('studio-bg', CREW_IMG, 0, 0, 960, 540, {
        opacity: 0.65,
      }),
      createShape('studio-gradient', 'rectangle', 0, 0, 960, 540, {
        fill:
          'linear-gradient(90deg, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.4) 40%, rgba(13,13,13,0.95) 100%)',
        stroke: 'transparent',
      }),
      // Right aligned bio panel
      createGlassPanel('studio-bio-glass', 520, 90, 360, 360, {}),
      // Golden vertical accent bar
      createShape('studio-accent-bar', 'rectangle', 510, 90, 4, 360, {
        fill: COLORS.CINEMATIC_GOLD,
        stroke: 'transparent',
      }),
      createTextElement('studio-title', 'ABOUT THE PRODUCTION HOUSE', 540, 110, 320, 40, {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.CINEMATIC_GOLD,
        letterSpacing: 2,
      }),
      createTextElement(
        'studio-body-1',
        'Introduce your studio or production company. Highlight your cinematic vision, storytelling philosophy, and signature style.',
        540,
        155,
        320,
        90,
        {
          fontSize: 13,
          color: 'rgba(229,229,229,0.96)',
        },
      ),
      createTextElement(
        'studio-body-2',
        'Mention key genres, notable collaborations, and your production capabilities — from development and casting to post-production and distribution.',
        540,
        250,
        320,
        120,
        {
          fontSize: 13,
          color: 'rgba(229,229,229,0.85)',
        },
      ),
    ],
  };

  // 3. Creative Breakdown – Creative Text Layout
  const highlightsSlide: Slide = {
    id: 'film-highlights',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      // Solid cinematic background so text layouts read cleanly in thumbnails
      createShape('highlights-bg', 'rectangle', 0, 0, 960, 540, {
        fill: COLORS.CINEMATIC_BLACK,
        stroke: 'transparent',
      }),
      // Title with top margin
      createTextElement('highlights-title', 'CREATIVE BREAKDOWN', 80, 50, 800, 32, {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.CINEMATIC_GOLD,
        textAlign: 'left',
      }),
      // Left glass panel – Visual Pillars, inset from edges for margin
      createGlassPanel('highlights-left', 70, 110, 370, 340, {}),
      createTextElement('highlights-left-title', 'VISUAL PILLARS', 90, 130, 330, 24, {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.CINEMATIC_GOLD,
      }),
      createTextElement(
        'highlights-left-body',
        '• Gold accents for premium tone\n• Deep blacks with controlled contrast\n• Lens flares and anamorphic streaks\n• Layered glass panels for depth',
        90,
        160,
        330,
        120,
        {
          fontSize: 12,
        },
      ),
      // Right glass panel – Story & Tone, inset from right edge for margin
      createGlassPanel('highlights-right', 510, 110, 370, 160, {}),
      createTextElement('highlights-right-title', 'STORY & TONE', 530, 130, 330, 24, {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.CINEMATIC_GOLD,
      }),
      createTextElement(
        'highlights-right-body',
        'Grounded, character-driven drama with cinematic scale. Balancing intimate close-ups with wide establishing frames.',
        530,
        160,
        330,
        80,
        {
          fontSize: 12,
        },
      ),
      // Bottom glass strip – Audience Experience, also inset
      createGlassPanel('highlights-bottom', 510, 290, 370, 160, {}),
      createTextElement('highlights-bottom-title', 'AUDIENCE EXPERIENCE', 530, 300, 330, 24, {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.CINEMATIC_GOLD,
      }),
      createTextElement(
        'highlights-bottom-body',
        'Immersive, big-screen visuals that still work on streaming. Designed for strong trailer moments and festival screenings.',
        530,
        330,
        330,
        80,
        {
          fontSize: 12,
        },
      ),
    ],
  };

  // 4. Production Schedule (Table)
  const scheduleSlide: Slide = {
    id: 'film-schedule',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      // Solid dark backdrop so table is consistent in canvas, thumbnail, and presentation
      createShape('schedule-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: COLORS.CINEMATIC_BLACK,
        stroke: 'transparent',
      }),
      // Light card behind the table (like Sports schedule) for maximum contrast
      createGlassPanel('schedule-glass', 80, 80, 800, 380, {
        fill: COLORS.SOFT_SILVER,
        stroke: 'rgba(0,0,0,0.08)',
      }),
      createTextElement('schedule-title', 'PRODUCTION SCHEDULE', 100, 100, 760, 32, {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'left',
        color: COLORS.CINEMATIC_GOLD,
      }),
      // Replace table with a bar chart showing 3 datasets: Planned, Actual, Remaining days per phase
      createChart(
        'schedule-chart',
        'bar',
        100,
        150,
        760,
        260,
        {
          labels: [
            'Pre-prod',
            'Script',
            'Casting',
            'Shoot',
            'Editing',
            'Post FX',
            'Sound',
          ],
          datasets: [
            {
              label: 'Planned Days',
              data: [30, 20, 15, 45, 40, 30, 20],
              backgroundColor: 'rgba(212,175,55,0.85)',
              borderColor: 'rgba(0,0,0,0.4)',
              borderWidth: 1,
            },
            {
              label: 'Actual Days',
              data: [32, 22, 18, 50, 42, 35, 22],
              backgroundColor: 'rgba(123,0,0,0.85)',
              borderColor: 'rgba(0,0,0,0.4)',
              borderWidth: 1,
            },
            {
              label: 'Remaining Days',
              data: [0, 0, 0, 5, 8, 10, 5],
              backgroundColor: 'rgba(229,229,229,0.9)',
              borderColor: 'rgba(0,0,0,0.4)',
              borderWidth: 1,
            },
          ],
        },
        {
          scales: {
            x: {
              ticks: { color: '#333333' },
              grid: { display: false },
            },
            y: {
              ticks: { color: '#333333' },
              grid: { color: 'rgba(148,163,184,0.35)' },
            },
          },
          plugins: {
            legend: {
              labels: { color: '#333333' },
            },
          },
        },
      ),
    ],
  };

  // 5. Cast & Crew Credits
  const castCrewSlide: Slide = {
    id: 'film-cast-crew',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      createTextElement('cast-title', 'CAST & CREW', 80, 60, 800, 40, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.CINEMATIC_GOLD,
      }),
      // 3x2 grid of credits
      ...[0, 1, 2].flatMap((col) =>
        [0, 1].map((row) => {
          const baseX = 80 + col * 280;
          const baseY = 130 + row * 180;
          return [
            createGlassPanel(
              `cast-card-${col}-${row}`,
              baseX,
              baseY,
              240,
              150,
              {},
            ),
            createImageElement(
              `cast-img-${col}-${row}`,
              BTS_3,
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
              `cast-name-${col}-${row}`,
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
              `cast-role-${col}-${row}`,
              'Role / Credit',
              baseX + 90,
              baseY + 44,
              140,
              22,
              {
                fontSize: 12,
                color: 'rgba(229,229,229,0.8)',
              },
            ),
          ] as Element[];
        }),
      ).flat(),
    ],
  };

  // 6. Awards & Achievements
  const awardsSlide: Slide = {
    id: 'film-awards',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      createImageElement('awards-bg', AWARDS_IMG, 0, 0, 960, 540, {
        opacity: 0.4,
      }),
      // Solid cinematic overlay (no gradient string) so canvas & presentation match
      createShape('awards-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(13,13,13,0.98)',
        stroke: 'transparent',
      }),
      createTextElement('awards-title', 'AWARDS & ACHIEVEMENTS', 80, 60, 800, 40, {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        color: COLORS.CINEMATIC_GOLD,
      }),
      // 3 circular stat cards
      ...[0, 1, 2].map((index) => {
        const centerX = 140 + index * 260;
        return createShape(
          `awards-circle-${index}`,
          'circle',
          centerX,
          180,
          180,
          180,
          {
            fill: 'rgba(13,13,13,0.7)',
            stroke: 'rgba(212,175,55,0.9)',
            strokeWidth: 2,
            shadow: {
              color: 'rgba(212,175,55,0.8)',
              blur: 22,
              offsetX: 0,
              offsetY: 8,
            },
          },
        );
      }),
      // Gold halo rings behind
      ...[0, 1, 2].map((index) => {
        const centerX = 130 + index * 260;
        return createShape(
          `awards-halo-${index}`,
          'circle',
          centerX,
          170,
          200,
          200,
          {
            fill: 'transparent',
            stroke: 'rgba(212,175,55,0.4)',
            strokeWidth: 3,
          },
        );
      }),
      createTextElement('awards-num-1', '12', 180, 220, 100, 40, {
        fontSize: 32,
        fontWeight: '600',
        textAlign: 'center',
        color: COLORS.CINEMATIC_GOLD,
      }),
      createTextElement('awards-label-1', 'International Selections', 160, 260, 140, 40, {
        fontSize: 13,
        textAlign: 'center',
      }),
      createTextElement('awards-num-2', '4', 440, 220, 100, 40, {
        fontSize: 32,
        fontWeight: '600',
        textAlign: 'center',
        color: COLORS.CINEMATIC_GOLD,
      }),
      createTextElement('awards-label-2', 'Festival Awards', 420, 260, 140, 40, {
        fontSize: 13,
        textAlign: 'center',
      }),
      createTextElement('awards-num-3', '96%', 700, 220, 100, 40, {
        fontSize: 32,
        fontWeight: '600',
        textAlign: 'center',
        color: COLORS.CINEMATIC_GOLD,
      }),
      createTextElement('awards-label-3', 'Audience Score', 680, 260, 140, 40, {
        fontSize: 13,
        textAlign: 'center',
      }),
    ],
  };

  // 7. Storyboard / Scene Breakdown
  const storyboardSlide: Slide = {
    id: 'film-storyboard',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      createImageElement('story-bg', SCRIPT_IMG, 0, 0, 960, 540, {
        opacity: 0.5,
      }),
      createShape('story-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'linear-gradient(135deg, rgba(13,13,13,0.96), rgba(13,13,13,0.9))',
        stroke: 'transparent',
      }),
      createTextElement('story-title', 'STORYBOARD / SCENE BREAKDOWN', 80, 60, 800, 40, {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.CINEMATIC_GOLD,
      }),
      // Scene cards (3-4 boxes)
      ...[0, 1, 2].map((index) => {
        const baseY = 130 + index * 110;
        return createGlassPanel(
          `scene-card-${index}`,
          100,
          baseY,
          760,
          90,
          {},
        );
      }),
      // Scene text
      createTextElement('scene-1-title', 'Scene 01 – Opening Establishing Shot', 120, 140, 400, 24, {
        fontSize: 14,
        fontWeight: '600',
      }),
      createTextElement(
        'scene-1-body',
        'City skyline at dusk with slow push-in. Timecode: 00:00–00:20.',
        120,
        165,
        600,
        30,
        {
          fontSize: 12,
        },
      ),
      createTextElement('scene-2-title', 'Scene 02 – Character Introduction', 120, 250, 400, 24, {
        fontSize: 14,
        fontWeight: '600',
      }),
      createTextElement(
        'scene-2-body',
        'Lead character enters frame on steady dolly. Timecode: 00:20–01:00.',
        120,
        275,
        600,
        30,
        {
          fontSize: 12,
        },
      ),
      createTextElement('scene-3-title', 'Scene 03 – Key Dialogue Sequence', 120, 360, 400, 24, {
        fontSize: 14,
        fontWeight: '600',
      }),
      createTextElement(
        'scene-3-body',
        'Two-shot with over-the-shoulder reverses. Timecode: 01:00–02:10.',
        120,
        385,
        600,
        30,
        {
          fontSize: 12,
        },
      ),
      // Thin gold connecting lines
      // (Connectors removed to keep thumbnail cleaner)
    ],
  };

  // 8. Gallery – Behind The Scenes
  const btsSlide: Slide = {
    id: 'film-bts-gallery',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      // Solid background only – removed full-screen background image for better compatibility
      createTextElement('bts-title', 'BEHIND THE SCENES', 80, 60, 800, 40, {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.CINEMATIC_GOLD,
      }),
      // Carousel-like layered photos
      createImageElement('bts-main', BTS_2, 160, 140, 420, 260, {
        borderRadius: 18,
        opacity: 0.98,
        zIndex: 1,
        shadow: {
          color: 'rgba(0,0,0,0.85)',
          blur: 26,
          offsetX: 0,
          offsetY: 18,
        },
      } as any),
      createImageElement('bts-side-left', BTS_3, 60, 190, 320, 200, {
        borderRadius: 18,
        opacity: 0.8,
        zIndex: 1,
      }),
      createImageElement('bts-side-right', SET_IMG, 420, 190, 320, 200, {
        borderRadius: 18,
        opacity: 0.8,
        zIndex: 1,
      }),
      // Tag text floating directly on image (no glass background shape)
      createTextElement('bts-tag-text', 'Behind the Scenes', 80, 437, 200, 26, {
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 2,
      }),
    ],
  };

  // 9. Testimonials / Critic Quotes
  const testimonialsSlide: Slide = {
    id: 'film-testimonials',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      // Solid background; structured layout with contained cards (not full-screen background shapes)
      createTextElement('test-title', 'CRITIC QUOTES & TESTIMONIALS', 80, 50, 800, 40, {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.CINEMATIC_GOLD,
        textAlign: 'center',
      }),
      // Three testimonial cards with rounded rectangles
      ...[0, 1, 2].flatMap((index) => {
        const x = 80 + index * 290;
        return [
          createShape(
            `test-card-${index}`,
            'rounded-rectangle',
            x,
            120,
            260,
            220,
            {
              fill: 'rgba(13,13,13,0.85)',
              stroke: 'rgba(212,175,55,0.8)',
              strokeWidth: 1,
              rx: 20,
              zIndex: 1,
              shadow: {
                color: 'rgba(0,0,0,0.6)',
                blur: 18,
                offsetX: 0,
                offsetY: 8,
              },
            },
          ),
          createTextElement(
            `test-quote-${index}`,
            '“A rich, cinematic experience with powerful visual storytelling.”',
            x + 20,
            140,
            220,
            100,
            {
              fontSize: 13,
              color: 'rgba(229,229,229,0.96)',
              textAlign: 'left',
              zIndex: 2,
            },
          ),
          createTextElement(
            `test-name-${index}`,
            'Critic Name, Publication',
            x + 20,
            230,
            220,
            26,
            {
              fontSize: 12,
              fontStyle: 'italic',
              color: 'rgba(229,229,229,0.85)',
              textAlign: 'left',
              zIndex: 2,
            },
          ),
        ];
      }),
    ],
  };

  // 10. Closing – Thank You / Contact
  const closingSlide: Slide = {
    id: 'film-closing',
    background: COLORS.CINEMATIC_BLACK,
    createdAt,
    elements: [
      // Solid background only – removed full-screen background image and glass background shapes
      createTextElement('closing-title', 'THANK YOU FOR WATCHING', 170, 180, 620, 50, {
        fontSize: 26,
        fontWeight: '600',
        textAlign: 'center',
        color: COLORS.CINEMATIC_GOLD,
        letterSpacing: 3,
      }),
      createTextElement(
        'closing-subtitle',
        'For screeners, press kits, and collaboration inquiries, contact:',
        180,
        230,
        600,
        30,
        {
          fontSize: 14,
          textAlign: 'center',
          color: 'rgba(229,229,229,0.9)',
        },
      ),
      // QR code frame
      createShape('closing-qr', 'rounded-rectangle', 160, 320, 110, 110, {
        fill: 'rgba(13,13,13,0.7)',
        stroke: 'rgba(212,175,55,0.9)',
        strokeWidth: 2,
        rx: 22,
      }),
      createTextElement('closing-qr-text', 'QR CODE', 160, 360, 110, 30, {
        fontSize: 11,
        textAlign: 'center',
      }),
      // Contact lines
      createTextElement('closing-email', 'Email: contact@studio.com', 290, 320, 480, 24, {
        fontSize: 13,
      }),
      createTextElement('closing-web', 'Website: www.studiofilm.com', 290, 345, 480, 24, {
        fontSize: 13,
      }),
      createTextElement('closing-social', 'Social: @studiofilm  •  @directorhandle', 290, 370, 480, 24, {
        fontSize: 13,
      }),
    ],
  };

  return [
    openingSlide,
    studioBioSlide,
    highlightsSlide,
    scheduleSlide,
    castCrewSlide,
    awardsSlide,
    storyboardSlide,
    btsSlide,
    testimonialsSlide,
    closingSlide,
  ];
};

export default createFilmProductionTemplate;
