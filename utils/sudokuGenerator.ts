export type SudokuGrid = (number | null)[][];

// Generate a complete valid Sudoku grid
export const generateCompleteGrid = (): SudokuGrid => {
  const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));

  const isValid = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  };

  const fillGrid = (grid: SudokuGrid): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          // Shuffle numbers for randomness
          for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
          }

          for (const num of numbers) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (fillGrid(grid)) return true;
              grid[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  fillGrid(grid);
  return grid;
};

// Remove numbers from complete grid based on difficulty
export const generatePuzzle = (difficulty: 'easy' | 'normal' | 'hard'): { puzzle: SudokuGrid; solution: SudokuGrid } => {
  const solution = generateCompleteGrid();
  const puzzle = solution.map(row => [...row]);

  // Determine number of cells to remove based on difficulty
  const cellsToRemove = {
    easy: 40,    // ~45% filled
    normal: 50,  // ~38% filled
    hard: 60     // ~26% filled
  }[difficulty];

  const positions: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Remove numbers from random positions
  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = null;
  }

  return { puzzle, solution };
};

// Check if a move is valid
export const isValidMove = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (x !== col && grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (x !== row && grid[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentRow = i + startRow;
      const currentCol = j + startCol;
      if (currentRow !== row && currentCol !== col && grid[currentRow][currentCol] === num) {
        return false;
      }
    }
  }

  return true;
};

// Check if puzzle is complete
export const isPuzzleComplete = (grid: SudokuGrid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) return false;
    }
  }
  return true;
};

// Get a hint for the current puzzle
export const getHint = (puzzle: SudokuGrid, solution: SudokuGrid): { row: number; col: number; value: number } | null => {
  const emptyCells: { row: number; col: number }[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] === null) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) return null;

  // Return a random empty cell with its solution
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  return {
    row: randomCell.row,
    col: randomCell.col,
    value: solution[randomCell.row][randomCell.col]!
  };
};