import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TemplateCard, { TemplateCardProps } from '@/components/demo/TemplateCard';

const makeProps = (overrides: Partial<TemplateCardProps> = {}): TemplateCardProps => {
  const baseTheme = {
    id: 'test-theme',
    name: 'Test Theme',
    description: 'A demo theme for testing.',
    slides: [{ id: 's1', elements: [], background: '#ffffff', createdAt: new Date(), lastUpdated: Date.now() }],
    thumbnail: 'https://example.com/thumb.jpg',
  } as any;

  return {
    theme: baseTheme,
    onApply: jest.fn(),
    ...overrides,
  };
};

describe('TemplateCard', () => {
  it('renders title, description, and slide count', () => {
    const props = makeProps();
    render(<TemplateCard {...props} />);

    expect(screen.getByText('Test Theme')).toBeInTheDocument();
    expect(screen.getByText('A demo theme for testing.')).toBeInTheDocument();
    expect(screen.getByText(/slides included/i)).toBeInTheDocument();
  });

  it('renders thumbnail image with accessible alt text', () => {
    const props = makeProps();
    render(<TemplateCard {...props} />);

    const img = screen.getByRole('img', { name: /preview of test theme template/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', props.theme.thumbnail!);
  });

  it('calls onApply when Use template button is clicked', () => {
    const props = makeProps();
    render(<TemplateCard {...props} />);

    const button = screen.getByRole('button', { name: /use template/i });
    fireEvent.click(button);

    expect(props.onApply).toHaveBeenCalledWith('test-theme');
  });

  it('falls back gracefully when thumbnail is missing', () => {
    const themeWithoutThumb: any = {
      id: 'no-thumb',
      name: 'No Thumb Theme',
      description: 'No thumbnail provided.',
      slides: [],
      thumbnail: null,
    };

    const props = makeProps({ theme: themeWithoutThumb });
    render(<TemplateCard {...props} />);

    expect(screen.getByText('Preview unavailable')).toBeInTheDocument();
  });
});
