import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';
import type { Slide } from '@/types/slide-thumbnails';
import type { Element } from '@/hooks/use-action-manager';

const pxToInches = (px: number): number => px / 96;
const pxToPoints = (px: number): number => px * 0.75;

const colorToPpt = (color: string): { color: string; transparency?: number } => {
    if (!color) return { color: 'FFFFFF' };

    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;

        const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
        const hexColor = toHex(r) + toHex(g) + toHex(b);
        const transparency = a < 1 ? Math.round((1 - a) * 100) : undefined;

        return { color: hexColor, transparency };
    }

    const hexColor = color.replace('#', '').toUpperCase();
    return { color: hexColor };
};

const hexToPptColor = (hex: string): string => colorToPpt(hex).color;

const getShapeType = (shapeType: string): any => {
    const shapeMap: Record<string, string> = {
        'rectangle': 'rect',
        'rounded-rectangle': 'roundRect',
        'circle': 'ellipse',
        'triangle': 'triangle',
        'star': 'star5',
        'diamond': 'diamond',
        'pentagon': 'pentagon',
        'hexagon': 'hexagon',
        'arrow-right': 'rightArrow',
        'arrow-double': 'leftRightArrow',
        'cloud': 'cloud',
        'heart': 'heart',
        'lightning': 'lightningBolt',
        'line': 'line',
    };
    return shapeMap[shapeType] || 'rect';
};

const exportTextElement = (slide: any, element: Element) => {
    const options: any = {
        x: pxToInches(element.x),
        y: pxToInches(element.y),
        w: pxToInches(element.width),
        h: pxToInches(element.height),
        fontSize: pxToPoints(element.fontSize || 18),
        fontFace: element.fontFamily || 'Arial',
        color: hexToPptColor(element.color || '#000000'),
        align: element.textAlign || 'left',
        valign: element.verticalAlign || 'top',
    };

    if (element.fontWeight === 'bold') options.bold = true;
    if (element.fontWeight === 'medium') options.bold = true;
    if (element.fontStyle === 'italic') options.italic = true;
    if (element.textDecoration?.includes('underline')) options.underline = { style: 'sng' };
    if (element.textDecoration?.includes('line-through')) options.strike = true;

    let textContent = element.text || element.content || '';
    if (element.textTransform === 'uppercase') {
        textContent = textContent.toUpperCase();
        options.caps = true;
    } else if (element.textTransform === 'lowercase') {
        textContent = textContent.toLowerCase();
    } else if (element.textTransform === 'capitalize') {
        textContent = textContent.replace(/\b\w/g, (char: string) => char.toUpperCase());
    }

    if (element.backgroundColor && element.backgroundColor !== 'transparent') {
        const bgColor = colorToPpt(element.backgroundColor);
        options.fill = { color: bgColor.color };
        if (bgColor.transparency) options.transparency = bgColor.transparency;
    }

    if (element.borderWidth && element.borderWidth > 0 && element.borderColor) {
        options.line = {
            color: hexToPptColor(element.borderColor),
            width: pxToPoints(element.borderWidth),
            dashType: element.borderStyle === 'dashed' ? 'dash' : element.borderStyle === 'dotted' ? 'dot' : 'solid',
        };
    }

    if (element.rotation) options.rotate = element.rotation;
    if (element.opacity !== undefined && element.opacity < 1) {
        options.transparency = Math.round((1 - element.opacity) * 100);
    }
    if (element.lineHeight) {
        options.lineSpacing = pxToPoints((element.fontSize || 18) * (element.lineHeight || 1.2));
    }
    if (element.letterSpacing) options.charSpacing = pxToPoints(element.letterSpacing);
    if (element.padding) options.margin = pxToInches(element.padding);
    if (element.borderRadius) options.rectRadius = pxToInches(element.borderRadius);

    slide.addText(textContent, options);
};

