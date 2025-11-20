import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PresentationTheme } from '@/utils/presentationThemes';

export interface TemplateCardProps {
  theme: PresentationTheme;
  onApply: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ theme, onApply }) => {
  const slideCount = theme.slides?.length ?? 0;

  const handleApply = () => {
    onApply(theme.id);
  };

  return (
    <article
      className="template-card group"
      aria-labelledby={`template-card-${theme.id}-title`}
    >
      <button
        type="button"
        className="template-card__click-surface"
        onClick={handleApply}
        aria-label={`Use ${theme.name} template`}
      >
        <div className="template-card__thumbnail-wrapper">
          {theme.thumbnail ? (
            <img
              className="template-card__thumbnail-image"
              src={theme.thumbnail}
              alt={`Preview of ${theme.name} template`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="template-card__thumbnail-placeholder" aria-hidden="true">
              <span>Preview unavailable</span>
            </div>
          )}
          <span className="template-card__badge">
            {slideCount > 0 ? `${slideCount} slides` : 'Template'}
          </span>
        </div>

        <div className="template-card__body">
          <div className="flex items-start justify-between gap-2">
            <h3
              id={`template-card-${theme.id}-title`}
              className="template-card__title"
            >
              {theme.name}
            </h3>
            <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">
              <Eye className="w-4 h-4" />
            </span>
          </div>

          <p className="template-card__description">{theme.description}</p>

          <div className="template-card__meta-row">
            <p className="template-card__meta">
              <span className="sr-only">Slide count:</span>
              {slideCount > 0 ? `${slideCount} slides included` : 'Auto-generated slides'}
            </p>
            <div className="template-card__actions">
              <Button
                variant="outline"
                size="sm"
                className="text-[13px] h-8 btn-micro"
                onClick={handleApply}
              >
                Use template
              </Button>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
};

export default TemplateCard;
