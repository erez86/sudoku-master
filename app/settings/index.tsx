import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Typography } from '@/components/UI/Typography';
import { useState } from 'react';

export default function SettingsScreen() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hintEnabled, setHintEnabled] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false);

  const SettingItem = ({ label, description, value, onValueChange }: {
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Typography variant="label" style={styles.settingLabel}>{label}</Typography>
        {description && (
          <Typography variant="caption" style={styles.settingDescription}>{description}</Typography>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#bdc3c7', true: '#3498db' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const DifficultyButton = ({ title, description, onPress }: {
    title: string;
    description: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.difficultyButton} onPress={onPress}>
      <Typography variant="label" style={styles.difficultyTitle}>{title}</Typography>
      <Typography variant="caption" style={styles.difficultyDescription}>{description}</Typography>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Typography variant="label" style={styles.sectionTitle}>Game Preferences</Typography>

        <SettingItem
          label="Sound Effects"
          description="Play sounds for moves and completions"
          value={soundEnabled}
          onValueChange={setSoundEnabled}
        />

        <SettingItem
          label="Show Timer"
          description="Display elapsed time during game"
          value={timerEnabled}
          onValueChange={setTimerEnabled}
        />

        <SettingItem
          label="Hints Available"
          description="Allow hint system to help when stuck"
          value={hintEnabled}
          onValueChange={setHintEnabled}
        />

        <SettingItem
          label="Auto-check Errors"
          description="Highlight conflicts immediately"
          value={autoCheckEnabled}
          onValueChange={setAutoCheckEnabled}
        />

        <Typography variant="label" style={styles.sectionTitle}>Default Difficulty</Typography>

        <DifficultyButton
          title="Easy"
          description="Perfect for learning the basics"
          onPress={() => {}}
        />

        <DifficultyButton
          title="Medium"
          description="Good balance of challenge and fun"
          onPress={() => {}}
        />

        <DifficultyButton
          title="Hard"
          description="For experienced players"
          onPress={() => {}}
        />

        <DifficultyButton
          title="Expert"
          description="Ultimate challenge"
          onPress={() => {}}
        />

        <Typography variant="label" style={styles.sectionTitle}>Statistics</Typography>

        <View style={styles.statContainer}>
          <Typography variant="body" style={styles.statText}>Games Played: 0</Typography>
          <Typography variant="body" style={styles.statText}>Games Won: 0</Typography>
          <Typography variant="body" style={styles.statText}>Best Time: --:--</Typography>
          <Typography variant="body" style={styles.statText}>Average Time: --:--</Typography>
        </View>

        <TouchableOpacity style={styles.resetButton}>
          <Typography variant="label" style={styles.resetButtonText}>Reset Statistics</Typography>
        </TouchableOpacity>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingContent: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    color: '#2c3e50',
    marginBottom: 2,
  },
  settingDescription: {
    color: '#7f8c8d',
  },
  difficultyButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  difficultyTitle: {
    color: '#3498db',
    marginBottom: 2,
  },
  difficultyDescription: {
    color: '#7f8c8d',
  },
  statContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statText: {
    color: '#34495e',
    marginBottom: 5,
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
  },
});
