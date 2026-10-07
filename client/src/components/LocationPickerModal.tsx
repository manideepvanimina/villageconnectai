import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Village, DemoUser } from '../types';
import { calculateDistanceKm } from '../utils/geo';
import { InteractiveVillageMap } from './InteractiveVillageMap';
import { 
  MapPin, X, Crosshair, CheckCircle2, Compass, 
  Loader2, LogIn, UserPlus, Sparkles, Users, 
  Building2, ArrowRight, ShieldCheck, Home, Map as MapIcon, List
} from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { 
    villages, 
    selectedVillage, 
    setSelectedVillage, 
    showToast,
    currentUser,
    userProfile,
    demoUsers,
    quickDemoLogin,
    updateUserHomeVillage,
    openLoginForVillage,
  } = useApp();

  const [detecting, setDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [loggingInUserId, setLoggingInUserId] = useState<string | null>(null);
  const [isSavingHome, setIsSavingHome] = useState(false);

  // Filter demo residents for the currently selected village
  const villageResidents = useMemo(() => {
    if (!selectedVillage) return [];
    return demoUsers.filter(u => u.home_village_id === selectedVillage.id);
  }, [demoUsers, selectedVillage]);

  if (!isOpen) return null;

  // GPS Auto-Detection using browser Geolocation API
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    setDetectedInfo(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });

        // Find nearest village
        let nearest: Village = villages[0];
        let minDistance = calculateDistanceKm(userLat, userLng, nearest.latitude, nearest.longitude);

        villages.forEach((v) => {
          const dist = calculateDistanceKm(userLat, userLng, v.latitude, v.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            nearest = v;
          }
        });

        setSelectedVillage(nearest);
        setDetectedInfo(`GPS Match: Found ${nearest.name} (${minDistance} km away)`);
        showToast(`📍 Nearest village detected: ${nearest.name} (${minDistance} km)`);
        setDetecting(false);
      },
      (error) => {
        console.warn('GPS error:', error);
        setDetecting(false);
        alert(`Could not detect GPS location (${error.message}). Please pick your village from the map.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 1-Click login as a resident of the selected village
  const handleResidentLogin = async (resident: DemoUser) => {
    setLoggingInUserId(resident.id);
    try {
      await quickDemoLogin(resident);
      showToast(`🌾 Logged in to ${selectedVillage?.name} as ${resident.full_name}!`);
      onClose();
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoggingInUserId(null);
    }
  };

  // Set selected village as permanent home village in Supabase DB
  const handleSetHomeVillage = async () => {
    if (!selectedVillage) return;
    setIsSavingHome(true);
    try {
      await updateUserHomeVillage(selectedVillage);
      onClose();
    } catch (err: any) {
      alert(`Failed to update home village: ${err.message}`);
    } finally {
      setIsSavingHome(false);
    }
  };

  const isCurrentHomeVillage = userProfile?.home_village_id === selectedVillage?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-rural-lg border border-amber-200 relative animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-saffron-600 to-amber-500 text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-stone-900 tracking-tight">
                Select & Login to Your Village
              </h3>
              <p className="text-xs text-stone-500">
                Click any village on the map to switch context or authenticate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls & Tab Toggle */}
        <div className="flex items-center gap-2 my-2.5 flex-shrink-0">
          <button
            onClick={handleDetectGPS}
            disabled={detecting}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-saffron-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-xs"
          >
            {detecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-saffron-600" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-saffron-600" />
            )}
            <span>{detecting ? 'Detecting...' : 'Auto-Detect via GPS'}</span>
          </button>

          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                activeTab === 'map' ? 'bg-white text-saffron-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                activeTab === 'list' ? 'bg-white text-saffron-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <List className="w-3 h-3" />
              <span>List ({villages.length})</span>
            </button>
          </div>
        </div>

        {detectedInfo && (
          <p className="text-[11px] font-bold text-krishi-700 -mt-1 mb-2 text-center flex-shrink-0">
            ✓ {detectedInfo}
          </p>
        )}

        {/* Scrollable Main Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          
          {/* MAP VIEW */}
          {activeTab === 'map' ? (
            <div className="space-y-3">
              <InteractiveVillageMap
                villages={villages}
                selectedVillage={selectedVillage}
                onSelectVillage={(v) => {
                  setSelectedVillage(v);
                  showToast(`Selected: ${v.name}`);
                }}
                userLocation={userLocation}
                height="240px"
              />
              <p className="text-[11px] text-stone-500 text-center italic">
                👆 Tap any village pin on the map to view residents and login options
              </p>
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {villages.map((v) => {
                const isSelected = selectedVillage?.id === v.id;
                const isHome = userProfile?.home_village_id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVillage(v)}
                    className={`w-full text-left p-3 rounded-2xl text-xs flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-amber-100/70 border-saffron-500 font-bold text-saffron-900 shadow-xs'
                        : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <span>{v.name}</span>
                        {isHome && (
                          <span className="text-[10px] bg-krishi-100 text-krishi-800 px-1.5 py-0.2 rounded-full font-bold">
                            Your Home
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {v.formatted_address || `${v.district}, ${v.state}`} • Pop: {v.population?.toLocaleString() || '4,000+'}
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-saffron-600 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] text-stone-400">Select</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ACTIVE SELECTED VILLAGE DETAILS & AUTH ACTIONS */}
          {selectedVillage && (
            <div className="bg-gradient-to-br from-amber-50/80 to-stone-50 p-4 rounded-2xl border border-amber-200 space-y-3">
              
              {/* Village Header & Metadata */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">📍</span>
                    <h4 className="font-extrabold text-stone-900 text-sm sm:text-base">
                      {selectedVillage.name}
                    </h4>
                    <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      {selectedVillage.district} District
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    {selectedVillage.formatted_address || `${selectedVillage.name}, ${selectedVillage.district}, ${selectedVillage.state}`}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-stone-700 flex items-center justify-end gap-1">
                    <Users className="w-3 h-3 text-stone-400" />
                    <span>{selectedVillage.population?.toLocaleString() || '4,200'} Residents</span>
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    {selectedVillage.latitude.toFixed(3)}°N, {selectedVillage.longitude.toFixed(3)}°E
                  </div>
                </div>
              </div>

              {/* AUTH & LOGIN OPTIONS FOR THIS VILLAGE */}
              <div className="pt-2 border-t border-amber-200/60">
                
                {/* CASE A: User is LOGGED IN */}
                {currentUser && userProfile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-krishi-600" />
                        <span>Logged in as: <strong>{userProfile.full_name}</strong></span>
                      </span>
                      {isCurrentHomeVillage ? (
                        <span className="text-[10px] font-bold bg-krishi-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                          ✓ Official Home Village
                        </span>
                      ) : null}
                    </div>

                    {!isCurrentHomeVillage && (
                      <button
                        onClick={handleSetHomeVillage}
                        disabled={isSavingHome}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-saffron-600 to-amber-600 hover:from-saffron-700 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
                      >
                        {isSavingHome ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Home className="w-3.5 h-3.5" />
                        )}
                        <span>Set {selectedVillage.name} as My Home Village (Save to Database)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* CASE B: User is NOT LOGGED IN — OFFER 1-CLICK VILLAGE LOGIN OR AUTH */
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-saffron-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Log in as a Resident of {selectedVillage.name}</span>
                      </span>
                      <span className="text-[10px] font-bold text-stone-500">1-Click</span>
                    </div>

                    {/* Verified Residents of this Village */}
                    {villageResidents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {villageResidents.map((resident) => {
                          const isLoggingIn = loggingInUserId === resident.id;
                          return (
                            <button
                              key={resident.id}
                              type="button"
                              onClick={() => handleResidentLogin(resident)}
                              disabled={Boolean(loggingInUserId)}
                              className="p-2 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-300 text-left transition-all active:scale-98 flex items-center justify-between gap-1.5 group shadow-2xs"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-stone-900 group-hover:text-saffron-900 truncate">
                                  {resident.full_name}
                                </div>
                                <div className="text-[10px] text-stone-500 capitalize truncate">
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
                      <p className="text-[11px] text-stone-500 italic">
                        No demo resident accounts currently preloaded for this village.
                      </p>
                    )}

                    {/* Password Sign In or Create Account for this Village */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openLoginForVillage(selectedVillage, 'login');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 font-bold text-xs text-stone-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <LogIn className="w-3.5 h-3.5 text-saffron-600" />
                        <span>Sign In with Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openLoginForVillage(selectedVillage, 'register');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-krishi-700 hover:bg-krishi-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Join this Village</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Explore {selectedVillage?.name} Feeds & Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
