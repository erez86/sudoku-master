import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Typography } from '@/components/UI/Typography';

export default function RulesScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Typography variant="label" style={styles.sectionTitle}>How to Play:</Typography>
        <Typography variant="body" style={styles.ruleText}>• Fill the 9×9 grid with digits 1-9</Typography>
        <Typography variant="body" style={styles.ruleText}>• Each row must contain all digits 1-9</Typography>
        <Typography variant="body" style={styles.ruleText}>• Each column must contain all digits 1-9</Typography>
        <Typography variant="body" style={styles.ruleText}>• Each 3×3 box must contain all digits 1-9</Typography>

        <Typography variant="label" style={styles.sectionTitle}>Tips for Success:</Typography>
        <Typography variant="body" style={styles.ruleText}>• Start with rows/columns that have the most numbers</Typography>
        <Typography variant="body" style={styles.ruleText}>• Look for numbers that can only go in one place</Typography>
        <Typography variant="body" style={styles.ruleText}>• Use process of elimination</Typography>
        <Typography variant="body" style={styles.ruleText}>• Look for patterns and logical deductions</Typography>

        <Typography variant="label" style={styles.sectionTitle}>Difficulty Levels:</Typography>
        <Typography variant="body" style={styles.ruleText}>• <Typography variant="label" style={styles.difficultyLevel}>Easy</Typography> - Perfect for beginners</Typography>
        <Typography variant="body" style={styles.ruleText}>• <Typography variant="label" style={styles.difficultyLevel}>Medium</Typography> - Good for developing skills</Typography>
        <Typography variant="body" style={styles.ruleText}>• <Typography variant="label" style={styles.difficultyLevel}>Hard</Typography> - Challenge for experienced players</Typography>
        <Typography variant="body" style={styles.ruleText}>• <Typography variant="label" style={styles.difficultyLevel}>Expert</Typography> - Ultimate test of logic</Typography>

        <Typography variant="label" style={styles.sectionTitle}>Game Features:</Typography>
        <Typography variant="body" style={styles.ruleText}>• Highlight conflicts automatically</Typography>
        <Typography variant="body" style={styles.ruleText}>• Undo/redo moves</Typography>
        <Typography variant="body" style={styles.ruleText}>• Notes and pencil marks</Typography>
        <Typography variant="body" style={styles.ruleText}>• Timer and statistics tracking</Typography>
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginTop: 25,
    marginBottom: 15,
    color: '#2c3e50',
  },
  ruleText: {
    marginBottom: 10,
    color: '#34495e',
  },
  difficultyLevel: {
    color: '#3498db',
  },
});
