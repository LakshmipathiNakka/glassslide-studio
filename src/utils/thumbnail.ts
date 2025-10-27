import html2canvas from 'html2canvas';

export interface CaptureOptions {
  width?: number; // output width (default 200)
  height?: number; // output height (default 112)
  quality?: number; // 0-1 for toDataURL
  backgroundColor?: string | null; // transparent or specific
  scale?: number; // html2canvas scale for high-DPI capture
}

export async function captureElementToThumbnail(el: HTMLElement, opts: CaptureOptions = {}): Promise<string> {
  const {
    width = 200,
    height = 112,
    quality = 0.85,
    backgroundColor = null,
    scale = 2,
  } = opts;

  // Use html2canvas to render element offscreen
  const canvas = await html2canvas(el, {
    backgroundColor,
    scale,
    useCORS: true,
    logging: false,
    removeContainer: true,
    allowTaint: false,
    // Ensure consistent viewport clipping
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
  });

  // Downscale to target size for performance
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png', quality);

  // Cover behavior: scale canvas snapshot to fit 16:9 centered
  const sx = 0, sy = 0, sw = canvas.width, sh = canvas.height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, width, height);
  return out.toDataURL('image/png', quality);
}

// Simple debounce utility using RAF + setTimeout for smoothness
export function createDebounced<T extends (...args: any[]) => any>(fn: T, delayMs: number) {
  let t: number | null = null;
  let raf: number | null = null;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    if (raf) window.cancelAnimationFrame(raf);
    t = window.setTimeout(() => {
      raf = window.requestAnimationFrame(() => fn(...args));
    }, delayMs);
  };
}
