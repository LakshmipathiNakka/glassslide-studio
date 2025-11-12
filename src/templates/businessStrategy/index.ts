import type { Slide } from '@/types/slide-thumbnails';
import type { Element } from '@/hooks/use-action-manager';
import config from './businessStrategyTemplate.json';

// Helpers for 16:9 grid (W=960, H=540)
const W = 960, H = 540, M = 50;
const contentW = W - 2 * M; // 860
const colW = Math.floor(contentW / 12); // 71
const col = (n: number) => M + n * colW;
const span = (n: number) => n * colW;

function textEl(p: Partial<Element> & { id: string; x: number; y: number; width: number; height: number; text: string }): Element {
  return {
    id: p.id,
    type: 'text',
    x: p.x, y: p.y, width: p.width, height: p.height,
    text: p.text,
    fontFamily: p.fontFamily || 'Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontWeight: (p as any).fontWeight || '500',
    fontSize: (p as any).fontSize || 18,
    letterSpacing: (p as any).letterSpacing || 0,
    lineHeight: (p as any).lineHeight || 1.3,
    textAlign: (p as any).textAlign || 'left',
    color: (p as any).color || '#0A2540',
    opacity: (p as any).opacity ?? 1,
    rotation: (p as any).rotation || 0,
    // Properties panel-friendly extras
    padding: (p as any).padding ?? 8,
    verticalAlign: (p as any).verticalAlign || 'top',
  } as Element;
}

function shapeEl(p: { id: string; x: number; y: number; width: number; height: number; fill?: string; stroke?: string; strokeWidth?: number; shapeType?: string; borderRadius?: number; opacity?: number }): Element {
  return {
    id: p.id,
    type: 'shape',
    x: p.x, y: p.y, width: p.width, height: p.height,
    shapeType: (p as any).shapeType || 'rectangle',
    fill: p.fill || '#FFFFFF',
    stroke: p.stroke || '#EAEAEA',
    strokeWidth: p.strokeWidth ?? 1,
    borderRadius: (p as any).borderRadius || 0,
    opacity: p.opacity ?? 1,
  } as unknown as Element;
}

function chartBarEl(id: string, x: number, y: number, width: number, height: number, labels: string[], values: number[], color: string, hideGrid = true): Element {
  return {
    id, type: 'chart', chartType: 'bar', x, y, width, height,
    chartData: {
      title: '', labels,
      datasets: [{ label: 'Series', data: values, backgroundColor: color, borderColor: color, borderRadius: 6 }],
      axes: hideGrid ? { x: { grid: { display: false }}, y: { grid: { display: false }}} : undefined
    }
  } as unknown as Element;
}

function chartPieEl(id: string, x: number, y: number, width: number, height: number, labels: string[], values: number[], colors: string[]): Element {
  return {
    id, type: 'chart', chartType: 'pie', x, y, width, height,
    chartData: {
      title: '', labels,
      datasets: [{ label: 'Share', data: values, backgroundColor: colors, borderColor: '#FFFFFF' }],
      // doughnut style
      innerRadius: 0.5,
      legend: { position: 'bottom' }
    }
  } as unknown as Element;
}

function imageEl(p: { id: string; x: number; y: number; width: number; height: number; imageUrl?: string; borderRadius?: number; opacity?: number }): Element {
  return {
    id: p.id,
    type: 'image',
    x: p.x, y: p.y, width: p.width, height: p.height,
    imageUrl: p.imageUrl || '',
    borderRadius: (p as any).borderRadius || 0,
    opacity: p.opacity ?? 1,
  } as unknown as Element;
}

