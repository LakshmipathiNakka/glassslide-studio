import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

// Palette for Sports & Fitness
const COLORS = {
  RED: '#FF3B30',
  BLACK: '#1C1C1E',
  ORANGE: '#FF9500',
  GRAY: '#F2F2F7',
  WHITE: '#FFFFFF',
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
  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
  fontWeight: 'bold',
  color: COLORS.WHITE,
  textAlign: 'left',
  lineHeight: 1.3,
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
  stroke: COLORS.RED,
  strokeWidth: 1,
  opacity: 1,
  zIndex: 1,
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
  zIndex: 1,
  ...styles,
});

const createSportsFitnessTemplate = (): Slide[] => {
  const createdAt = new Date();

  // Note: Using royalty-free Unsplash images (can be replaced by user later).
  const HERO_IMG = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80'; // runners
  // Close-up sports performance tracking (watch + track) to match Player Performance Snapshot
  const STATS_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80';
  // Gallery: real in-game / training sports shots (Game Moments)
const GALLERY_1 = 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&w=1600&q=80'; // soccer tackle
  const GALLERY_2 = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=80'; // basketball dunk
  const GALLERY_3 = 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=1600&q=80'; // gym training
  const GALLERY_4 = 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80'; // stadium crowd / celebration
  const ROSTER_IMG = 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1600&q=80';
  // Fitness strategy image – validated gym/strength training shot
  const STRATEGY_BG = 'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=1600&q=80';
  // Training partners/tools image – validated outdoor running shot
  const SPONSOR_BG = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80';
  const FINAL_IMG = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80';

  // 1. Action Cover
  const coverSlide: Slide = {
    id: 'sports-cover',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      // Motion-blur style background via dark overlay image
      createImageElement('hero-bg', HERO_IMG, -40, -40, 1040, 620, {
        opacity: 0.45,
      }),
      createShape('hero-gradient', 'rectangle', 0, 0, 960, 540, {
        fill: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.9) 100%)',
        stroke: 'transparent',
      }),
      // Hero image with depth
      createImageElement('hero-foreground', HERO_IMG, 520, 90, 360, 260, {
        borderRadius: 24,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowBlur: 36,
        shadowOffsetX: 0,
        shadowOffsetY: 20,
      } as any),
      // Title block
      createTextElement('title', 'SPORTS & FITNESS PERFORMANCE', 80, 160, 420, 96, {
        fontSize: 40,
        fontWeight: '900',
        color: COLORS.WHITE,
      }),
      createShape('title-stroke', 'rectangle', 80, 250, 220, 6, {
        fill: COLORS.RED,
        stroke: 'transparent',
      }),
      createTextElement('subtitle', 'Elite training, data-driven coaching, and high-performance analytics.', 80, 270, 420, 80, {
        fontSize: 18,
        fontWeight: '500',
        color: '#E5E5EA',
      }),
      createTextElement('presenter', 'Coach Name  •  Performance Director', 80, 360, 420, 40, {
        fontSize: 14,
        fontWeight: '500',
        color: '#AEAEB2',
      }),
    ],
  };

  // 2. Player Stats
  const statsSlide: Slide = {
    id: 'sports-stats',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Player Performance Snapshot', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '900',
      }),
      createImageElement('stats-img', STATS_IMG, 60, 130, 320, 220, {
        borderRadius: 20,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.75)',
        shadowBlur: 28,
        shadowOffsetX: 0,
        shadowOffsetY: 18,
      } as any),
      // Radial-style chart using supported pie type
      createChart(
        'player-index-pie',
        'pie',
        420,
        120,
        430,
        260,
        {
          labels: ['Speed', 'Accuracy', 'Reaction', 'Stamina', 'Power'],
          datasets: [
            {
              label: 'Player Index',
              data: [9.2, 8.5, 9.0, 8.8, 8.1],
              backgroundColor: [
                COLORS.RED,
                COLORS.ORANGE,
                '#34C759',
                '#0A84FF',
                '#FFD60A',
              ],
              borderColor: 'transparent',
              borderWidth: 0,
            },
          ],
        },
      ),
      // Highlight numbers
      createTextElement('goals-label', 'GOALS', 80, 380, 120, 24, {
        fontSize: 12,
        fontWeight: '600',
        color: '#AEAEB2',
      }),
      createTextElement('goals-value', '34', 80, 400, 120, 40, {
        fontSize: 32,
        color: COLORS.ORANGE,
      }),
      createTextElement('speed-label', 'SPEED INDEX', 220, 380, 160, 24, {
        fontSize: 12,
        color: '#AEAEB2',
      }),
      createTextElement('speed-value', '9.2', 220, 400, 120, 40, {
        fontSize: 32,
        color: COLORS.RED,
      }),
      createTextElement('stamina-label', 'STAMINA SCORE', 400, 380, 200, 24, {
        fontSize: 12,
        color: '#AEAEB2',
      }),
      createTextElement('stamina-value', '88%', 400, 400, 120, 40, {
        fontSize: 32,
        color: COLORS.WHITE,
      }),
    ],
  };

  // 3. Match Analysis
  const matchSlide: Slide = {
    id: 'sports-match-analysis',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Match Analysis — Team A vs Team B', 80, 60, 800, 40, {
        fontSize: 26,
        fontWeight: '900',
      }),
      createTextElement('subtitle', 'Possession, shots, sprints, tackles comparison.', 80, 100, 800, 28, {
        fontSize: 16,
        color: '#E5E5EA',
      }),
      createShape('chart-card', 'rounded-rectangle', 80, 140, 800, 320, {
        fill: 'rgba(28,28,30,0.9)',
        stroke: 'rgba(255,255,255,0.08)',
        strokeWidth: 1,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.85)',
        shadowBlur: 40,
        shadowOffsetX: 0,
        shadowOffsetY: 24,
      } as any),
      createChart(
        'bar-match',
        'bar',
        110,
        170,
        740,
        260,
        {
          labels: ['Possession %', 'Shots', 'Sprints', 'Tackles'],
          datasets: [
            {
              label: 'Team A',
              data: [58, 14, 210, 32],
              backgroundColor: COLORS.RED,
              borderRadius: 4,
            },
            {
              label: 'Team B',
              data: [42, 9, 178, 29],
              backgroundColor: COLORS.ORANGE,
              borderRadius: 4,
            },
          ],
        },
        {
          scales: {
            x: { ticks: { color: '#F2F2F7' }, grid: { display: false } },
            y: { ticks: { color: '#8E8E93' }, grid: { color: 'rgba(255,255,255,0.08)' } },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { color: '#F2F2F7' },
            },
          },
        },
      ),
    ],
  };

  // 4. Training Schedule (Table)
  const scheduleSlide: Slide = {
    id: 'sports-schedule',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Weekly Training Schedule', 80, 60, 800, 40, {
        fontSize: 26,
        fontWeight: '900',
      }),
      {
        id: 'schedule-table',
        type: 'table',
        x: 80,
        y: 130,
        width: 800,
        height: 320,
        rows: 6,
        cols: 5,
        header: true,
        headerBg: COLORS.RED,
        headerTextColor: COLORS.WHITE,
        backgroundColor: COLORS.GRAY,
        rowAltBg: '#FFFFFF',
        borderColor: '#D1D1D6',
        borderWidth: 1,
        cellPadding: 10,
        cellTextAlign: 'center',
        color: '#1C1C1E',
        borderRadius: 14,
        tableData: [
          ['Day', 'Warm-up', 'Drills', 'Endurance', 'Recovery'],
          ['Monday', 'Dynamic mobility', 'Speed & agility', 'Intervals', 'Stretch / Foam roll'],
          ['Tuesday', 'Band activation', 'Ball control', 'Tempo runs', 'Contrast shower'],
          ['Wednesday', 'Light jog', 'Tactical drills', 'Small-sided games', 'Massage / Mobility'],
          ['Thursday', 'Neuromuscular', 'Finishing', 'Sprint repeats', 'Cold tub'],
          ['Friday', 'Activation', 'Set pieces', 'Match prep', 'Early sleep'],
        ],
      } as any,
    ],
  };

  // 5. Performance Comparison
  const comparisonSlide: Slide = {
    id: 'sports-comparison',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Performance Comparison — Season Over Season', 80, 60, 800, 40, {
        fontSize: 26,
        fontWeight: '900',
      }),
      createShape('divider', 'rectangle', 80, 120, 2, 320, {
        fill: 'rgba(255,255,255,0.16)',
        stroke: 'transparent',
      }),
      createShape('accent-top', 'rectangle', 80, 130, 360, 4, {
        fill: COLORS.RED,
        stroke: 'transparent',
      }),
      createShape('accent-bottom', 'rectangle', 520, 130, 360, 4, {
        fill: COLORS.ORANGE,
        stroke: 'transparent',
      }),
      createTextElement('left-label', 'Last Season', 120, 140, 360, 28, {
        fontSize: 18,
        color: '#AEAEB2',
      }),
      createTextElement('right-label', 'Current Season', 560, 140, 360, 28, {
        fontSize: 18,
        color: COLORS.WHITE,
      }),
      createTextElement('metric-speed', 'Sprint Speed (30m)', 120, 190, 360, 24, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('metric-speed-prev', '4.12s', 120, 214, 160, 30, {
        fontSize: 22,
        color: '#8E8E93',
      }),
      createTextElement('metric-speed-new', '3.98s', 560, 214, 160, 30, {
        fontSize: 22,
        color: COLORS.ORANGE,
      }),
      createTextElement('metric-agility', 'Agility Test', 120, 260, 360, 24, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('metric-agility-prev', '11.2', 120, 284, 160, 30, {
        fontSize: 22,
        color: '#8E8E93',
      }),
      createTextElement('metric-agility-new', '10.6', 560, 284, 160, 30, {
        fontSize: 22,
        color: COLORS.ORANGE,
      }),
      createTextElement('metric-hr', 'Avg Match HR', 120, 330, 360, 24, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('metric-hr-prev', '168 bpm', 120, 354, 160, 30, {
        fontSize: 22,
        color: '#8E8E93',
      }),
      createTextElement('metric-hr-new', '161 bpm', 560, 354, 160, 30, {
        fontSize: 22,
        color: COLORS.ORANGE,
      }),
    ],
  };

  // 6. Fitness Progress Trends (Line chart + text)
  const gallerySlide: Slide = {
    id: 'sports-gallery',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Fitness Progress Trends', 80, 60, 800, 40, {
        fontSize: 26,
        fontWeight: '900',
      }),
      // Line chart with 3 datasets: Speed, Strength, Endurance
      createChart(
        'fitness-trends-line',
        'line',
        80,
        120,
        520,
        320,
        {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [
            {
              label: 'Speed (m/s)',
              data: [7.8, 8.0, 8.2, 8.4, 8.5, 8.7],
              borderColor: COLORS.RED,
              backgroundColor: 'rgba(255,59,48,0.2)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Strength (1RM index)',
              data: [72, 75, 78, 80, 82, 85],
              borderColor: COLORS.ORANGE,
              backgroundColor: 'rgba(255,149,0,0.2)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Endurance (Yo-Yo score)',
              data: [1100, 1180, 1240, 1300, 1360, 1420],
              borderColor: '#34C759',
              backgroundColor: 'rgba(52,199,89,0.2)',
              tension: 0.3,
              fill: true,
            },
          ],
        },
      ),
      // Text explanation on the right
      createTextElement('side-title', 'How to Read This Chart', 630, 140, 260, 30, {
        fontSize: 18,
        color: COLORS.ORANGE,
      }),
      createTextElement(
        'side-body',
        'Speed, strength, and endurance are tracked across six weeks of training. A steady upward trend indicates progressive overload and well-balanced recovery.',
        630,
        175,
        260,
        90,
        {
          fontSize: 14,
          fontWeight: '500',
          color: '#E5E5EA',
        },
      ),
      createTextElement('side-point-1', '• Speed: short-distance sprint metrics (30–40m).', 630, 280, 260, 40, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('side-point-2', '• Strength: lower-body compound lifts, normalized.', 630, 315, 260, 40, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('side-point-3', '• Endurance: intermittent running test scores.', 630, 350, 260, 40, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
    ],
  };

  // 7. Team Roster
  const rosterSlide: Slide = {
    id: 'sports-roster',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Team Roster', 80, 60, 800, 40, {
        fontSize: 26,
        fontWeight: '900',
      }),
      createImageElement('roster-bg', ROSTER_IMG, 80, 120, 800, 320, {
        borderRadius: 24,
        opacity: 0.3,
      } as any),
      createShape('roster-glass', 'rounded-rectangle', 80, 120, 800, 320, {
        fill: 'rgba(28,28,30,0.88)',
        stroke: 'rgba(255,255,255,0.08)',
        strokeWidth: 1,
      }),
      createTextElement('player1', '#7  •  J. Parker  —  Forward', 120, 150, 320, 28, {
        fontSize: 16,
      }),
      createShape('badge1', 'rectangle', 410, 152, 80, 22, {
        fill: COLORS.RED,
        stroke: 'transparent',
      }),
      createTextElement('badge1-text', 'CAPTAIN', 410, 152, 80, 22, {
        fontSize: 11,
        textAlign: 'center',
      }),
      createTextElement('player2', '#10 •  R. Silva   —  Midfield', 120, 190, 320, 28, {
        fontSize: 16,
      }),
      createTextElement('player3', '#4  •  L. Becker —  Defense', 120, 230, 320, 28, {
        fontSize: 16,
      }),
      createTextElement('player4', '#1  •  K. Ito     —  Goalkeeper', 120, 270, 320, 28, {
        fontSize: 16,
      }),
      createTextElement('player5', '#11 •  A. Singh  —  Wing', 120, 310, 320, 28, {
        fontSize: 16,
      }),
      createTextElement('mvp-label', 'MVP', 600, 150, 120, 24, {
        fontSize: 13,
        color: COLORS.ORANGE,
      }),
      createTextElement('mvp-player', 'R. Silva — 18 goals / 12 assists', 600, 176, 260, 32, {
        fontSize: 15,
      }),
    ],
  };

  // 8. Training Strategy Overview (with fitness image)
  const strategySlide: Slide = {
    id: 'sports-strategy',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Training Strategy Overview', 80, 60, 800, 40, {
        fontSize: 26,
        fontWeight: '900',
      }),
      // Fitness image on the left
      createImageElement('strategy-img', STRATEGY_BG, 80, 120, 360, 260, {
        borderRadius: 20,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.85)',
        shadowBlur: 30,
        shadowOffsetX: 0,
        shadowOffsetY: 18,
      } as any),
      // Text content on the right
      createTextElement('block-title', 'Session Focus', 480, 130, 380, 30, {
        fontSize: 18,
        color: COLORS.ORANGE,
      }),
      createTextElement('block-body', 'Each training block combines strength, speed, and recovery work to match in-game demands.', 480, 165, 380, 60, {
        fontSize: 14,
        fontWeight: '500',
        color: '#E5E5EA',
      }),
      createTextElement('focus-1', '• Warm-up: mobility + activation (10–15 min)', 480, 230, 380, 24, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('focus-2', '• Main set: speed, agility, and change of direction', 480, 260, 380, 24, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('focus-3', '• Conditioning: sport-specific intervals', 480, 290, 380, 24, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('focus-4', '• Recovery: cooldown, stretch, and monitoring', 480, 320, 380, 24, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
    ],
  };

  // 9. Training Partners & Tools (with fitness image)
  const sponsorSlide: Slide = {
    id: 'sports-sponsors',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      createTextElement('title', 'Training Partners & Tools', 80, 60, 800, 40, {
        fontSize: 26,
        fontWeight: '900',
      }),
      // Fitness / gym image on the right
      createImageElement('sponsor-bg', SPONSOR_BG, 520, 140, 320, 260, {
        borderRadius: 24,
        opacity: 0.9,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.85)',
        shadowBlur: 30,
        shadowOffsetX: 0,
        shadowOffsetY: 18,
      } as any),
      // Text block on the left
      createTextElement('partners-title', 'Key Support Systems', 80, 140, 400, 30, {
        fontSize: 18,
        color: COLORS.ORANGE,
      }),
      createTextElement('partners-1', '• Strength & conditioning: local performance gym partnership', 80, 180, 400, 50, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('partners-2', '• Sports science: wearable tech for live HR, GPS, and load tracking', 80, 220, 400, 50, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('partners-3', '• Recovery: nutrition, sleep tracking, and physio support', 80, 260, 400, 50, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
      createTextElement('partners-4', '• Mindset: mental skills coaching and game-day routines', 80, 300, 400, 50, {
        fontSize: 14,
        color: '#F2F2F7',
      }),
    ],
  };

  // 10. Final Results / Next Goals
  const finalSlide: Slide = {
    id: 'sports-final',
    background: COLORS.BLACK,
    createdAt,
    elements: [
      createImageElement('final-img', FINAL_IMG, 540, 120, 320, 260, {
        borderRadius: 22,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.85)',
        shadowBlur: 34,
        shadowOffsetX: 0,
        shadowOffsetY: 20,
      } as any),
      createTextElement('title', 'Season Results & Next Goals', 80, 80, 420, 40, {
        fontSize: 26,
        fontWeight: '900',
      }),
      createTextElement('summary', 'Last match: 3–1 win  •  Season record: 18–4–2', 80, 130, 420, 40, {
        fontSize: 16,
        color: '#E5E5EA',
      }),
      createTextElement('goal1', '• Maintain win rate above 75%', 80, 190, 420, 30, {
        fontSize: 16,
        color: '#F2F2F7',
      }),
      createTextElement('goal2', '• Improve sprint speed by 3%', 80, 225, 420, 30, {
        fontSize: 16,
        color: '#F2F2F7',
      }),
      createTextElement('goal3', '• Reduce average HR by 5 bpm under load', 80, 260, 420, 30, {
        fontSize: 16,
        color: '#F2F2F7',
      }),
      createTextElement('goal4', '• Integrate real-time GPS & HR analytics', 80, 295, 420, 30, {
        fontSize: 16,
        color: '#F2F2F7',
      }),
      createTextElement('cta', 'STRONGER EVERY SEASON', 80, 360, 420, 40, {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.ORANGE,
      }),
    ],
  };

  return [
    coverSlide,
    statsSlide,
    matchSlide,
    scheduleSlide,
    comparisonSlide,
    gallerySlide,
    rosterSlide,
    strategySlide,
    sponsorSlide,
    finalSlide,
  ];
};

export default createSportsFitnessTemplate;
