import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { VoiceInputModal } from './components/VoiceInputModal';
import { PostUpdateModal } from './components/PostUpdateModal';
import { SellProductModal } from './components/SellProductModal';
import { AddServiceModal } from './components/AddServiceModal';
import { LocationPickerModal } from './components/LocationPickerModal';

import { HomePage } from './pages/HomePage';
import { DirectoryPage } from './pages/DirectoryPage';
import { AgriculturePage } from './pages/AgriculturePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';

import { CheckCircle2, Home, Wrench, Tractor, ShoppingBag, Sparkles, User } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, t, toastMessage, isLocationModalOpen, setIsLocationModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      {/* Desktop Navigation Tabs */}
      <div className="hidden md:block bg-white border-b border-amber-200/50 sticky top-[57px] z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1">
          {[
            { id: 'home', label: t.navHome, icon: Home },
            { id: 'directory', label: t.navDirectory, icon: Wrench },
            { id: 'agriculture', label: t.navAgriculture, icon: Tractor },
            { id: 'marketplace', label: t.navMarketplace, icon: ShoppingBag },
            { id: 'ai', label: t.navAI, icon: Sparkles, highlight: true },
            { id: 'profile', label: t.navProfile, icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-saffron-50 text-saffron-900 border border-saffron-300 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.highlight ? 'text-saffron-600' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-4 py-4 sm:py-6">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'directory' && <DirectoryPage />}
        {activeTab === 'agriculture' && <AgriculturePage />}
        {activeTab === 'marketplace' && <MarketplacePage />}
        {activeTab === 'ai' && <AIAssistantPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      <VoiceInputModal />
      <PostUpdateModal />
      <SellProductModal />
      <AddServiceModal />
      <LocationPickerModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-stone-700">
          <CheckCircle2 className="w-5 h-5 text-krishi-400 flex-shrink-0" />
          <p className="text-xs font-semibold flex-1 leading-snug">
            {toastMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
