export type SudokuGrid = (number | null)[][];

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface GameState {
  grid: SudokuGrid;
  solution: SudokuGrid;
  initialGrid: SudokuGrid;
  difficulty: Difficulty;
  timeElapsed: number;
  isCompleted: boolean;
  mistakes: number;
  maxMistakes: number;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellProps {
  value: number | null;
  isInitial: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  hasError: boolean;
  onPress: () => void;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTimes: Record<Difficulty, number>;
  totalPlayTime: number;
}