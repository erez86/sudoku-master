import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { Typography } from '@/components/UI/Typography';

export type CellValue = number | null;
export type SudokuGrid = CellValue[][];

interface SudokuBoardProps {
  grid: SudokuGrid;
  originalGrid: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  errorCells: Set<string>;
  onCellPress: (row: number, col: number) => void;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  grid,
  originalGrid,
  selectedCell,
  errorCells,
  onCellPress,
}) => {
  const isOriginalCell = (row: number, col: number) => {
    return originalGrid[row][col] !== null;
  };

  const isSelected = (row: number, col: number) => {
    return selectedCell?.row === row && selectedCell?.col === col;
  };

  const isInSameRowOrCol = (row: number, col: number) => {
    if (!selectedCell) return false;
    return selectedCell.row === row || selectedCell.col === col;
  };

  const isInSameBox = (row: number, col: number) => {
    if (!selectedCell) return false;
    const boxRow = Math.floor(selectedCell.row / 3);
    const boxCol = Math.floor(selectedCell.col / 3);
    const cellBoxRow = Math.floor(row / 3);
    const cellBoxCol = Math.floor(col / 3);
    return boxRow === cellBoxRow && boxCol === cellBoxCol;
  };

  const isSameNumber = (row: number, col: number) => {
    if (!selectedCell || !grid[selectedCell.row][selectedCell.col] || !grid[row][col]) {
      return false;
    }
    return grid[selectedCell.row][selectedCell.col] === grid[row][col];
  };

  const hasError = (row: number, col: number) => {
    return errorCells.has(`${row}-${col}`);
  };

  const getCellStyle = (row: number, col: number) => {
    // Use type assertion to help TypeScript understand the array of styles
    const styles: any[] = [cellStyles.cell];

    // Border styles for 3x3 boxes
    if (row % 3 === 0) styles.push(cellStyles.topBorder);
    if (col % 3 === 0) styles.push(cellStyles.leftBorder);
    if (row === 8) styles.push(cellStyles.bottomBorder);
    if (col === 8) styles.push(cellStyles.rightBorder);

    // Error highlighting takes priority
    if (hasError(row, col)) {
      styles.push(cellStyles.error);
    } else if (isSelected(row, col)) {
      styles.push(cellStyles.selected);
    } else if (isSameNumber(row, col)) {
      styles.push(cellStyles.sameNumber);
    } else if (isInSameRowOrCol(row, col) || isInSameBox(row, col)) {
      styles.push(cellStyles.highlighted);
    }

    return styles;
  };

  const getTextStyle = (row: number, col: number): TextStyle[] => {
    const styles: TextStyle[] = [cellStyles.cellText];

    if (hasError(row, col)) {
      styles.push(cellStyles.errorText);
    } else if (isOriginalCell(row, col)) {
      styles.push(cellStyles.originalText);
    } else {
      styles.push(cellStyles.userText);
    }

    return styles;
  };

  return (
    <View style={cellStyles.board}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={cellStyles.row}>
          {row.map((cell, colIndex) => (
            <TouchableOpacity
              key={`${rowIndex}-${colIndex}`}
              style={getCellStyle(rowIndex, colIndex)}
              onPress={() => onCellPress(rowIndex, colIndex)}
              activeOpacity={0.7}
            >
              <Typography
                variant="label"
                style={getTextStyle(rowIndex, colIndex)}
              >
                {cell || ''}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const cellStyles = StyleSheet.create({
  board: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 0,
    aspectRatio: 1,
    maxWidth: 350,
    width: '100%',
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#bdc3c7',
  },
  cellText: {
    fontSize: 18,
    fontWeight: '600',
  },
  originalText: {
    color: '#2c3e50',
  },
  userText: {
    color: '#3498db',
  },
  selected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
    borderWidth: 2,
  },
  highlighted: {
    backgroundColor: '#f5f5f5',
  },
  sameNumber: {
    backgroundColor: '#e8f5e8',
  },
  error: {
    backgroundColor: '#ffeaea',
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  errorText: {
    color: '#e74c3c',
  },
  topBorder: {
    borderTopWidth: 2,
    borderTopColor: '#2c3e50',
  },
  leftBorder: {
    borderLeftWidth: 2,
    borderLeftColor: '#2c3e50',
  },
  bottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#2c3e50',
  },
  rightBorder: {
    borderRightWidth: 2,
    borderRightColor: '#2c3e50',
  },
});