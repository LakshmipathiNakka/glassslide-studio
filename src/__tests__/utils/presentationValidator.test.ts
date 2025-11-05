import {
  validatePresentation,
  sanitizeSlidesForPresentation,
  isPresentationReady,
  getValidationSummary,
  groupIssuesBySlide,
} from '@/utils/presentationValidator';
import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

describe('presentationValidator', () => {
  describe('validatePresentation', () => {
    it('should pass validation for slides with content', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'text-1',
              type: 'text',
              text: 'Hello World',
              x: 0,
              y: 0,
              width: 100,
              height: 50,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const result = validatePresentation(slides);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect empty text elements with placeholders', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'text-1',
              type: 'text',
              text: '',
              placeholder: 'Click to add title',
              x: 0,
              y: 0,
              width: 100,
              height: 50,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const result = validatePresentation(slides);

      expect(result.isValid).toBe(true); // No errors, just warnings
      expect(result.warnings).toHaveLength(2); // Both "empty" and "placeholder not replaced"
      expect(result.warnings[0].issue).toContain('placeholder');
    });

    it('should detect missing images', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'img-1',
              type: 'image',
              imageUrl: '',
              x: 0,
              y: 0,
              width: 200,
              height: 150,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const result = validatePresentation(slides);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].elementType).toBe('image');
      expect(result.errors[0].issue).toContain('no image URL');
    });

    it('should detect empty charts', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'chart-1',
              type: 'chart',
              chartType: 'bar',
              chartData: { labels: [], datasets: [] },
              x: 0,
              y: 0,
              width: 300,
              height: 200,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const result = validatePresentation(slides);

      expect(result.isValid).toBe(true); // Warning, not error
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].elementType).toBe('chart');
    });

    it('should detect empty tables', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'table-1',
              type: 'table',
              rows: 0,
              cols: 0,
              tableData: [],
              x: 0,
              y: 0,
              width: 400,
              height: 300,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const result = validatePresentation(slides);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].elementType).toBe('table');
    });

    it('should detect completely empty slides', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const result = validatePresentation(slides);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].elementType).toBe('slide');
      expect(result.warnings[0].issue).toContain('empty');
    });

    it('should handle multiple slides with various issues', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'text-1',
              type: 'text',
              text: 'Valid content',
              x: 0,
              y: 0,
              width: 100,
              height: 50,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
        {
          id: '2',
          elements: [
            {
              id: 'text-2',
              type: 'text',
              text: '',
              placeholder: 'Empty',
              x: 0,
              y: 0,
              width: 100,
              height: 50,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
        {
          id: '3',
          elements: [
            {
              id: 'img-1',
              type: 'image',
              imageUrl: '',
              x: 0,
              y: 0,
              width: 200,
              height: 150,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const result = validatePresentation(slides);

      expect(result.isValid).toBe(false); // Has errors
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeSlidesForPresentation', () => {
    it('should remove placeholder attributes from text elements', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'text-1',
              type: 'text',
              text: 'Content',
              placeholder: 'This should be removed',
              x: 0,
              y: 0,
              width: 100,
              height: 50,
            } as any,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const sanitized = sanitizeSlidesForPresentation(slides);

      expect((sanitized[0].elements[0] as any).placeholder).toBeUndefined();
      expect(sanitized[0].elements[0].type).toBe('text');
    });

    it('should remove empty text elements', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'text-1',
              type: 'text',
              text: '',
              content: '',
              x: 0,
              y: 0,
              width: 100,
              height: 50,
            } as Element,
            {
              id: 'text-2',
              type: 'text',
              text: 'Valid content',
              x: 0,
              y: 100,
              width: 100,
              height: 50,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const sanitized = sanitizeSlidesForPresentation(slides);

      expect(sanitized[0].elements).toHaveLength(1);
      expect((sanitized[0].elements[0] as any).text).toBe('Valid content');
    });

    it('should preserve non-text elements', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'img-1',
              type: 'image',
              imageUrl: 'test.jpg',
              x: 0,
              y: 0,
              width: 200,
              height: 150,
            } as Element,
            {
              id: 'shape-1',
              type: 'shape',
              shapeType: 'rectangle',
              fill: '#000',
              x: 0,
              y: 0,
              width: 100,
              height: 100,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      const sanitized = sanitizeSlidesForPresentation(slides);

      expect(sanitized[0].elements).toHaveLength(2);
      expect(sanitized[0].elements[0].type).toBe('image');
      expect(sanitized[0].elements[1].type).toBe('shape');
    });
  });

  describe('isPresentationReady', () => {
    it('should return true when no errors exist', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'text-1',
              type: 'text',
              text: 'Content',
              x: 0,
              y: 0,
              width: 100,
              height: 50,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      expect(isPresentationReady(slides)).toBe(true);
    });

    it('should return false when errors exist', () => {
      const slides: Slide[] = [
        {
          id: '1',
          elements: [
            {
              id: 'img-1',
              type: 'image',
              imageUrl: '',
              x: 0,
              y: 0,
              width: 200,
              height: 150,
            } as Element,
          ],
          background: '#fff',
          createdAt: new Date(),
          lastUpdated: Date.now(),
        },
      ];

      expect(isPresentationReady(slides)).toBe(false);
    });
  });

  describe('getValidationSummary', () => {
    it('should return success message when no issues', () => {
      const validation = {
        isValid: true,
        issues: [],
        warnings: [],
        errors: [],
      };

      const summary = getValidationSummary(validation);

      expect(summary).toContain('ready');
    });

    it('should summarize warnings only', () => {
      const validation = {
        isValid: true,
        issues: [
          {
            slideIndex: 0,
            slideId: '1',
            elementId: 'text-1',
            elementType: 'text',
            issue: 'Empty',
            severity: 'warning' as const,
            suggestion: 'Add content',
          },
        ],
        warnings: [
          {
            slideIndex: 0,
            slideId: '1',
            elementId: 'text-1',
            elementType: 'text',
            issue: 'Empty',
            severity: 'warning' as const,
            suggestion: 'Add content',
          },
        ],
        errors: [],
      };

      const summary = getValidationSummary(validation);

      expect(summary).toContain('1 warning');
    });

    it('should summarize errors and warnings', () => {
      const validation = {
        isValid: false,
        issues: [
          {
            slideIndex: 0,
            slideId: '1',
            elementId: 'img-1',
            elementType: 'image',
            issue: 'No image',
            severity: 'error' as const,
            suggestion: 'Add image',
          },
          {
            slideIndex: 0,
            slideId: '1',
            elementId: 'text-1',
            elementType: 'text',
            issue: 'Empty',
            severity: 'warning' as const,
            suggestion: 'Add content',
          },
        ],
        warnings: [
          {
            slideIndex: 0,
            slideId: '1',
            elementId: 'text-1',
            elementType: 'text',
            issue: 'Empty',
            severity: 'warning' as const,
            suggestion: 'Add content',
          },
        ],
        errors: [
          {
            slideIndex: 0,
            slideId: '1',
            elementId: 'img-1',
            elementType: 'image',
            issue: 'No image',
            severity: 'error' as const,
            suggestion: 'Add image',
          },
        ],
      };

      const summary = getValidationSummary(validation);

      expect(summary).toContain('1 error');
      expect(summary).toContain('1 warning');
    });
  });

  describe('groupIssuesBySlide', () => {
    it('should group issues by slide index', () => {
      const issues = [
        {
          slideIndex: 0,
          slideId: '1',
          elementId: 'text-1',
          elementType: 'text',
          issue: 'Issue 1',
          severity: 'warning' as const,
          suggestion: 'Fix 1',
        },
        {
          slideIndex: 0,
          slideId: '1',
          elementId: 'text-2',
          elementType: 'text',
          issue: 'Issue 2',
          severity: 'warning' as const,
          suggestion: 'Fix 2',
        },
        {
          slideIndex: 1,
          slideId: '2',
          elementId: 'img-1',
          elementType: 'image',
          issue: 'Issue 3',
          severity: 'error' as const,
          suggestion: 'Fix 3',
        },
      ];

      const grouped = groupIssuesBySlide(issues);

      expect(grouped.size).toBe(2);
      expect(grouped.get(0)).toHaveLength(2);
      expect(grouped.get(1)).toHaveLength(1);
    });
  });
});
