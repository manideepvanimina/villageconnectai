import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, CheckCircle2, AlertCircle, Loader2, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoUser } from '../types';

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
    selectedVillage 
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-rural-lg border border-amber-200 relative animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-saffron-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              🌾
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-stone-900 tracking-tight">
                {authModalTab === 'login' ? 'Sign In to VillageConnect' : 'Create Resident Account'}
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
        <div className="flex items-center bg-stone-100 p-1 rounded-2xl mt-4 mb-3 flex-shrink-0">
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
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email / Phone Identifier</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. 919876543210@villageconnect.ai or user@gmail.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>{loading ? 'Signing in...' : 'Sign In to My Profile'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anjaiah Reddy"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98480 11223"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Home Village</label>
                  <select
                    value={villageId}
                    onChange={(e) => setVillageId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 bg-white font-medium"
                  >
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.district})</option>
                    ))}
                  </select>
                </div>
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

          {/* Quick Switch / 1-Click Demo Profiles */}
          <div className="pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Test Logins (Verified Demo Accounts)</span>
              </span>
              <span className="text-[10px] text-stone-400 font-medium">1-Click Auth</span>
            </div>
            <p className="text-[11px] text-stone-500 mb-2.5">
              Click any verified resident below to instantly authenticate and evaluate their real persisted database profile:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoUsers.map((u) => {
                const isLoggingIn = switchingUserId === u.id;
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
                      <div className="text-[10px] text-stone-500 capitalize flex items-center gap-1">
                        <span className="font-semibold text-saffron-700">@{u.username}</span>
                        <span>•</span>
                        <span>{u.role}</span>
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

        </div>

      </div>
    </div>
  );
};
