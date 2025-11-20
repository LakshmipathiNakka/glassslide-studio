import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

// Palette for high-end Business Strategy template
const COLORS = {
  SLATE_BLACK: '#1A1A1A',
  ROYAL_BLUE: '#0044FF',
  AQUA_GLOW: '#00C8FF',
  WHITE: '#FFFFFF',
  SILVER: '#F0F0F0',
};

type ShapeType =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'triangle'
  | 'diamond'
  | 'line';

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
  fontWeight: 'normal',
  color: COLORS.WHITE,
  textAlign: 'left',
  lineHeight: 1.4,
  zIndex: 2,
  ...styles,
});

const createShape = (
  id: string,
  shapeType: ShapeType,
  x: number,
  y: number,
  width: number,
  height: number,
  styles: Partial<Element> = {},
): Element => ({
  id,
  type: 'shape',
  shapeType,
  x,
  y,
  width,
  height,
  fill: 'transparent',
  stroke: 'rgba(255,255,255,0.4)',
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
  // Provide src alias so all renderers (old/offscreen, thumbnails, editor) can resolve the image
  ...( { src: imageUrl } as any ),
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
    fill: 'rgba(10, 10, 10, 0.45)',
    stroke: 'rgba(0, 200, 255, 0.7)',
    strokeWidth: 1,
    backdropFilter: 'blur(28px)',
    rx: 26,
    shadow: {
      color: 'rgba(0, 0, 0, 0.55)',
      blur: 32,
      offsetX: 0,
      offsetY: 18,
    },
    ...styles,
  });

