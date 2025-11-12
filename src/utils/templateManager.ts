import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';
import { generateElementsForLayout, CanvasSize } from '@/utils/layoutApply';

export interface PromptBranding {
  primaryColor: string;
  accentColor: string;
  neutralColor: string;
  textColor: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
}

export interface PromptChart {
  type: 'bar' | 'line' | 'pie';
  data: { labels: string[]; datasets: Array<{ label?: string; data: number[]; color?: string }>; };
  options?: any;
}

export interface PromptTable {
  style?: 'striped' | 'classic';
  headers: string[];
  rows: string[][];
}

export interface PromptSlide {
  id: string;
  title?: string;
  layout: string;
  content: any;
}

export interface TemplatePrompt {
  templateId: string;
  templateName: string;
  description?: string;
  branding: PromptBranding;
  generationRules?: any;
  slides: PromptSlide[];
}

const CANVAS: CanvasSize = { width: 960, height: 540 };
const MARGIN = Math.round(CANVAS.width * 0.05); // ~5%
const GRID = 8;
const snap = (n: number) => Math.round(n / GRID) * GRID;

function mapLayoutId(requested: string, content: any): string {
  // Override by content type where helpful
  if (content?.timeline) return 'timeline-horizontal';

  const map: Record<string, string> = {
    'section-header': 'title-center-subtitle',
    'two-content': 'two-column-text',
    'title-body': 'title-content-classic',
    'table': 'table-zebra',
    'title-only': 'title-only-left',
    'table-chart-combo': 'title-content-classic',
  };
  return map[requested] || requested;
}

function setBrandText(el: Element, branding: PromptBranding, isHeading = false): Element {
  if (el.type !== 'text') return el;
  return {
    ...el,
    fontFamily: isHeading ? `${branding.fontFamilyHeading}, Inter, system-ui, sans-serif` : `${branding.fontFamilyBody}, system-ui, sans-serif`,
    color: isHeading ? branding.primaryColor : '#3A3A3C',
  };
}

function applyHeadline(elements: Element[], branding: PromptBranding, headline?: string, sub?: string, center?: boolean) {
  const texts = elements.filter(e => e.type === 'text');
  if (texts[0] && headline) {
    texts[0].text = headline;
    texts[0] = setBrandText(texts[0], branding, true);
    if (center) texts[0].textAlign = 'center';
    texts[0].fontSize = Math.max(36, texts[0].fontSize || 36);
  }
  if (texts[1] && sub) {
    texts[1].text = sub;
    texts[1] = setBrandText(texts[1], branding, false);
    if (center) texts[1].textAlign = 'center';
    texts[1].fontSize = Math.max(18, texts[1].fontSize || 20);
  }
}

function injectChart(elements: Element[], branding: PromptBranding, chart: PromptChart) {
  let el = elements.find(e => e.type === 'chart');
  if (!el) {
    // Create a new chart box in the center area
    el = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      x: snap(MARGIN),
      y: snap(140),
      width: snap(CANVAS.width - 2 * MARGIN),
      height: snap(280),
      chartType: chart.type,
      chartData: { labels: [], datasets: [] },
    } as Element;
    elements.push(el);
  }
  el.chartType = chart.type;
  el.chartData = {
    labels: chart.data.labels,
    datasets: chart.data.datasets.map((d, i) => ({
      label: d.label || `Series ${i + 1}`,
      data: d.data,
      backgroundColor: d.color || branding.accentColor,
      borderColor: d.color || branding.accentColor,
      tension: chart.type === 'line' ? 0.35 : undefined,
      fill: chart.type === 'line' ? true : undefined,
      borderRadius: chart.type === 'bar' ? 6 : undefined,
    }))
  } as any;
}

