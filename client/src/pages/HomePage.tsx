import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SmartSearch } from '../components/SmartSearch';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { VillageMapView } from '../components/VillageMapView';
import { api } from '../services/api';
import { Update, Service, Product } from '../types';
import { 
  Tractor, Wrench, Zap, ShoppingBag, ShieldCheck, 
  Clock, Plus, Phone, MessageSquare, ArrowRight, CheckCircle2, AlertTriangle, Users
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    selectedVillage, 
    t, 
    setActiveTab, 
    setIsPostModalOpen, 
    setIsSellModalOpen, 
    refreshTrigger, 
    triggerRefresh, 
    showToast 
  } = useApp();

  const [updates, setUpdates] = useState<Update[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedVillage) return;

    setLoading(true);
    Promise.all([
      api.getUpdates(selectedVillage.id),
      api.getServices({ village_id: selectedVillage.id }),
      api.getProducts({ village_id: selectedVillage.id }),
    ])
      .then(([updatesData, servicesData, productsData]) => {
        setUpdates(updatesData);
        setFeaturedServices(servicesData.slice(0, 4));
        setFeaturedProducts(productsData.slice(0, 4));
      })
      .catch(err => console.error('Failed to load home data:', err))
      .finally(() => setLoading(false));
  }, [selectedVillage, refreshTrigger]);

  // Peer verification action
  const handleVerifyNotice = async (updateId: string) => {
    setVerifyingId(updateId);
    try {
      const res = await api.verifyUpdate(updateId);
      showToast(res.message);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Verification error');
    } finally {
      setVerifyingId(null);
    }
  };

  const emergencies = updates.filter(u => u.is_emergency && u.status === 'live');

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200">
      
      {/* Emergency Notice Alert Banner (if active) */}
      <EmergencyBanner emergencies={emergencies} />

      {/* Greeting Header */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Good day, {selectedVillage?.name} 👋
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600">
            {selectedVillage?.district} District, {selectedVillage?.state} • Pop. ~{selectedVillage?.population?.toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.postNotice}</span>
        </button>
      </div>

      {/* CENTERPIECE: The "I NEED..." Smart Search Agent */}
      <SmartSearch />

      {/* Quick Action Navigation Grid */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-2.5">
          {t.quickActions}
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('agriculture')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 group-hover:scale-110 transition-transform mb-1.5">
              <Tractor className="w-5 h-5 text-amber-700" />
            </div>
            <span className="text-xs font-bold text-stone-800">Tractors</span>
            <span className="text-[10px] text-stone-500">Rentals</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-saffron-100 flex items-center justify-center text-saffron-800 group-hover:scale-110 transition-transform mb-1.5">
              <Zap className="w-5 h-5 text-saffron-600" />
            </div>
            <span className="text-xs font-bold text-stone-800">Electrician</span>
            <span className="text-[10px] text-stone-500">Motors</span>
          </button>

          <button
            onClick={() => setActiveTab('agriculture')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-krishi-100 flex items-center justify-center text-krishi-800 group-hover:scale-110 transition-transform mb-1.5">
              <Users className="w-5 h-5 text-krishi-700" />
            </div>
            <span className="text-xs font-bold text-stone-800">Farm Labor</span>
            <span className="text-[10px] text-stone-500">Harvesting</span>
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-800 group-hover:scale-110 transition-transform mb-1.5">
              <ShoppingBag className="w-5 h-5 text-rose-700" />
            </div>
            <span className="text-xs font-bold text-stone-800">Produce</span>
            <span className="text-[10px] text-stone-500">Sell & Buy</span>
          </button>
        </div>
      </div>

      {/* Interactive Google Maps Village Resource Network */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <span>🗺️</span>
              <span>Village Map & Resource Radar</span>
            </h3>
            <p className="text-xs text-stone-500">
              Interactive Google Maps showing local providers, mandis, and neighboring villages
            </p>
          </div>
          <button
            onClick={() => setActiveTab('directory')}
            className="text-xs font-bold text-saffron-700 hover:text-saffron-800"
          >
            Directory Map ↗
          </button>
        </div>
        <VillageMapView services={featuredServices} showNearbyVillages={true} />
      </div>

      {/* Community Feed with 5-Peer Verification Logic */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
              Village Updates & Notices
            </h3>
            <p className="text-xs text-stone-500">
              Community notices verified by verified residents of {selectedVillage?.name}
            </p>
          </div>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="text-xs font-bold text-saffron-700 hover:text-saffron-800"
          >
            + Create Notice
          </button>
        </div>

        <div className="space-y-3">
          {updates.map((update) => {
            const isLive = update.status === 'live';
            const progressPercent = Math.min(100, Math.round((update.verification_count / update.verifications_required) * 100));

            return (
              <div
                key={update.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm transition-all ${
                  update.is_emergency
                    ? 'border-red-300 bg-red-50/20'
                    : isLive
                    ? 'border-stone-200'
                    : 'border-amber-300/80 bg-amber-50/20'
                }`}
              >
                {/* Status Bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {update.is_emergency ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">
                        <AlertTriangle className="w-3 h-3" />
                        EMERGENCY
                      </span>
                    ) : isLive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-krishi-100 text-krishi-800 border border-krishi-300">
                        <CheckCircle2 className="w-3 h-3 text-krishi-600" />
                        {t.verified} ({update.verification_count} residents)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending ({update.verification_count}/{update.verifications_required} verified)
                      </span>
                    )}
                    <span className="text-xs font-medium text-stone-500">
                      by {update.author_name}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {new Date(update.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Content */}
                <h4 className="font-bold text-stone-900 text-sm sm:text-base mb-1.5">
                  {update.title}
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-3">
                  {update.content}
                </p>

                {/* Verification Progress Bar & Action Button (Target: 5 Users) */}
                {!isLive && (
                  <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 mb-1">
                        <span>Verification Progress: {update.verification_count}/5</span>
                        <span>{5 - update.verification_count} more needed</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleVerifyNotice(update.id)}
                      disabled={verifyingId === update.id}
                      className="px-3.5 py-1.5 rounded-xl bg-krishi-600 hover:bg-krishi-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{verifyingId === update.id ? 'Verifying...' : t.verifyNotice}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Local Services Preview */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
              Nearby Village Services
            </h3>
            <p className="text-xs text-stone-500">
              Verified local workers, tractors, electricians & repair technicians
            </p>
          </div>
          <button
            onClick={() => setActiveTab('directory')}
            className="flex items-center gap-1 text-xs font-bold text-saffron-700 hover:text-saffron-800"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {service.business_name}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {service.provider_name} • <span className="capitalize">{service.category}</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    ★ {service.rating}
                  </span>
                </div>
                <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                  {service.details}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
                <span className="font-bold text-krishi-800">
                  ₹{service.rate_amount} <span className="text-stone-500 font-normal">{service.pricing_unit}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${service.contact_number}`}
                    className="p-1.5 rounded-xl bg-krishi-100 text-krishi-800 hover:bg-krishi-200 transition-colors"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  {service.whatsapp_number && (
                    <a
                      href={`https://wa.me/${service.whatsapp_number.replace(/\+/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fresh Farm Produce Preview */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
              Marketplace Near You
            </h3>
            <p className="text-xs text-stone-500">
              Fresh harvest and farm products directly from farmers
            </p>
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-1 text-xs font-bold text-saffron-700 hover:text-saffron-800"
          >
            <span>{t.sellProduce}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="font-bold text-stone-900 text-sm truncate">
                    {product.title}
                  </h4>
                  {product.is_organic && (
                    <span className="text-[10px] font-bold bg-krishi-100 text-krishi-800 px-1.5 py-0.2 rounded">
                      Organic
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mb-1.5 truncate">
                  Seller: {product.seller_name} • {product.quantity}
                </p>
                <div className="text-sm font-extrabold text-saffron-700">
                  ₹{product.price} <span className="text-xs font-normal text-stone-600">/{product.price_unit}</span>
                </div>
              </div>
              <a
                href={`tel:${product.contact_phone}`}
                className="py-1.5 px-3 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs flex items-center gap-1 flex-shrink-0"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
