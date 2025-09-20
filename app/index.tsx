import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert, Modal } from 'react-native';
import { Typography } from '@/components/UI/Typography';
import { Button } from '@/components/UI/Button';
import { router } from 'expo-router';
import { useState } from 'react';

export default function HomeScreen() {
  const [difficultyModalVisible, setDifficultyModalVisible] = useState(false);

  const handleStartGame = () => {
    setDifficultyModalVisible(true);
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'normal' | 'hard') => {
    setDifficultyModalVisible(false);
    router.push(`/game?difficulty=${difficulty}`);
  };

  const handleRulesAndTips = () => {
    router.push('/rules');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleExitGame = () => {
    Alert.alert('Exit Game', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', onPress: () => Alert.alert('Goodbye!') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Typography variant="title" style={styles.title}>Sudoku Master</Typography>
      <Typography variant="caption" style={styles.subtitle}>Challenge your mind with the ultimate puzzle game</Typography>

      <View style={styles.menuContainer}>
        <Button
          title="Start Game"
          icon={{ library: 'ionicons', name: 'play-circle' }}
          onPress={handleStartGame}
          variant="primary"
          size="large"
          style={styles.menuButton}
        />

        <Button
          title="Rules & Tips"
          icon={{ library: 'ionicons', name: 'help-circle' }}
          onPress={handleRulesAndTips}
          variant="primary"
          size="large"
          style={styles.menuButton}
        />

        <Button
          title="Settings"
          icon={{ library: 'ionicons', name: 'settings' }}
          onPress={handleSettings}
          variant="primary"
          size="large"
          style={styles.menuButton}
        />

        <Button
          title="Exit Game"
          icon={{ library: 'ionicons', name: 'exit' }}
          onPress={handleExitGame}
          variant="danger"
          size="large"
          style={styles.exitButton}
        />
      </View>

      {/* Difficulty Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={difficultyModalVisible}
        onRequestClose={() => setDifficultyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="title" style={styles.modalTitle}>Select Difficulty</Typography>
            <Typography variant="caption" style={styles.modalSubtitle}>Choose your challenge level</Typography>

            <Button
              title="Easy"
              icon={{ library: 'ionicons', name: 'checkmark-circle' }}
              onPress={() => handleDifficultySelect('easy')}
              variant="success"
              size="large"
              style={styles.difficultyButton}
            />

            <Button
              title="Normal"
              icon={{ library: 'ionicons', name: 'alert-circle' }}
              onPress={() => handleDifficultySelect('normal')}
              variant="warning"
              size="large"
              style={styles.difficultyButton}
            />

            <Button
              title="Hard"
              icon={{ library: 'ionicons', name: 'warning' }}
              onPress={() => handleDifficultySelect('hard')}
              variant="danger"
              size="large"
              style={styles.difficultyButton}
            />

            <Button
              title="Cancel"
              icon={{ library: 'ionicons', name: 'close' }}
              onPress={() => setDifficultyModalVisible(false)}
              variant="secondary"
              size="medium"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 40,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 300,
  },
  menuButton: {
    marginBottom: 15,
  },
  exitButton: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    marginBottom: 5,
    color: '#2c3e50',
  },
  modalSubtitle: {
    marginBottom: 25,
    color: '#7f8c8d',
  },
  difficultyButton: {
    width: '100%',
    marginBottom: 10,
  },
  cancelButton: {
    marginTop: 10,
  },
});
