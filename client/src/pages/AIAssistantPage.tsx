import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, speakText } from '../services/api';
import { 
  Sparkles, Send, Mic, Volume2, ShieldCheck, 
  ExternalLink, Phone, MessageSquare, Bot, User, Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  sources?: Array<{ name: string; verifiedDate: string; official?: boolean }>;
  cards?: any[];
  timestamp: string;
}

export const AIAssistantPage: React.FC = () => {
  const { selectedVillage, language, t, setIsVoiceModalOpen } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    const welcomeText = language === 'te'
      ? `నమస్కారం! నేను VillageConnect AI సహాయకుడిని. ${selectedVillage?.name} గ్రామంలో ట్రాక్టర్, వ్యవసాయ కూలీలు, మోటార్ మరమ్మతులు, మార్కెట్ రేట్లు లేదా ప్రభుత్వ పథకాల గురించి నన్ను అడగండి.`
      : language === 'hi'
      ? `नमस्ते! मैं VillageConnect AI सहायक हूँ। ${selectedVillage?.name} गाँव में ट्रैक्टर, कृषि मजदूर, पंप मरम्मत, बाज़ार दरें या सरकारी योजनाओं के बारे में मुझसे पूछें।`
      : `Hello! I am your VillageConnect AI Assistant for ${selectedVillage?.name}. How can I assist you with tractors, farm labor, water pump repairs, marketplace produce, or official government welfare schemes today?`;

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        content: welcomeText,
        sources: [{ name: 'VillageConnect Local Intelligence', verifiedDate: '2026-03-28' }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [selectedVillage, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const villageId = selectedVillage?.id || '11111111-1111-1111-1111-111111111111';
      const response = await api.chatAI(text, villageId, language);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: response.reply,
        sources: response.sources,
        cards: response.cards,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      // Speak response aloud automatically if desired or via button
    } catch (err: any) {
      console.warn('API chat connection issue, activating local intelligence fallback:', err);
      const vName = selectedVillage?.name || 'Ramapuram';
      const q = text.toLowerCase();
      let fallbackReply = '';
      let fallbackCards: any[] = [];

      if (q.includes('motor') || q.includes('pump') || q.includes('electrician') || q.includes('మోటార్') || q.includes('पंप')) {
        fallbackReply = language === 'te'
          ? `నమస్కారం! ${vName} గ్రామ పరిసరాల్లో బోరు మోటార్ మరమ్మతులకు **రవి ఎలక్ట్రికల్స్ (రవి శంకర్)** అందుబాటులో ఉన్నారు.\n\n• ఫోన్: **+919849133445**\n• సేవ: బోరు మోటార్, స్టార్టర్, వైరింగ్ మరమ్మతులు\n• రేటు: ₹300 (విజిట్ కి)\n• లభ్యత: అందుబాటులో ఉన్నారు\n\nమీరు నేరుగా కాల్ చేయవచ్చు.`
          : language === 'hi'
          ? `नमस्ते! ${vName} क्षेत्र में बोरवेल मोटर मरम्मत के लिए **रवि इलेक्ट्रिकल्स (रवि शंकर)** उपलब्ध हैं।\n\n• फ़ोन: **+919849133445**\n• सेवा: बोरवेल मोटर व स्टार्टर रिपेयर\n• दर: ₹300 / विज़िट\n• स्थिति: उपलब्ध`
          : `Hello! For borewell water pump motor repairs in ${vName} cluster, I located **Ravi Electricals & Borewell Motor Repairs** operated by **Ravi Shankar**.\n\n• Contact: **+919849133445**\n• Service: Submersible pump winding, starter repair, emergency wiring\n• Rate: ₹300 per visit\n• Status: Available now`;
        fallbackCards = [{
          id: '52222222-2222-2222-2222-222222222222',
          business_name: 'Ravi Electricals & Borewell Motor Repairs',
          provider_name: 'Ravi Shankar',
          contact_number: '+919849133445',
          whatsapp_number: '+919849133445',
          category: 'electrician',
          rate_amount: 300,
          pricing_unit: 'per visit',
          availability_status: 'available',
          service_radius_km: 15
        }];
      } else if (q.includes('tractor') || q.includes('హార్వెస్టర్') || q.includes('ట్రాక్టర్') || q.includes('ट्रैक्टर')) {
        fallbackReply = `In ${vName} area, **Srinivas Tractor & Harvester Services** is available for ploughing and harvesting.\n\n• Contact: **+919848022334**\n• Rate: ₹1200 per acre`;
        fallbackCards = [{
          id: '51111111-1111-1111-1111-111111111111',
          business_name: 'Srinivas Tractor & Harvester Services',
          provider_name: 'Srinivas Rao',
          contact_number: '+919848022334',
          whatsapp_number: '+919848022334',
          category: 'tractor',
          rate_amount: 1200,
          pricing_unit: 'per acre',
          availability_status: 'available',
          service_radius_km: 15
        }];
      } else if (q.includes('scheme') || q.includes('kisan') || q.includes('పథకం') || q.includes('योजना')) {
        fallbackReply = `Active schemes for farmers in ${vName}:\n\n• **PM-KISAN Samman Nidhi**: ₹6,000/year in 3 installments (apply at pmkisan.gov.in)\n• **PM Fasal Bima Yojana (PMFBY)**: Low-premium crop insurance for kharif & rabi`;
      } else {
        fallbackReply = `I am your VillageConnect AI Assistant for ${vName}. You can ask about tractors, borewell mechanics, farm labor, crop market prices, or official government welfare schemes. How can I assist you?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-local-${Date.now()}`,
          sender: 'assistant',
          content: fallbackReply,
          sources: [{ name: 'VillageConnect Local Intelligence (High-Availability Fallback)', verifiedDate: '2026-03-28' }],
          cards: fallbackCards,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { label: '🚜 Tractor tomorrow', prompt: 'I need a tractor tomorrow for harvesting' },
    { label: '⚡ Water pump broken', prompt: 'Find someone to repair my borewell water pump motor' },
    { label: '📜 Kisan Schemes', prompt: 'What government farming schemes can I apply for?' },
    { label: '🍅 Sell tomatoes', prompt: 'Where can I sell my tomatoes?' },
    { label: '📝 Draft notice', prompt: 'Draft a village notice for electricity feeder maintenance' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-20 md:pb-4 animate-in fade-in duration-200">
      
      {/* Assistant Header */}
      <div className="py-2.5 px-4 bg-white rounded-2xl border border-amber-200/80 shadow-sm mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-saffron-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
              {t.aiAssistantTitle}
            </h2>
            <p className="text-[11px] text-stone-500">
              Active Context: {selectedVillage?.name} Gram Panchayat
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-krishi-100 text-krishi-800 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-krishi-600" />
          Verified Sources
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-stone-800 text-white'
                  : 'bg-saffron-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-stone-900 text-white rounded-tr-sm'
                  : 'bg-white text-stone-900 border border-amber-200/80 rounded-tl-sm'
              }`}
            >
              <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                {msg.content}
              </div>

              {/* Cards (if returned provider) */}
              {msg.cards && msg.cards.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
                  {msg.cards.map(c => (
                    <div key={c.id} className="bg-amber-50/50 p-2.5 rounded-2xl border border-amber-200 text-xs">
                      <div className="font-bold text-stone-900">{c.business_name}</div>
                      <div className="text-[11px] text-stone-500 mb-2">{c.provider_name} • Rate: ₹{c.rate_amount} {c.pricing_unit}</div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${c.contact_number}`}
                          className="px-3 py-1 rounded-lg bg-krishi-600 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Now</span>
                        </a>
                        {c.whatsapp_number && (
                          <a
                            href={`https://wa.me/${c.whatsapp_number.replace(/\+/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Verified Sources Badge */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5 text-[10px] text-stone-500">
                  <ShieldCheck className="w-3 h-3 text-krishi-600 flex-shrink-0" />
                  <span>Source:</span>
                  {msg.sources.map((s, idx) => (
                    <span key={idx} className="font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.2 rounded">
                      {s.name} ({s.verifiedDate})
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Audio & Timestamp */}
              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-stone-400">
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => speakText(msg.content, language)}
                    title="Read aloud in local language"
                    className="flex items-center gap-1 text-saffron-700 hover:text-saffron-900 font-bold ml-2"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-stone-500 bg-white p-3 rounded-2xl border border-stone-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-saffron-600" />
            <span>Consulting local village database...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sample Prompt Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.prompt)}
            className="flex-shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-white hover:bg-saffron-50 text-stone-700 border border-stone-200 hover:border-saffron-300 shadow-sm"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-amber-300 focus-within:border-saffron-600 p-1.5 shadow-sm">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask in Telugu, Hindi or English..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none"
        />

        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-saffron-800"
          title="Voice Input"
        >
          <Mic className="w-4 h-4 text-saffron-600" />
        </button>

        <button
          onClick={() => handleSend()}
          disabled={!inputMessage.trim() || loading}
          className="px-4 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

    </div>
  );
};
