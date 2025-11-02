import { fabric } from 'fabric';
import { PREMIUM_LAYOUTS, LayoutPreview } from '@/data/premiumLayouts';

export type PlaceholderRole = 'title' | 'subtitle' | 'body' | 'image' | 'shape' | 'chart' | 'table' | 'box';

export interface LayoutPlaceholder {
  id: string;
  role: PlaceholderRole;
  x: number; // px
  y: number; // px
  width: number; // px
  height: number; // px
}

export interface ApplyLayoutOptions {
  duration?: number; // ms
  easing?: (t: number) => number;
  snap?: boolean;
  snapThreshold?: number; // px
  margins?: { top: number; right: number; bottom: number; left: number };
}

const EASE = fabric.util.ease.easeInOutCubic || ((t: number) => t);

function pctToPx(pct: number, total: number) { return (pct / 100) * total; }

function resolveRoleFromPreviewContent(content?: string, type?: string): PlaceholderRole {
  const c = (content || '').toLowerCase();
  if (c.includes('title') && !c.includes('sub')) return 'title';
  if (c.includes('subtitle')) return 'subtitle';
  if (c.includes('text') || c.includes('body')) return 'body';
  if (type === 'chart') return 'chart';
  if (type === 'table') return 'table';
  if (type === 'box' || type === 'gradient' || type === 'line') return 'box';
  return 'body';
}

function placeholdersFromLayout(layout: LayoutPreview, canvas: fabric.Canvas): LayoutPlaceholder[] {
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  let i = 0;
  return layout.preview.elements.map((el) => {
    const x = pctToPx(el.x, cw);
    const y = pctToPx(el.y, ch);
    const width = pctToPx(el.width, cw);
    const height = pctToPx(el.height, ch);
    const role = resolveRoleFromPreviewContent(el.content, el.type);
    return { id: `${layout.id}-ph-${i++}`, role, x, y, width, height };
  });
}

function inferRoleForObject(obj: fabric.Object): PlaceholderRole {
  // Prefer explicit role if provided via data
  const data: any = (obj as any).data;
  const explicit: PlaceholderRole | undefined = data?.role;
  if (explicit) return explicit;

  const type = obj.type;
  if (type === 'i-text' || type === 'text' || type === 'textbox') {
    const it = obj as any;
    const fs: number = it.fontSize || 18;
    const fw: string = (it.fontWeight || 'normal').toString();
    // Heuristics: bold+large => title, medium => subtitle, else body
    if ((fw === 'bold' || fw === '700' || fw === '600') && fs >= 28) return 'title';
    if (fs >= 20 && fs < 28) return 'subtitle';
    return 'body';
  }
  if (type === 'rect' || type === 'triangle' || type === 'circle' || type === 'path') return 'shape';
  // Custom types could be tagged via data.kind
  if (data?.kind === 'chart') return 'chart';
  if (data?.kind === 'table') return 'table';
  return 'box';
}

function byAreaDesc(a: fabric.Object, b: fabric.Object) {
  const aw = (a.width || 0) * (a.scaleX || 1);
  const ah = (a.height || 0) * (a.scaleY || 1);
  const bw = (b.width || 0) * (b.scaleX || 1);
  const bh = (b.height || 0) * (b.scaleY || 1);
  return bw * bh - aw * ah;
}

function buildRoleBuckets(objs: fabric.Object[]) {
  const buckets: Record<PlaceholderRole, fabric.Object[]> = {
    title: [], subtitle: [], body: [], image: [], shape: [], chart: [], table: [], box: []
  };
  objs.forEach((o) => {
    const r = inferRoleForObject(o);
    buckets[r].push(o);
  });
  Object.keys(buckets).forEach((k) => {
    // Sort deterministically by area desc then by top-left
    // @ts-ignore
    buckets[k].sort((a, b) => {
      const areaCmp = byAreaDesc(a, b);
      if (areaCmp !== 0) return areaCmp;
      const ax = a.left || 0, ay = a.top || 0;
      const bx = b.left || 0, by = b.top || 0;
      return ay - by || ax - bx;
    });
  });
  return buckets;
}

function snapToGuides(x: number, y: number, w: number, h: number, cw: number, ch: number, threshold: number, margins: { top: number; right: number; bottom: number; left: number }) {
  let nx = x, ny = y;
  const centerX = cw / 2;
  const centerY = ch / 2;
  const leftMargin = margins.left;
  const topMargin = margins.top;
  const rightMargin = cw - margins.right - w;
  const bottomMargin = ch - margins.bottom - h;

  // Center snap
  if (Math.abs((x + w / 2) - centerX) <= threshold) nx = centerX - w / 2;
  if (Math.abs((y + h / 2) - centerY) <= threshold) ny = centerY - h / 2;

  // Margin snaps
  if (Math.abs(x - leftMargin) <= threshold) nx = leftMargin;
  if (Math.abs(y - topMargin) <= threshold) ny = topMargin;
  if (Math.abs(x - rightMargin) <= threshold) nx = rightMargin;
  if (Math.abs(y - bottomMargin) <= threshold) ny = bottomMargin;

  return { x: nx, y: ny };
}

