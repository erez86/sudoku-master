export const GRID_SIZE = 9;
export const BOX_SIZE = 3;

export const DIFFICULTY_SETTINGS = {
  easy: { cellsToRemove: 35, maxMistakes: 5 },
  medium: { cellsToRemove: 45, maxMistakes: 4 },
  hard: { cellsToRemove: 55, maxMistakes: 3 },
  expert: { cellsToRemove: 65, maxMistakes: 2 }
} as const;

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5AC8FA',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  error: '#FF3B30',
  success: '#34C759',
  border: '#C6C6C8',
  highlight: '#FFD60A',
  selected: '#007AFF20'
} as const;

export const FONT_SIZES = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  cell: 18
} as const;