function tableEl(id: string, x: number, y: number, width: number, height: number, headers: string[], rows: string[][], opts?: { headerBg?: string; headerText?: string; rowAlt?: string; border?: string; color?: string }): Element {
  return {
    id, type: 'table', x, y, width, height,
    rows: Math.max(1, rows.length + 1),
    cols: Math.max(1, headers.length),
    tableData: [headers, ...rows],
    header: true,
    headerBg: opts?.headerBg || '#EAEAEA',
    headerTextColor: opts?.headerText || '#0A2540',
    borderWidth: 1,
    borderColor: opts?.border || '#EAEAEA',
    backgroundColor: '#FFFFFF',
    color: opts?.color || '#0A2540',
    rowAltBg: opts?.rowAlt || '#F7F7F7',
    cellPadding: 12,
    cellTextAlign: 'left'
  } as unknown as Element;
}

export function buildBusinessStrategySlides(): Slide[] {
  const slides: Slide[] = [];
  const now = Date.now();

  const palette = { primary: '#0A2540', accent: '#00BFA6', light: '#EAEAEA', white: '#FFFFFF' };
  const heading = 'Poppins, Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  const body = 'Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

// 1 Cover
  slides.push({
    id: `bs-${now}-1`,
    elements: [
      // Optional centered logo placeholder (user can replace via properties panel)
      imageEl({ id: 'bs-logo', x: Math.round((W - 180) / 2), y: 90, width: 180, height: 100, imageUrl: '', borderRadius: 8 }),
      textEl({ id: 'bs-title', x: col(1), y: 200, width: span(10), height: 60, text: 'Business Strategy', fontFamily: heading, fontWeight: '600' as any, fontSize: 48, color: '#FFFFFF', letterSpacing: 0.5, lineHeight: 1.2, textAlign: 'center' as any, verticalAlign: 'center' as any }),
      textEl({ id: 'bs-tagline', x: col(1), y: 270, width: span(10), height: 40, text: 'Your Tagline Here', fontFamily: heading, fontWeight: '600' as any, fontSize: 36, color: '#00BFA6', letterSpacing: 1, textAlign: 'center' as any }),
      textEl({ id: 'bs-subtext', x: col(1), y: 315, width: span(10), height: 30, text: 'Q4 Business Review 2025', fontFamily: body, fontSize: 16, color: '#EAEAEA', textAlign: 'center' as any, opacity: 0.9 }),
      // Bottom accent bar
      shapeEl({ id: 'bs-acc-bar', x: col(1), y: H - 24, width: span(10), height: 4, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 })
    ],
    background: palette.primary,
    createdAt: new Date(), lastUpdated: Date.now()
  });

// 2 Agenda
  slides.push({
    id: `bs-${now}-2`,
    elements: [
      textEl({ id: 'ag-title', x: col(1), y: M, width: span(6), height: 50, text: 'Agenda', fontFamily: heading, fontWeight: '600' as any, fontSize: 42, color: palette.primary }),
      // Bulleted list with aqua dots
      ...['Introduction','Market Insights','Financial Summary','SWOT Analysis','Roadmap'].flatMap((txt, i) => {
        const y = 130 + i * 34;
        return [
          shapeEl({ id: `ag-dot-${i}`, x: col(1), y: y + 8, width: 12, height: 12, shapeType: 'circle', fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
          textEl({ id: `ag-item-${i}`, x: col(1) + 20, y, width: span(9), height: 26, text: txt, fontFamily: body, fontSize: 20, color: palette.primary, lineHeight: 1.5 })
        ];
      })
    ],
    background: palette.white,
    createdAt: new Date(), lastUpdated: Date.now()
  });

// 3 Mission & Vision (two-column)
  slides.push({
    id: `bs-${now}-3`,
    elements: [
      textEl({ id: 'mv-h1', x: col(1), y: M, width: span(4), height: 40, text: 'Mission', fontFamily: heading, fontWeight: '600' as any, fontSize: 32, color: palette.primary, letterSpacing: 0.5, lineHeight: 1.2 }),
      shapeEl({ id: 'mv-uline1', x: col(1), y: M + 38, width: span(2), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      textEl({ id: 'mv-b1', x: col(1), y: 120, width: span(5), height: 280, text: 'Our mission is to drive innovation and deliver excellence.', fontFamily: body, fontSize: 18, color: '#4B5563', lineHeight: 1.5 }),

      // Divider line between columns
      shapeEl({ id: 'mv-divider', x: col(6), y: 120, width: 1, height: 280, fill: '#EAEAEA', stroke: '#EAEAEA', strokeWidth: 1 }),

      textEl({ id: 'mv-h2', x: col(7), y: M, width: span(4), height: 40, text: 'Vision', fontFamily: heading, fontWeight: '600' as any, fontSize: 32, color: palette.primary, letterSpacing: 0.5, lineHeight: 1.2 }),
      shapeEl({ id: 'mv-uline2', x: col(7), y: M + 38, width: span(2), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      textEl({ id: 'mv-b2', x: col(7), y: 120, width: span(5), height: 280, text: 'Our vision is to become a global leader in sustainable growth.', fontFamily: body, fontSize: 18, color: '#4B5563', lineHeight: 1.5 })
    ],
    background: palette.white,
    createdAt: new Date(), lastUpdated: Date.now()
  });

// 4 Market Overview (bar)
  slides.push({
    id: `bs-${now}-4`,
    elements: [
      textEl({ id: 'mo-title', x: col(1), y: M, width: span(8), height: 40, text: 'Market Overview', fontFamily: heading, fontWeight: '600' as any, fontSize: 32, color: palette.primary }),
      shapeEl({ id: 'mo-uline', x: col(1), y: M + 38, width: span(2), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      {
        id: 'mo-chart', type: 'chart', chartType: 'bar', x: col(1), y: 120, width: span(10), height: 320,
        chartData: {
          title: 'Segments', labels: ['Q1','Q2','Q3','Q4'],
          datasets: [{ label: 'Share', data: [25,40,35,50], backgroundColor: palette.accent, borderColor: palette.accent, borderRadius: 4 }],
          axes: { x: { grid: { display: true, color: '#EAEAEA' }, ticks: { color: '#0A2540' }}, y: { grid: { display: true, color: '#EAEAEA' }, ticks: { color: '#0A2540' }}},
          legend: { position: 'bottom' },
          dataLabels: { display: true, color: '#0A2540', font: { size: 12 } }
        }
      } as unknown as Element
    ],
    background: palette.white,
    createdAt: new Date(), lastUpdated: Date.now()
  });

  // 5 Financial Summary (table)
  slides.push({
    id: `bs-${now}-5`,
    elements: [
      textEl({ id: 'fs-title', x: col(1), y: M, width: span(8), height: 40, text: 'Financial Summary', fontFamily: heading, fontWeight: '600' as any, fontSize: 32 }),
      shapeEl({ id: 'fs-uline', x: col(1), y: M + 38, width: span(2), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      tableEl('fs-table', col(1), 120, span(10), 300, ['Quarter','Revenue','Profit'], [
        ['Q1','$1.2M','$0.3M'],
        ['Q2','$1.5M','$0.5M'],
        ['Q3','$1.8M','$0.7M'],
        ['Q4','$2.2M','$0.9M']
      ], { headerBg: palette.light, headerText: palette.primary, rowAlt: '#F7F7F7', border: palette.light, color: palette.primary })
    ],
    background: palette.white,
    createdAt: new Date(), lastUpdated: Date.now()
  });

  // 6 SWOT (2x2)
  const swLabels = ['Strengths','Weaknesses','Opportunities','Threats'];
  slides.push({
    id: `bs-${now}-6`,
    elements: [
      textEl({ id: 'sw-title', x: col(1), y: M, width: span(6), height: 40, text: 'SWOT Analysis', fontFamily: heading, fontWeight: '600' as any, fontSize: 32 }),
      shapeEl({ id: 'sw-uline', x: col(1), y: M + 38, width: span(2), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      // grid cards
      ...[0,1,2,3].flatMap((i) => {
        const row = Math.floor(i / 2);
        const colIdx = i % 2;
        const x = col(1) + colIdx * (span(5) + colW);
        const y = 120 + row * 160;
        return [
          shapeEl({ id: `sw-card-${i}`, x, y, width: span(5), height: 140, fill: '#FFFFFF', stroke: palette.light, strokeWidth: 1, borderRadius: 8 }),
          textEl({ id: `sw-text-${i}`, x: x + 12, y: y + 12, width: span(5) - 24, height: 116, text: swLabels[i], fontFamily: heading, fontWeight: '600' as any, fontSize: 20, color: palette.primary })
        ];
      })
    ],
    background: palette.white,
    createdAt: new Date(), lastUpdated: Date.now()
  });

// 7 Team Profiles (optional images)
  const team = [
    { name: 'John Smith', role: 'CEO' },
    { name: 'Sara Lee', role: 'CFO' },
    { name: 'Ravi Patel', role: 'CTO' }
  ];
  slides.push({
    id: `bs-${now}-7`,
    elements: [
      textEl({ id: 'tm-title', x: col(1), y: M, width: span(6), height: 40, text: 'Team', fontFamily: heading, fontWeight: '600' as any, fontSize: 32, color: palette.primary }),
      shapeEl({ id: 'tm-uline', x: col(1), y: M + 38, width: span(2), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      ...team.flatMap((m, i) => {
        const x = col(1) + i * (span(3) + colW);
        const y = 140;
        return [
          shapeEl({ id: `tm-card-${i}`, x, y, width: span(3), height: 240, fill: '#FFFFFF', stroke: palette.light, strokeWidth: 1, borderRadius: 8 }),
          // circular image placeholder
          imageEl({ id: `tm-img-${i}`, x: x + Math.floor((span(3) - 120) / 2), y: y + 16, width: 120, height: 120, imageUrl: '', borderRadius: 60 }),
          textEl({ id: `tm-name-${i}`, x: x + 12, y: y + 144, width: span(3) - 24, height: 26, text: m.name, fontFamily: heading, fontWeight: '600' as any, fontSize: 20, color: palette.primary, textAlign: 'center' as any }),
          textEl({ id: `tm-role-${i}`, x: x + 12, y: y + 174, width: span(3) - 24, height: 22, text: m.role, fontFamily: body, fontSize: 16, color: '#6B7280', textAlign: 'center' as any }),
          // accent bottom border
          shapeEl({ id: `tm-accent-${i}`, x, y: y + 240, width: span(3), height: 4, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 })
        ];
      })
    ],
    background: palette.white,
    createdAt: new Date(), lastUpdated: Date.now()
  });

// 8 Roadmap (timeline)
  const milestones = ['Q1 — Launch MVP','Q2 — Expand to EU Market','Q3 — New Product Line','Q4 — IPO Readiness'];
  slides.push({
    id: `bs-${now}-8`,
    elements: [
      textEl({ id: 'rm-title', x: col(1), y: M, width: span(8), height: 40, text: 'Roadmap', fontFamily: heading, fontWeight: '600' as any, fontSize: 32, color: palette.primary }),
      shapeEl({ id: 'rm-uline', x: col(1), y: M + 38, width: span(2), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      shapeEl({ id: 'rm-line', x: col(1), y: 260, width: span(10), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      ...[0,1,2,3].flatMap((i) => {
        const cx = col(2) + i * span(2.5);
        return [
          // Node: white fill, aqua border
          shapeEl({ id: `rm-dot-${i}`, x: cx, y: 252, width: 16, height: 16, shapeType: 'circle', fill: '#FFFFFF', stroke: palette.accent, strokeWidth: 2 }),
          textEl({ id: `rm-lbl-${i}`, x: cx - 80, y: 280, width: 160, height: 24, text: milestones[i], fontFamily: body, fontSize: 16, color: palette.primary, textAlign: 'center' as any }),
          textEl({ id: `rm-desc-${i}`, x: cx - 100, y: 304, width: 200, height: 20, text: '', fontFamily: body, fontSize: 14, color: '#6B7280', textAlign: 'center' as any })
        ];
      })
    ],
    background: palette.white,
    createdAt: new Date(), lastUpdated: Date.now()
  });

  // 9 KPI Dashboard (cards + charts)
  // Compute pixel-perfect card layout within a 10-column row starting at col(1)
  const ROW_X = col(1);
  const ROW_W = span(10);
  const GAP_PX = Math.floor(colW * 0.5); // ~35px gap
  const CARD_W_PX = Math.floor((ROW_W - 3 * GAP_PX) / 4);
  slides.push({
    id: `bs-${now}-9`,
    elements: [
      textEl({ id: 'kpi-title', x: ROW_X, y: M, width: span(6), height: 40, text: 'KPI Dashboard', fontFamily: heading, fontWeight: '600' as any, fontSize: 32, color: palette.primary }),
      shapeEl({ id: 'kpi-uline', x: ROW_X, y: M + 38, width: span(2), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      // four metric cards with icon (pixel-calculated to guarantee fit)
      ...[['Sales Growth','22%'],['Retention','89%'],['ROI','15%'],['Brand Awareness','73%']].flatMap((pair, i) => {
        const x = ROW_X + i * (CARD_W_PX + GAP_PX);
        const y = 120;
        return [
          shapeEl({ id: `kpi-card-${i}`, x, y, width: CARD_W_PX, height: 140, fill: '#FFFFFF', stroke: palette.light, strokeWidth: 1, borderRadius: 8 }),
          // icon circle
          shapeEl({ id: `kpi-ico-${i}`, x: x + 12, y: y + 12, width: 40, height: 40, shapeType: 'circle', fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
          textEl({ id: `kpi-val-${i}`, x: x + 60, y: y + 12, width: CARD_W_PX - 72, height: 36, text: pair[1] as string, fontFamily: heading, fontWeight: '600' as any, fontSize: 32, color: palette.primary }),
          textEl({ id: `kpi-lbl-${i}`, x: x + 60, y: y + 54, width: CARD_W_PX - 72, height: 22, text: pair[0], fontFamily: body, fontSize: 16, color: '#6B7280' })
        ];
      }),
      // chart zone (bar + pie)
      {
        id: 'kpi-bar', type: 'chart', chartType: 'bar', x: ROW_X, y: 280, width: Math.floor(ROW_W * 0.5) - GAP_PX / 2, height: 170,
        chartData: {
          title: 'Weekly', labels: ['W1','W2','W3','W4'],
          datasets: [{ label: 'Assignments', data: [120,140,160,180], backgroundColor: palette.accent, borderColor: palette.accent, borderRadius: 6 }],
          axes: { x: { grid: { display: true, color: '#EAEAEA' }}, y: { grid: { display: true, color: '#EAEAEA' }}},
          legend: { position: 'bottom' }
        }
      } as unknown as Element,
      chartPieEl('kpi-pie', ROW_X + Math.floor(ROW_W * 0.5) + Math.floor(GAP_PX / 2), 280, Math.floor(ROW_W * 0.5) - GAP_PX / 2, 170, ['NA','EU','AS'], [40,30,30], ['#00BFA6','#0A2540','#A8A8A8'])
    ],
    background: palette.white,
    createdAt: new Date(), lastUpdated: Date.now()
  });

// 10 Thank You
  slides.push({
    id: `bs-${now}-10`,
    elements: [
      textEl({ id: 'ty-title', x: col(1), y: 200, width: span(10), height: 80, text: 'Thank You!', fontFamily: heading, fontWeight: '800' as any, fontSize: 48, color: '#FFFFFF', textAlign: 'center' as any }),
      shapeEl({ id: 'ty-uline', x: col(5), y: 250, width: span(2), height: 2, fill: palette.accent, stroke: palette.accent, strokeWidth: 0 }),
      textEl({ id: 'ty-sub', x: col(3), y: 270, width: span(6), height: 40, text: 'contact@yourcompany.com', fontFamily: body, fontSize: 18, color: '#EAEAEA', textAlign: 'center' as any })
    ],
    background: '#0A2540',
    createdAt: new Date(), lastUpdated: Date.now()
  });

  return slides;
}

export default buildBusinessStrategySlides;
