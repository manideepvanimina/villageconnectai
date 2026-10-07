import React, { useState } from 'react';
import { X, Wrench, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const AddServiceModal: React.FC = () => {
  const { isServiceModalOpen, setIsServiceModalOpen, selectedVillage, t, triggerRefresh, showToast } = useApp();

  const [businessName, setBusinessName] = useState('');
  const [providerName, setProviderName] = useState('');
  const [category, setCategory] = useState('electrician');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [rateAmount, setRateAmount] = useState('');
  const [pricingUnit, setPricingUnit] = useState('per visit');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isServiceModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactNumber.trim()) return;

    setSubmitting(true);
    try {
      const villageId = selectedVillage?.id || '11111111-1111-1111-1111-111111111111';
      await api.addService({
        village_id: villageId,
        business_name: businessName,
        provider_name: providerName || businessName,
        category,
        contact_number: contactNumber,
        whatsapp_number: whatsappNumber || contactNumber,
        rate_amount: Number(rateAmount) || 0,
        pricing_unit: pricingUnit,
        details: details || 'Reliable local village service provider.',
        availability_status: 'available',
      });

      showToast('🔧 Service registered in Village Directory successfully!');
      triggerRefresh();
      setIsServiceModalOpen(false);
    } catch (err: any) {
      alert(`Error registering service: ${err.message}`);
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
              {t.registerService}
            </h3>
            <p className="text-xs text-stone-500">
              Join the official service directory of {selectedVillage?.name}
            </p>
          </div>
          <button
            onClick={() => setIsServiceModalOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Business / Service Name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Srinivas Tractor Rentals or Ravi Electrical Works"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 bg-white"
              >
                <option value="tractor">🚜 Tractor & Farm Machinery</option>
                <option value="farm_labor">🌾 Farm Labor Team</option>
                <option value="electrician">⚡ Electrician & Borewell Motor</option>
                <option value="plumber">🚰 Plumber & Drip Irrigation</option>
                <option value="mechanic">🔧 Mechanic & Garage</option>
                <option value="auto">🛺 Auto & Goods Transport</option>
                <option value="driver">🚗 Driver / Taxi</option>
                <option value="carpenter">🪚 Carpenter</option>
                <option value="welder">⚙️ Welder</option>
                <option value="tailor">🧵 Tailor</option>
                <option value="other">Other Service</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Provider Full Name</label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g. Srinivas Rao"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+919848022334"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+919848022334"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Estimated Rate (₹)</label>
              <input
                type="number"
                value={rateAmount}
                onChange={(e) => setRateAmount(e.target.value)}
                placeholder="e.g. 900"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Pricing Unit</label>
              <select
                value={pricingUnit}
                onChange={(e) => setPricingUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 bg-white"
              >
                <option value="per hour">per hour</option>
                <option value="per visit">per visit</option>
                <option value="per acre">per acre</option>
                <option value="per day">per day</option>
                <option value="fixed">fixed / negotiable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Service Details & Equipment</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe machinery models, experience, equipment available, emergency visit availability..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-stone-200 font-bold text-xs text-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{submitting ? 'Registering...' : 'Register Provider'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