function animateObjectTo(obj: fabric.Object, to: { left: number; top: number; width?: number; height?: number; scaleX?: number; scaleY?: number; fontSize?: number }, options: Required<Pick<ApplyLayoutOptions, 'duration'>> & { easing: (t: number) => number }, onChange?: () => void) {
  const fromLeft = obj.left || 0;
  const fromTop = obj.top || 0;
  const fromWidth = obj.width || 0;
  const fromHeight = obj.height || 0;
  const fromScaleX = obj.scaleX || 1;
  const fromScaleY = obj.scaleY || 1;
  const hasExplicitScale = to.scaleX != null || to.scaleY != null;

  fabric.util.animate({
    startValue: 0,
    endValue: 1,
    duration: options.duration,
    easing: options.easing,
    onChange: (v: number) => {
      const lerp = (a: number, b: number) => a + (b - a) * v;
      obj.set({
        left: lerp(fromLeft, to.left),
        top: lerp(fromTop, to.top),
      });
      if (to.width != null && !hasExplicitScale) {
        obj.set({ width: lerp(fromWidth, to.width) });
      }
      if (to.height != null && !hasExplicitScale) {
        obj.set({ height: lerp(fromHeight, to.height) });
      }
      if (hasExplicitScale) {
        if (to.scaleX != null) obj.set({ scaleX: lerp(fromScaleX, to.scaleX) });
        if (to.scaleY != null) obj.set({ scaleY: lerp(fromScaleY, to.scaleY) });
      }
      // Text font size interpolation (for i-text/textbox)
      if ((obj.type === 'i-text' || obj.type === 'textbox') && (to as any).fontSize != null) {
        const it = obj as any;
        const fsFrom = it.fontSize || 18;
        it.set({ fontSize: Math.round(lerp(fsFrom, (to as any).fontSize)) });
      }
      obj.setCoords();
      onChange?.();
    },
    onComplete: () => {
      obj.setCoords();
      onChange?.();
    },
  });
}

export function applyLayoutToFabricCanvas(canvas: fabric.Canvas, layoutId: string, opts?: ApplyLayoutOptions) {
  const options: Required<ApplyLayoutOptions> = {
    duration: opts?.duration ?? 320,
    easing: opts?.easing ?? EASE,
    snap: opts?.snap ?? true,
    snapThreshold: opts?.snapThreshold ?? 6,
    margins: opts?.margins ?? { top: 24, right: 24, bottom: 24, left: 24 },
  } as any;

  const layout = PREMIUM_LAYOUTS.find(l => l.id === layoutId);
  if (!layout) return;

  const placeholders = placeholdersFromLayout(layout, canvas);
  const objects = canvas.getObjects().filter(o => !o.excludeFromExport); // all active objects
  const buckets = buildRoleBuckets(objects);

  const cw = canvas.getWidth();
  const ch = canvas.getHeight();

  const applyToObject = (obj: fabric.Object, ph: LayoutPlaceholder) => {
    // Maintain aspect ratio when appropriate
    const ow = (obj.width || 0) * (obj.scaleX || 1);
    const oh = (obj.height || 0) * (obj.scaleY || 1);

    // Compute fit into placeholder (contain)
    const sx = ph.width / Math.max(1, ow);
    const sy = ph.height / Math.max(1, oh);
    const s = Math.min(sx, sy);
    const tw = ow * s;
    const th = oh * s;
    const tx = ph.x + (ph.width - tw) / 2;
    const ty = ph.y + (ph.height - th) / 2;

    // Optional snapping
    const snapped = options.snap
      ? snapToGuides(tx, ty, tw, th, cw, ch, options.snapThreshold, options.margins)
      : { x: tx, y: ty };

    const to: any = { left: snapped.x, top: snapped.y };
    // For vector shapes and images prefer scale to preserve crisp controls
    if (ow > 0 && oh > 0) {
      to.scaleX = (obj.scaleX || 1) * s;
      to.scaleY = (obj.scaleY || 1) * s;
    } else {
      to.width = ph.width;
      to.height = ph.height;
    }

    // Special handling for text: adjust width and font size proportionally to placeholder height
    if (obj.type === 'i-text' || obj.type === 'textbox') {
      const it = obj as any;
      const currentFs = it.fontSize || 18;
      const scaleForHeight = ph.height / Math.max(1, oh);
      to.fontSize = Math.max(10, Math.round(currentFs * scaleForHeight));
      // Text boxes in Fabric are sized by width; height grows with content
      to.scaleX = undefined; to.scaleY = undefined; // use width/height instead
      to.width = ph.width;
      to.height = ph.height;
    }

    animateObjectTo(obj, to, { duration: options.duration, easing: options.easing }, () => {
      canvas.requestRenderAll();
    });
  };

  // For each placeholder, pick best matching object from corresponding bucket
  const used = new Set<fabric.Object>();
  placeholders.forEach((ph) => {
    const pool = buckets[ph.role].length ? buckets[ph.role] : buckets.body; // fallback to body
    const candidate = pool.find(o => !used.has(o));
    if (!candidate) return;
    used.add(candidate);
    applyToObject(candidate, ph);
  });

  // If there are remaining objects with no placeholder mapping, gently move them below content area
  const remaining = objects.filter(o => !used.has(o));
  if (remaining.length) {
    const gutter = options.margins.bottom;
    remaining.forEach((obj, idx) => {
      const ow = (obj.width || 0) * (obj.scaleX || 1);
      const oh = (obj.height || 0) * (obj.scaleY || 1);
      const left = options.margins.left + (idx % 3) * (ow + 12);
      const top = ch - oh - gutter;
      animateObjectTo(obj, { left, top }, { duration: Math.max(200, options.duration - 80), easing: options.easing }, () => canvas.requestRenderAll());
    });
  }
}
