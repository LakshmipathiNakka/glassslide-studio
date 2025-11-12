// Registry of presentation themes for Glass-Slide
// Each theme: { id, name, description, slides, thumbnail, palette }

import type { Slide } from '@/types/slide-thumbnails';

export interface PresentationTheme {
  id: string;
  name: string;
  description: string;
  slides: Slide[];
  thumbnail: string | null;
  palette?: Record<string, string>;
}

// Business theme removed. Register new themes here.
export const presentationThemes: PresentationTheme[] = [];

export default presentationThemes;
