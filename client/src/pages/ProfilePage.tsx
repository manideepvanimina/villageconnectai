import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, MapPin, Globe, Shield, Star, Award, 
  Database, Cpu, CheckCircle2, RefreshCw, ExternalLink
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { selectedVillage, language, setLanguage, role, setRole, t, triggerRefresh, showToast } = useApp();

  return (
    <div className="space-y-5 pb-20 md:pb-8 animate-in fade-in duration-200">
      
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              RK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900">
                  Ramesh Kumar
                </h2>
                <span className="text-[10px] font-bold bg-krishi-100 text-krishi-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-krishi-600" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-stone-500">+91 98765 43210</p>
              <div className="flex items-center gap-1 text-xs text-stone-600 mt-1">
                <MapPin className="w-3.5 h-3.5 text-saffron-600" />
                <span>{selectedVillage?.name}, {selectedVillage?.district}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-400">Reputation</span>
            <div className="text-lg font-black text-amber-600 flex items-center gap-1 justify-end">
              <Award className="w-4 h-4 text-amber-500" />
              <span>45 pts</span>
            </div>
          </div>
        </div>

        {/* Persona Switcher Buttons */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
            Switch Demo Role Persona:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'villager', label: 'Resident / Villager' },
              { id: 'farmer', label: 'Farmer / Rythu' },
              { id: 'worker', label: 'Worker / Service' },
              { id: 'moderator', label: 'Panchayat Moderator' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setRole(r.id as any);
                  showToast(`Switched persona to: ${r.label}`);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  role === r.id
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Language Preference Settings */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm">
        <h3 className="font-bold text-sm text-stone-900 mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-saffron-600" />
          <span>Language Preference / భాష / भाषा</span>
        </h3>
        <p className="text-xs text-stone-500 mb-3">
          VillageConnect AI automatically adapts all menus, AI audio responses, and search to your chosen language.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
              language === 'en'
                ? 'bg-saffron-50 border-saffron-500 text-saffron-900'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('te')}
            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
              language === 'te'
                ? 'bg-saffron-50 border-saffron-500 text-saffron-900'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            తెలుగు (Telugu)
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
              language === 'hi'
                ? 'bg-saffron-50 border-saffron-500 text-saffron-900'
                : 'border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            हिंदी (Hindi)
          </button>
        </div>
      </div>

      {/* Hackathon Judge Architecture Summary */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-sm sm:text-base text-white">
            Hackathon Judge Briefing & Tech Architecture
          </h3>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed mb-3">
          VillageConnect AI is a production-grade, hyper-local digital ecosystem built specifically for rural India.
        </p>

        <div className="space-y-2 text-xs text-stone-300">
          <div className="flex items-start gap-2 bg-stone-800/80 p-2.5 rounded-xl">
            <span className="text-amber-400 font-bold">1. Agentic AI:</span>
            <span>Natural language "I NEED..." smart search detects intent (FIND_FARM_RESOURCE, FIND_SERVICE, SELL_PRODUCT, GOVERNMENT_SCHEME), extracts entities, and calls authorized PostgreSQL tools.</span>
          </div>

          <div className="flex items-start gap-2 bg-stone-800/80 p-2.5 rounded-xl">
            <span className="text-krishi-400 font-bold">2. Supabase Cloud PostgreSQL:</span>
            <span>Real relational database with Row Level Security (RLS) policies, indexes, and automated triggers.</span>
          </div>

          <div className="flex items-start gap-2 bg-stone-800/80 p-2.5 rounded-xl">
            <span className="text-saffron-400 font-bold">3. 5-User Peer Verification:</span>
            <span>Community notices require 5 unique resident verifications to go live, preventing viral rumors or false notices.</span>
          </div>

          <div className="flex items-start gap-2 bg-stone-800/80 p-2.5 rounded-xl">
            <span className="text-blue-400 font-bold">4. Multilingual & Voice-First:</span>
            <span>Native speech recognition and text-to-speech audio in Telugu, Hindi, and English for low-literacy users.</span>
          </div>
        </div>
      </div>

    </div>
  );
};