function injectTable(elements: Element[], branding: PromptBranding, table: PromptTable) {
  let el = elements.find(e => e.type === 'table');
  if (!el) {
    el = {
      id: `table-${Date.now()}`,
      type: 'table',
      x: snap(MARGIN), y: snap(120),
      width: snap(CANVAS.width - 2 * MARGIN), height: snap(320),
      rows: Math.min(6, (table.rows?.length || 4) + 1),
      cols: Math.min(6, table.headers?.length || 3),
      tableData: [],
      header: true,
    } as Element;
    elements.push(el);
  }
  const rows = table.rows || [];
  const headers = table.headers || [];
  el.tableData = [headers, ...rows];
  el.header = true;
  el.headerBg = branding.neutralColor;
  el.headerTextColor = branding.primaryColor;
  el.borderWidth = 1;
  el.borderColor = branding.neutralColor;
  el.backgroundColor = '#FFFFFF';
  el.color = branding.textColor;
  el.cellPadding = 12;
  el.cellTextAlign = 'left';
  el.fontSize = 14;
  el.rowAltBg = table.style === 'striped' ? '#FAFAFA' : null;
}

function addShapes(elements: Element[], content: any, branding: PromptBranding) {
  if (Array.isArray(content?.shapes)) {
    for (const s of content.shapes) {
      if (s.type === 'line') {
        const w = snap(CANVAS.width - 2 * MARGIN);
        const x = snap(MARGIN);
        const y = snap(CANVAS.height - MARGIN - (s.thickness || 4));
        elements.push({ id: `shape-line-${Math.random()}`, type:'shape', shapeType:'rectangle', x, y, width: w, height: s.thickness || 4, fill: s.color || branding.accentColor, stroke: 'transparent' });
      }
      if (s.type === 'circle') {
        const size = snap(s.size || 24);
        const x = snap(CANVAS.width - MARGIN - size);
        const y = snap(MARGIN);
        elements.push({ id: `shape-circle-${Math.random()}`, type:'shape', shapeType:'circle', x, y, width: size, height: size, fill: s.fill || branding.accentColor, stroke: 'transparent', borderRadius: size/2 });
      }
      if (s.type === 'triangle') {
        const size = 40;
        const x = s.alignment === 'right' ? snap(CANVAS.width - MARGIN - size) : snap(MARGIN);
        const y = snap(MARGIN + 70);
        elements.push({ id: `shape-tri-${Math.random()}`, type:'shape', shapeType:'triangle', x, y, width: size, height: size * 0.75, fill: s.color || branding.neutralColor, stroke: 'transparent' });
      }
    }
  }
}

function addRightShapes(elements: Element[], content: any, branding: PromptBranding) {
  if (!Array.isArray(content?.rightShapes)) return;
  const baseX = snap(CANVAS.width - MARGIN - 180);
  const baseY = snap(220);
  const gap = 72;
  content.rightShapes.forEach((s: any, i: number) => {
    if (s.type === 'circle') {
      const size = 64;
      const x = baseX;
      const y = baseY + i * gap;
      elements.push({ id: `rs-${i}-c`, type:'shape', shapeType:'circle', x, y, width: size, height: size, fill: s.fill || branding.accentColor, stroke: 'transparent', borderRadius: 9999 });
      elements.push({ id: `rs-${i}-t`, type:'text', x: x + 8, y: y + 20, width: size - 16, height: 24, text: s.label || '', fontSize: 14, fontWeight: 'bold', color: s.textColor || '#FFFFFF', textAlign: 'center' });
    }
  });
}

function addTimeline(elements: Element[], content: any, branding: PromptBranding) {
  const items = content?.timeline as Array<{ label: string; milestone: string; color?: string }>;
  if (!Array.isArray(items) || items.length === 0) return;
  const lineY = snap(CANVAS.height / 2);
  const left = MARGIN + 20;
  const right = CANVAS.width - MARGIN - 20;
  const step = (right - left) / (items.length - 1);
  // Base line
  elements.push({ id: 'tl-line', type:'shape', shapeType:'rectangle', x: snap(left), y: snap(lineY), width: snap(right - left), height: 6, fill: branding.neutralColor, stroke: 'transparent' });
  items.forEach((it, i) => {
    const cx = snap(left + i * step);
    const cy = snap(lineY - 10);
    elements.push({ id: `tl-dot-${i}`, type:'shape', shapeType:'circle', x: cx - 12, y: cy - 12, width: 24, height: 24, fill: it.color || branding.accentColor, stroke: '#FFFFFF', strokeWidth: 2, borderRadius: 9999 });
    elements.push({ id: `tl-label-${i}`, type:'text', x: cx - 40, y: cy + 20, width: 80, height: 20, text: it.label, fontSize: 14, color: branding.textColor, textAlign: 'center' });
    elements.push({ id: `tl-milestone-${i}`, type:'text', x: cx - 80, y: cy + 40, width: 160, height: 28, text: it.milestone, fontSize: 14, color: '#4B5563', textAlign: 'center' });
  });
}

