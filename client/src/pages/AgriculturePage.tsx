import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Service, GovernmentScheme } from '../types';
import { 
  Tractor, Users, FileText, Phone, MessageSquare, 
  ExternalLink, ShieldCheck, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';

export const AgriculturePage: React.FC = () => {
  const { selectedVillage, language, t } = useApp();
  const [agriServices, setAgriServices] = useState<Service[]>([]);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [activeTab, setActiveSection] = useState<'equipment' | 'schemes'>('equipment');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedVillage) return;
    setLoading(true);

    Promise.all([
      api.getServices({ village_id: selectedVillage.id }),
      api.getGovernmentSchemes(),
    ])
      .then(([servicesData, schemesData]) => {
        const filtered = servicesData.filter(s => 
          ['tractor', 'farm_labor', 'harvester', 'agricultural_services'].includes(s.category)
        );
        setAgriServices(filtered);
        setSchemes(schemesData);
      })
      .catch(err => console.error('Agri page load error:', err))
      .finally(() => setLoading(false));
  }, [selectedVillage]);

  return (
    <div className="space-y-5 pb-20 md:pb-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="pt-2">
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <span>🚜</span>
          <span>{t.navAgriculture} — {selectedVillage?.name}</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">
          Dedicated hub for tractors, harvesters, farm labor teams, and verified government agricultural welfare schemes
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveSection('equipment')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'equipment'
              ? 'bg-krishi-700 text-white shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Tractor className="w-4 h-4" />
          <span>Farm Machinery & Labor ({agriServices.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('schemes')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'schemes'
              ? 'bg-saffron-600 text-white shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Government Schemes ({schemes.length})</span>
        </button>
      </div>

      {/* Equipment & Labor Section */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {agriServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-krishi-800 bg-krishi-100 px-2 py-0.5 rounded">
                        {service.category === 'tractor' ? 'Tractor & Implements' : 'Agricultural Labor'}
                      </span>
                      <h3 className="font-extrabold text-stone-900 text-base mt-1">
                        {service.business_name}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        Lead: {service.provider_name}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      ★ {service.rating}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4">
                    {service.details}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 mb-3">
                    <span className="bg-stone-100 px-2 py-0.5 rounded-md">
                      Coverage: {service.service_radius_km || 15} km
                    </span>
                    <span className="bg-krishi-50 text-krishi-700 font-bold px-2 py-0.5 rounded-md">
                      ● {service.availability_status}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="text-sm font-extrabold text-stone-900">
                    ₹{service.rate_amount} <span className="text-xs font-normal text-stone-500">{service.pricing_unit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${service.contact_number}`}
                      className="px-3.5 py-2 rounded-xl bg-krishi-600 hover:bg-krishi-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t.callNow}</span>
                    </a>
                    {service.whatsapp_number && (
                      <a
                        href={`https://wa.me/${service.whatsapp_number.replace(/\+/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
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
        </div>
      )}

      {/* Official Government Schemes Section */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-saffron-50 border border-saffron-200/80 flex items-start gap-2.5 text-xs text-saffron-950">
            <ShieldCheck className="w-4 h-4 text-saffron-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Official & Verified Information Only:</strong> Every scheme listed below is verified directly from Central & State Ministry portals (e.g., pmkisan.gov.in, pmfby.gov.in). Never trust unofficial links.
            </div>
          </div>

          <div className="space-y-3.5">
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Category: {scheme.category}
                    </span>
                    <h3 className="font-extrabold text-stone-900 text-base sm:text-lg mt-1">
                      {language === 'te' && scheme.title_te ? scheme.title_te : language === 'hi' && scheme.title_hi ? scheme.title_hi : scheme.title}
                    </h3>
                  </div>

                  <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-1 rounded-lg self-start">
                    Verified: {scheme.last_verified_date}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-stone-700 my-3">
                  <div>
                    <strong className="text-stone-900">Key Benefits: </strong>
                    <span>{scheme.benefits}</span>
                  </div>
                  <div>
                    <strong className="text-stone-900">Eligibility: </strong>
                    <span>{scheme.eligibility}</span>
                  </div>
                  <div>
                    <strong className="text-stone-900">How to Apply: </strong>
                    <span>{scheme.how_to_apply}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  {scheme.helpline_number && (
                    <div className="text-stone-600">
                      <strong>Toll-free Helpline:</strong> <span className="font-mono">{scheme.helpline_number}</span>
                    </div>
                  )}

                  <a
                    href={scheme.official_portal_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all self-start sm:self-auto"
                  >
                    <span>{t.officialPortal}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
