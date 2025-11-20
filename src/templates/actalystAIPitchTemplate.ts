import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

// Gradient palette for Actalyst AI startup deck
const COLORS = {
  RED: '#FF4D4D',
  ORANGE: '#FF8C00',
  GOLD: '#FFD700',
  LIME: '#32CD32',
  BLUE: '#1E90FF',
  WHITE: '#FFFFFF',
};

const GRADIENTS = {
  WARM_COOL: 'linear-gradient(135deg, #FF4D4D, #FF8C00, #FFD700, #1E90FF)',
  COOL: 'linear-gradient(135deg, #32CD32, #1E90FF)',
  GOLDEN: 'linear-gradient(135deg, #FF8C00, #FFD700)',
  ORANGE_YELLOW: 'linear-gradient(135deg, #FF4D4D, #FF8C00)',
  GREEN_BLUE: 'linear-gradient(135deg, #32CD32, #1E90FF)',
  BLUE_PURPLE: 'linear-gradient(135deg, #1E90FF, #8E2DE2)',
  GOLD_LIME: 'linear-gradient(135deg, #FFD700, #32CD32)',
  LIME_DEEP_BLUE: 'linear-gradient(135deg, #32CD32, #1E3A8A)',
  FULL_SPECTRUM:
    'linear-gradient(135deg, #FF4D4D, #FF8C00, #FFD700, #32CD32, #1E90FF)',
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
  stroke: 'rgba(255,255,255,0.22)',
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
  ...( { src: imageUrl } as any ),
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

const createBlurBlob = (
  id: string,
  x: number,
  y: number,
  size: number,
  fill: string,
): Element =>
  createShape(id, 'circle', x, y, size, size, {
    fill,
    opacity: 0.45,
    stroke: 'transparent',
    // use backdropFilter as a proxy for blur/glow
    ...( { backdropFilter: 'blur(24px)' } as any ),
    zIndex: 0,
  });

const createActalystAIPitchTemplate = (): Slide[] => {
  const createdAt = new Date();

  const HERO_IMG =
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80';
  const TECH_IMG =
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80';

  // 1. Title — Actalyst AI
  const titleSlide: Slide = {
    id: 'aa-title',
    background: GRADIENTS.WARM_COOL,
    createdAt,
    elements: [
      createBlurBlob('t-blob-1', -40, -20, 260, COLORS.RED),
      createBlurBlob('t-blob-2', 700, -60, 260, COLORS.GOLD),
      createBlurBlob('t-blob-3', 600, 320, 260, COLORS.BLUE),
      createTextElement('t-title', 'Actalyst AI', 120, 160, 720, 70, {
        fontSize: 56,
        fontWeight: '600',
      }),
      createTextElement(
        't-sub',
        'Real-Time AI Insights. Smarter Decisions. Every Moment.',
        120,
        230,
        720,
        40,
        {
          fontSize: 22,
          color: 'rgba(255,255,255,0.9)',
        },
      ),
      createShape('t-icon-pill', 'rounded-rectangle', 120, 290, 260, 40, {
        fill: 'rgba(0,0,0,0.18)',
        stroke: 'rgba(255,255,255,0.32)',
        strokeWidth: 1,
        ...( { backdropFilter: 'blur(10px)' } as any ),
      }),
      createTextElement(
        't-icons',
        'AI  •  Data Streams  •  Automation',
        140,
        298,
        220,
        24,
        {
          fontSize: 14,
        },
      ),
    ],
  };

  // 2. Agenda
  const agendaSlide: Slide = {
    id: 'aa-agenda',
    background: GRADIENTS.COOL,
    createdAt,
    elements: [
      createBlurBlob('a-blob-1', 720, -60, 240, COLORS.BLUE),
      createBlurBlob('a-blob-2', -80, 320, 260, COLORS.LIME),
      createTextElement('a-title', 'Agenda', 120, 80, 720, 40, {
        fontSize: 32,
        fontWeight: '600',
      }),
      ...[
        '1. Problem & Opportunity',
        '2. Actalyst AI Platform',
        '3. Tech Stack & Architecture',
        '4. Performance & Use Cases',
        '5. Business Model & Pricing',
        '6. Roadmap & Next Steps',
      ].flatMap((label, index) => {
        const y = 140 + index * 50;
        const id = `a-item-${index}`;
        return [
          createTextElement(id, label, 140, y, 600, 30, {
            fontSize: 18,
          }),
          createShape(`${id}-divider`, 'rectangle', 140, y + 32, 360, 2, {
            fill:
              index % 2 === 0
                ? 'linear-gradient(90deg, #FF8C00, #FFD700)'
                : 'linear-gradient(90deg, #32CD32, #1E90FF)',
            stroke: 'transparent',
            opacity: 0.9,
          }),
        ] as Element[];
      }),
    ],
  };

  // 3. Mission & Vision
  const missionSlide: Slide = {
    id: 'aa-mission',
    background: GRADIENTS.GOLDEN,
    createdAt,
    elements: [
      createBlurBlob('m-blob-1', 660, -40, 260, COLORS.GOLD),
      createTextElement('m-title', 'Mission & Vision', 120, 70, 720, 40, {
        fontSize: 32,
        fontWeight: '600',
      }),
      createShape('m-card', 'rounded-rectangle', 100, 130, 760, 290, {
        fill: 'rgba(0,0,0,0.16)',
        stroke: 'rgba(255,255,255,0.32)',
        strokeWidth: 1,
        ...( { backdropFilter: 'blur(18px)' } as any ),
      }),
      createTextElement('m-label', 'Mission', 140, 160, 320, 26, {
        fontSize: 18,
        fontWeight: '600',
      }),
      createTextElement(
        'm-text',
        'Enable enterprises to act instantly using real-time AI intelligence.',
        140,
        190,
        320,
        60,
        {
          fontSize: 16,
          color: 'rgba(255,255,255,0.9)',
        },
      ),
      createTextElement(
        'm-bullets',
        '\u2022 Reduce time-to-decision from hours to seconds.\n\u2022 Bring AI directly into daily operational workflows.\n\u2022 Make real-time data usable for every team, not just data science.',
        140,
        250,
        320,
        120,
        {
          fontSize: 13,
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.5,
        },
      ),
      createTextElement('v-label', 'Vision', 500, 160, 320, 26, {
        fontSize: 18,
        fontWeight: '600',
      }),
      createTextElement(
        'v-text',
        'A world where decisions evolve as fast as data itself.',
        500,
        190,
        320,
        60,
        {
          fontSize: 16,
          color: 'rgba(255,255,255,0.9)',
        },
      ),
      createTextElement(
        'v-bullets',
        '\u2022 Every event, log, and transaction becomes a live signal.\n\u2022 Human operators collaborate with AI copilots in real time.\n\u2022 Strategic decisions are continuously updated as conditions change.',
        500,
        250,
        320,
        120,
        {
          fontSize: 13,
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.5,
        },
      ),
    ],
  };

  // 4. Tech Stack Overview (Icons)
  const stackSlide: Slide = {
    id: 'aa-stack',
    background: GRADIENTS.ORANGE_YELLOW,
    createdAt,
    elements: [
      createBlurBlob('s-blob-1', -60, -40, 220, COLORS.RED),
      createBlurBlob('s-blob-2', 700, 340, 260, COLORS.GOLD),
      createTextElement('s-title', 'Tech Stack Overview', 120, 70, 720, 40, {
        fontSize: 30,
        fontWeight: '600',
      }),
      ...[
        { label: 'Real-time AI Engine', desc: 'Streaming inference layer tuned for sub-100ms decisions.' },
        { label: 'Predictive Models', desc: 'Ensembles for classification, ranking, and forecasting.' },
        { label: 'Feature Store', desc: 'Unified, versioned feature layer across batch and stream.' },
        { label: 'Stream Processing', desc: 'Low-latency pipelines on events, logs, and sensor data.' },
        { label: 'Cloud Infrastructure', desc: 'Autoscaling across managed Kubernetes and serverless.' },
        { label: 'Analytics Layer', desc: 'Dashboards, experimentation, and observability for AI.' },
      ].flatMap((item, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const baseX = 100 + col * 260;
        const baseY = 140 + row * 150;
        const id = `s-card-${index}`;
        return [
          createShape(id, 'rounded-rectangle', baseX, baseY, 220, 120, {
            fill: 'rgba(0,0,0,0.18)',
            stroke: 'rgba(255,255,255,0.35)',
            ...( { backdropFilter: 'blur(16px)' } as any ),
          }),
          createShape(`${id}-icon`, 'circle', baseX + 16, baseY + 24, 30, 30, {
            fill: 'rgba(255,255,255,0.15)',
            stroke: 'rgba(255,255,255,0.8)',
            strokeWidth: 1.5,
          }),
          createTextElement(`${id}-label`, item.label, baseX + 60, baseY + 22, 150, 26, {
            fontSize: 14,
            lineHeight: 1.3,
          }),
          createTextElement(`${id}-desc`, item.desc, baseX + 16, baseY + 54, 188, 56, {
            fontSize: 11,
            lineHeight: 1.4,
            color: 'rgba(255,255,255,0.85)',
          }),
        ] as Element[];
      }),
    ],
  };

  // 5. Product Architecture (Diagram)
  const archSlide: Slide = {
    id: 'aa-architecture',
    background: GRADIENTS.GREEN_BLUE,
    createdAt,
    elements: [
      createBlurBlob('p-blob-1', -40, 220, 220, COLORS.LIME),
      createBlurBlob('p-blob-2', 720, -40, 240, COLORS.BLUE),
      createTextElement('p-title', 'Product Architecture', 120, 70, 720, 40, {
        fontSize: 30,
        fontWeight: '600',
      }),
      ...[
        'Data Stream Input',
        'Real-Time AI Core',
        'Predictive Decision Engine',
        'API Layer',
        'Dashboards & Integrations',
      ].flatMap((label, index) => {
        const baseY = 140 + index * 70;
        const id = `p-node-${index}`;
        return [
          createShape(id, 'circle', 160, baseY, 32, 32, {
            fill: 'rgba(0,0,0,0.25)',
            stroke: 'rgba(255,255,255,0.9)',
            strokeWidth: 2,
          }),
          createTextElement(`${id}-label`, label, 220, baseY + 4, 580, 30, {
            fontSize: 16,
          }),
          index < 4
            ? createShape(`p-line-${index}`, 'rectangle', 176, baseY + 40, 2, 30, {
                fill: COLORS.WHITE,
                stroke: 'transparent',
                opacity: 0.5,
              })
            : (null as any),
        ].filter(Boolean) as Element[];
      }),
    ],
  };

  // 6. Performance Graphs (Line + Area Charts)
  const perfSlide: Slide = {
    id: 'aa-performance',
    background: GRADIENTS.ORANGE_YELLOW,
    createdAt,
    elements: [
      createBlurBlob('k-blob-1', 680, 40, 240, COLORS.RED),
      createTextElement('k-title', 'Performance KPIs', 120, 70, 720, 40, {
        fontSize: 30,
        fontWeight: '600',
      }),
      // Latency trend (line/area)
      createShape('k-card-latency', 'rounded-rectangle', 100, 130, 360, 320, {
        fill: 'rgba(0,0,0,0.2)',
        stroke: 'rgba(255,255,255,0.35)',
        ...( { backdropFilter: 'blur(16px)' } as any ),
      }),
      createTextElement('k-latency-title', 'Prediction Latency (ms)', 120, 150, 320, 24, {
        fontSize: 16,
      }),
      createChart(
        'k-latency-chart',
        'line',
        120,
        180,
        320,
        250,
        {
          labels: ['1k', '10k', '50k', '100k', '250k'],
          datasets: [
            {
              label: 'Latency',
              data: [120, 105, 95, 88, 80],
              borderColor: COLORS.WHITE,
              backgroundColor: 'linear-gradient(180deg, #FF8C00, #FFD700, #1E90FF)',
              fill: true,
            },
          ],
        },
      ),
      // Accuracy trend
      createShape('k-card-accuracy', 'rounded-rectangle', 500, 130, 360, 150, {
        fill: 'rgba(0,0,0,0.2)',
        stroke: 'rgba(255,255,255,0.35)',
        ...( { backdropFilter: 'blur(16px)' } as any ),
      }),
      createTextElement('k-acc-title', 'Accuracy Trend (%)', 520, 150, 320, 24, {
        fontSize: 16,
      }),
      createChart(
        'k-acc-chart',
        'line',
        520,
        180,
        320,
        90,
        {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Accuracy',
              data: [91.2, 92.8, 93.7, 94.6],
              borderColor: COLORS.WHITE,
              backgroundColor: 'linear-gradient(180deg, #FF4D4D, #FFD700, #1E90FF)',
              fill: true,
            },
          ],
        },
      ),
      // Throughput (bar)
      createShape('k-card-throughput', 'rounded-rectangle', 500, 300, 360, 150, {
        fill: 'rgba(0,0,0,0.2)',
        stroke: 'rgba(255,255,255,0.35)',
        ...( { backdropFilter: 'blur(16px)' } as any ),
      }),
      createTextElement('k-th-title', 'Model Throughput (req/sec)', 520, 320, 320, 24, {
        fontSize: 16,
      }),
      createChart(
        'k-th-chart',
        'bar',
        520,
        350,
        320,
        90,
        {
          labels: ['v1', 'v2', 'v3'],
          datasets: [
            {
              label: 'Throughput',
              data: [4200, 7800, 10500],
              backgroundColor: [
                'linear-gradient(180deg, #FF8C00, #FFD700)',
                'linear-gradient(180deg, #32CD32, #1E90FF)',
                'linear-gradient(180deg, #FF4D4D, #1E90FF)',
              ],
            },
          ],
        },
      ),
      createTextElement(
        'k-caption',
        'Latency continues to fall as traffic grows, while accuracy and throughput improve with each model iteration.',
        120,
        470,
        720,
        30,
        {
          fontSize: 13,
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
        },
      ),
    ],
  };

  // 7. Use-Case Gallery (Circular glow masks)
  const useCaseSlide: Slide = {
    id: 'aa-usecases',
    background: GRADIENTS.GOLD_LIME,
    createdAt,
    elements: [
      createBlurBlob('u-blob-1', -40, -20, 220, COLORS.GOLD),
      createBlurBlob('u-blob-2', 720, 280, 260, COLORS.LIME),
      createTextElement('u-title', 'Use-Case Gallery', 120, 70, 720, 40, {
        fontSize: 30,
        fontWeight: '600',
      }),
      ...[
        { label: 'Fraud Detection', desc: 'Flag anomalous patterns in payments and transactions in real time.' },
        { label: 'Supply Chain Forecasting', desc: 'Predict demand and inventory risk across global networks.' },
        { label: 'Customer Behavior Prediction', desc: 'Score churn, LTV, and next-best-action for each customer.' },
        { label: 'Real-Time Personalization', desc: 'Adapt experiences and offers based on streaming context.' },
      ].flatMap((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const centerX = 200 + col * 360;
        const centerY = 180 + row * 160;
        const id = `u-${index}`;
        return [
          createShape(`${id}-ring`, 'circle', centerX - 70, centerY - 70, 140, 140, {
            fill: 'transparent',
            stroke: 'rgba(255,255,255,0.9)',
            strokeWidth: 3,
          }),
          createImageElement(
            `${id}-img`,
            TECH_IMG,
            centerX - 64,
            centerY - 64,
            128,
            128,
            {
              ...( { clipPath: 'circle(50% at 50% 50%)' } as any ),
            },
          ),
          createTextElement(`${id}-label`, item.label, centerX - 90, centerY + 80, 180, 22, {
            fontSize: 14,
            textAlign: 'center',
          }),
          createTextElement(`${id}-desc`, item.desc, centerX - 90, centerY + 104, 180, 40, {
            fontSize: 11,
            lineHeight: 1.4,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.9)',
          }),
        ] as Element[];
      }),
    ],
  };

  // 8. Metrics Dashboard
  const metricsSlide: Slide = {
    id: 'aa-metrics',
    background: GRADIENTS.BLUE_PURPLE,
    createdAt,
    elements: [
      createBlurBlob('md-blob-1', -60, 240, 260, COLORS.BLUE),
      createTextElement('md-title', 'Metrics Dashboard', 120, 70, 720, 40, {
        fontSize: 30,
        fontWeight: '600',
      }),
      createTextElement(
        'md-sub',
        'Platform-wide indicators over the last 30 days of production traffic.',
        120,
        106,
        720,
        26,
        {
          fontSize: 14,
          color: 'rgba(255,255,255,0.9)',
        },
      ),
      ...[
        { id: 'pred', label: 'Predictions / day', value: '10M+', desc: 'Streaming predictions across customers' },
        { id: 'lat', label: 'Real-time inference', value: '< 80ms', desc: 'Median end-to-end latency' },
        { id: 'acc', label: 'Accuracy', value: '94.6%', desc: 'Across key verticals' },
        { id: 'regions', label: 'Cloud regions', value: '5', desc: 'Fully scaled deployments' },
      ].flatMap((m, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const baseX = 100 + col * 360;
        const baseY = 140 + row * 160;
        const id = `md-${m.id}`;
        return [
          createShape(id, 'rounded-rectangle', baseX, baseY, 320, 130, {
            fill: 'linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))',
            stroke: 'rgba(255,255,255,0.55)',
            strokeWidth: 1.5,
            ...( { backdropFilter: 'blur(14px)' } as any ),
          }),
          createTextElement(`${id}-value`, m.value, baseX + 16, baseY + 26, 200, 32, {
            fontSize: 26,
            fontWeight: '600',
          }),
          createTextElement(`${id}-label`, m.label, baseX + 16, baseY + 60, 260, 22, {
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
          }),
          createTextElement(`${id}-desc`, m.desc, baseX + 16, baseY + 84, 280, 26, {
            fontSize: 12,
            color: 'rgba(255,255,255,0.8)',
          }),
        ] as Element[];
      }),
    ],
  };

  // 9. Innovations Timeline
  const timelineSlide: Slide = {
    id: 'aa-timeline',
    background: GRADIENTS.ORANGE_YELLOW,
    createdAt,
    elements: [
      createBlurBlob('tl-blob-1', 720, 220, 260, COLORS.BLUE),
      createTextElement('tl-title', 'Innovation Timeline', 120, 70, 720, 40, {
        fontSize: 30,
        fontWeight: '600',
      }),
      createTextElement(
        'tl-sub',
        'Milestones from first prototype to autonomous decisioning at scale.',
        120,
        104,
        720,
        26,
        {
          fontSize: 14,
          color: 'rgba(255,255,255,0.9)',
        },
      ),
      createShape('tl-line', 'rectangle', 120, 260, 720, 4, {
        fill: 'linear-gradient(90deg, #FF8C00, #1E90FF)',
        stroke: 'transparent',
      }),
      ...[
        { year: '2022', text: 'Founding & Proto Engine' },
        { year: '2023', text: 'Live AI Stream Engine' },
        { year: '2024', text: 'Enterprise Deployment' },
        { year: '2025', text: 'Autonomous Decisioning v2.0' },
      ].flatMap((item, index) => {
        const step = 720 / 3;
        const cx = 120 + index * step;
        const id = `tl-${index}`;
        return [
          createShape(`${id}-ring`, 'circle', cx - 14, 246, 28, 28, {
            fill: 'rgba(0,0,0,0.3)',
            stroke: 'rgba(255,255,255,0.9)',
            strokeWidth: 2,
          }),
          createTextElement(`${id}-year`, item.year, cx - 40, 282, 80, 22, {
            fontSize: 12,
            fontWeight: '600',
            textAlign: 'center',
          }),
          createTextElement(`${id}-text`, item.text, cx - 80, 304, 160, 40, {
            fontSize: 12,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
          }),
        ] as Element[];
      }),
    ],
  };

  // 10. Pricing / Comparison Table
  const pricingSlide: Slide = {
    id: 'aa-pricing',
    background: GRADIENTS.LIME_DEEP_BLUE,
    createdAt,
    elements: [
      createBlurBlob('pr-blob-1', -40, 260, 260, COLORS.LIME),
      createTextElement('pr-title', 'Pricing & Plans', 120, 70, 720, 40, {
        fontSize: 30,
        fontWeight: '600',
      }),
      {
        id: 'pr-table',
        type: 'table',
        x: 100,
        y: 120,
        width: 760,
        height: 260,
        rows: 6,
        cols: 4,
        tableData: [
          ['Plan', 'Starter', 'Growth', 'Enterprise'],
          ['API Calls / month', '1M', '25M', 'Custom, unlimited tiers'],
          ['Model Access', 'Core models', 'Core + advanced models', 'Private models & custom ensembles'],
          ['Real-Time Features', 'Single region', 'Multi-region streaming', 'Global multi-cloud streaming'],
          ['Support', 'Email, business hours', 'Priority support', '24/7 dedicated success team'],
          ['Customization', 'Standard config', 'Feature flags & tuning', 'Full pipeline customization'],
        ],
        header: true,
        headerBg: 'linear-gradient(135deg, #FF8C00, #FFD700)',
        headerTextColor: COLORS.WHITE,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        cellPadding: 10,
        cellTextAlign: 'center',
        rowAltBg: 'rgba(255,255,255,0.04)',
        color: COLORS.WHITE,
      } as Element,
      // Enterprise callout
      createShape('pr-enterprise', 'rounded-rectangle', 100, 400, 760, 80, {
        fill: 'rgba(0,0,0,0.35)',
        stroke: 'rgba(255,255,255,0.75)',
        strokeWidth: 1.5,
        ...( { backdropFilter: 'blur(14px)' } as any ),
      }),
      createTextElement(
        'pr-enterprise-text',
        'Enterprise: unlimited scale, dedicated success team, and custom SLAs – contact sales for tailored pricing.',
        120,
        420,
        720,
        40,
        {
          fontSize: 14,
          textAlign: 'center',
        },
      ),
    ],
  };

  // 11. Thank-You / Contact + QR
  const thankSlide: Slide = {
    id: 'aa-thankyou',
    background: GRADIENTS.FULL_SPECTRUM,
    createdAt,
    elements: [
      createBlurBlob('th-blob-1', -40, -40, 260, COLORS.RED),
      createBlurBlob('th-blob-2', 700, 260, 260, COLORS.BLUE),
      createShape('th-card', 'rounded-rectangle', 160, 130, 640, 240, {
        fill: 'rgba(0,0,0,0.28)',
        stroke: 'rgba(255,255,255,0.6)',
        strokeWidth: 1.5,
        ...( { backdropFilter: 'blur(18px)' } as any ),
      }),
      createTextElement('th-title', 'Thank You', 180, 160, 600, 50, {
        fontSize: 40,
        fontWeight: '600',
        textAlign: 'center',
      }),
      createTextElement(
        'th-sub',
        'Ready to see Actalyst AI in action? Scan to book a live demo.',
        200,
        212,
        560,
        30,
        {
          fontSize: 16,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.9)',
        },
      ),
      createShape('th-qr-ring', 'circle', 430, 240, 100, 100, {
        fill: 'transparent',
        stroke: 'rgba(255,255,255,0.95)',
        strokeWidth: 3,
      }),
      createShape('th-qr-inner', 'rectangle', 448, 258, 64, 64, {
        fill: 'rgba(0,0,0,0.6)',
        stroke: 'rgba(255,255,255,0.8)',
        strokeWidth: 1.5,
      }),
      createTextElement('th-qr-note', 'QR: actalyst.ai/demo', 340, 320, 280, 20, {
        fontSize: 12,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.9)',
      }),
      createTextElement(
        'th-contact',
        'Contact: hello@actalyst.ai  •  Website: actalyst.ai',
        220,
        360,
        520,
        24,
        {
          fontSize: 13,
          textAlign: 'center',
        },
      ),
      createTextElement(
        'th-social',
        'Follow: linkedin.com/company/actalyst-ai  •  @ActalystAI',
        220,
        388,
        520,
        24,
        {
          fontSize: 12,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.9)',
        },
      ),
    ],
  };

  return [
    titleSlide,
    agendaSlide,
    missionSlide,
    stackSlide,
    archSlide,
    perfSlide,
    useCaseSlide,
    metricsSlide,
    timelineSlide,
    pricingSlide,
    thankSlide,
  ];
};

export default createActalystAIPitchTemplate;
