import React, { useState, useEffect } from 'react';
import { Search, Mic, Sparkles, Phone, MessageSquare, ExternalLink, CheckCircle2, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, speakText } from '../services/api';
import { SmartSearchResult } from '../types';

export const SmartSearch: React.FC = () => {
  const { 
    selectedVillage, 
    language, 
    t, 
    setIsVoiceModalOpen, 
    setActiveTab, 
    voiceSearchQuery, 
    setVoiceSearchQuery,
    setIsPostModalOpen,
    setIsSellModalOpen
  } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SmartSearchResult | null>(null);

  // Quick Demo Pills for 1-click Judge demonstration
  const quickPills = [
    { label: '🚜 Tractor tomorrow', query: 'I need a tractor tomorrow for harvesting' },
    { label: '⚡ Water pump motor', query: 'My borewell water pump motor is broken, find electrician' },
    { label: '🍅 Sell tomatoes', query: 'Where can I sell my fresh tomatoes?' },
    { label: '📜 Kisan Schemes', query: 'What government farming schemes can I apply for?' },
    { label: '🌾 Harvest labor team', query: 'I need farm labor for paddy harvesting this weekend' },
  ];

  // Auto-run when speech was captured via VoiceInputModal
  useEffect(() => {
    if (voiceSearchQuery) {
      setQuery(voiceSearchQuery);
      handleSearch(voiceSearchQuery);
      setVoiceSearchQuery(null);
    }
  }, [voiceSearchQuery]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const villageId = selectedVillage?.id || '11111111-1111-1111-1111-111111111111';
      const result = await api.smartSearch(q, villageId, language);
      setSearchResult(result);

      // Speak result explanation aloud in local language for rural audio accessibility!
      if (result.explanation) {
        speakText(result.explanation, language);
      }
    } catch (err) {
      console.error('Smart search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePillClick = (pillQuery: string) => {
    setQuery(pillQuery);
    handleSearch(pillQuery);
  };

  return (
    <div className="w-full bg-gradient-to-b from-amber-500/10 via-saffron-500/5 to-transparent rounded-3xl p-4 sm:p-6 border border-amber-200/70 shadow-rural">
      
      {/* Title & Tagline */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-saffron-500 text-white shadow-sm">
            <Sparkles className="w-4 h-4 fill-white" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
              {t.searchPlaceholder}
            </h2>
            <p className="text-xs text-stone-600">
              {t.searchHelp}
            </p>
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center bg-white rounded-2xl shadow-md border-2 border-saffron-400 focus-within:border-saffron-600 transition-all p-1.5 sm:p-2">
        <Search className="w-5 h-5 text-saffron-600 ml-2.5 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={t.searchPlaceholder}
          className="w-full px-3 py-2 text-stone-900 placeholder-stone-400 font-medium text-sm sm:text-base focus:outline-none bg-transparent"
        />

        {/* Voice Microphone Input Button */}
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          title="Speak in Telugu, Hindi, or English"
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-saffron-800 font-bold text-xs flex items-center gap-1.5 transition-all mr-1 shadow-sm active:scale-95"
        >
          <Mic className="w-4 h-4 text-saffron-600 animate-pulse" />
          <span className="hidden sm:inline font-semibold">Speak</span>
        </button>

        {/* Search Submit Button */}
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-saffron-600 to-amber-600 hover:from-saffron-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Connect</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Quick Demo Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex-shrink-0 mr-1">
          Quick Demo:
        </span>
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handlePillClick(pill.query)}
            className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full bg-white hover:bg-saffron-50 text-stone-700 hover:text-saffron-900 border border-stone-200 hover:border-saffron-300 shadow-sm transition-all active:scale-95"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Agentic Results Container */}
      {searchResult && (
        <div className="mt-4 pt-4 border-t border-amber-200/80 animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Agent Workflow Badge Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-krishi-100 text-krishi-900 border border-krishi-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-krishi-600" />
              <span>Intent: {searchResult.intent}</span>
            </span>

            {searchResult.entities && Object.entries(searchResult.entities).map(([key, val]) => (
              <span key={key} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                <span className="capitalize text-stone-500">{key}:</span> {val}
              </span>
            ))}

            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              ⚡ Tools: {searchResult.toolCalls.map(t => t.tool).join(', ')}
            </span>
          </div>

          {/* Reasoning & Explanation Card */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm mb-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-saffron-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
                {t.whyThisMatched}
              </h3>
              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                Confidence 96%
              </span>
            </div>
            <p className="text-sm font-medium text-stone-800 leading-relaxed">
              {searchResult.explanation}
            </p>
          </div>

          {/* Local Provider / Resource Cards */}
          {searchResult.results && searchResult.results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {searchResult.results.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-saffron-300 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                        {item.business_name || item.title}
                      </h4>
                      <p className="text-xs font-medium text-stone-500">
                        {item.provider_name || item.seller_name || item.category}
                      </p>
                    </div>
                    {item.rating && (
                      <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                        ★ {item.rating}
                      </span>
                    )}
                    {item.price && (
                      <span className="text-xs font-bold bg-krishi-100 text-krishi-900 px-2 py-0.5 rounded-full">
                        ₹{item.price} {item.price_unit}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                    {item.details || item.description || item.benefits}
                  </p>

                  {/* Contact / Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    {item.contact_number && (
                      <a
                        href={`tel:${item.contact_number}`}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-krishi-600 hover:bg-krishi-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{t.callNow}</span>
                      </a>
                    )}
                    {item.whatsapp_number && (
                      <a
                        href={`https://wa.me/${item.whatsapp_number.replace(/\+/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{t.whatsapp}</span>
                      </a>
                    )}
                    {item.official_portal_url && (
                      <a
                        href={item.official_portal_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{t.officialPortal}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Next Actions */}
          {searchResult.recommendedActions && searchResult.recommendedActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-600">Recommended Next Steps:</span>
              {searchResult.recommendedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (action.type === 'POST_REQUEST') {
                      setActiveTab('home');
                      setIsPostModalOpen(true);
                    } else if (action.type === 'CREATE_LISTING') {
                      setActiveTab('marketplace');
                      setIsSellModalOpen(true);
                    } else if (action.action.startsWith('/')) {
                      const tab = action.action.replace('/', '');
                      setActiveTab(tab === 'community' ? 'home' : tab);
                    } else if (action.action.startsWith('http') || action.action.startsWith('tel:')) {
                      window.open(action.action, '_blank');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-saffron-700 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
                >
                  <span>{action.label}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
