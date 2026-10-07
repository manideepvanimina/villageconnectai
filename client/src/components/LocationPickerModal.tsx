import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Village } from '../types';
import { calculateDistanceKm, getGoogleMapsLocationUrl } from '../utils/geo';
import { 
  MapPin, X, Navigation, Crosshair, CheckCircle2, 
  ExternalLink, Compass, Loader2
} from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose }) => {
  const { villages, selectedVillage, setSelectedVillage, showToast } = useApp();
  const [detecting, setDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentLat = selectedVillage?.latitude || 17.3850;
  const currentLng = selectedVillage?.longitude || 78.4867;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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
        setDetectedInfo(`GPS Match: Found ${nearest.name} (${minDistance} km from your device)`);
        showToast(`📍 GPS matched to: ${nearest.name} (${minDistance} km)`);
        setDetecting(false);
      },
      (error) => {
        console.warn('GPS error:', error);
        setDetecting(false);
        alert(`Could not detect GPS location (${error.message}). Please choose your village from the list.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const mapEmbedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(selectedVillage?.name || 'Ramapuram')}&center=${currentLat},${currentLng}&zoom=13`
    : `https://www.google.com/maps?q=${currentLat},${currentLng}&z=13&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-rural-lg border border-amber-200 relative animate-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-saffron-600 text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                Select Your Home Village
              </h3>
              <p className="text-xs text-stone-500">
                Google Maps Location & Panchayats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Auto Detect Button */}
        <div className="my-3">
          <button
            onClick={handleDetectGPS}
            disabled={detecting}
            className="w-full py-2.5 px-4 rounded-2xl bg-amber-100/90 hover:bg-amber-200/90 text-saffron-900 border border-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
          >
            {detecting ? (
              <Loader2 className="w-4 h-4 animate-spin text-saffron-600" />
            ) : (
              <Crosshair className="w-4 h-4 text-saffron-600" />
            )}
            <span>{detecting ? 'Acquiring GPS Signal...' : 'Auto-Detect My Village via GPS'}</span>
          </button>
          {detectedInfo && (
            <p className="text-[11px] font-bold text-krishi-700 mt-1.5 text-center">
              ✓ {detectedInfo}
            </p>
          )}
        </div>

        {/* Interactive Google Map Preview */}
        <div className="w-full h-44 rounded-2xl overflow-hidden border border-stone-200 my-3 relative shadow-inner">
          <iframe
            title="Google Maps Village Preview"
            src={mapEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 bg-white/95 px-2 py-1 rounded-lg text-[10px] font-bold text-stone-700 shadow-xs">
            📍 {selectedVillage?.name} ({selectedVillage?.district})
          </div>
        </div>

        {/* Village Selection List */}
        <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar my-3">
          {villages.map((v) => {
            const isSelected = selectedVillage?.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVillage(v)}
                className={`w-full text-left p-2.5 rounded-2xl text-xs flex items-center justify-between border transition-all ${
                  isSelected
                    ? 'bg-amber-100/70 border-saffron-500 font-bold text-saffron-900 shadow-xs'
                    : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div>
                  <div className="font-semibold text-stone-900">{v.name}</div>
                  <div className="text-[10px] text-stone-500">{v.formatted_address || `${v.district}, ${v.state}`}</div>
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

        {/* Confirm Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
          >
            Confirm {selectedVillage?.name} Location
          </button>
        </div>

      </div>
    </div>
  );
};
