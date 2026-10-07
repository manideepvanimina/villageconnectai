import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Village, Language, UserRole, UserProfile, DemoUser } from '../types';
import { api } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { getTranslation } from '../translations';

interface AppContextType {
  // Villages
  villages: Village[];
  selectedVillage: Village | null;
  setSelectedVillage: (village: Village) => void;

  // Language & Role
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  directoryCategoryFilter: string;
  setDirectoryCategoryFilter: (cat: string) => void;
  directoryViewMode: 'list' | 'map';
  setDirectoryViewMode: (mode: 'list' | 'map') => void;

  // Translations
  t: ReturnType<typeof getTranslation>;

  // Authentication & Profile
  currentUser: User | null;
  sessionToken: string | null;
  userProfile: UserProfile | null;
  isLoadingAuth: boolean;
  demoUsers: DemoUser[];
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, phone?: string, villageId?: string) => Promise<void>;
  quickDemoLogin: (user: DemoUser) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  uploadUserAvatar: (base64: string, mimeType: string) => Promise<UserProfile>;
  removeUserAvatar: () => Promise<UserProfile>;

  // Voice Search Bridge
  voiceSearchQuery: string | null;
  setVoiceSearchQuery: (q: string | null) => void;

  // Modals
  isPostModalOpen: boolean;
  setIsPostModalOpen: (open: boolean) => void;
  isSellModalOpen: boolean;
  setIsSellModalOpen: (open: boolean) => void;
  isServiceModalOpen: boolean;
  setIsServiceModalOpen: (open: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'map';
  setAuthModalTab: (tab: 'login' | 'register' | 'map') => void;

  // Village & Map Auth Actions
  updateUserHomeVillage: (village: Village) => Promise<void>;
  openLoginForVillage: (village: Village, tab?: 'login' | 'register') => void;

  // Refresh triggers & Toasts
  refreshTrigger: number;
  triggerRefresh: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [language, setLanguageState] = useState<Language>('en');
  const [role, setRoleState] = useState<UserRole>('villager');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [directoryCategoryFilter, setDirectoryCategoryFilter] = useState<string>('all');
  const [directoryViewMode, setDirectoryViewMode] = useState<'list' | 'map'>('list');

  // Auth & Profile state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  // Voice Bridge
  const [voiceSearchQuery, setVoiceSearchQuery] = useState<string | null>(null);

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'map'>('login');

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to update language
  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    // If logged in, optionally persist preference to backend
    if (sessionToken && userProfile) {
      api.updateProfile({ language: newLang }, sessionToken)
        .then(res => {
          setUserProfile(res.profile);
        })
        .catch(() => {});
    }
  };

  // Helper to update role
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (sessionToken && userProfile) {
      api.updateProfile({ role: newRole }, sessionToken)
        .then(res => {
          setUserProfile(res.profile);
        })
        .catch(() => {});
    }
  };

  // 1. Fetch Villages
  useEffect(() => {
    api.getVillages()
      .then(data => {
        setVillages(data);
        if (data.length > 0 && !selectedVillage) {
          setSelectedVillage(data[0]); // Default to Ramapuram
        }
      })
      .catch(err => {
        console.error('Failed to load villages:', err);
        const fallback: Village = {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Ramapuram',
          district: 'Rangareddy',
          state: 'Telangana',
          pincode: '501501',
          latitude: 17.3850,
          longitude: 78.4867,
          population: 4200
        };
        setVillages([fallback]);
        setSelectedVillage(fallback);
      });
  }, []);

  // 2. Fetch Demo Users for seamless testing
  useEffect(() => {
    api.getDemoUsers()
      .then(setDemoUsers)
      .catch(err => console.warn('Could not load demo users:', err));
  }, []);

  // 3. Profile Fetcher
  const loadProfileForSession = useCallback(async (token: string, user: User) => {
    try {
      const profile = await api.getMyProfile(token);
      setUserProfile(profile);

      // Sync role and language from persistent database profile
      if (profile.role) setRoleState(profile.role);
      if (profile.language) setLanguageState(profile.language);

      // If user profile has a home village, sync it
      if (profile.village) {
        setSelectedVillage(profile.village);
      } else if (profile.home_village_id) {
        const matched = villages.find(v => v.id === profile.home_village_id);
        if (matched) setSelectedVillage(matched);
      }
      return profile;
    } catch (err: any) {
      console.warn('Profile fetch note:', err.message);
      return null;
    }
  }, [villages]);

  // 4. Supabase Auth Session Initialization & Subscription
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          setCurrentUser(session.user);
          setSessionToken(session.access_token);
          await loadProfileForSession(session.access_token, session.user);
        } else if (mounted) {
          setCurrentUser(null);
          setSessionToken(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session) {
        setCurrentUser(session.user);
        setSessionToken(session.access_token);
        await loadProfileForSession(session.access_token, session.user);
      } else {
        setCurrentUser(null);
        setSessionToken(null);
        setUserProfile(null);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfileForSession]);

  // Auth Operations
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      setCurrentUser(data.user);
      setSessionToken(data.session.access_token);
      await loadProfileForSession(data.session.access_token, data.user);
      showToast(`👋 Welcome back, ${data.user.user_metadata?.full_name || 'Resident'}!`);
      setIsAuthModalOpen(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, phone?: string, villageId?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone || null,
          home_village_id: villageId || selectedVillage?.id || '11111111-1111-1111-1111-111111111111',
          role: 'villager',
          language: language
        }
      }
    });
    if (error) throw error;
    if (data.session) {
      setCurrentUser(data.user);
      setSessionToken(data.session.access_token);
      await loadProfileForSession(data.session.access_token, data.user);
      showToast(`🎉 Account created! Welcome, ${fullName}!`);
      setIsAuthModalOpen(false);
    } else {
      showToast('Account created! Please check your email to confirm or sign in.');
      setIsAuthModalOpen(false);
    }
  };

  const quickDemoLogin = async (demoUser: DemoUser) => {
    try {
      await login(demoUser.email, 'Password123!');
    } catch (err: any) {
      console.warn('Demo login password attempt:', err.message);
      // Fallback: direct sign in
      throw err;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSessionToken(null);
    setUserProfile(null);
    showToast('Logged out successfully.');
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!sessionToken || !currentUser) return null;
    return await loadProfileForSession(sessionToken, currentUser);
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    if (!sessionToken) {
      throw new Error('You must be logged in to update your profile.');
    }
    const res = await api.updateProfile(data, sessionToken);
    setUserProfile(res.profile);
    if (res.profile.role) setRoleState(res.profile.role);
    if (res.profile.language) setLanguageState(res.profile.language);
    if (res.profile.village) setSelectedVillage(res.profile.village);
    showToast(res.message || 'Profile updated successfully!');
    return res.profile;
  };

  const uploadUserAvatar = async (base64: string, mimeType: string): Promise<UserProfile> => {
    if (!sessionToken) {
      throw new Error('You must be logged in to upload an avatar.');
    }
    const res = await api.uploadAvatar(base64, mimeType, sessionToken);
    setUserProfile(res.profile);
    showToast(res.message || 'Profile picture updated successfully!');
    return res.profile;
  };

  const removeUserAvatar = async (): Promise<UserProfile> => {
    if (!sessionToken) {
      throw new Error('You must be logged in to remove your avatar.');
    }
    const res = await api.removeAvatar(sessionToken);
    setUserProfile(res.profile);
    showToast(res.message || 'Profile picture removed successfully.');
    return res.profile;
  };

  const updateUserHomeVillage = async (village: Village) => {
    setSelectedVillage(village);
    if (sessionToken && userProfile) {
      try {
        await updateUserProfile({ home_village_id: village.id });
        showToast(`🏠 Home village updated to ${village.name}!`);
      } catch (err: any) {
        console.error('Failed to save home village:', err);
        showToast(`Switched active view to ${village.name}`);
      }
    } else {
      showToast(`📍 Active village view: ${village.name}`);
    }
  };

  const openLoginForVillage = (village: Village, tab: 'login' | 'register' | 'map' = 'login') => {
    setSelectedVillage(village);
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const t = getTranslation(language);

  return (
    <AppContext.Provider
      value={{
        villages,
        selectedVillage,
        setSelectedVillage,
        language,
        setLanguage,
        role,
        setRole,
        activeTab,
        setActiveTab,
        directoryCategoryFilter,
        setDirectoryCategoryFilter,
        directoryViewMode,
        setDirectoryViewMode,
        t,
        currentUser,
        sessionToken,
        userProfile,
        isLoadingAuth,
        demoUsers,
        login,
        signup,
        quickDemoLogin,
        logout,
        refreshProfile,
        updateUserProfile,
        uploadUserAvatar,
        removeUserAvatar,
        updateUserHomeVillage,
        openLoginForVillage,
        voiceSearchQuery,
        setVoiceSearchQuery,
        isPostModalOpen,
        setIsPostModalOpen,
        isSellModalOpen,
        setIsSellModalOpen,
        isServiceModalOpen,
        setIsServiceModalOpen,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        refreshTrigger,
        triggerRefresh,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
