import React, { useState, useEffect } from 'react';
import { Mic, X, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const VoiceInputModal: React.FC = () => {
  const { isVoiceModalOpen, setIsVoiceModalOpen, language, selectedVillage, t, setActiveTab } = useApp();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVoiceModalOpen) return;

    setTranscript('');
    setRecognitionError(null);

    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition is not supported in this browser. Please use keyboard input or Chrome/Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Select language
      if (language === 'te') recognition.lang = 'te-IN';
      else if (language === 'hi') recognition.lang = 'hi-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setRecognitionError(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();

      return () => {
        recognition.stop();
      };
    } catch (e: any) {
      setRecognitionError(e.message);
    }
  }, [isVoiceModalOpen, language]);

  if (!isVoiceModalOpen) return null;

  const handleApplyVoice = async () => {
    if (!transcript.trim()) return;
    setIsVoiceModalOpen(false);
    setActiveTab('home');
    // Call smart search directly or populate
    const villageId = selectedVillage?.id || '11111111-1111-1111-1111-111111111111';
    await api.smartSearch(transcript, villageId, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-rural-lg border border-amber-200 relative animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={() => setIsVoiceModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Mic Ring */}
        <div className="my-6 relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-saffron-100 flex items-center justify-center relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-saffron-500 animate-ping opacity-40" />
            )}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-saffron-600 to-amber-500 flex items-center justify-center shadow-lg">
              <Mic className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Status Text */}
        <h3 className="text-lg font-extrabold text-stone-900 mb-1">
          {isListening ? t.voiceListening : 'Voice Input'}
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          {t.voiceSpeakNow}
        </p>

        {/* Transcript Box */}
        <div className="bg-amber-50/60 rounded-2xl p-4 min-h-[90px] border border-amber-200 flex items-center justify-center mb-5 text-stone-800 text-sm font-semibold">
          {transcript ? (
            <span className="text-saffron-900 font-bold text-base">{transcript}</span>
          ) : (
            <span className="text-stone-400 italic">"నాకు రేపు ట్రాక్టర్ కావాలి..." / "I need tractor tomorrow..."</span>
          )}
        </div>

        {recognitionError && (
          <div className="text-xs text-amber-800 bg-amber-100/70 p-2.5 rounded-xl flex items-center gap-2 mb-4 text-left">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{recognitionError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVoiceModalOpen(false)}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 font-bold text-xs text-stone-600 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyVoice}
            disabled={!transcript.trim()}
            className="flex-1 py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Search This Need</span>
          </button>
        </div>

      </div>
    </div>
  );
};
