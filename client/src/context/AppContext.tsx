import React, { createContext, useContext, useState, useEffect } from 'react';
import { Village, Language, UserRole } from '../types';
import { api } from '../services/api';
import { getTranslation } from '../translations';

interface AppContextType {
  villages: Village[];
  selectedVillage: Village | null;
  setSelectedVillage: (village: Village) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  t: ReturnType<typeof getTranslation>;
  // Modals
  isPostModalOpen: boolean;
  setIsPostModalOpen: (open: boolean) => void;
  isSellModalOpen: boolean;
  setIsSellModalOpen: (open: boolean) => void;
  isServiceModalOpen: boolean;
  setIsServiceModalOpen: (open: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  // Refresh triggers
  refreshTrigger: number;
  triggerRefresh: () => void;
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [role, setRole] = useState<UserRole>('villager');
  const [activeTab, setActiveTab] = useState<string>('home');

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
        // Fallback default village
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
        t,
        isPostModalOpen,
        setIsPostModalOpen,
        isSellModalOpen,
        setIsSellModalOpen,
        isServiceModalOpen,
        setIsServiceModalOpen,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
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
