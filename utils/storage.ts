import AsyncStorage from '@react-native-async-storage/async-storage';
import { SudokuGrid } from '@/components/Game/SudokuBoard';

export interface GameState {
  currentGrid: SudokuGrid;
  originalGrid: SudokuGrid;
  solutionGrid: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  moveHistory: Array<{ row: number; col: number; oldValue: number | null; newValue: number | null }>;
  errorCells: string[];
  mistakes: number;
  timer: number;
  hints: number;
  difficulty: 'easy' | 'normal' | 'hard';
  timestamp: number;
}

export interface GamePreferences {
  playerName: string;
  lastDifficulty: 'easy' | 'normal' | 'hard';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PlayerProfile {
  id: string;
  name: string;
  preferences: GamePreferences;
  stats: GameStats;
  createdAt: number;
  lastActive: number;
}

export interface ProfileManager {
  activeProfileId: string;
  profiles: PlayerProfile[];
}

export interface GameStats {
  // Game completion stats
  totalGamesCompleted: number;
  totalGamesStarted: number;
  totalGamesForfeited: number;

  // Time tracking
  bestTimes: {
    easy: number | null;
    normal: number | null;
    hard: number | null;
  };
  averageTimes: {
    easy: number[];
    normal: number[];
    hard: number[];
  };
  totalPlayTime: number; // Total time spent playing (in seconds)

  // Performance tracking
  perfectGames: number; // Games completed with 0 mistakes
  totalMistakes: number;
  hintsUsed: number;

  // Completion tracking by difficulty
  completionsByDifficulty: {
    easy: number;
    normal: number;
    hard: number;
  };

  // Auto-fill usage
  autoFillUsed: number;

  // Streaks
  currentStreak: number; // Current consecutive completions
  bestStreak: number; // Best streak ever

