import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Typography } from '@/components/UI/Typography';
import { Button } from '@/components/UI/Button';
import { router, useLocalSearchParams } from 'expo-router';

export default function GameScreen() {
  const { difficulty } = useLocalSearchParams<{ difficulty: 'easy' | 'normal' | 'hard' }>();

  const handleGoBack = () => {
    router.back();
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return '#27ae60';
      case 'normal': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#3498db';
    }
  };

  const getDifficultyEmoji = () => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'normal': return '🟡';
      case 'hard': return '🔴';
      default: return '🎮';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Typography variant="title" style={styles.title}>Sudoku Game</Typography>

        {/* Difficulty Indicator */}
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
          <Typography variant="caption" style={styles.difficultyText}>
            {getDifficultyEmoji()} {difficulty?.toUpperCase() || 'UNKNOWN'} LEVEL
          </Typography>
        </View>

        <Typography variant="body" style={styles.description}>
          Get ready for a {difficulty} challenge!
        </Typography>

        <View style={styles.placeholder}>
          <Typography variant="body" style={styles.placeholderText}>
            🧩 Sudoku Grid Coming Soon
          </Typography>
          <Typography variant="caption" style={styles.placeholderSubtext}>
            A beautiful 9×9 Sudoku grid will appear here
          </Typography>
          <Typography variant="caption" style={styles.placeholderSubtext}>
            with {difficulty} difficulty level
          </Typography>
        </View>

        <View style={styles.gameInfo}>
          <Typography variant="caption" style={styles.gameInfoText}>
            ⏱️ Timer: 00:00
          </Typography>
          <Typography variant="caption" style={styles.gameInfoText}>
            💡 Hints: 3 remaining
          </Typography>
        </View>

        <Button
          title="Back to Menu"
          icon={{ library: 'ionicons', name: 'arrow-back' }}
          onPress={handleGoBack}
          variant="primary"
          size="large"
        />
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    marginBottom: 15,
  },
  difficultyBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  difficultyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  description: {
    color: '#ecf0f1',
    textAlign: 'center',
    marginBottom: 30,
  },
  placeholder: {
    backgroundColor: '#34495e',
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 5,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  gameInfoText: {
    color: '#ecf0f1',
  },
});
