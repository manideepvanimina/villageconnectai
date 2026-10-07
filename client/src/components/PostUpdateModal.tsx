import React, { useState } from 'react';
import { X, Send, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const PostUpdateModal: React.FC = () => {
  const { 
    isPostModalOpen, 
    setIsPostModalOpen, 
    selectedVillage, 
    t, 
    triggerRefresh, 
    showToast,
    currentUser,
    userProfile,
    sessionToken
  } = useApp();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'notice' | 'event' | 'emergency' | 'general'>('notice');
  const [authorName, setAuthorName] = useState(userProfile?.full_name || '');
  const [isEmergency, setIsEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (userProfile?.full_name && !authorName) {
      setAuthorName(userProfile.full_name);
    }
  }, [userProfile]);

  if (!isPostModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const villageId = selectedVillage?.id || '11111111-1111-1111-1111-111111111111';
      await api.addUpdate({
        village_id: villageId,
        title,
        content,
        category: isEmergency ? 'emergency' : category,
        author_name: authorName || userProfile?.full_name || 'Village Resident',
        is_emergency: isEmergency,
      }, sessionToken || undefined);

      showToast(isEmergency 
        ? '🚨 Emergency notice published immediately!' 
        : '📝 Update submitted! It is currently PENDING and will go LIVE once 5 village residents verify it.'
      );
      triggerRefresh();
      setIsPostModalOpen(false);
      setTitle('');
      setContent('');
    } catch (err: any) {
      alert(`Error posting notice: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-rural-lg border border-amber-200 relative animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
              {t.postNotice}
            </h3>
            <p className="text-xs text-stone-500">
              Publishing to {selectedVillage?.name}
            </p>
          </div>
          <button
            onClick={() => setIsPostModalOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5-User Verification Notice Box */}
        <div className="my-3 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 text-saffron-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Community Trust Rule:</strong> To prevent misinformation, non-emergency notices start as <em>Pending</em> and require verification from <strong>5 local residents</strong> to go live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Agricultural Feeder Power Cut on Friday"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 bg-white"
              >
                <option value="notice">Public Notice</option>
                <option value="event">Village Event</option>
                <option value="lost_found">Lost & Found</option>
                <option value="general">General Update</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Your Name / Title</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Ramesh Kumar (Farmer)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Details & Information</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide clear details including dates, timings, locations, or actions needed..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
            />
          </div>

          {/* Emergency Alert Option */}
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div>
                <div className="text-xs font-bold text-red-900">Mark as Emergency Alert</div>
                <div className="text-[10px] text-red-700">For flood, road blockage, fire or major outage</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-stone-200 font-bold text-xs text-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Publish Update'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
