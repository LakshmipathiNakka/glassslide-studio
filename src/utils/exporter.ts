import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import type { Slide } from '@/types/slide-thumbnails';
import React from 'react';
import { createRoot } from 'react-dom/client';
import SlideRenderer from '@/components/shared/SlideRenderer';

// Render a slide offscreen and capture as image (PNG dataURL)
export async function renderSlideToImage(slide: Slide, width = 2048, height = 1152): Promise<string> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-10000px';
  container.style.left = '-10000px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.zIndex = '-1';
  document.body.appendChild(container);

  const scale = width / 1024; // maintain 16:9 like editor
  const root = createRoot(container);
  await new Promise<void>((resolve) => {
    root.render(React.createElement(SlideRenderer as any, { slide, mode: 'export', scale }, null));
    // Let browser layout pass happen
    requestAnimationFrame(() => resolve());
  });

  try {
    const canvas = await html2canvas(container, { backgroundColor: null, scale: 1, useCORS: true });
    const dataUrl = canvas.toDataURL('image/png', 0.95);
    return dataUrl;
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

export async function exportSlidesToPPTX(slides: Slide[], fileName = 'GlassSlide-Export.pptx') {
  const deck = new pptxgen();
  for (const slide of slides) {
    const dataUrl = await renderSlideToImage(slide);
    const s = deck.addSlide();
    s.addImage({ data: dataUrl, x: 0, y: 0, w: 10, h: 5.625 }); // 16:9 inches
  }
  await deck.writeFile({ fileName });
}

// Lightweight PDF export fallback using a new window (no additional deps)
export async function exportSlidesToPDF(slides: Slide[], title = 'GlassSlide-PDF') {
  const images: string[] = [];
  for (const slide of slides) {
    images.push(await renderSlideToImage(slide, 1920, 1080));
  }
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<html><head><title>${title}</title><style>body{margin:0}img{display:block;width:100%;page-break-after:always}</style></head><body></body></html>`);
  images.forEach((src) => {
    const img = win.document.createElement('img');
    img.src = src;
    win.document.body.appendChild(img);
  });
  // Let user print to PDF
  win.document.close();
  win.focus();
}