const createBusinessStrategyTemplate = (): Slide[] => {
  const createdAt = new Date();

  // Real-image backgrounds (royalty-free Unsplash; users can swap later)
  const COVER_IMG =
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80'; // boardroom skyline
  const WORKSPACE_IMG =
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80'; // workspace
  const LEADERSHIP_IMG =
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80'; // leadership
  const MARKET_IMG =
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80'; // market/financial
  const FINANCE_IMG =
    'https://images.unsplash.com/photo-1427751840561-9852520f8ce8?auto=format&fit=crop&w=1600&q=80'; // financial
  const SWOT_IMG =
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80'; // business macro
  const TEAM_IMG =
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=1600&q=80'; // team portraits
  const ROADMAP_IMG =
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80'; // abstract corporate
  const KPI_IMG =
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80'; // dashboard
  const THANKYOU_IMG =
    'https://images.unsplash.com/photo-1487611459768-bd414656ea10?auto=format&fit=crop&w=1600&q=80'; // skyline

  // 1. Cover – Company Logo + Tagline
  const coverSlide: Slide = {
    id: 'biz-cover',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('cover-bg', COVER_IMG, 0, 0, 960, 540, {
        opacity: 0.8,
      }),
      // Solid overlay (no gradient string) so it renders identically in editor & presentation
      createShape('cover-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.8)',
        stroke: 'transparent',
        zIndex: 0,
      }),
      // Center glass title card
      createGlassPanel('cover-card', 160, 130, 640, 260, {
        fill: 'rgba(10,10,10,0.55)',
      }),
      // Neon outline
      createShape('cover-outline', 'rounded-rectangle', 160, 130, 640, 260, {
        fill: 'transparent',
        stroke: 'rgba(0,200,255,0.9)',
        strokeWidth: 1.5,
        rx: 30,
        shadow: {
          color: 'rgba(0,200,255,0.9)',
          blur: 24,
          offsetX: 0,
          offsetY: 0,
        },
      }),
      // Logo placeholder
      createShape('cover-logo', 'circle', 210, 150, 68, 68, {
        fill: 'rgba(255,255,255,0.08)',
        stroke: 'rgba(255,255,255,0.7)',
        strokeWidth: 1.5,
        shadow: {
          color: 'rgba(0,0,0,0.7)',
          blur: 18,
          offsetX: 0,
          offsetY: 8,
        },
      }),
      createTextElement('cover-logo-text', 'LOGO', 210, 170, 68, 30, {
        fontSize: 12,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.7)',
      }),
      createTextElement('cover-title', 'Business Strategy Deck', 300, 180, 480, 60, {
        fontSize: 40,
        fontWeight: '600',
        textAlign: 'left',
      }),
      createTextElement('cover-tagline', 'Aligning vision, execution, and growth.', 300, 235, 480, 30, {
        fontSize: 18,
        color: 'rgba(240,240,240,0.9)',
      }),
      createTextElement('cover-meta', 'Company Name  •  Presenter Name  •  Date', 300, 275, 480, 24, {
        fontSize: 13,
        color: 'rgba(240,240,240,0.75)',
      }),
    ],
  };

  // 2. Agenda
  const agendaSlide: Slide = {
    id: 'biz-agenda',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('agenda-bg', WORKSPACE_IMG, 0, 0, 960, 540, {
        opacity: 0.6,
      }),
      // Solid dark overlay for presentation compatibility
      createShape('agenda-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.85)',
        stroke: 'transparent',
      }),
      // Vertical neon accent
      createShape('agenda-accent', 'rectangle', 80, 60, 6, 360, {
        fill: COLORS.ROYAL_BLUE,
        stroke: 'transparent',
        shadow: {
          color: 'rgba(0,68,255,0.9)',
          blur: 20,
          offsetX: 0,
          offsetY: 0,
        },
      }),
      // Glass agenda panel
      createGlassPanel('agenda-panel', 110, 80, 420, 360, {
        fill: 'rgba(10,10,10,0.5)',
      }),
      createTextElement('agenda-title', 'Agenda', 130, 100, 380, 40, {
        fontSize: 30,
        fontWeight: '600',
      }),
      createTextElement('agenda-items', '1. Introduction\n2. Market Overview\n3. Strategy Pillars\n4. Leadership & Team\n5. KPIs & Financials\n6. Roadmap & Next Steps', 130, 150, 380, 260, {
        fontSize: 18,
        color: COLORS.SILVER,
        lineHeight: 1.6,
      }),
    ],
  };

  // 3. Mission & Vision
  const missionVisionSlide: Slide = {
    id: 'biz-mission-vision',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('mv-bg', LEADERSHIP_IMG, 0, 0, 960, 540, {
        opacity: 0.7,
      }),
      createShape('mv-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.85)',
        stroke: 'transparent',
      }),
      // Right-side glass block
      createGlassPanel('mv-panel', 520, 80, 360, 380, {
        fill: 'rgba(10,10,10,0.6)',
      }),
      createTextElement('mv-title', 'Mission & Vision', 540, 100, 320, 34, {
        fontSize: 26,
        fontWeight: '600',
      }),
      // Mission box
      createGlassPanel('mv-mission-box', 540, 150, 320, 130, {
        stroke: 'rgba(0,68,255,0.9)',
      }),
      createTextElement('mv-mission-title', 'Mission', 560, 165, 280, 26, {
        fontSize: 18,
        fontWeight: '600',
      }),
      createTextElement(
        'mv-mission-body',
        'Describe why the company exists and what value it creates for customers and stakeholders.',
        560,
        195,
        280,
        80,
        {
          fontSize: 14,
          color: COLORS.SILVER,
        },
      ),
      // Vision box
      createGlassPanel('mv-vision-box', 540, 300, 320, 130, {
        stroke: 'rgba(0,200,255,0.9)',
      }),
      createTextElement('mv-vision-title', 'Vision', 560, 315, 280, 26, {
        fontSize: 18,
        fontWeight: '600',
      }),
      createTextElement(
        'mv-vision-body',
        'Paint the long-term picture of where the business is heading and the impact you aim to have.',
        560,
        345,
        280,
        80,
        {
          fontSize: 14,
          color: COLORS.SILVER,
        },
      ),
    ],
  };

  // 4. Market Overview (Chart)
  const marketSlide: Slide = {
    id: 'biz-market',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('market-bg', MARKET_IMG, 0, 0, 960, 540, {
        opacity: 0.7,
      }),
      createShape('market-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.9)',
        stroke: 'transparent',
      }),
      createTextElement('market-title', 'Market Overview', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      createTextElement(
        'market-subtitle',
        'Summarize market size, CAGR, and key segments relevant to this strategy.',
        80,
        100,
        800,
        30,
        {
          fontSize: 16,
          color: COLORS.SILVER,
        },
      ),
      // Chart container glass (zIndex lower than chart so chart renders on top)
      createGlassPanel('market-chart-card', 80, 150, 800, 320, {
        fill: 'rgba(10,10,10,0.55)',
        zIndex: 1,
      }),
      {
        id: 'market-chart',
        type: 'chart',
        chartType: 'line',
        x: 110,
        y: 185,
        width: 740,
        height: 260,
        zIndex: 2,
        chartData: {
          labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            {
              label: 'Total Addressable Market ($B)',
              data: [8, 10, 13, 17, 22, 28],
              borderColor: COLORS.ROYAL_BLUE,
              backgroundColor: 'rgba(0,68,255,0.25)',
              tension: 0.35,
            },
            {
              label: 'Serviceable Market ($B)',
              data: [3, 4, 5.5, 7, 9, 11],
              borderColor: COLORS.AQUA_GLOW,
              backgroundColor: 'rgba(0,200,255,0.2)',
              tension: 0.35,
            },
          ],
        },
      } as Element,
    ],
  };

  // 5. Financial Summary (Table)
  const financialSlide: Slide = {
    id: 'biz-financial',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('fin-bg', FINANCE_IMG, 0, 0, 960, 540, {
        opacity: 0.6,
      }),
      createShape('fin-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.9)',
        stroke: 'transparent',
      }),
      createTextElement('fin-title', 'Financial Summary', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // Glass table card (zIndex lower than table so table content renders on top)
      createGlassPanel('fin-table-card', 80, 120, 800, 340, {
        fill: 'rgba(10,10,10,0.65)',
        zIndex: 1,
      }),
      {
        id: 'fin-table',
        type: 'table',
        x: 100,
        y: 150,
        width: 760,
        height: 280,
        zIndex: 2,
        rows: 6,
        cols: 5,
        header: true,
        headerBg: COLORS.ROYAL_BLUE,
        headerTextColor: COLORS.WHITE,
        backgroundColor: 'rgba(250,250,250,1)',
        rowAltBg: '#F5F7FA',
        borderColor: 'rgba(0,0,0,0.12)',
        borderWidth: 1,
        borderRadius: 18,
        cellPadding: 10,
        cellTextAlign: 'center',
        color: '#111827',
        tableData: [
          ['Year', 'Revenue', 'Growth %', 'Expenses', 'Net Profit'],
          ['2022', '$40M', '—', '$32M', '$8M'],
          ['2023', '$52M', '+30%', '$40M', '$12M'],
          ['2024', '$68M', '+31%', '$50M', '$18M'],
          ['2025E', '$85M', '+25%', '$60M', '$25M'],
          ['2026E', '$105M', '+24%', '$72M', '$33M'],
        ],
      } as Element,
    ],
  };

  // 6. SWOT Analysis
  const swotSlide: Slide = {
    id: 'biz-swot',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('swot-bg', SWOT_IMG, 0, 0, 960, 540, {
        opacity: 0.6,
      }),
      createShape('swot-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.9)',
        stroke: 'transparent',
      }),
      createTextElement('swot-title', 'SWOT Analysis', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // Geometric quadrant grid
      createShape('swot-grid-v', 'line', 480, 130, 1, 320, {
        stroke: 'rgba(255,255,255,0.3)',
        strokeWidth: 1,
      }),
      createShape('swot-grid-h', 'line', 80, 290, 800, 1, {
        stroke: 'rgba(255,255,255,0.3)',
        strokeWidth: 1,
      }),
      // Strengths
      createGlassPanel('swot-s', 90, 140, 380, 140, {
        stroke: 'rgba(0,68,255,0.9)',
      }),
      createTextElement('swot-s-title', 'Strengths', 110, 155, 340, 24, {
        fontSize: 18,
        fontWeight: '600',
      }),
      createTextElement(
        'swot-s-body',
        '\u2022 Strong brand recognition\n\u2022 Differentiated product offering\n\u2022 Robust financial position',
        110,
        185,
        340,
        80,
        {
          fontSize: 14,
          color: COLORS.SILVER,
        },
      ),
      // Weaknesses
      createGlassPanel('swot-w', 500, 140, 380, 140, {
        stroke: 'rgba(240,240,240,0.9)',
      }),
      createTextElement('swot-w-title', 'Weaknesses', 520, 155, 340, 24, {
        fontSize: 18,
        fontWeight: '600',
      }),
      createTextElement(
        'swot-w-body',
        '\u2022 Limited regional presence\n\u2022 Legacy systems in key workflows\n\u2022 Hiring in competitive talent markets',
        520,
        185,
        340,
        80,
        {
          fontSize: 14,
          color: COLORS.SILVER,
        },
      ),
      // Opportunities
      createGlassPanel('swot-o', 90, 300, 380, 140, {
        stroke: 'rgba(0,200,255,0.9)',
      }),
      createTextElement('swot-o-title', 'Opportunities', 110, 315, 340, 24, {
        fontSize: 18,
        fontWeight: '600',
      }),
      createTextElement(
        'swot-o-body',
        '\u2022 Expansion into new markets\n\u2022 Cross-sell and upsell opportunities\n\u2022 Strategic partnerships and M&A',
        110,
        345,
        340,
        80,
        {
          fontSize: 14,
          color: COLORS.SILVER,
        },
      ),
      // Threats
      createGlassPanel('swot-t', 500, 300, 380, 140, {
        stroke: 'rgba(255,120,80,0.9)',
      }),
      createTextElement('swot-t-title', 'Threats', 520, 315, 340, 24, {
        fontSize: 18,
        fontWeight: '600',
      }),
      createTextElement(
        'swot-t-body',
        '\u2022 Intensifying competition\n\u2022 Regulatory changes\n\u2022 Macroeconomic uncertainty',
        520,
        345,
        340,
        80,
        {
          fontSize: 14,
          color: COLORS.SILVER,
        },
      ),
    ],
  };

  // 7. Team Profiles
  const teamSlide: Slide = {
    id: 'biz-team',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('team-bg', TEAM_IMG, 0, 0, 960, 540, {
        opacity: 0.65,
      }),
      createShape('team-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.9)',
        stroke: 'transparent',
      }),
      createTextElement('team-title', 'Leadership Team', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // 2x3 or 3x2 grid of profiles
      ...[0, 1, 2].flatMap((col) =>
        [0, 1].map((row) => {
          const baseX = 80 + col * 280;
          const baseY = 130 + row * 180;
          return [
            createGlassPanel(`team-card-${col}-${row}`, baseX, baseY, 240, 150, {
              stroke: 'rgba(0,200,255,0.8)',
            }),
            createImageElement(
              `team-photo-${col}-${row}`,
              TEAM_IMG,
              baseX + 14,
              baseY + 18,
              60,
              60,
              {
                borderRadius: 999,
                opacity: 0.95,
              },
            ),
            createTextElement(`team-name-${col}-${row}`, 'Name Here', baseX + 88, baseY + 22, 140, 24, {
              fontSize: 15,
              fontWeight: '600',
            }),
            createTextElement(`team-role-${col}-${row}`, 'Role / Title', baseX + 88, baseY + 46, 140, 22, {
              fontSize: 13,
              color: COLORS.SILVER,
            }),
            createTextElement(
              `team-tagline-${col}-${row}`,
              'Short descriptor of expertise and contribution.',
              baseX + 88,
              baseY + 70,
              140,
              52,
              {
                fontSize: 12,
                color: 'rgba(240,240,240,0.8)',
              },
            ),
          ] as Element[];
        }),
      ).flat(),
    ],
  };

  // 8. Roadmap Timeline
  const roadmapSlide: Slide = {
    id: 'biz-roadmap',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('roadmap-bg', ROADMAP_IMG, 0, 0, 960, 540, {
        opacity: 0.6,
      }),
      createShape('roadmap-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.9)',
        stroke: 'transparent',
      }),
      createTextElement('roadmap-title', 'Strategic Roadmap', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // Horizontal glowing line
      createShape('roadmap-line', 'rectangle', 100, 260, 760, 4, {
        fill: COLORS.ROYAL_BLUE,
        stroke: 'transparent',
        shadow: {
          color: 'rgba(0,68,255,0.8)',
          blur: 18,
          offsetX: 0,
          offsetY: 0,
        },
      }),
      // Milestone capsules
      ...['2024 Q1', '2024 Q3', '2025 Q1', '2025 Q3'].map((label, index) => {
        const centerX = 140 + index * 200;
        return createGlassPanel(`roadmap-cap-${index}`, centerX - 70, 210, 140, 90, {
          rx: 40,
          fill: 'rgba(10,10,10,0.7)',
        });
      }),
      ...['2024 Q1', '2024 Q3', '2025 Q1', '2025 Q3'].map((label, index) => {
        const centerX = 140 + index * 200;
        return createTextElement(
          `roadmap-cap-label-${index}`,
          label,
          centerX - 60,
          220,
          120,
          24,
          {
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
          },
        );
      }),
      ...['Launch new segment', 'Expand into 2 regions', 'Introduce premium tier', 'Scale partnerships'].map(
        (desc, index) => {
          const centerX = 140 + index * 200;
          return createTextElement(
            `roadmap-cap-desc-${index}`,
            desc,
            centerX - 60,
            245,
            120,
            40,
            {
              fontSize: 12,
              color: COLORS.SILVER,
              textAlign: 'center',
            },
          );
        },
      ),
    ],
  };

  // 9. KPI Dashboard
  const kpiSlide: Slide = {
    id: 'biz-kpis',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('kpi-bg', KPI_IMG, 0, 0, 960, 540, {
        opacity: 0.65,
      }),
      createShape('kpi-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.9)',
        stroke: 'transparent',
      }),
      createTextElement('kpi-title', 'KPI Dashboard', 80, 60, 800, 40, {
        fontSize: 28,
        fontWeight: '600',
      }),
      // Metric cards row 1
      ...[
        { id: 'rev', label: 'Revenue YoY', value: '+28%', accent: COLORS.ROYAL_BLUE },
        { id: 'share', label: 'Market Share', value: '14%', accent: COLORS.AQUA_GLOW },
        { id: 'cac', label: 'Customer Acquisition Cost', value: '$310', accent: COLORS.ROYAL_BLUE },
      ].map((metric, index) => {
        const baseX = 80 + index * 280;
        const baseY = 130;
        return createGlassPanel(`kpi-card-1-${metric.id}`, baseX, baseY, 240, 110, {
          stroke: metric.accent,
          fill: 'rgba(10,10,10,0.7)',
        });
      }),
      ...[
        { id: 'rev', label: 'Revenue YoY', value: '+28%', accent: COLORS.ROYAL_BLUE },
        { id: 'share', label: 'Market Share', value: '14%', accent: COLORS.AQUA_GLOW },
        { id: 'cac', label: 'Customer Acquisition Cost', value: '$310', accent: COLORS.ROYAL_BLUE },
      ].flatMap((metric, index) => {
        const baseX = 80 + index * 280;
        const baseY = 130;
        return [
          createTextElement(`kpi-1-label-${metric.id}`, metric.label, baseX + 20, baseY + 18, 200, 22, {
            fontSize: 14,
            color: COLORS.SILVER,
          }),
          createTextElement(`kpi-1-value-${metric.id}`, metric.value, baseX + 20, baseY + 44, 200, 32, {
            fontSize: 22,
            fontWeight: '600',
          }),
        ] as Element[];
      }),
      // Metric cards row 2
      ...[
        { id: 'conv', label: 'Conversion Rate', value: '4.8%', accent: COLORS.AQUA_GLOW },
        { id: 'margin', label: 'Operating Margin', value: '22%', accent: COLORS.ROYAL_BLUE },
        { id: 'nps', label: 'Net Promoter Score', value: '63', accent: COLORS.AQUA_GLOW },
      ].map((metric, index) => {
        const baseX = 80 + index * 280;
        const baseY = 270;
        return createGlassPanel(`kpi-card-2-${metric.id}`, baseX, baseY, 240, 110, {
          stroke: metric.accent,
          fill: 'rgba(10,10,10,0.7)',
        });
      }),
      ...[
        { id: 'conv', label: 'Conversion Rate', value: '4.8%', accent: COLORS.AQUA_GLOW },
        { id: 'margin', label: 'Operating Margin', value: '22%', accent: COLORS.ROYAL_BLUE },
        { id: 'nps', label: 'Net Promoter Score', value: '63', accent: COLORS.AQUA_GLOW },
      ].flatMap((metric, index) => {
        const baseX = 80 + index * 280;
        const baseY = 270;
        return [
          createTextElement(`kpi-2-label-${metric.id}`, metric.label, baseX + 20, baseY + 18, 200, 22, {
            fontSize: 14,
            color: COLORS.SILVER,
          }),
          createTextElement(`kpi-2-value-${metric.id}`, metric.value, baseX + 20, baseY + 44, 200, 32, {
            fontSize: 22,
            fontWeight: '600',
          }),
        ] as Element[];
      }),
    ],
  };

  // 10. Thank You
  const thanksSlide: Slide = {
    id: 'biz-thankyou',
    background: COLORS.SLATE_BLACK,
    createdAt,
    elements: [
      createImageElement('thanks-bg', THANKYOU_IMG, 0, 0, 960, 540, {
        opacity: 0.7,
      }),
      createShape('thanks-overlay', 'rectangle', 0, 0, 960, 540, {
        fill: 'rgba(0, 0, 0, 0.92)',
        stroke: 'transparent',
      }),
      // Center glass panel
      createGlassPanel('thanks-card', 160, 150, 640, 220, {
        fill: 'rgba(10,10,10,0.6)',
      }),
      createTextElement('thanks-title', 'Thank You', 180, 180, 600, 50, {
        fontSize: 40,
        fontWeight: '600',
        textAlign: 'center',
      }),
      createTextElement('thanks-subtitle', 'Questions or follow-ups?', 180, 230, 600, 30, {
        fontSize: 18,
        color: COLORS.SILVER,
        textAlign: 'center',
      }),
      createTextElement(
        'thanks-contact',
        'contact@company.com  •  company.com  •  +1 (000) 000-0000',
        180,
        265,
        600,
        26,
        {
          fontSize: 14,
          color: COLORS.SILVER,
          textAlign: 'center',
        },
      ),
      // QR code placeholder
      createShape('thanks-qr', 'rounded-rectangle', 780, 340, 120, 120, {
        fill: 'rgba(0,0,0,0.5)',
        stroke: 'rgba(0,200,255,0.9)',
        strokeWidth: 2,
        rx: 24,
        shadow: {
          color: 'rgba(0,200,255,0.9)',
          blur: 22,
          offsetX: 0,
          offsetY: 0,
        },
      }),
      createTextElement('thanks-qr-note', 'Insert QR code', 780, 468, 120, 20, {
        fontSize: 11,
        color: COLORS.SILVER,
        textAlign: 'center',
      }),
    ],
  };

  return [
    coverSlide,
    agendaSlide,
    missionVisionSlide,
    marketSlide,
    financialSlide,
    swotSlide,
    teamSlide,
    roadmapSlide,
    kpiSlide,
    thanksSlide,
  ];
};

export default createBusinessStrategyTemplate;
