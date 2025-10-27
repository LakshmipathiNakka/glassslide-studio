// Table color themes inspired by Apple Keynote
export interface TableTheme {
  id: string;
  name: string;
  headerBg: string;
  headerTextColor: string;
  rowEvenBg: string;
  rowOddBg: string;
  borderColor: string;
  textColor: string;
}

export const TABLE_THEMES: TableTheme[] = [
  {
    id: 'keynote1',
    name: 'Keynote Blue',
    headerBg: '#3B82F6',
    headerTextColor: '#FFFFFF',
    rowEvenBg: '#F8FAFC',
    rowOddBg: '#F1F5F9',
    borderColor: '#E2E8F0',
    textColor: '#1E293B'
  },
  {
    id: 'keynote2',
    name: 'Modern Gray',
    headerBg: '#64748B',
    headerTextColor: '#FFFFFF',
    rowEvenBg: '#F8FAFC',
    rowOddBg: '#F1F5F9',
    borderColor: '#E2E8F0',
    textColor: '#1E293B'
  },
  {
    id: 'keynote3',
    name: 'Elegant Green',
    headerBg: '#10B981',
    headerTextColor: '#FFFFFF',
    rowEvenBg: '#ECFDF5',
    rowOddBg: '#D1FAE5',
    borderColor: '#A7F3D0',
    textColor: '#064E3B'
  },
  {
    id: 'keynote4',
    name: 'Vibrant Orange',
    headerBg: '#F97316',
    headerTextColor: '#FFFFFF',
    rowEvenBg: '#FFF7ED',
    rowOddBg: '#FFEDD5',
    borderColor: '#FED7AA',
    textColor: '#7C2D12'
  },
  {
    id: 'keynote5',
    name: 'Royal Purple',
    headerBg: '#8B5CF6',
    headerTextColor: '#FFFFFF',
    rowEvenBg: '#F5F3FF',
    rowOddBg: '#EDE9FE',
    borderColor: '#DDD6FE',
    textColor: '#4C1D95'
  },
  {
    id: 'keynote6',
    name: 'Minimal White',
    headerBg: '#FFFFFF',
    headerTextColor: '#1E293B',
    rowEvenBg: '#FFFFFF',
    rowOddBg: '#F8FAFC',
    borderColor: '#E2E8F0',
    textColor: '#1E293B'
  },
  {
    id: 'keynote7',
    name: 'Dark Mode',
    headerBg: '#334155',
    headerTextColor: '#F8FAFC',
    rowEvenBg: '#1E293B',
    rowOddBg: '#0F172A',
    borderColor: '#334155',
    textColor: '#E2E8F0'
  },
  {
    id: 'keynote8',
    name: 'Warm Sunset',
    headerBg: '#F59E0B',
    headerTextColor: '#FFFFFF',
    rowEvenBg: '#FFFBEB',
    rowOddBg: '#FEF3C7',
    borderColor: '#FDE68A',
    textColor: '#78350F'
  }
];

// Default theme to use when none is selected
export const DEFAULT_THEME: TableTheme = TABLE_THEMES[0];

// Apply a theme to a table element
export const applyTableTheme = (element: any, theme: TableTheme) => {
  if (!element) return;
  
  return {
    ...element,
    headerBg: theme.headerBg,
    headerTextColor: theme.headerTextColor,
    backgroundColor: theme.rowEvenBg,
    rowAltBg: theme.rowOddBg,
    borderColor: theme.borderColor,
    color: theme.textColor,
    // Ensure the theme is saved with the element
    themeId: theme.id
  };
};

// Get theme by ID
export const getThemeById = (id: string): TableTheme => {
  return TABLE_THEMES.find(theme => theme.id === id) || DEFAULT_THEME;
};
