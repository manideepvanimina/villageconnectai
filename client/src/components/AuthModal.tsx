import React, { useState } from 'react';
import { 
  X, LogIn, UserPlus, Sparkles, CheckCircle2, 
  AlertCircle, Loader2, ShieldCheck, MapPin, Map as MapIcon, 
  Compass, ArrowRight, Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoUser } from '../types';
import { InteractiveVillageMap } from './InteractiveVillageMap';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    login, 
    signup, 
    quickDemoLogin, 
    demoUsers, 
    villages, 
    selectedVillage,
    setSelectedVillage,
    showToast
  } = useApp();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [villageId, setVillageId] = useState(selectedVillage?.id || '11111111-1111-1111-1111-111111111111');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [switchingUserId, setSwitchingUserId] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Full name, email, and password are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await signup(email.trim(), password, fullName.trim(), phone.trim(), villageId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoClick = async (u: DemoUser) => {
    setSwitchingUserId(u.id);
    setErrorMsg(null);
    try {
      await quickDemoLogin(u);
    } catch (err: any) {
      setErrorMsg(`Failed to log in as ${u.full_name}: ${err.message}`);
    } finally {
      setSwitchingUserId(null);
    }
  };

  // Find demo users for selected village in map view
  const mapSelectedVillageObj = villages.find(v => v.id === villageId) || selectedVillage || villages[0];
  const residentsOfSelectedVillage = demoUsers.filter(u => u.home_village_id === mapSelectedVillageObj?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-rural-lg border border-amber-200 relative animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-saffron-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              🌾
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-stone-900 tracking-tight">
                {authModalTab === 'login' && 'Sign In to VillageConnect'}
                {authModalTab === 'register' && 'Create Resident Account'}
                {authModalTab === 'map' && 'Select Your Village on Map'}
              </h3>
              <p className="text-xs text-stone-500">
                Secure rural digital identification with Supabase Cloud
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-stone-100 p-1 rounded-2xl mt-3 mb-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => { setAuthModalTab('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authModalTab === 'login'
                ? 'bg-white text-saffron-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthModalTab('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authModalTab === 'register'
                ? 'bg-white text-saffron-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Account</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthModalTab('map'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authModalTab === 'map'
                ? 'bg-gradient-to-r from-saffron-600 to-amber-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Village Map</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3.5">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. 919876543210@villageconnect.ai or user@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-xs text-stone-900 bg-stone-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-xs text-stone-900 bg-stone-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthModalTab('map')}
                  className="text-xs font-bold text-saffron-700 hover:text-saffron-800 flex items-center justify-center gap-1 mx-auto"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Or select your village on the interactive map →</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTRATION FORM */}
          {authModalTab === 'register' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar or Lakshmi Devi"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-xs text-stone-900 bg-stone-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-xs text-stone-900 bg-stone-50/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-xs text-stone-900 bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password (min 6 chars) *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-xs text-stone-900 bg-stone-50/50"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    Home Village / Panchayat *
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('map')}
                    className="text-[11px] font-bold text-saffron-700 hover:text-saffron-800 flex items-center gap-1"
                  >
                    <MapIcon className="w-3 h-3" />
                    <span>Pick on Map</span>
                  </button>
                </div>
                <select
                  value={villageId}
                  onChange={(e) => {
                    setVillageId(e.target.value);
                    const v = villages.find(x => x.id === e.target.value);
                    if (v) setSelectedVillage(v);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-xs text-stone-900 bg-stone-50/50 font-medium"
                >
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>
                      📍 {v.name} ({v.district} District, {v.state})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-krishi-700 hover:bg-krishi-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{loading ? 'Creating account...' : 'Create Account & Profile'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: INTERACTIVE VILLAGE MAP LOGIN */}
          {authModalTab === 'map' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
                <Compass className="w-4 h-4 text-saffron-600 flex-shrink-0" />
                <span>Click any village marker on the map to log in as a resident or set your home village:</span>
              </div>

              {/* Embedded Leaflet Village Map */}
              <InteractiveVillageMap
                villages={villages}
                selectedVillage={mapSelectedVillageObj}
                onSelectVillage={(v) => {
                  setSelectedVillage(v);
                  setVillageId(v.id);
                  showToast(`Selected: ${v.name}`);
                }}
                height="220px"
              />

              {/* Selected Village Card with Residents */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                    <span>📍 {mapSelectedVillageObj?.name}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      {mapSelectedVillageObj?.district}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    Pop: {mapSelectedVillageObj?.population?.toLocaleString() || '4,000+'}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-stone-200">
                  <div className="text-[11px] font-black uppercase text-saffron-900 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Residents of {mapSelectedVillageObj?.name} (1-Click Login):</span>
                  </div>

                  {residentsOfSelectedVillage.length > 0 ? (
                    <div className="space-y-1.5">
                      {residentsOfSelectedVillage.map((resident) => {
                        const isLoggingIn = switchingUserId === resident.id;
                        return (
                          <button
                            key={resident.id}
                            type="button"
                            onClick={() => handleQuickDemoClick(resident)}
                            disabled={Boolean(switchingUserId)}
                            className="w-full p-2 rounded-xl bg-white hover:bg-amber-100/70 border border-amber-200 text-left transition-all active:scale-98 flex items-center justify-between gap-2 shadow-2xs group"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-stone-900 group-hover:text-saffron-900 truncate">
                                {resident.full_name}
                              </div>
                              <div className="text-[10px] text-stone-500 capitalize">
                                @{resident.username} • {resident.role}
                              </div>
                            </div>
                            {isLoggingIn ? (
                              <Loader2 className="w-3.5 h-3.5 text-saffron-600 animate-spin flex-shrink-0" />
                            ) : (
                              <div className="text-[10px] font-bold text-saffron-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex-shrink-0">
                                Login →
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500 italic py-1">
                      No preloaded demo profiles for this village. You can create a new resident account below!
                    </p>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthModalTab('register')}
                      className="flex-1 py-1.5 rounded-xl bg-krishi-700 hover:bg-krishi-800 text-white font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register in {mapSelectedVillageObj?.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthModalTab('login')}
                      className="flex-1 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 font-bold text-xs text-stone-700 flex items-center justify-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5 text-saffron-600" />
                      <span>Sign In with Email</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Switch / 1-Click Demo Profiles (Shown in Login tab) */}
          {authModalTab === 'login' && (
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Test Logins by Village</span>
                </span>
                <span className="text-[10px] text-stone-400 font-medium">1-Click Auth</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoUsers.map((u) => {
                  const isLoggingIn = switchingUserId === u.id;
                  const userVillageName = u.village?.name || 'Ramapuram';
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoClick(u)}
                      disabled={Boolean(switchingUserId)}
                      className="p-2.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-all active:scale-98 flex items-center justify-between gap-2 group"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-stone-900 group-hover:text-saffron-900 truncate">
                          {u.full_name}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1">
                          <span className="font-semibold text-saffron-700">📍 {userVillageName}</span>
                          <span>•</span>
                          <span className="capitalize">{u.role}</span>
                        </div>
                      </div>
                      {isLoggingIn ? (
                        <Loader2 className="w-4 h-4 text-saffron-600 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="text-[10px] font-bold text-saffron-700 bg-white px-2 py-0.5 rounded-lg border border-amber-200 flex-shrink-0">
                          Login →
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
