import { Slide } from '@/types/slide-thumbnails';
import { Element } from '@/hooks/use-action-manager';

export interface ValidationIssue {
  slideIndex: number;
  slideId: string;
  elementId: string;
  elementType: string;
  issue: string;
  severity: 'warning' | 'error';
  suggestion: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  errors: ValidationIssue[];
}

/**
 * Validates all slides before presentation mode
 * Checks for placeholder content, empty elements, and rendering issues
 */
export function validatePresentation(slides: Slide[]): ValidationResult {
  const issues: ValidationIssue[] = [];

  slides.forEach((slide, slideIndex) => {
    slide.elements.forEach((element) => {
      const el = element as Element;

      // Check text elements
      if (el.type === 'text') {
        const isEmpty = !el.text || el.text.trim() === '';
        const hasPlaceholder = !!el.placeholder;
        const hasContent = !!el.content && el.content.trim() !== '';

        if (isEmpty && !hasContent) {
          issues.push({
            slideIndex,
            slideId: slide.id,
            elementId: el.id,
            elementType: 'text',
            issue: hasPlaceholder 
              ? `Text element contains placeholder: "${el.placeholder}"`
              : 'Text element is empty',
            severity: 'warning',
            suggestion: 'Add content to the text element or remove it before presenting',
          });
        }

        // Check for placeholder text that wasn't replaced
        if (hasPlaceholder && isEmpty) {
          issues.push({
            slideIndex,
            slideId: slide.id,
            elementId: el.id,
            elementType: 'text',
            issue: `Placeholder text "${el.placeholder}" was not replaced`,
            severity: 'warning',
            suggestion: 'Replace placeholder with actual content',
          });
        }
      }

      // Check image elements
      if (el.type === 'image') {
        if (!el.imageUrl || el.imageUrl.trim() === '') {
          issues.push({
            slideIndex,
            slideId: slide.id,
            elementId: el.id,
            elementType: 'image',
            issue: 'Image element has no image URL',
            severity: 'error',
            suggestion: 'Upload an image or remove the element',
          });
        }
      }

      // Check chart elements
      if (el.type === 'chart') {
        if (!el.chartData || !el.chartData.labels || el.chartData.labels.length === 0) {
          issues.push({
            slideIndex,
            slideId: slide.id,
            elementId: el.id,
            elementType: 'chart',
            issue: 'Chart has no data',
            severity: 'warning',
            suggestion: 'Add data to the chart or remove it',
          });
        }
      }

      // Check table elements
      if (el.type === 'table') {
        const rows = el.rows || 0;
        const cols = el.cols || 0;
        const hasData = el.tableData && el.tableData.length > 0;

        if (!hasData || rows === 0 || cols === 0) {
          issues.push({
            slideIndex,
            slideId: slide.id,
            elementId: el.id,
            elementType: 'table',
            issue: 'Table has no data',
            severity: 'warning',
            suggestion: 'Add content to table cells or remove the table',
          });
        }
      }
    });

    // Check if slide is completely empty
    if (slide.elements.length === 0) {
      issues.push({
        slideIndex,
        slideId: slide.id,
        elementId: '',
        elementType: 'slide',
        issue: 'Slide is empty',
        severity: 'warning',
        suggestion: 'Add content to the slide or remove it',
      });
    }
  });

  const warnings = issues.filter(i => i.severity === 'warning');
  const errors = issues.filter(i => i.severity === 'error');

  return {
    isValid: errors.length === 0,
    issues,
    warnings,
    errors,
  };
}

/**
 * Strips placeholder attributes from elements before presentation
 * Returns cleaned slides ready for presentation
 */
export function sanitizeSlidesForPresentation(slides: Slide[]): Slide[] {
  return slides.map(slide => ({
    ...slide,
    elements: slide.elements.map(element => {
      const el = { ...element } as any;

      // Remove placeholder from text elements
      if (el.type === 'text') {
        delete el.placeholder;
        
        // If text is empty but has placeholder, remove the element entirely from presentation
        const isEmpty = !el.text || el.text.trim() === '';
        const hasNoContent = !el.content || el.content.trim() === '';
        
        if (isEmpty && hasNoContent) {
          return null; // Will be filtered out
        }
      }

      return el;
    }).filter(Boolean) as Element[], // Remove null elements
  }));
}

/**
 * Checks if slides are presentation-ready
 * Returns true if no critical errors exist
 */
export function isPresentationReady(slides: Slide[]): boolean {
  const validation = validatePresentation(slides);
  return validation.errors.length === 0;
}

/**
 * Gets a human-readable summary of validation issues
 */
export function getValidationSummary(validation: ValidationResult): string {
  const { errors, warnings } = validation;
  
  if (errors.length === 0 && warnings.length === 0) {
    return 'All slides are ready for presentation!';
  }

  const parts: string[] = [];
  
  if (errors.length > 0) {
    parts.push(`${errors.length} error${errors.length > 1 ? 's' : ''}`);
  }
  
  if (warnings.length > 0) {
    parts.push(`${warnings.length} warning${warnings.length > 1 ? 's' : ''}`);
  }

  return `Found ${parts.join(' and ')}`;
}

/**
 * Groups validation issues by slide
 */
export function groupIssuesBySlide(issues: ValidationIssue[]): Map<number, ValidationIssue[]> {
  const grouped = new Map<number, ValidationIssue[]>();
  
  issues.forEach(issue => {
    const existing = grouped.get(issue.slideIndex) || [];
    existing.push(issue);
    grouped.set(issue.slideIndex, existing);
  });

  return grouped;
}