const exportShapeElement = (slide: any, element: Element) => {
    const options: any = {
        x: pxToInches(element.x),
        y: pxToInches(element.y),
        w: pxToInches(element.width),
        h: pxToInches(element.height),
    };

    const fillColor = element.fill || element.backgroundColor;
    if (fillColor && fillColor !== 'transparent' && fillColor !== 'none') {
        const fillPpt = colorToPpt(fillColor);
        options.fill = { color: fillPpt.color };

        if (fillPpt.transparency !== undefined) {
            options.fill.transparency = fillPpt.transparency;
        } else if (element.opacity !== undefined && element.opacity < 1) {
            options.fill.transparency = Math.round((1 - element.opacity) * 100);
        }
    } else {
        options.fill = { type: 'solid', color: 'FFFFFF', transparency: 100 };
    }

    if (element.stroke || element.borderColor) {
        const strokeColor = element.stroke || element.borderColor;
        if (strokeColor && strokeColor !== 'transparent' && strokeColor !== 'none') {
            const strokePpt = colorToPpt(strokeColor);
            options.line = {
                color: strokePpt.color,
                width: pxToPoints(element.strokeWidth || element.borderWidth || 1),
            };

            if (strokePpt.transparency !== undefined) {
                options.line.transparency = strokePpt.transparency;
            }
        }
    }

    if (element.rotation) options.rotate = element.rotation;
    if (element.shapeType === 'rounded-rectangle' && element.borderRadius) {
        options.rectRadius = pxToInches(element.borderRadius);
    }

    const shapeType = getShapeType(element.shapeType || 'rectangle');
    slide.addShape(shapeType, options);
};

const exportImageElement = (slide: any, element: Element) => {
    if (!element.imageUrl) return;

    const options: any = {
        data: element.imageUrl,
        x: pxToInches(element.x),
        y: pxToInches(element.y),
        w: pxToInches(element.width),
        h: pxToInches(element.height),
    };

    if (element.rotation) options.rotate = element.rotation;
    if (element.opacity !== undefined && element.opacity < 1) {
        options.transparency = Math.round((1 - element.opacity) * 100);
    }

    slide.addImage(options);
};

const exportTableElement = (slide: any, element: Element) => {
    if (!element.tableData || !element.rows || !element.cols) return;

    const tableRows: any[] = [];

    for (let i = 0; i < element.rows; i++) {
        const row: any[] = [];
        for (let j = 0; j < element.cols; j++) {
            const cellText = element.tableData[i]?.[j] || '';
            const cellOptions: any = {
                text: cellText,
                options: {
                    align: element.cellTextAlign || 'left',
                    valign: 'middle',
                    fontSize: pxToPoints(element.fontSize || 12),
                    color: hexToPptColor(element.textColor || element.color || '#000000'),
                },
            };

            if (i === 0 && element.header) {
                cellOptions.options.fill = hexToPptColor(element.headerBg || '#3B82F6');
                cellOptions.options.color = hexToPptColor(element.headerTextColor || '#FFFFFF');
                cellOptions.options.bold = true;
            } else {
                if (element.rowAltBg && i % 2 === 1) {
                    cellOptions.options.fill = hexToPptColor(element.rowAltBg);
                } else if (element.backgroundColor) {
                    cellOptions.options.fill = hexToPptColor(element.backgroundColor);
                }
            }

            row.push(cellOptions);
        }
        tableRows.push(row);
    }

    const options: any = {
        x: pxToInches(element.x),
        y: pxToInches(element.y),
        w: pxToInches(element.width),
        border: {
            pt: pxToPoints(element.borderWidth || 1),
            color: hexToPptColor(element.borderColor || '#E2E8F0'),
        },
    };

    if (element.columnWidths && element.columnWidths.length > 0) {
        options.colW = element.columnWidths.map(w => pxToInches(w));
    }

    slide.addTable(tableRows, options);
};

const exportChartElement = async (slide: any, element: Element) => {
    // Charts cannot be exported - not in DOM when export runs
};

export async function exportSlidesToPPTX(slides: Slide[], fileName = 'GlassSlide-Export.pptx') {
    const pptx = new pptxgen();

    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'GlassSlide Studio';
    pptx.company = 'GlassSlide';
    pptx.subject = 'Presentation';
    pptx.title = fileName.replace('.pptx', '');

    for (const slideData of slides) {
        const slide = pptx.addSlide();

        if (slideData.background && slideData.background !== 'transparent') {
            slide.background = { color: hexToPptColor(slideData.background) };
        }

        for (const element of slideData.elements) {
            try {
                switch (element.type) {
                    case 'text':
                        exportTextElement(slide, element);
                        break;

                    case 'shape':
                        exportShapeElement(slide, element);
                        break;

                    case 'image':
                        exportImageElement(slide, element);
                        break;

                    case 'table':
                        exportTableElement(slide, element);
                        break;

                    case 'chart':
                        await exportChartElement(slide, element);
                        break;

                    case 'line':
                        exportShapeElement(slide, element);
                        break;

                    default:
                    // Skip unknown element types
                }
            } catch (error) {
                // Skip elements that fail to export
            }
        }
    }

    await pptx.writeFile({ fileName });
}

export async function exportSlidesToPDF(slides: Slide[], title = 'GlassSlide-PDF') {
    // PDF export not yet implemented
}
