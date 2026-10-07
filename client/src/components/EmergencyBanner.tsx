import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Update } from '../types';

interface EmergencyBannerProps {
  emergencies: Update[];
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ emergencies }) => {
  const { t, setActiveTab } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !emergencies || emergencies.length === 0) return null;

  const current = emergencies[0];

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-2.5 shadow-md border-b border-red-700 animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-white/20 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white text-red-700 px-1.5 py-0.2 rounded font-mono">
                {t.emergencyAlert}
              </span>
              <span className="text-xs font-bold truncate">
                {current.title}
              </span>
            </div>
            <p className="text-[11px] text-red-100 truncate mt-0.5 hidden sm:block">
              {current.content}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1 text-[11px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-md transition-colors"
          >
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white p-1"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
