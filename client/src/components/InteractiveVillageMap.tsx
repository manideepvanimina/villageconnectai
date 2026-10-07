import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Village } from '../types';
import { Compass, Maximize2, Crosshair } from 'lucide-react';

interface InteractiveVillageMapProps {
  villages: Village[];
  selectedVillage: Village | null;
  onSelectVillage: (village: Village) => void;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
  height?: string;
}

export const InteractiveVillageMap: React.FC<InteractiveVillageMapProps> = ({
  villages,
  selectedVillage,
  onSelectVillage,
  userLocation,
  className = '',
  height = '320px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialLat = selectedVillage?.latitude || 17.385;
    const initialLng = selectedVillage?.longitude || 78.4867;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 11,
      zoomControl: false, // Custom placed zoom or default
      attributionControl: false,
    });

    // High quality, beautiful CartoDB Voyager map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size once DOM has painted
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Markers when villages or selectedVillage changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    villages.forEach(v => {
      const isSelected = selectedVillage?.id === v.id;
      bounds.extend([v.latitude, v.longitude]);

      const pinHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          ${isSelected ? '<div class="absolute -top-1 w-12 h-12 bg-amber-400/40 rounded-full animate-ping pointer-events-none"></div>' : ''}
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md transition-all duration-200 border-2 ${
            isSelected
              ? 'bg-gradient-to-r from-saffron-600 to-amber-600 border-white text-white scale-110 ring-4 ring-saffron-500/40 shadow-xl'
              : 'bg-white/95 border-stone-300 hover:border-saffron-500 text-stone-800 hover:scale-105'
          }">
            <span class="text-sm">🌾</span>
            <span class="text-xs font-black tracking-tight whitespace-nowrap">${v.name}</span>
          </div>
          <div class="w-2.5 h-2.5 transform rotate-45 -mt-1 ${
            isSelected ? 'bg-amber-600 ring-1 ring-white' : 'bg-white border-r border-b border-stone-300'
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'village-custom-marker',
        html: pinHtml,
        iconSize: [120, 44],
        iconAnchor: [60, 44],
      });

      const marker = L.marker([v.latitude, v.longitude], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          onSelectVillage(v);
          map.flyTo([v.latitude, v.longitude], 13, {
            animate: true,
            duration: 0.7,
          });
        });

      markersRef.current.push(marker);
    });

    // Handle user location marker
    if (userLocation) {
      if (userMarkerRef.current) userMarkerRef.current.remove();

      const userPinHtml = `
        <div class="relative flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-blue-500/30 animate-ping absolute -top-1"></div>
          <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
            📍
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: userPinHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your Current Location');

      bounds.extend([userLocation.lat, userLocation.lng]);
    }
  }, [villages, selectedVillage, userLocation, onSelectVillage]);

  // Center on selected village smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVillage) return;

    map.flyTo([selectedVillage.latitude, selectedVillage.longitude], 13, {
      animate: true,
      duration: 0.6,
    });
  }, [selectedVillage?.id]);

  // Reset View to fit all villages
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || villages.length === 0) return;

    const bounds = L.latLngBounds(villages.map(v => [v.latitude, v.longitude]));
    if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);
    map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 0.8 });
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-amber-200 shadow-inner ${className}`} style={{ height }}>
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Actions */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-amber-200">
        <Compass className="w-3.5 h-3.5 text-saffron-600 animate-spin-slow" />
        <span className="text-[11px] font-black text-stone-800">
          {selectedVillage ? `📍 ${selectedVillage.name}` : 'Click any village pin to select'}
        </span>
      </div>

      <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-2">
        <button
          onClick={handleFitAll}
          type="button"
          title="Fit all villages on map"
          className="bg-white/95 hover:bg-white text-stone-700 hover:text-saffron-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-stone-200 flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5 text-saffron-600" />
          <span>Fit All ({villages.length})</span>
        </button>
      </div>
    </div>
  );
};
