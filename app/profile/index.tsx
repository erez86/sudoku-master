import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, TextInput, Modal, Alert, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/UI/Typography';
import { Button } from '@/components/UI/Button';
import { Icon } from '@/components/UI/Icon';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  createNewProfile,
  switchToProfile,
  updateProfileName,
  deleteProfile,
} from '@/utils/storage';
import { useProfile } from '../../contexts/ProfileContext';

export default function ProfileScreen() {
  const { activeProfile, profileManager, refreshProfile } = useProfile();
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [newProfileModalVisible, setNewProfileModalVisible] = useState(false);
  const [profileSwitchModalVisible, setProfileSwitchModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    if (activeProfile) {
      setNewName(activeProfile.name);
    }
  }, [activeProfile]);

  // Refresh profile data when screen becomes active (e.g., returning from a game)
  useFocusEffect(
    React.useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAverageTime = (times: number[]) => {
    if (times.length === 0) return null;
    const sum = times.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / times.length);
  };

  const getCompletionRate = () => {
    if (!activeProfile || activeProfile.stats.totalGamesStarted === 0) return 0;
    return Math.round((activeProfile.stats.totalGamesCompleted / activeProfile.stats.totalGamesStarted) * 100);
  };

  const handleEditName = async () => {
    if (!activeProfile || newName.trim() === '') return;

    try {
      const success = await updateProfileName(activeProfile.id, newName.trim());
      if (success) {
        await refreshProfile();
        setEditNameModalVisible(false);
        Alert.alert('Success', 'Profile name updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update profile name. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile name:', error);
      Alert.alert('Error', 'Failed to update profile name. Please try again.');
    }
  };

  const handleCreateProfile = async () => {
    if (newProfileName.trim() === '') {
      Alert.alert('Error', 'Please enter a profile name.');
      return;
    }

    try {
      const newProfile = await createNewProfile(newProfileName.trim());
      await refreshProfile();
      setNewProfileModalVisible(false);
      setNewProfileName('');
      Alert.alert('Success', `Profile "${newProfile.name}" created and activated!`);
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    }
  };

  const handleSwitchProfile = async (profileId: string) => {
    try {
      const profile = await switchToProfile(profileId);
      if (profile) {
        await refreshProfile();
        setProfileSwitchModalVisible(false);
        Alert.alert('Success', `Switched to profile "${profile.name}"!`);
      } else {
        Alert.alert('Error', 'Failed to switch profile. Please try again.');
      }
    } catch (error) {
      console.error('Error switching profile:', error);
      Alert.alert('Error', 'Failed to switch profile. Please try again.');
    }
  };

  const handleDeleteProfile = (profileId: string, profileName: string) => {
    if (!profileManager || profileManager.profiles.length <= 1) {
      Alert.alert('Cannot Delete', 'You cannot delete the last profile.');
      return;
    }

    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteProfile(profileId);
              if (success) {
                await refreshProfile();
                Alert.alert('Success', `Profile "${profileName}" deleted successfully.`);
              } else {
                Alert.alert('Error', 'Failed to delete profile. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting profile:', error);
              Alert.alert('Error', 'Failed to delete profile. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!activeProfile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Typography variant="body" style={styles.loadingText}>Loading profile...</Typography>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon
              library="ionicons"
              name="person"
              size={40}
              color="#fff"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.editNameButton}
          onPress={() => setEditNameModalVisible(true)}
        >
          <Typography variant="title" style={styles.playerName}>
            {activeProfile.name}
          </Typography>
          <Icon
            library="ionicons"
            name="pencil"
            size={16}
            color="#bdc3c7"
          />
        </TouchableOpacity>

        <Typography variant="body" style={styles.playerSubtitle}>
          Member since {formatDate(activeProfile.createdAt)}
        </Typography>
      </View>

      {/* Profile Actions */}
      <View style={styles.section}>
        <View style={styles.profileActions}>
          <Button
            title="Switch Profile"
            icon={{ library: 'ionicons', name: 'swap-horizontal' }}
            onPress={() => setProfileSwitchModalVisible(true)}
            variant="primary"
            size="medium"
            style={styles.profileActionButton}
          />
          <Button
            title="New Profile"
            icon={{ library: 'ionicons', name: 'add-circle' }}
            onPress={() => setNewProfileModalVisible(true)}
            variant="success"
            size="medium"
            style={styles.profileActionButton}
          />
        </View>
      </View>

      {/* Overall Stats */}
      <View style={styles.section}>
        <Typography variant="label" style={styles.sectionTitle}>
          Overall Statistics
        </Typography>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Typography variant="title" style={styles.statNumber}>
              {activeProfile.stats.totalGamesCompleted}
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>
              Games Completed
            </Typography>
          </View>

          <View style={styles.statCard}>
            <Typography variant="title" style={styles.statNumber}>
              {activeProfile.stats.totalGamesStarted}
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>
              Games Started
            </Typography>
          </View>

          <View style={styles.statCard}>
            <Typography variant="title" style={styles.statNumber}>
              {getCompletionRate()}%
            </Typography>
            <Typography variant="caption" style={styles.statLabel}>
              Completion Rate
            </Typography>
          </View>
        </View>
      </View>

      {/* Best Times */}
      <View style={styles.section}>
        <Typography variant="label" style={styles.sectionTitle}>
          Best Times
        </Typography>

        <View style={styles.timeCard}>
          <View style={styles.timeRow}>
            <View style={[styles.difficultyTag, styles.easyTag]}>
              <Typography variant="caption" style={styles.difficultyText}>EASY</Typography>
            </View>
            <Typography variant="body" style={styles.timeText}>
              {formatTime(activeProfile.stats.bestTimes.easy)}
            </Typography>
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.difficultyTag, styles.normalTag]}>
              <Typography variant="caption" style={styles.difficultyText}>NORMAL</Typography>
            </View>
            <Typography variant="body" style={styles.timeText}>
              {formatTime(activeProfile.stats.bestTimes.normal)}
            </Typography>
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.difficultyTag, styles.hardTag]}>
              <Typography variant="caption" style={styles.difficultyText}>HARD</Typography>
            </View>
            <Typography variant="body" style={styles.timeText}>
              {formatTime(activeProfile.stats.bestTimes.hard)}
            </Typography>
          </View>
        </View>
      </View>

      {/* Average Times */}
      <View style={styles.section}>
        <Typography variant="label" style={styles.sectionTitle}>
          Average Times (Last 10 Games)
        </Typography>

        <View style={styles.timeCard}>
          <View style={styles.timeRow}>
            <View style={[styles.difficultyTag, styles.easyTag]}>
              <Typography variant="caption" style={styles.difficultyText}>EASY</Typography>
            </View>
            <Typography variant="body" style={styles.timeText}>
              {formatTime(getAverageTime(activeProfile.stats.averageTimes.easy))}
            </Typography>
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.difficultyTag, styles.normalTag]}>
              <Typography variant="caption" style={styles.difficultyText}>NORMAL</Typography>
            </View>
            <Typography variant="body" style={styles.timeText}>
              {formatTime(getAverageTime(activeProfile.stats.averageTimes.normal))}
            </Typography>
          </View>

          <View style={styles.timeRow}>
            <View style={[styles.difficultyTag, styles.hardTag]}>
              <Typography variant="caption" style={styles.difficultyText}>HARD</Typography>
            </View>
            <Typography variant="body" style={styles.timeText}>
              {formatTime(getAverageTime(activeProfile.stats.averageTimes.hard))}
            </Typography>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Typography variant="label" style={styles.sectionTitle}>
          Preferences
        </Typography>

        <View style={styles.preferenceCard}>
          <View style={styles.preferenceRow}>
            <Typography variant="body" style={styles.preferenceLabel}>
              Last Difficulty
            </Typography>
            <View style={[
              styles.difficultyTag,
              activeProfile.preferences.lastDifficulty === 'easy' ? styles.easyTag :
              activeProfile.preferences.lastDifficulty === 'normal' ? styles.normalTag : styles.hardTag
            ]}>
              <Typography variant="caption" style={styles.difficultyText}>
                {activeProfile.preferences.lastDifficulty.toUpperCase()}
              </Typography>
            </View>
          </View>

          <View style={styles.preferenceRow}>
            <Typography variant="body" style={styles.preferenceLabel}>
              Sound Enabled
            </Typography>
            <Typography variant="body" style={styles.preferenceValue}>
              {activeProfile.preferences.soundEnabled ? '🔊 On' : '🔇 Off'}
            </Typography>
          </View>

          <View style={styles.preferenceRow}>
            <Typography variant="body" style={styles.preferenceLabel}>
              Vibration Enabled
            </Typography>
            <Typography variant="body" style={styles.preferenceValue}>
              {activeProfile.preferences.vibrationEnabled ? '📳 On' : '📴 Off'}
            </Typography>
          </View>
        </View>
      </View>

      {/* Edit Name Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editNameModalVisible}
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="title" style={styles.modalTitle}>Edit Profile Name</Typography>
            <TextInput
              style={styles.textInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new name"
              placeholderTextColor="#7f8c8d"
              autoFocus={true}
              maxLength={20}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setEditNameModalVisible(false)}
                variant="secondary"
                size="medium"
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={handleEditName}
                variant="primary"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* New Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={newProfileModalVisible}
        onRequestClose={() => setNewProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="title" style={styles.modalTitle}>Create New Profile</Typography>
            <TextInput
              style={styles.textInput}
              value={newProfileName}
              onChangeText={setNewProfileName}
              placeholder="Enter profile name"
              placeholderTextColor="#7f8c8d"
              autoFocus={true}
              maxLength={20}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setNewProfileModalVisible(false);
                  setNewProfileName('');
                }}
                variant="secondary"
                size="medium"
                style={styles.modalButton}
              />
              <Button
                title="Create"
                onPress={handleCreateProfile}
                variant="success"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Switch Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileSwitchModalVisible}
        onRequestClose={() => setProfileSwitchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="title" style={styles.modalTitle}>Switch Profile</Typography>
            <Typography variant="caption" style={styles.modalSubtitle}>
              Select a profile to switch to:
            </Typography>

            <ScrollView style={styles.profileList}>
              {profileManager?.profiles.map((profile) => (
                <View key={profile.id} style={styles.profileItem}>
                  <TouchableOpacity
                    style={[
                      styles.profileItemButton,
                      profile.id === activeProfile?.id && styles.activeProfileItem
                    ]}
                    onPress={() => handleSwitchProfile(profile.id)}
                    disabled={profile.id === activeProfile?.id}
                  >
                    <View style={styles.profileItemContent}>
                      <Typography
                        variant="body"
                        style={[
                          styles.profileItemName,
                          profile.id === activeProfile?.id && styles.activeProfileItemText
                        ]}
                      >
                        {profile.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        style={[
                          styles.profileItemStats,
                          profile.id === activeProfile?.id && styles.activeProfileItemText
                        ]}
                      >
                        {profile.stats.totalGamesCompleted} games completed
                      </Typography>
                    </View>
                    {profile.id === activeProfile?.id && (
                      <Icon
                        library="ionicons"
                        name="checkmark-circle"
                        size={20}
                        color="#27ae60"
                      />
                    )}
                  </TouchableOpacity>

                  {profile.id !== activeProfile?.id && profileManager?.profiles.length > 1 && (
                    <TouchableOpacity
                      style={styles.deleteProfileButton}
                      onPress={() => handleDeleteProfile(profile.id, profile.name)}
                    >
                      <Icon
                        library="ionicons"
                        name="trash"
                        size={16}
                        color="#e74c3c"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setProfileSwitchModalVisible(false)}
              variant="secondary"
              size="medium"
              style={styles.fullWidthButton}
            />
          </View>
        </View>
      </Modal>

      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#34495e',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 16,
  },
  editIcon: {
    marginLeft: 12,
  },
  playerName: {
    color: '#fff',
  },
  playerSubtitle: {
    color: '#bdc3c7',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    marginBottom: 16,
    fontSize: 18,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profileActionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#34495e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    color: '#3498db',
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    color: '#bdc3c7',
    textAlign: 'center',
  },
  timeCard: {
    backgroundColor: '#34495e',
    borderRadius: 12,
    padding: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  easyTag: {
    backgroundColor: '#27ae60',
  },
  normalTag: {
    backgroundColor: '#f39c12',
  },
  hardTag: {
    backgroundColor: '#e74c3c',
  },
  difficultyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  timeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  preferenceCard: {
    backgroundColor: '#34495e',
    borderRadius: 12,
    padding: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  preferenceLabel: {
    color: '#fff',
  },
  preferenceValue: {
    color: '#bdc3c7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#2c3e50',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  fullWidthButton: {
    marginTop: 10,
  },
  profileList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileItemButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginRight: 10,
  },
  activeProfileItem: {
    backgroundColor: '#e8f5e8',
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemName: {
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileItemStats: {
    color: '#7f8c8d',
  },
  activeProfileItemText: {
    color: '#27ae60',
  },
  deleteProfileButton: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
});
