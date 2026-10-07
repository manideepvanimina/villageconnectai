import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, ChevronDown, ShieldCheck, UserCheck, LogIn, User, LogOut, RefreshCw } from 'lucide-react';
import { Language, UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    villages,
    selectedVillage,
    setSelectedVillage,
    language,
    setLanguage,
    role,
    setRole,
    currentUser,
    userProfile,
    logout,
    setIsLocationModalOpen,
    setIsAuthModalOpen,
    setAuthModalTab,
    setActiveTab,
    t
  } = useApp();

  const getInitials = (name?: string) => {
    if (!name) return 'VC';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-sm">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        
        {/* Brand & Village Selection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('home')}
              className="text-2xl filter drop-shadow-sm hover:scale-105 transition-transform"
              title="Home"
            >
              🌾
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setActiveTab('home')}
                  className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-saffron-700 via-amber-700 to-krishi-700 bg-clip-text text-transparent hover:opacity-90 text-left"
                >
                  {t.appName}
                </button>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-saffron-100 text-saffron-800 border border-saffron-300">
                  AI 2.0
                </span>
              </div>
              
              {/* Village Dropdown */}
              <div className="relative group">
                <button 
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-saffron-700 transition-colors py-0.5"
                  title="Click to open interactive Google Maps & GPS village picker"
                >
                  <MapPin className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0 animate-pulse" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {selectedVillage ? `${selectedVillage.name}, ${selectedVillage.district}` : t.selectVillage}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {/* Village Selection Menu */}
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-rural-lg border border-amber-200 py-1.5 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 flex items-center justify-between">
                    <span>{t.selectVillage} ({villages.length})</span>
                    <button 
                      onClick={() => setIsLocationModalOpen(true)}
                      className="text-[10px] text-saffron-700 hover:underline font-semibold"
                    >
                      Map View
                    </button>
                  </div>
                  {villages.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVillage(v)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50/70 transition-colors ${
                        selectedVillage?.id === v.id ? 'bg-amber-100/60 font-bold text-saffron-900' : 'text-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{v.name}</div>
                        <div className="text-[10px] text-stone-500">{v.district}, {v.state}</div>
                      </div>
                      {selectedVillage?.id === v.id && (
                        <ShieldCheck className="w-3.5 h-3.5 text-krishi-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls: Multilingual Switch & User Profile / Login */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Pills */}
          <div className="flex items-center bg-stone-100/90 p-0.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                language === 'en' ? 'bg-white text-saffron-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                language === 'te' ? 'bg-white text-saffron-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                language === 'hi' ? 'bg-white text-saffron-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* User Profile Pill or Sign In Button */}
          {currentUser ? (
            <div className="relative group">
              <button
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-stone-900 transition-all shadow-xs"
                title="User Profile Menu"
              >
                {/* Avatar Icon */}
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-gradient-to-tr from-saffron-600 to-amber-500 text-white font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 shadow-inner">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(userProfile?.full_name)
                  )}
                </div>

                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold truncate max-w-[110px] leading-tight">
                    {userProfile?.full_name || 'Resident'}
                  </span>
                  <span className="text-[10px] text-stone-500 capitalize leading-tight">
                    {userProfile?.role || 'villager'}
                  </span>
                </div>

                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {/* Profile Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-rural-lg border border-amber-200 py-1.5 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-stone-100">
                  <div className="font-extrabold text-xs text-stone-900 truncate">
                    {userProfile?.full_name || 'Resident'}
                  </div>
                  {userProfile?.username && (
                    <div className="text-[11px] text-saffron-700 font-semibold">
                      @{userProfile.username}
                    </div>
                  )}
                  <div className="text-[10px] text-stone-400 truncate">
                    {userProfile?.email || currentUser.email}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-amber-50 flex items-center gap-2 font-medium"
                >
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span>View / Edit Profile</span>
                </button>

                <button
                  onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-amber-50 flex items-center gap-2 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Switch Account</span>
                </button>

                <div className="border-t border-stone-100 my-1" />

                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
