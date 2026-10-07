import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Service } from '../types';
import { VillageMapView } from '../components/VillageMapView';
import { 
  Search, Phone, MessageSquare, Plus, Star, MapPin, 
  CheckCircle2, Clock, Wrench, Tractor, Users, Zap, Shield, Map, List
} from 'lucide-react';

export const DirectoryPage: React.FC = () => {
  const { selectedVillage, t, setIsServiceModalOpen, refreshTrigger } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'tractor', label: '🚜 Tractor & Farm Machinery' },
    { id: 'farm_labor', label: '🌾 Farm Labor' },
    { id: 'electrician', label: '⚡ Electrician & Borewell' },
    { id: 'plumber', label: '🚰 Plumber' },
    { id: 'mechanic', label: '🔧 Mechanic / Garage' },
    { id: 'auto', label: '🛺 Auto & Transport' },
    { id: 'driver', label: '🚗 Driver' },
    { id: 'carpenter', label: '🪚 Carpenter' },
    { id: 'welder', label: '⚙️ Welder' },
    { id: 'tailor', label: '🧵 Tailor' },
  ];

  useEffect(() => {
    if (!selectedVillage) return;
    setLoading(true);

    api.getServices({
      village_id: selectedVillage.id,
      category: selectedCategory,
      availability: availabilityFilter,
      search: searchTerm,
    })
      .then(setServices)
      .catch(err => console.error('Directory fetch error:', err))
      .finally(() => setLoading(false));
  }, [selectedVillage, selectedCategory, availabilityFilter, searchTerm, refreshTrigger]);

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {t.navDirectory} — {selectedVillage?.name}
          </h2>
          <p className="text-xs text-stone-600">
            Verified electricians, tractor operators, mechanics, plumbers, and local workers
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* List vs Map View Mode Toggle */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-saffron-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-saffron-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-saffron-600" />
              <span>Maps</span>
            </button>
          </div>

          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.registerService}</span>
            <span className="sm:hidden">Register</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-stone-200 p-1.5">
        <Search className="w-4 h-4 text-stone-400 ml-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by worker name, machinery, service (e.g. rotavator, borewell, puncture)..."
          className="w-full px-3 py-2 text-stone-900 placeholder-stone-400 text-xs sm:text-sm focus:outline-none"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-stone-400 mr-2">
            Clear
          </button>
        )}
      </div>

      {/* Category Horizontal Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.id
                ? 'bg-saffron-600 text-white shadow-saffron-200'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Availability Filter Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setAvailabilityFilter('all')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
            availabilityFilter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setAvailabilityFilter('available')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 ${
            availabilityFilter === 'available'
              ? 'bg-krishi-700 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-krishi-400" />
          <span>Available Now</span>
        </button>
      </div>

      {/* View Mode: Map vs List */}
      {viewMode === 'map' ? (
        <div className="animate-in fade-in duration-200">
          <VillageMapView services={services} showNearbyVillages={true} />
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">
          Loading directory records...
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
          <Wrench className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h4 className="font-bold text-stone-800 text-sm">No services found</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {t.emptyDirectory}
          </p>
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-saffron-600 text-white font-bold text-xs"
          >
            {t.registerService}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">
                      {service.business_name}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      {service.provider_name} • <span className="capitalize">{service.category}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {service.rating} ({service.rating_count})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        service.availability_status === 'available'
                          ? 'bg-krishi-100 text-krishi-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {service.availability_status === 'available' ? '● Available' : '○ Busy'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4">
                  {service.details}
                </p>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 mb-4">
                  {service.experience_years && (
                    <span className="bg-stone-100 px-2 py-0.5 rounded-md">
                      {service.experience_years} yrs exp.
                    </span>
                  )}
                  {service.service_radius_km && (
                    <span className="bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-saffron-600" />
                      {service.service_radius_km} km radius
                    </span>
                  )}
                  {service.is_verified && (
                    <span className="bg-krishi-50 text-krishi-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Shield className="w-3 h-3 text-krishi-600" />
                      Verified Provider
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-stone-500">Service Rate:</span>
                  <div className="text-sm font-extrabold text-stone-900">
                    ₹{service.rate_amount} <span className="text-xs font-normal text-stone-500">{service.pricing_unit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${service.contact_number}`}
                    className="px-3.5 py-2 rounded-xl bg-krishi-600 hover:bg-krishi-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.callNow}</span>
                  </a>

                  {service.whatsapp_number && (
                    <a
                      href={`https://wa.me/${service.whatsapp_number.replace(/\+/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.whatsapp}</span>
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
