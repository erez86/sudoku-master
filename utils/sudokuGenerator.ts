export type SudokuGrid = (number | null)[][];

// Utility function to create a deep copy of a grid
const copyGrid = (grid: SudokuGrid): SudokuGrid => {
  return grid.map(row => [...row]);
};

// Shuffle array function
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Check if a number is valid in a specific position
const isValidPlacement = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
};

// Generate a complete valid Sudoku grid using backtracking
export const generateCompleteGrid = (): SudokuGrid => {
  const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));

  const fillGrid = (): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          // Use shuffled numbers for randomness
          const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

          for (const num of numbers) {
            if (isValidPlacement(grid, row, col, num)) {
              grid[row][col] = num;
              if (fillGrid()) return true;
              grid[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  fillGrid();
  return grid;
};

// Solve a Sudoku puzzle using backtracking
const solveSudoku = (grid: SudokuGrid): SudokuGrid | null => {
  const workingGrid = copyGrid(grid);

  const solve = (): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (workingGrid[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(workingGrid, row, col, num)) {
              workingGrid[row][col] = num;
              if (solve()) return true;
              workingGrid[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  return solve() ? workingGrid : null;
};

// Count the number of solutions for a puzzle (to ensure uniqueness)
const countSolutions = (grid: SudokuGrid, maxSolutions: number = 2): number => {
  const workingGrid = copyGrid(grid);
  let solutionCount = 0;

  const solve = (): void => {
    if (solutionCount >= maxSolutions) return; // Early exit if we already found multiple solutions

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (workingGrid[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(workingGrid, row, col, num)) {
              workingGrid[row][col] = num;
              solve();
              workingGrid[row][col] = null;

              if (solutionCount >= maxSolutions) return;
            }
          }
          return;
        }
      }
    }
    solutionCount++;
  };

  solve();
  return solutionCount;
};

// Check if removing a specific cell still leaves a unique solution
const canRemoveCell = (grid: SudokuGrid, row: number, col: number): boolean => {
  const originalValue = grid[row][col];
  grid[row][col] = null;

  const solutions = countSolutions(grid, 2);

  grid[row][col] = originalValue; // Restore the value
  return solutions === 1;
};

// Generate puzzle based on difficulty with proper validation
export const generatePuzzle = (difficulty: 'easy' | 'normal' | 'hard'): { puzzle: SudokuGrid; solution: SudokuGrid } => {
  const solution = generateCompleteGrid();
  const puzzle = copyGrid(solution);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      targetCells: 45,   // 45-50 filled cells (easy)
      minCells: 40
    },
    normal: {
      targetCells: 35,   // 35-40 filled cells (medium)
      minCells: 30
    },
    hard: {
      targetCells: 25,   // 25-30 filled cells (hard)
      minCells: 22
    }
  };

  const { targetCells, minCells } = difficultySettings[difficulty];

  // Create list of all positions
  const positions: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }

  // Shuffle positions for random removal
  const shuffledPositions = shuffleArray(positions);
  let filledCells = 81;

  // Remove cells while maintaining uniqueness
  for (const [row, col] of shuffledPositions) {
    if (filledCells <= targetCells) break;

    // Try to remove this cell
    if (canRemoveCell(puzzle, row, col)) {
      puzzle[row][col] = null;
      filledCells--;
    }

    // Stop if we reach minimum cells for difficulty
    if (filledCells <= minCells) break;
  }

  // Ensure the puzzle is still solvable
  const testSolution = solveSudoku(puzzle);
  if (!testSolution) {
    console.warn('Generated puzzle is not solvable, regenerating...');
    return generatePuzzle(difficulty); // Regenerate if not solvable
  }

  return { puzzle, solution };
};

// Check if a move is valid (improved logic)
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
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentRow = startRow + i;
      const currentCol = startCol + j;
      if (currentRow !== row && currentCol !== col && grid[currentRow][currentCol] === num) {
        return false;
      }
    }
  }

  return true;
};

// Check if puzzle is complete and valid
export const isPuzzleComplete = (grid: SudokuGrid): boolean => {
  // Check if all cells are filled
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) return false;
    }
  }

  // Check if the solution is valid
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const num = grid[row][col]!;
      grid[row][col] = null; // Temporarily remove to check validity
      if (!isValidPlacement(grid, row, col, num)) {
        grid[row][col] = num; // Restore
        return false;
      }
      grid[row][col] = num; // Restore
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

// Validate if a given Sudoku grid is completely valid
export const isValidSudoku = (grid: SudokuGrid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const num = grid[row][col];
      if (num !== null) {
        grid[row][col] = null; // Temporarily remove
        if (!isValidPlacement(grid, row, col, num)) {
          grid[row][col] = num; // Restore
          return false;
        }
        grid[row][col] = num; // Restore
      }
    }
  }
  return true;
};