import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import { Typography } from '@/components/UI/Typography';
import { Button } from '@/components/UI/Button';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { SudokuBoard, SudokuGrid } from '@/components/Game/SudokuBoard';
import { SuccessModal } from '@/components/Game/SuccessModal';
import { generatePuzzle, isValidMove, isPuzzleComplete, getHint } from '@/utils/sudokuGenerator';
import {
  saveGameState,
  loadGameState,
  clearGameState,
  updateComprehensiveGameStats,
  incrementGameForfeitedStats,
  incrementGameStartedStats,
  incrementHintUsedStats,
  addMistakeToStats,
  GameState
} from '@/utils/storage';

export default function GameScreen() {
  const { difficulty } = useLocalSearchParams<{ difficulty: 'easy' | 'normal' | 'hard' }>();
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [hints, setHints] = useState(3);
  const [currentGrid, setCurrentGrid] = useState<SudokuGrid>([]);
  const [originalGrid, setOriginalGrid] = useState<SudokuGrid>([]);
  const [solutionGrid, setSolutionGrid] = useState<SudokuGrid>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<Array<{ row: number; col: number; oldValue: number | null; newValue: number | null }>>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [usedAutoFill, setUsedAutoFill] = useState(false);
  const [hintsUsedInThisGame, setHintsUsedInThisGame] = useState(0);

  // Initialize game - try to restore saved state first
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Try to load saved game state
        const savedState = await loadGameState();

        if (savedState && savedState.difficulty === (difficulty || 'normal')) {
          // Restore saved game
          setCurrentGrid(savedState.currentGrid);
          setOriginalGrid(savedState.originalGrid);
          setSolutionGrid(savedState.solutionGrid);
          setSelectedCell(savedState.selectedCell);
          setMoveHistory(savedState.moveHistory);
          setErrorCells(new Set(savedState.errorCells));
          setMistakes(savedState.mistakes);
          setTimer(savedState.timer);
          setHints(savedState.hints);
        } else {
          // Generate new puzzle
          const { puzzle, solution } = generatePuzzle(difficulty || 'normal');
          setCurrentGrid(puzzle.map(row => [...row]));
          setOriginalGrid(puzzle.map(row => [...row]));
          setSolutionGrid(solution);

          // Clear any existing saved state since we're starting a new game
          if (savedState) {
            await clearGameState();
          }

          // Track new game started
          await incrementGameStartedStats();
        }
      } catch (error) {
        console.error('Error initializing game:', error);
        // Fallback to generating new puzzle
        const { puzzle, solution } = generatePuzzle(difficulty || 'normal');
        setCurrentGrid(puzzle.map(row => [...row]));
        setOriginalGrid(puzzle.map(row => [...row]));
        setSolutionGrid(solution);
      }
    };

    initializeGame();
  }, [difficulty]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return '#27ae60';
      case 'normal': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#3498db';
    }
  };

  const handleCellPress = (row: number, col: number) => {
    if (originalGrid[row] && originalGrid[row][col] !== null) {
      // Can't select original cells
      return;
    }
    setSelectedCell({ row, col });
  };

  const handleNumberSelect = (num: number) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (originalGrid[row] && originalGrid[row][col] !== null) {
      // Can't modify original cells
      return;
    }

    const newGrid = currentGrid.map(r => [...r]);
    const oldValue = newGrid[row][col];
    const cellKey = `${row}-${col}`;

    if (oldValue === num) {
      // If same number, remove it
      newGrid[row][col] = null;
      // Remove from error cells when clearing
      setErrorCells(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(cellKey);
        return newErrors;
      });
    } else {
      // Place new number
      newGrid[row][col] = num;

      // Check if move is valid
      if (!isValidMove(newGrid, row, col, num)) {
        setMistakes(prev => prev + 1);
        // Track mistake in stats
        addMistakeToStats();
        // Add to error cells
        setErrorCells(prev => new Set(prev).add(cellKey));
      } else {
        // Remove from error cells if valid
        setErrorCells(prev => {
          const newErrors = new Set(prev);
          newErrors.delete(cellKey);
          return newErrors;
        });
      }
    }

    // Add to move history (limit to 3 steps)
    setMoveHistory(prev => {
      const newHistory = [...prev, { row, col, oldValue, newValue: newGrid[row][col] }];
      return newHistory.slice(-3); // Keep only last 3 moves
    });
    setCurrentGrid(newGrid);

    // Check if puzzle is complete
    if (isPuzzleComplete(newGrid)) {
      handleGameComplete();
    }
  };

  const handleHint = () => {
    if (hints === 0) return;

    const hint = getHint(currentGrid, solutionGrid);
    if (hint) {
      const newGrid = currentGrid.map(r => [...r]);
      const oldValue = newGrid[hint.row][hint.col];
      newGrid[hint.row][hint.col] = hint.value;

      setMoveHistory(prev => [...prev, {
        row: hint.row,
        col: hint.col,
        oldValue,
        newValue: hint.value
      }]);
      setCurrentGrid(newGrid);
      setHints(prev => prev - 1);
      setHintsUsedInThisGame(prev => prev + 1);
      setSelectedCell({ row: hint.row, col: hint.col });

      // Track hint usage in stats
      incrementHintUsedStats();
    }
  };

  const handleUndo = () => {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const newGrid = currentGrid.map(r => [...r]);
    newGrid[lastMove.row][lastMove.col] = lastMove.oldValue;
    const cellKey = `${lastMove.row}-${lastMove.col}`;

    // Remove from error cells when undoing
    setErrorCells(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(cellKey);
      return newErrors;
    });

    setCurrentGrid(newGrid);
    setMoveHistory(prev => prev.slice(0, -1));
  };

  const handleReset = () => {
    setCurrentGrid(originalGrid.map(row => [...row]));
    setMoveHistory([]);
    setMistakes(0);
    setSelectedCell(null);
    setErrorCells(new Set());
  };

  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  // Auto-save game state
  const saveCurrentGameState = useCallback(async () => {
    if (currentGrid.length === 0 || originalGrid.length === 0 || solutionGrid.length === 0) {
      return; // Don't save incomplete state
    }

    const gameState: GameState = {
      currentGrid,
      originalGrid,
      solutionGrid,
      selectedCell,
      moveHistory,
      errorCells: Array.from(errorCells),
      mistakes,
      timer,
      hints,
      difficulty: difficulty || 'normal',
      timestamp: Date.now(),
    };

    await saveGameState(gameState);
  }, [currentGrid, originalGrid, solutionGrid, selectedCell, moveHistory, errorCells, mistakes, timer, hints, difficulty]);

  // Auto-save whenever game state changes
  useEffect(() => {
    if (currentGrid.length > 0) {
      saveCurrentGameState();
    }
  }, [currentGrid, mistakes, timer, hints, moveHistory, errorCells, saveCurrentGameState]);

  const handleGameComplete = async () => {
    try {
      // Update comprehensive game statistics
      await updateComprehensiveGameStats({
        difficulty: difficulty || 'normal',
        timeInSeconds: timer,
        mistakes: mistakes,
        hintsUsed: hintsUsedInThisGame,
        wasAutoFilled: usedAutoFill,
        isCompleted: true,
      });

      // Clear saved game state since game is complete
      await clearGameState();

      // Stop the timer
      setIsPaused(true);

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error handling game completion:', error);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate back to main page
    router.back();
  };

  const handleNotes = () => {
    // Notes functionality to be implemented
    console.log('Notes feature coming soon!');
  };

  const handleAutoFill = () => {
    Alert.alert(
      'Auto Fill',
      'This will complete the entire puzzle. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            setUsedAutoFill(true);
            setCurrentGrid(solutionGrid.map(row => [...row]));
            setErrorCells(new Set());
            setSelectedCell(null);
            handleGameComplete();
          }
        }
      ]
    );
  };

  const handleForfeit = () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to forfeit this game? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            // Track forfeit statistics
            await incrementGameForfeitedStats(timer);
            await clearGameState();
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Panel */}
      <View style={styles.topPanel}>
        <View style={styles.statItem}>
          <Typography variant="caption" style={styles.statLabel}>Mistakes</Typography>
          <Typography variant="label" style={styles.statValue}>{mistakes}/3</Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="caption" style={styles.statLabel}>Timer</Typography>
          <Typography variant="label" style={styles.statValue}>{formatTime(timer)}</Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="caption" style={styles.statLabel}>Hints</Typography>
          <Typography variant="label" style={styles.statValue}>{hints}</Typography>
        </View>
      </View>

      {/* Game Board */}
      <View style={styles.gameBoard}>
        {currentGrid.length > 0 ? (
          <SudokuBoard
            grid={currentGrid}
            originalGrid={originalGrid}
            selectedCell={selectedCell}
            errorCells={errorCells}
            onCellPress={handleCellPress}
          />
        ) : (
          <View style={styles.placeholder}>
            <Typography variant="body" style={styles.placeholderText}>
              🧩 Generating Puzzle...
            </Typography>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
              <Typography variant="caption" style={styles.difficultyText}>
                {difficulty?.toUpperCase() || 'UNKNOWN'} LEVEL
              </Typography>
            </View>
          </View>
        )}
      </View>

      {/* Number Selection */}
      <View style={styles.numberSelection}>
        <Typography variant="caption" style={styles.sectionLabel}>Select Number</Typography>
        <View style={styles.numbersGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <Button
              key={num}
              title={num.toString()}
              onPress={() => handleNumberSelect(num)}
              variant={selectedNumber === num ? "primary" : "secondary"}
              size="medium"
              style={styles.numberButton}
            />
          ))}
        </View>
      </View>

      {/* Actions Panel */}
      <View style={styles.actionsPanel}>
        {/* First Row */}
        <View style={styles.actionsRow}>
          <Button
            icon={{ library: 'ionicons', name: 'bulb' }}
            onPress={handleHint}
            variant="warning"
            size="small"
            style={styles.actionButton}
            disabled={hints === 0}
            iconOnly={true}
          />
          <Button
            icon={{ library: 'ionicons', name: 'arrow-undo' }}
            onPress={handleUndo}
            variant="secondary"
            size="small"
            style={styles.actionButton}
            disabled={moveHistory.length === 0}
            iconOnly={true}
          />
          <Button
            icon={{ library: 'ionicons', name: 'refresh' }}
            onPress={handleReset}
            variant="danger"
            size="small"
            style={styles.actionButton}
            iconOnly={true}
          />
          <Button
            icon={{ library: 'ionicons', name: 'pencil' }}
            onPress={handleNotes}
            variant="secondary"
            size="small"
            style={styles.actionButton}
            iconOnly={true}
          />
        </View>

        {/* Second Row */}
        <View style={styles.actionsRow}>
          <Button
            icon={{ library: 'ionicons', name: isPaused ? 'play' : 'pause' }}
            onPress={handlePause}
            variant="primary"
            size="small"
            style={styles.actionButton}
            iconOnly={true}
          />
          <Button
            icon={{ library: 'ionicons', name: 'checkmark-done-circle' }}
            onPress={handleAutoFill}
            variant="success"
            size="small"
            style={styles.actionButton}
            iconOnly={true}
          />
          <Button
            icon={{ library: 'ionicons', name: 'exit' }}
            onPress={handleForfeit}
            variant="danger"
            size="small"
            style={styles.actionButton}
            iconOnly={true}
          />
        </View>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        difficulty={difficulty || 'normal'}
        time={formatTime(timer)}
        mistakes={mistakes}
      />

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
    padding: 16,
  },
  topPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#34495e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#bdc3c7',
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  gameBoard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: '#34495e',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  placeholderText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  placeholderSubtext: {
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 15,
  },
  difficultyBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  difficultyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  numberSelection: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#bdc3c7',
    textAlign: 'center',
    marginBottom: 12,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  numberButton: {
    width: 50,
    height: 50,
    marginHorizontal: 3,
    marginBottom: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  actionsPanel: {
    paddingBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