  // First completion dates
  firstCompletions: {
    easy: number | null;
    normal: number | null;
    hard: number | null;
  };
}

const STORAGE_KEYS = {
  GAME_STATE: '@sudoku_game_state',
  PREFERENCES: '@sudoku_preferences',
  STATS: '@sudoku_stats',
  PROFILES: '@sudoku_profiles',
};

// Game State Management
export const saveGameState = async (gameState: GameState): Promise<void> => {
  try {
    const stateWithTimestamp = {
      ...gameState,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

export const loadGameState = async (): Promise<GameState | null> => {
  try {
    const savedState = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Check if saved state is not too old (e.g., more than 24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - parsedState.timestamp > maxAge) {
        await clearGameState(); // Clear old saved games
        return null;
      }
      return parsedState;
    }
    return null;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

export const clearGameState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
};

// Preferences Management
export const savePreferences = async (preferences: GamePreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

export const loadPreferences = async (): Promise<GamePreferences> => {
  try {
    const savedPreferences = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (savedPreferences) {
      return JSON.parse(savedPreferences);
    }
    // Return default preferences
    return {
      playerName: 'Sudoku Master',
      lastDifficulty: 'normal',
      soundEnabled: true,
      vibrationEnabled: true,
    };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return {
      playerName: 'Sudoku Master',
      lastDifficulty: 'normal',
      soundEnabled: true,
      vibrationEnabled: true,
    };
  }
};

// Statistics Management
export const saveStats = async (stats: GameStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

export const loadStats = async (): Promise<GameStats> => {
  try {
    const savedStats = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
    if (savedStats) {
      return JSON.parse(savedStats);
    }
    // Return default stats
    return createDefaultStats();
  } catch (error) {
    console.error('Error loading stats:', error);
    return createDefaultStats();
  }
};

// Utility functions
export const updateGameCompletionStats = async (
  difficulty: 'easy' | 'normal' | 'hard',
  timeInSeconds: number
): Promise<void> => {
  try {
    const stats = await loadStats();

    stats.totalGamesCompleted++;

    // Update best time
    if (!stats.bestTimes[difficulty] || timeInSeconds < stats.bestTimes[difficulty]!) {
      stats.bestTimes[difficulty] = timeInSeconds;
    }

    // Add to average times (keep last 10 games for average calculation)
    stats.averageTimes[difficulty].push(timeInSeconds);
    if (stats.averageTimes[difficulty].length > 10) {
      stats.averageTimes[difficulty] = stats.averageTimes[difficulty].slice(-10);
    }

    await saveStats(stats);
  } catch (error) {
    console.error('Error updating completion stats:', error);
  }
};

export const incrementGameStartedStats = async (): Promise<void> => {
  try {
    const stats = await loadStats();
    stats.totalGamesStarted++;
    await saveStats(stats);
  } catch (error) {
    console.error('Error updating started stats:', error);
  }
};

// Profile Management Functions
const generateProfileId = (): string => {
  return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createDefaultStats = (): GameStats => ({
  totalGamesCompleted: 0,
  totalGamesStarted: 0,
  totalGamesForfeited: 0,
  bestTimes: {
    easy: null,
    normal: null,
    hard: null,
  },
  averageTimes: {
    easy: [],
    normal: [],
    hard: [],
  },
  totalPlayTime: 0,
  perfectGames: 0,
  totalMistakes: 0,
  hintsUsed: 0,
  completionsByDifficulty: {
    easy: 0,
    normal: 0,
    hard: 0,
  },
  autoFillUsed: 0,
  currentStreak: 0,
  bestStreak: 0,
  firstCompletions: {
    easy: null,
    normal: null,
    hard: null,
  },
});

const createDefaultPreferences = (playerName: string): GamePreferences => ({
  playerName,
  lastDifficulty: 'normal',
  soundEnabled: true,
  vibrationEnabled: true,
});

export const loadProfileManager = async (): Promise<ProfileManager> => {
  try {
    const savedProfiles = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
    if (savedProfiles) {
      return JSON.parse(savedProfiles);
    }

    // Create default profile manager with one profile
    const defaultProfileId = generateProfileId();
    const defaultProfile: PlayerProfile = {
      id: defaultProfileId,
      name: 'Sudoku Master',
      preferences: createDefaultPreferences('Sudoku Master'),
      stats: createDefaultStats(),
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    const profileManager: ProfileManager = {
      activeProfileId: defaultProfileId,
      profiles: [defaultProfile],
    };

    await saveProfileManager(profileManager);
    return profileManager;
  } catch (error) {
    console.error('Error loading profile manager:', error);

    // Fallback: create minimal profile manager
    const defaultProfileId = generateProfileId();
    const defaultProfile: PlayerProfile = {
      id: defaultProfileId,
      name: 'Sudoku Master',
      preferences: createDefaultPreferences('Sudoku Master'),
      stats: createDefaultStats(),
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    return {
      activeProfileId: defaultProfileId,
      profiles: [defaultProfile],
    };
  }
};

export const saveProfileManager = async (profileManager: ProfileManager): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profileManager));
  } catch (error) {
    console.error('Error saving profile manager:', error);
  }
};

export const getActiveProfile = async (): Promise<PlayerProfile> => {
  try {
    const profileManager = await loadProfileManager();
    const activeProfile = profileManager.profiles.find(p => p.id === profileManager.activeProfileId);

    if (!activeProfile) {
      // If active profile not found, return first profile
      const firstProfile = profileManager.profiles[0];
      if (firstProfile) {
        return firstProfile;
      }

      // If no profiles exist, create default
      const defaultProfile: PlayerProfile = {
        id: generateProfileId(),
        name: 'Sudoku Master',
        preferences: createDefaultPreferences('Sudoku Master'),
        stats: createDefaultStats(),
        createdAt: Date.now(),
        lastActive: Date.now(),
      };

      return defaultProfile;
    }

    return activeProfile;
  } catch (error) {
    console.error('Error getting active profile:', error);

    // Return fallback profile
    return {
      id: generateProfileId(),
      name: 'Sudoku Master',
      preferences: createDefaultPreferences('Sudoku Master'),
      stats: createDefaultStats(),
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
  }
};

export const createNewProfile = async (name: string): Promise<PlayerProfile> => {
  try {
    const profileManager = await loadProfileManager();

    const newProfile: PlayerProfile = {
      id: generateProfileId(),
      name: name,
      preferences: createDefaultPreferences(name),
      stats: createDefaultStats(),
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    profileManager.profiles.push(newProfile);
    profileManager.activeProfileId = newProfile.id;

    await saveProfileManager(profileManager);
    return newProfile;
  } catch (error) {
    console.error('Error creating new profile:', error);
    throw error;
  }
};

export const switchToProfile = async (profileId: string): Promise<PlayerProfile | null> => {
  try {
    const profileManager = await loadProfileManager();
    const profile = profileManager.profiles.find(p => p.id === profileId);

    if (!profile) {
      console.error('Profile not found:', profileId);
      return null;
    }

    // Update active profile and last active time
    profileManager.activeProfileId = profileId;
    profile.lastActive = Date.now();

    await saveProfileManager(profileManager);
    return profile;
  } catch (error) {
    console.error('Error switching to profile:', error);
    return null;
  }
};

export const updateProfileName = async (profileId: string, newName: string): Promise<boolean> => {
  try {
    const profileManager = await loadProfileManager();
    const profile = profileManager.profiles.find(p => p.id === profileId);

    if (!profile) {
      console.error('Profile not found for name update:', profileId);
      return false;
    }

    profile.name = newName;
    profile.preferences.playerName = newName;
    profile.lastActive = Date.now();

    await saveProfileManager(profileManager);
    return true;
  } catch (error) {
    console.error('Error updating profile name:', error);
    return false;
  }
};

export const deleteProfile = async (profileId: string): Promise<boolean> => {
  try {
    const profileManager = await loadProfileManager();

    // Don't allow deleting the last profile
    if (profileManager.profiles.length <= 1) {
      console.warn('Cannot delete the last profile');
      return false;
    }

    const profileIndex = profileManager.profiles.findIndex(p => p.id === profileId);
    if (profileIndex === -1) {
      console.error('Profile not found for deletion:', profileId);
      return false;
    }

    // Remove the profile
    profileManager.profiles.splice(profileIndex, 1);

    // If we deleted the active profile, switch to the first remaining profile
    if (profileManager.activeProfileId === profileId) {
      profileManager.activeProfileId = profileManager.profiles[0].id;
      profileManager.profiles[0].lastActive = Date.now();
    }

    await saveProfileManager(profileManager);
    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
};

export const updateActiveProfileStats = async (updatedStats: GameStats): Promise<void> => {
  try {
    const profileManager = await loadProfileManager();
    const activeProfile = profileManager.profiles.find(p => p.id === profileManager.activeProfileId);

    if (activeProfile) {
      activeProfile.stats = updatedStats;
      activeProfile.lastActive = Date.now();
      await saveProfileManager(profileManager);
    }
  } catch (error) {
    console.error('Error updating active profile stats:', error);
  }
};

export const updateActiveProfilePreferences = async (updatedPreferences: GamePreferences): Promise<void> => {
  try {
    const profileManager = await loadProfileManager();
    const activeProfile = profileManager.profiles.find(p => p.id === profileManager.activeProfileId);

    if (activeProfile) {
      activeProfile.preferences = updatedPreferences;
      activeProfile.name = updatedPreferences.playerName;
      activeProfile.lastActive = Date.now();
      await saveProfileManager(profileManager);
    }
  } catch (error) {
    console.error('Error updating active profile preferences:', error);
  }
};

// Enhanced Statistics Functions
export const updateComprehensiveGameStats = async (gameData: {
  difficulty: 'easy' | 'normal' | 'hard';
  timeInSeconds: number;
  mistakes: number;
  hintsUsed: number;
  wasAutoFilled: boolean;
  isCompleted: boolean;
}): Promise<void> => {
  try {
    const activeProfile = await getActiveProfile();
    const stats = activeProfile.stats;

    // Always update play time
    stats.totalPlayTime += gameData.timeInSeconds;

    if (gameData.isCompleted) {
      // Game completion stats
      stats.totalGamesCompleted++;
      stats.completionsByDifficulty[gameData.difficulty]++;

      // Update best time
      if (!stats.bestTimes[gameData.difficulty] || gameData.timeInSeconds < stats.bestTimes[gameData.difficulty]!) {
        stats.bestTimes[gameData.difficulty] = gameData.timeInSeconds;
      }

      // Add to average times (keep last 10 games for average calculation)
      stats.averageTimes[gameData.difficulty].push(gameData.timeInSeconds);
      if (stats.averageTimes[gameData.difficulty].length > 10) {
        stats.averageTimes[gameData.difficulty] = stats.averageTimes[gameData.difficulty].slice(-10);
      }

      // Perfect game tracking
      if (gameData.mistakes === 0) {
        stats.perfectGames++;
      }

      // Auto-fill tracking
      if (gameData.wasAutoFilled) {
        stats.autoFillUsed++;
      }

      // First completion tracking
      if (!stats.firstCompletions[gameData.difficulty]) {
        stats.firstCompletions[gameData.difficulty] = Date.now();
      }

      // Streak tracking
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else {
      // Reset streak if game not completed (forfeited)
      stats.currentStreak = 0;
    }

    // Mistakes and hints tracking
    stats.totalMistakes += gameData.mistakes;
    stats.hintsUsed += gameData.hintsUsed;

    // Save updated stats
    await updateActiveProfileStats(stats);
  } catch (error) {
    console.error('Error updating comprehensive game stats:', error);
  }
};

export const incrementGameForfeitedStats = async (timePlayedInSeconds: number): Promise<void> => {
  try {
    const activeProfile = await getActiveProfile();
    const stats = activeProfile.stats;

    stats.totalGamesForfeited++;
    stats.totalPlayTime += timePlayedInSeconds;
    stats.currentStreak = 0; // Reset streak on forfeit

    await updateActiveProfileStats(stats);
  } catch (error) {
    console.error('Error updating forfeit stats:', error);
  }
};

export const incrementHintUsedStats = async (): Promise<void> => {
  try {
    const activeProfile = await getActiveProfile();
    const stats = activeProfile.stats;

    stats.hintsUsed++;

    await updateActiveProfileStats(stats);
  } catch (error) {
    console.error('Error updating hint stats:', error);
  }
};

export const addMistakeToStats = async (): Promise<void> => {
  try {
    const activeProfile = await getActiveProfile();
    const stats = activeProfile.stats;

    stats.totalMistakes++;

    await updateActiveProfileStats(stats);
  } catch (error) {
    console.error('Error updating mistake stats:', error);
  }
};

export const incrementAutoFillStats = async (): Promise<void> => {
  try {
    const activeProfile = await getActiveProfile();
    const stats = activeProfile.stats;

    stats.autoFillUsed++;

    await updateActiveProfileStats(stats);
  } catch (error) {
    console.error('Error updating auto-fill stats:', error);
  }
};