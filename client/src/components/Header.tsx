import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Globe, ChevronDown, ShieldCheck, UserCheck } from 'lucide-react';
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
    t
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/60 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        
        {/* Brand & Village Selection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl filter drop-shadow-sm animate-bounce" style={{ animationDuration: '3s' }}>🌾</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-saffron-700 via-amber-700 to-krishi-700 bg-clip-text text-transparent">
                  {t.appName}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-saffron-100 text-saffron-800 border border-saffron-300">
                  AI 2.0
                </span>
              </div>
              
              {/* Village Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-saffron-700 transition-colors py-0.5">
                  <MapPin className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {selectedVillage ? `${selectedVillage.name}, ${selectedVillage.district}` : t.selectVillage}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {/* Village Selection Menu */}
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-rural-lg border border-amber-200 py-1.5 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100">
                    {t.selectVillage} ({villages.length})
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

        {/* Right Controls: Multilingual Switch & Role Badge */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Pills */}
          <div className="flex items-center bg-stone-100/90 p-0.5 rounded-lg border border-stone-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                language === 'en' ? 'bg-white text-saffron-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                language === 'te' ? 'bg-white text-saffron-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                language === 'hi' ? 'bg-white text-saffron-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Role Switcher Pill */}
          <div className="relative group">
            <button
              title="Click to switch persona role"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100/80 text-amber-900 border border-amber-300 hover:bg-amber-200/80 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline capitalize">{role}</span>
              <ChevronDown className="w-3 h-3 text-amber-600" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-rural-lg border border-amber-200 py-1.5 hidden group-hover:block z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Demo User Persona
              </div>
              {(['villager', 'farmer', 'worker', 'moderator'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`w-full text-left px-3 py-1.5 text-xs capitalize flex items-center justify-between hover:bg-amber-50 ${
                    role === r ? 'font-bold text-saffron-800 bg-amber-50' : 'text-stone-700'
                  }`}
                >
                  <span>{r}</span>
                  {role === r && <span className="text-saffron-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
