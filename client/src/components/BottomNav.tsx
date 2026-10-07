import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Wrench, Tractor, ShoppingBag, Sparkles, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'directory', label: t.navDirectory, icon: Wrench },
    { id: 'agriculture', label: t.navAgriculture, icon: Tractor },
    { id: 'marketplace', label: t.navMarketplace, icon: ShoppingBag },
    { id: 'ai', label: t.navAI, icon: Sparkles, highlight: true },
    { id: 'profile', label: t.navProfile, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
      <div className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-saffron-700 font-bold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? 'bg-saffron-100/90 scale-110 shadow-sm' : ''
                } ${item.highlight && !isActive ? 'text-amber-600' : ''}`}
              >
                <Icon className={`w-5 h-5 ${item.highlight ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[55px]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-saffron-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
