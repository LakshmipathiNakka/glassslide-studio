import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

// Palette for Finance & Analytics dashboard deck
const COLORS = {
  GRAPHITE: '#232931',
  SLATE: '#393E46',
  TEAL: '#4ECCA3',
  SILVER: '#EEEEEE',
  WHITE: '#FFFFFF',
  TEXT_MUTED: '#A7ADB7',
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
  textColor: COLORS.SILVER,
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
  stroke: '#2F3640',
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

const createFinanceAnalyticsDashboardTemplate = (): Slide[] => {
  const createdAt = new Date();

  // 1. Title & Overview
  const titleSlide: Slide = {
    id: 'fin-title',
    background: COLORS.GRAPHITE,
    createdAt,
    elements: [
      createTextElement(
        't-header',
        'Finance & Analytics Report – Q4 Insights & Projections',
        80,
        150,
        800,
        60,
        {
          fontSize: 30,
          fontWeight: '600',
          color: COLORS.WHITE,
        },
      ),
      createTextElement(
        't-subheader',
        'Performance Review • Market Signals • Strategic Actions',
        80,
        205,
        800,
        30,
        {
          fontSize: 16,
          fontWeight: '500',
          color: COLORS.TEAL,
        },
      ),
      createShape('t-line', 'rectangle', 80, 242, 260, 3, {
        fill: COLORS.TEAL,
        stroke: 'transparent',
      }),
      createTextElement(
        't-body',
        'This report highlights key financial indicators, revenue behavior, cost movements, and forward-looking projections. The goal is to provide actionable insights that support data-driven decision-making.',
        80,
        260,
        800,
        80,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createTextElement(
        't-caption',
        'Prepared by: Finance & Analytics Division',
        80,
        350,
        400,
        24,
        {
          fontSize: 12,
          color: COLORS.TEXT_MUTED,
        },
      ),
    ],
  };

  // 2. Financial Highlights (Bar Chart)
  const highlightsSlide: Slide = {
    id: 'fin-highlights',
    background: COLORS.GRAPHITE,
    createdAt,
    elements: [
      createTextElement('fh-header', 'Key Financial Highlights', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.WHITE,
      }),
      createTextElement(
        'fh-body',
        'Overall quarterly performance remained stable with strong upside in subscription revenue and improved cost structures. Year-over-year metrics indicate sustained momentum across core business units.',
        80,
        96,
        800,
        60,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createTextElement('fh-callout1', '+14.8% YoY Revenue Growth', 80, 170, 260, 26, {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.TEAL,
      }),
      createTextElement('fh-callout2', 'Operating Margin Up by 3.2%', 80, 200, 260, 26, {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.TEAL,
      }),
      createTextElement('fh-callout3', 'Customer LTV Increased by 9.4%', 80, 228, 260, 26, {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.TEAL,
      }),
      createShape('fh-panel', 'rounded-rectangle', 380, 140, 500, 280, {
        fill: 'rgba(35,41,49,0.75)',
        stroke: 'rgba(255,255,255,0.06)',
        ...( {
          shadow: {
            color: 'rgba(0,0,0,0.35)',
            blur: 20,
            offsetX: 0,
            offsetY: 10,
          },
        } as any),
      }),
      createChart(
        'fh-chart',
        'bar',
        400,
        160,
        460,
        230,
        {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Revenue (M$)',
              data: [42, 46, 51, 57],
              backgroundColor: 'rgba(78,204,163,0.85)',
            },
            {
              label: 'Operating Margin %',
              data: [18.5, 19.1, 20.0, 21.7],
              type: 'line',
              borderColor: 'rgba(255,255,255,0.9)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              fill: true,
            },
          ],
        },
      ),
      createTextElement(
        'fh-caption',
        'Data Source: Internal Financial Analytics Engine',
        380,
        380,
        500,
        20,
        {
          fontSize: 11,
          color: COLORS.TEXT_MUTED,
          textAlign: 'right',
        },
      ),
    ],
  };

  // 3. Revenue Split (Pie Chart)
  const revenueSlide: Slide = {
    id: 'fin-revenue-split',
    background: COLORS.SLATE,
    createdAt,
    elements: [
      createTextElement('rs-header', 'Revenue Composition by Segment', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.WHITE,
      }),
      createTextElement(
        'rs-sub',
        'Understanding category-level contribution',
        80,
        92,
        800,
        24,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createShape('rs-panel', 'rounded-rectangle', 80, 130, 360, 300, {
        fill: 'rgba(35,41,49,0.8)',
        stroke: 'rgba(255,255,255,0.06)',
      }),
      createChart(
        'rs-pie',
        'pie',
        100,
        150,
        320,
        220,
        {
          labels: ['Subscription', 'Enterprise Solutions', 'Professional Services', 'Other'],
          datasets: [
            {
              data: [54, 28, 13, 5],
              backgroundColor: [
                'rgba(78,204,163,0.95)',
                'rgba(0,122,255,0.9)',
                'rgba(238,238,238,0.9)',
                'rgba(57,62,70,0.9)',
              ],
              borderColor: COLORS.GRAPHITE,
              borderWidth: 1,
            },
          ],
        },
      ),
      createTextElement(
        'rs-body',
        'Subscription services continue to dominate total revenue share, while enterprise solutions show accelerated adoption. Regional revenue exhibits balanced contribution across North America, APAC, and EMEA.',
        470,
        150,
        430,
        120,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createTextElement(
        'rs-footnote',
        'Values rounded to nearest whole number.',
        470,
        280,
        430,
        24,
        {
          fontSize: 11,
          color: COLORS.TEXT_MUTED,
        },
      ),
    ],
  };

  // 4. Cost Breakdown (Table)
  const costSlide: Slide = {
    id: 'fin-cost',
    background: COLORS.GRAPHITE,
    createdAt,
    elements: [
      createTextElement('c-header', 'Cost Structure Breakdown', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.WHITE,
      }),
      createTextElement(
        'c-body',
        'Operational efficiencies reduced overhead expenses, while R&D investment increased to support product innovation and AI-driven capabilities.',
        80,
        96,
        800,
        50,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      {
        id: 'c-table',
        type: 'table',
        x: 80,
        y: 150,
        width: 800,
        height: 320,
        rows: 6,
        cols: 3,
        header: true,
        headerBg: COLORS.SLATE,
        headerTextColor: COLORS.WHITE,
        cellPadding: 8,
        cellTextAlign: 'left',
        backgroundColor: 'rgba(37, 43, 51, 0.95)',
        rowAltBg: 'rgba(47, 54, 64, 0.9)',
        textColor: COLORS.SILVER,
        borderColor: COLORS.TEAL,
        borderWidth: 2,
        tableData: [
          ['Category', 'Cost (M$)', 'Notes'],
          ['Personnel Costs', '32.5', 'Compensation, benefits, variable incentive pool'],
          ['Infrastructure', '14.1', 'Cloud, hosting, network, office footprint'],
          ['Sales & Marketing', '11.3', 'Demand gen, field sales, brand spend'],
          ['R&D', '9.8', 'Product development and AI research'],
          ['Administrative', '4.6', 'G&A, legal, compliance'],
        ],
      } as Element,
      // Teal left accent bars per major cost row
      createShape('c-bar-personnel', 'rectangle', 80, 150 + 45 * 1 + 8, 4, 30, {
        fill: COLORS.TEAL,
        stroke: 'transparent',
      }),
      createShape('c-bar-infra', 'rectangle', 80, 150 + 45 * 2 + 8, 4, 30, {
        fill: COLORS.TEAL,
        stroke: 'transparent',
      }),
      createShape('c-bar-sm', 'rectangle', 80, 150 + 45 * 3 + 8, 4, 30, {
        fill: COLORS.TEAL,
        stroke: 'transparent',
      }),
      createShape('c-bar-rd', 'rectangle', 80, 150 + 45 * 4 + 8, 4, 30, {
        fill: COLORS.TEAL,
        stroke: 'transparent',
      }),
      createShape('c-bar-admin', 'rectangle', 80, 150 + 45 * 5 + 8, 4, 30, {
        fill: COLORS.TEAL,
        stroke: 'transparent',
      }),
    ],
  };

  // 5. Profit Growth Trend (Line Chart)
  const profitSlide: Slide = {
    id: 'fin-profit',
    background: COLORS.SLATE,
    createdAt,
    elements: [
      createTextElement('p-header', 'Profitability Trend – Last 12 Quarters', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.WHITE,
      }),
      createTextElement(
        'p-sub',
        'Consistent growth driven by recurring revenue and cost optimization.',
        80,
        92,
        800,
        24,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createShape('p-panel', 'rounded-rectangle', 80, 130, 800, 320, {
        fill: 'rgba(35,41,49,0.85)',
        stroke: 'rgba(255,255,255,0.06)',
      }),
      createChart(
        'p-chart',
        'line',
        110,
        160,
        740,
        260,
        {
          labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12'],
          datasets: [
            {
              label: 'Net Profit (M$)',
              data: [8.2, 8.5, 9.0, 9.6, 10.1, 10.8, 11.3, 12.0, 12.7, 13.2, 14.1, 14.9],
              borderColor: COLORS.TEAL,
              backgroundColor: 'rgba(78,204,163,0.22)',
              fill: true,
            },
            {
              label: 'Operating Profit (M$)',
              data: [10.5, 10.9, 11.4, 12.0, 12.8, 13.4, 14.0, 14.7, 15.3, 16.0, 16.8, 17.4],
              borderColor: 'rgba(255,255,255,0.85)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              fill: false,
            },
          ],
        },
      ),
      createTextElement('p-callout1', 'Strong Q3 Surge', 130, 180, 200, 22, {
        fontSize: 12,
        color: COLORS.TEAL,
      }),
      createTextElement('p-callout2', 'Stable QoQ Progression', 540, 340, 260, 22, {
        fontSize: 12,
        color: COLORS.TEXT_MUTED,
        textAlign: 'right',
      }),
    ],
  };

  // 6. KPI Cards
  const kpiSlide: Slide = {
    id: 'fin-kpis',
    background: COLORS.GRAPHITE,
    createdAt,
    elements: [
      createTextElement('k-header', 'Core KPIs – Snapshot', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.WHITE,
      }),
      ...[
        { label: 'Customer Retention', value: '74%', insight: 'Sustained pipeline quality boosted retention and reduced churn.' },
        { label: 'ARPU', value: '$118.30', insight: 'Upsell and cross-sell motions lifted per-account value.' },
        { label: 'CAC', value: '↓ 7%', insight: 'Improved acquisition efficiency across digital channels.' },
        { label: 'Churn Rate', value: '3.1%', insight: 'Ongoing CX initiatives reduced logo churn.' },
      ].flatMap((kpi, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const baseX = 80 + col * 400;
        const baseY = 120 + row * 150;
        const id = `k-${index}`;
        return [
          createShape(id, 'rounded-rectangle', baseX, baseY, 360, 120, {
            fill: 'rgba(35,41,49,0.9)',
            stroke: COLORS.TEAL,
            strokeWidth: 1.3,
            ...( {
              shadow: {
                color: 'rgba(0,0,0,0.35)',
                blur: 18,
                offsetX: 0,
                offsetY: 10,
              },
            } as any),
          }),
          createTextElement(`${id}-value`, kpi.value, baseX + 18, baseY + 26, 150, 28, {
            fontSize: 24,
            fontWeight: '600',
            color: COLORS.TEAL,
          }),
          createTextElement(`${id}-label`, kpi.label, baseX + 18, baseY + 56, 200, 20, {
            fontSize: 13,
            textColor: COLORS.SILVER,
          }),
          createTextElement(`${id}-insight`, kpi.insight, baseX + 18, baseY + 78, 320, 32, {
            fontSize: 11,
            color: COLORS.TEXT_MUTED,
          }),
        ] as Element[];
      }),
    ],
  };

  // 7. Market Comparison
  const marketSlide: Slide = {
    id: 'fin-market',
    background: COLORS.SLATE,
    createdAt,
    elements: [
      createTextElement('m-header', 'Market Position vs Competitors', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.WHITE,
      }),
      createTextElement(
        'm-body',
        'Our cost-efficiency ratio remains stronger than peers, while our multi-region expansion strategy enabled better operational leverage.',
        80,
        96,
        800,
        44,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createShape('m-bars', 'rounded-rectangle', 80, 150, 520, 260, {
        fill: 'rgba(35,41,49,0.85)',
        stroke: 'rgba(255,255,255,0.06)',
      }),
      ...[
        { label: 'Market Share', ours: 28, peer: 19 },
        { label: 'Growth Rate', ours: 18, peer: 11 },
        { label: 'Average Deal Size', ours: 140, peer: 110 },
        { label: 'Profit Margin', ours: 22, peer: 16 },
      ].flatMap((metric, index) => {
        const baseY = 170 + index * 55;
        const id = `m-${index}`;
        return [
          createTextElement(`${id}-label`, metric.label, 100, baseY, 160, 20, {
            fontSize: 12,
            textColor: COLORS.SILVER,
          }),
          createShape(`${id}-ours-bg`, 'rectangle', 270, baseY + 4, 200, 10, {
            fill: 'rgba(255,255,255,0.08)',
            stroke: 'transparent',
          }),
          createShape(`${id}-ours`, 'rectangle', 270, baseY + 4, 2 * metric.ours, 10, {
            fill: COLORS.TEAL,
            stroke: 'transparent',
          }),
          createShape(`${id}-peer`, 'rectangle', 270, baseY + 19, 2 * metric.peer, 6, {
            fill: 'rgba(255,255,255,0.4)',
            stroke: 'transparent',
          }),
        ] as Element[];
      }),
      createShape('m-map-panel', 'rounded-rectangle', 630, 150, 250, 260, {
        fill: 'rgba(35,41,49,0.9)',
        stroke: 'rgba(255,255,255,0.06)',
      }),
      createTextElement('m-map-header', 'Regional Focus', 650, 166, 210, 20, {
        fontSize: 13,
        fontWeight: '500',
      }),
      createTextElement('m-map-na', 'NA: Strong enterprise renewals', 650, 190, 210, 18, {
        fontSize: 11,
        color: COLORS.TEXT_MUTED,
      }),
      createTextElement('m-map-eu', 'EU: Margin improvement from scale', 650, 212, 210, 18, {
        fontSize: 11,
        color: COLORS.TEXT_MUTED,
      }),
      createTextElement('m-map-apac', 'APAC: Fastest pipeline growth', 650, 234, 210, 18, {
        fontSize: 11,
        color: COLORS.TEXT_MUTED,
      }),
    ],
  };

  // 8. Forecast Visualization
  const forecastSlide: Slide = {
    id: 'fin-forecast',
    background: COLORS.GRAPHITE,
    createdAt,
    elements: [
      createTextElement('f-header', 'Forward-Looking Forecast – FY Outlook', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.WHITE,
      }),
      createTextElement(
        'f-sub',
        'Projected demand, risk factors, and expected revenue trajectory',
        80,
        92,
        800,
        24,
        {
          fontSize: 14,
          color: COLORS.TEAL,
        },
      ),
      createTextElement(
        'f-body',
        'The forecast model incorporates historical volatility, macroeconomic indicators, customer cohorts, and product adoption probabilities.',
        80,
        120,
        800,
        44,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createShape('f-panel', 'rounded-rectangle', 80, 170, 800, 280, {
        fill: 'rgba(35,41,49,0.9)',
        stroke: 'rgba(255,255,255,0.06)',
      }),
      createChart(
        'f-chart',
        'line',
        110,
        190,
        740,
        220,
        {
          labels: ['FY24', 'FY25', 'FY26', 'FY27'],
          datasets: [
            {
              label: 'Revenue Forecast (M$)',
              data: [220, 246, 275, 310],
              borderColor: COLORS.TEAL,
              backgroundColor: 'rgba(78,204,163,0.22)',
              fill: true,
            },
          ],
        },
      ),
      createTextElement(
        'f-callout',
        'Expected YoY growth range: 11% – 16%',
        500,
        190,
        350,
        36,
        {
          fontSize: 14,
          fontWeight: '500',
          color: COLORS.WHITE,
          textAlign: 'right',
        },
      ),
    ],
  };

  // 9. Summary Graphs
  const summarySlide: Slide = {
    id: 'fin-summary',
    background: COLORS.SLATE,
    createdAt,
    elements: [
      createTextElement('s-header', 'Unified View – Consolidated Analytics', 80, 60, 800, 32, {
        fontSize: 22,
        fontWeight: '600',
        color: COLORS.WHITE,
      }),
      createShape('s-panel-cost', 'rounded-rectangle', 80, 120, 380, 180, {
        fill: 'rgba(35,41,49,0.9)',
        stroke: 'rgba(255,255,255,0.06)',
      }),
      createTextElement('s-cost-title', 'Cost Movements', 100, 136, 340, 20, {
        fontSize: 14,
        fontWeight: '500',
      }),
      ...[
        { label: 'Infra', value: 18 },
        { label: 'People', value: 32 },
        { label: 'S&M', value: 24 },
        { label: 'R&D', value: 26 },
      ].map((item, index) => {
        const y = 164 + index * 30;
        const id = `s-cost-${index}`;
        return [
          createTextElement(`${id}-label`, item.label, 100, y, 70, 18, {
            fontSize: 11,
            color: COLORS.TEXT_MUTED,
          }),
          createShape(`${id}-bar-bg`, 'rectangle', 170, y + 4, 260, 10, {
            fill: 'rgba(255,255,255,0.06)',
            stroke: 'transparent',
          }),
          createShape(`${id}-bar`, 'rectangle', 170, y + 4, item.value * 5, 10, {
            fill: COLORS.TEAL,
            stroke: 'transparent',
          }),
        ] as Element[];
      }).flat(),
      createShape('s-panel-rev', 'rounded-rectangle', 480, 120, 400, 120, {
        fill: 'rgba(35,41,49,0.9)',
        stroke: 'rgba(255,255,255,0.06)',
      }),
      createTextElement('s-rev-title', 'Revenue vs Forecast', 500, 136, 360, 20, {
        fontSize: 14,
        fontWeight: '500',
      }),
      createChart(
        's-rev-chart',
        'line',
        500,
        156,
        360,
        70,
        {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Actual',
              data: [52, 55, 58, 60],
              borderColor: COLORS.TEAL,
              backgroundColor: 'rgba(78,204,163,0.18)',
              fill: true,
            },
            {
              label: 'Forecast',
              data: [51, 54, 57, 59],
              borderColor: 'rgba(255,255,255,0.7)',
              backgroundColor: 'rgba(255,255,255,0.02)',
              fill: false,
            },
          ],
        },
      ),
      createShape('s-panel-retention', 'rounded-rectangle', 480, 250, 400, 120, {
        fill: 'rgba(35,41,49,0.9)',
        stroke: 'rgba(255,255,255,0.06)',
      }),
      createTextElement('s-ret-title', 'Retention & Renewals', 500, 266, 360, 20, {
        fontSize: 14,
        fontWeight: '500',
      }),
      // Percent bars
      createTextElement('s-ret-saas-label', 'SaaS Retention', 500, 292, 160, 18, {
        fontSize: 11,
        color: COLORS.TEXT_MUTED,
      }),
      createShape('s-ret-saas-bg', 'rectangle', 640, 296, 200, 10, {
        fill: 'rgba(255,255,255,0.06)',
        stroke: 'transparent',
      }),
      createShape('s-ret-saas-bar', 'rectangle', 640, 296, 0.82 * 200, 10, {
        fill: COLORS.TEAL,
        stroke: 'transparent',
      }),
      createTextElement('s-ret-saas-val', '82%', 850, 290, 40, 18, {
        fontSize: 12,
        textColor: COLORS.SILVER,
      }),
      createTextElement('s-ret-ent-label', 'Enterprise Renewal', 500, 318, 160, 18, {
        fontSize: 11,
        color: COLORS.TEXT_MUTED,
      }),
      createShape('s-ret-ent-bg', 'rectangle', 640, 322, 200, 10, {
        fill: 'rgba(255,255,255,0.06)',
        stroke: 'transparent',
      }),
      createShape('s-ret-ent-bar', 'rectangle', 640, 322, 0.69 * 200, 10, {
        fill: COLORS.TEAL,
        stroke: 'transparent',
      }),
      createTextElement('s-ret-ent-val', '69%', 850, 316, 40, 18, {
        fontSize: 12,
        textColor: COLORS.SILVER,
      }),
      createTextElement(
        's-callout',
        'Strong unit economics continue to drive sustainable scale.',
        80,
        390,
        800,
        24,
        {
          fontSize: 13,
          color: COLORS.TEXT_MUTED,
        },
      ),
    ],
  };

  // 10. Closing
  const closingSlide: Slide = {
    id: 'fin-closing',
    background: COLORS.SLATE,
    createdAt,
    elements: [
      createTextElement('cl-header', 'Thank You', 80, 160, 800, 50, {
        fontSize: 30,
        fontWeight: '600',
        color: COLORS.WHITE,
        textAlign: 'left',
      }),
      createTextElement(
        'cl-sub',
        'For More Insights or Extended Analytics Access',
        80,
        205,
        600,
        26,
        {
          fontSize: 16,
          color: COLORS.TEAL,
        },
      ),
      createTextElement(
        'cl-body',
        'Our advanced analytics teams continue to refine forecasting models and expand data coverage. Please contact us for tailored reports or deeper financial intelligence.',
        80,
        240,
        520,
        70,
        {
          fontSize: 14,
          color: COLORS.TEXT_MUTED,
        },
      ),
      createShape('cl-contact-card', 'rounded-rectangle', 80, 320, 400, 130, {
        fill: 'rgba(35,41,49,0.9)',
        stroke: 'rgba(255,255,255,0.08)',
      }),
      createTextElement('cl-name', 'Name: Finance Analytics Lead', 100, 340, 360, 20, {
        fontSize: 13,
      }),
      createTextElement('cl-dept', 'Department: Finance & Strategy', 100, 362, 360, 20, {
        fontSize: 13,
        color: COLORS.TEXT_MUTED,
      }),
      createTextElement('cl-email', 'Email: analytics@company.com', 100, 384, 360, 20, {
        fontSize: 13,
        color: COLORS.TEXT_MUTED,
      }),
      createShape('cl-qr', 'rounded-rectangle', 520, 320, 120, 120, {
        fill: COLORS.GRAPHITE,
        stroke: COLORS.TEAL,
        strokeWidth: 2,
      }),
      createTextElement('cl-qr-note', 'Scan for full analytics workspace', 520, 446, 200, 18, {
        fontSize: 11,
        color: COLORS.TEXT_MUTED,
      }),
    ],
  };

  return [
    titleSlide,
    highlightsSlide,
    revenueSlide,
    costSlide,
    profitSlide,
    kpiSlide,
    marketSlide,
    forecastSlide,
    summarySlide,
    closingSlide,
  ];
};

export default createFinanceAnalyticsDashboardTemplate;
