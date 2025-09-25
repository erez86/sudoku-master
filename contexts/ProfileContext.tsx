import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  getActiveProfile,
  loadProfileManager,
  PlayerProfile,
  ProfileManager
} from '@/utils/storage';

interface ProfileContextType {
  activeProfile: PlayerProfile | null;
  profileManager: ProfileManager | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [activeProfile, setActiveProfile] = useState<PlayerProfile | null>(null);
  const [profileManager, setProfileManager] = useState<ProfileManager | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profile, manager] = await Promise.all([
        getActiveProfile(),
        loadProfileManager()
      ]);
      setActiveProfile(profile);
      setProfileManager(manager);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value: ProfileContextType = {
    activeProfile,
    profileManager,
    loading,
    refreshProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}