function addMetrics(elements: Element[], content: any, branding: PromptBranding) {
  const items = content?.metrics as Array<{ label: string; value: string; color?: string }>;
  if (!Array.isArray(items) || items.length === 0) return;
  const cols = items.length;
  const gap = 16;
  const cardW = snap((CANVAS.width - 2 * MARGIN - gap * (cols - 1)) / cols);
  const y = snap(180);
  items.forEach((m, i) => {
    const x = snap(MARGIN + i * (cardW + gap));
    elements.push({ id: `kpi-card-${i}`, type:'shape', shapeType:'rounded-rectangle', x, y, width: cardW, height: 120, fill: '#FFFFFF', stroke: branding.neutralColor, strokeWidth: 1, borderRadius: 12 });
    elements.push({ id: `kpi-val-${i}`, type:'text', x: x + 16, y: y + 24, width: cardW - 32, height: 40, text: m.value, fontSize: 28, fontWeight: 'bold', color: m.color || branding.accentColor, textAlign: 'left' });
    elements.push({ id: `kpi-lbl-${i}`, type:'text', x: x + 16, y: y + 64, width: cardW - 32, height: 24, text: m.label, fontSize: 14, color: '#4B5563', textAlign: 'left' });
  });
}

export function generateTemplateFromPrompt(prompt: TemplatePrompt): Slide[] {
  const slides: Slide[] = [];
  const branding = prompt.branding;

  prompt.slides.forEach((s, idx) => {
    const layoutId = mapLayoutId(s.layout, s.content || {});
    let elements = generateElementsForLayout(layoutId, CANVAS) as any as Element[];

    // Branding pass for existing text
    elements = elements.map((el, i) => setBrandText(el, branding, i === 0));

    // Title handling
    if (s.content?.headline || s.content?.subHeadline) {
      const center = s.content?.style?.alignment === 'center';
      applyHeadline(elements, branding, s.content.headline, s.content.subHeadline || s.content.subText, center);
    }

    // Two-content texts
    if (s.content?.leftText || s.content?.rightText) {
      const texts = elements.filter(e => e.type === 'text');
      if (texts[0] && s.content.leftText) { texts[0].text = s.content.leftText; texts[0] = setBrandText(texts[0], branding, false); texts[0].fontSize = 16; texts[0].lineHeight = 1.5; }
      if (texts[1] && s.content.rightText) { texts[1].text = s.content.rightText; texts[1] = setBrandText(texts[1], branding, false); texts[1].fontSize = 16; texts[1].lineHeight = 1.5; }
    }

    // Body text
  if (s.content?.bodyText) {
      const idxText = elements.findIndex(e => e.type === 'text');
      if (idxText >= 0) {
        const tt = setBrandText(elements[idxText], branding, false);
        tt.text = s.content.bodyText;
        (tt as any).fontSize = 18;
        (tt as any).lineHeight = 1.6;
        (tt as any).textAlign = 'left';
        elements[idxText] = tt;
      }
    }

    // Chart
    if (s.content?.chart) {
      injectChart(elements, branding, s.content.chart as PromptChart);
    }

    // Table
    if (s.content?.table) {
      injectTable(elements, branding, s.content.table as PromptTable);
    }

    // Shapes
    addShapes(elements, s.content, branding);
    addRightShapes(elements, s.content, branding);

    // Timeline
    if (s.content?.timeline) {
      addTimeline(elements, s.content, branding);
    }

    // Metrics
    if (s.content?.metrics) {
      addMetrics(elements, s.content, branding);
    }

    // Background
    const bg = (s.content?.style?.backgroundColor as string) || '#FFFFFF';

    slides.push({
      id: `${prompt.templateId}-${idx + 1}-${Date.now()}`,
      elements,
      background: bg,
      createdAt: new Date(),
      lastUpdated: Date.now(),
      title: s.title,
      category: 'business' as any,
    });
  });

  return slides;
}
