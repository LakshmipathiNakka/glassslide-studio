import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  layout: string;
  elements: Omit<Element, 'id'>[];
  background: string;
}

export const slideTemplates: Record<string, SlideTemplate> = {
  titleSubtitle: {
    id: 'titleSubtitle',
    name: 'Title & Subtitle',
    description: 'Classic title slide with subtitle',
    layout: 'titleSubtitle',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 120,
        y: 80,
        width: 720,
        height: 120,
        text: 'Click to add title',
        fontSize: 44,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#333333',
        zIndex: 1,
      },
      {
        type: 'text',
        x: 120,
        y: 220,
        width: 720,
        height: 80,
        text: 'Click to add subtitle',
        fontSize: 32,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#666666',
        zIndex: 2,
      }
    ]
  },
  blank: {
    id: 'blank',
    name: 'Blank Slide',
    description: 'Empty slide for custom content',
    layout: 'blank',
    background: '#ffffff',
    elements: []
  },
  titleContent: {
    id: 'titleContent',
    name: 'Title & Content',
    description: 'Title with content area',
    layout: 'titleContent',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 120,
        y: 60,
        width: 720,
        height: 100,
        text: 'Click to add title',
        fontSize: 40,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'left',
        color: '#333333',
        zIndex: 1,
      },
      {
        type: 'text',
        x: 120,
        y: 180,
        width: 720,
        height: 400,
        text: 'Click to add content',
        fontSize: 24,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        color: '#666666',
        zIndex: 2,
      }
    ]
  },
  twoColumn: {
    id: 'twoColumn',
    name: 'Two Column',
    description: 'Two-column layout for content',
    layout: 'twoColumn',
    background: '#ffffff',
    elements: [
      {
        type: 'text',
        x: 120,
        y: 60,
        width: 720,
        height: 80,
        text: 'Click to add title',
        fontSize: 36,
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'center',
        color: '#333333',
        zIndex: 1,
      },
      {
        type: 'text',
        x: 120,
        y: 160,
        width: 360,
        height: 300,
        text: 'Left column content',
        fontSize: 20,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        color: '#666666',
        zIndex: 2,
      },
      {
        type: 'text',
        x: 500,
        y: 160,
        width: 360,
        height: 300,
        text: 'Right column content',
        fontSize: 20,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        color: '#666666',
        zIndex: 3,
      }
    ]
  }
};

export const getDefaultSlideTemplate = (): SlideTemplate => {
  return slideTemplates.titleSubtitle;
};

export const createSlideFromTemplate = (template: SlideTemplate, slideId: string): Slide => {
  const elements: Element[] = template.elements.map((element, index) => ({
    ...element,
    id: `${slideId}-element-${index}`,
  }));

  return {
    id: slideId,
    title: `Slide ${Date.now()}`,
    elements,
    background: template.background,
    createdAt: new Date(),
    category: 'custom'
  };
};
