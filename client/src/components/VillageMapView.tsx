import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Service, Village } from '../types';
import { calculateDistanceKm, getGoogleMapsDirectionsUrl, getGoogleMapsLocationUrl } from '../utils/geo';
import { 
  MapPin, Navigation, ExternalLink, Phone, MessageSquare, 
  Layers, Compass, Star, CheckCircle2, ChevronRight, Tractor, Zap, Wrench, Users, Search
} from 'lucide-react';

interface VillageMapViewProps {
  services?: Service[];
  showNearbyVillages?: boolean;
}

export const VillageMapView: React.FC<VillageMapViewProps> = ({ 
  services = [],
  showNearbyVillages = true 
}) => {
  const { selectedVillage, villages, setSelectedVillage, t } = useApp();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [mapQuery, setMapQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState<{
    type: 'village' | 'service';
    data: any;
    distanceKm?: number;
  } | null>(null);

  if (!selectedVillage) return null;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const lat = selectedVillage.latitude || 17.3850;
  const lng = selectedVillage.longitude || 78.4867;

  // Compute nearby villages with real Haversine distance
  const nearbyVillages = villages
    .filter(v => v.id !== selectedVillage.id)
    .map(v => ({
      ...v,
      distanceKm: calculateDistanceKm(lat, lng, v.latitude, v.longitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Determine Google Maps Embed URL
  const queryText = mapQuery.trim()
    ? `${mapQuery}, ${selectedVillage.district}, ${selectedVillage.state}`
    : `${selectedVillage.name}, ${selectedVillage.district}, ${selectedVillage.state}`;

  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(queryText)}&center=${lat},${lng}&zoom=14&maptype=${mapType}`
    : `https://www.google.com/maps?q=${encodeURIComponent(queryText)}&ll=${lat},${lng}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=14&output=embed`;

  // Helper icon for service category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tractor': return Tractor;
      case 'electrician': return Zap;
      case 'mechanic': return Wrench;
      case 'farm_labor': return Users;
      default: return MapPin;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 shadow-rural overflow-hidden">
      
      {/* Map Header Bar */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-saffron-500/5 to-white border-b border-amber-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-saffron-600 to-amber-500 text-white flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900 tracking-tight flex items-center gap-1.5">
              <span>Google Maps — Village Network</span>
              <span className="text-[10px] font-bold bg-krishi-100 text-krishi-800 px-2 py-0.5 rounded-full border border-krishi-300">
                Live GPS
              </span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Center: {selectedVillage.name} Gram Panchayat ({lat.toFixed(4)}° N, {lng.toFixed(4)}° E)
            </p>
          </div>
        </div>

        {/* Map Type Controls (Roadmap / Satellite) & Directions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                mapType === 'roadmap'
                  ? 'bg-white text-saffron-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                mapType === 'satellite'
                  ? 'bg-white text-saffron-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Satellite</span>
            </button>
          </div>

          <a
            href={getGoogleMapsDirectionsUrl(lat, lng, selectedVillage.name)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white shadow-xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Directions</span>
          </a>
        </div>
      </div>

      {/* Map Search / Landmark Input */}
      <div className="px-4 py-2 bg-amber-50/50 border-b border-amber-100 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-stone-400 ml-1" />
        <input
          type="text"
          value={mapQuery}
          onChange={(e) => setMapQuery(e.target.value)}
          placeholder={`Search landmarks in ${selectedVillage.name} (e.g. Rythu Vedika, Substation, Temple)...`}
          className="w-full bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
        />
        {mapQuery && (
          <button onClick={() => setMapQuery('')} className="text-[10px] text-stone-400 hover:text-stone-600">
            Reset
          </button>
        )}
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[300px] sm:h-[380px] bg-stone-100">
        <iframe
          title={`Google Map of ${selectedVillage.name}`}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        {/* Live Map Legend Floating Card */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-amber-200/70 text-xs max-w-[210px] pointer-events-auto">
          <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
            <MapPin className="w-3.5 h-3.5 text-saffron-600" />
            <span className="truncate">{selectedVillage.name}</span>
          </div>
          <div className="text-[10px] text-stone-600 space-y-0.5">
            <div>📍 Verified Gram Panchayat</div>
            <div>🚜 {services.length} Local Services Available</div>
            <div>🏘️ {nearbyVillages.length} Nearby Villages (within 25 km)</div>
          </div>
        </div>

        {/* Fullscreen Google Maps Link */}
        <a
          href={getGoogleMapsLocationUrl(lat, lng, selectedVillage.name)}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md hover:bg-white text-stone-800 text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-md border border-stone-200 flex items-center gap-1 transition-all"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Nearby Resources & Villages Panel */}
      <div className="p-4 bg-stone-50/60 border-t border-stone-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Section 1: Nearby Villages with Haversine GPS Distance */}
          {showNearbyVillages && nearbyVillages.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1">
                  <span>Nearby Villages by Road</span>
                </span>
                <span className="text-[10px] text-stone-500">Haversine GPS</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {nearbyVillages.map(v => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-400 shadow-xs flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-stone-900 truncate">
                        {v.name}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {v.district} • Pop. ~{v.population?.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] font-extrabold text-saffron-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        {v.distanceKm} km
                      </span>
                      <button
                        onClick={() => setSelectedVillage(v)}
                        className="text-[11px] font-bold text-stone-700 hover:text-saffron-700 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                      >
                        Switch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Local Services Geocoded in this Village */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Services in {selectedVillage.name}
              </span>
              <span className="text-[10px] text-stone-500">
                {services.length} registered
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {services.length === 0 ? (
                <div className="p-3 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-100">
                  No registered providers in this village yet
                </div>
              ) : (
                services.map(s => {
                  const Icon = getCategoryIcon(s.category);
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedPin({ type: 'service', data: s })}
                      className="p-2.5 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-400 shadow-xs flex items-center justify-between gap-2 cursor-pointer transition-all hover:bg-amber-50/30"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-stone-900 truncate">
                            {s.business_name}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {s.provider_name} • ₹{s.rate_amount} {s.pricing_unit}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-bold text-krishi-800 bg-krishi-50 px-1.5 py-0.5 rounded">
                          ★ {s.rating}
                        </span>
                        <a
                          href={`tel:${s.contact_number}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-md bg-krishi-600 text-white hover:bg-krishi-700"
                          title="Call"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Selected Provider Card Details Popup */}
        {selectedPin?.type === 'service' && selectedPin.data && (
          <div className="mt-3 p-3.5 bg-white rounded-2xl border-2 border-saffron-400 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm">
                  {selectedPin.data.business_name}
                </h4>
                <p className="text-xs text-stone-500">
                  {selectedPin.data.provider_name} • Service Radius: {selectedPin.data.service_radius_km || 15} km
                </p>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-stone-400 hover:text-stone-700 text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-700 mb-2.5">
              {selectedPin.data.details}
            </p>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedPin.data.contact_number}`}
                className="flex-1 py-1.5 px-3 rounded-xl bg-krishi-600 hover:bg-krishi-700 text-white font-bold text-xs flex items-center justify-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>Call Provider</span>
              </a>
              {selectedPin.data.whatsapp_number && (
                <a
                  href={`https://wa.me/${selectedPin.data.whatsapp_number.replace(/\+/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              )}
              <a
                href={getGoogleMapsDirectionsUrl(lat, lng, selectedPin.data.business_name)}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Map Route</span>
              </a>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
