import React, { useState } from 'react';
import { X, Tag, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const SellProductModal: React.FC = () => {
  const { 
    isSellModalOpen, 
    setIsSellModalOpen, 
    selectedVillage, 
    t, 
    triggerRefresh, 
    showToast,
    currentUser,
    userProfile,
    sessionToken 
  } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('per kg');
  const [category, setCategory] = useState('produce');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState(userProfile?.phone_number || '');
  const [sellerName, setSellerName] = useState(userProfile?.full_name || '');
  const [isOrganic, setIsOrganic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (userProfile) {
      if (!sellerName && userProfile.full_name) setSellerName(userProfile.full_name);
      if (!contactPhone && userProfile.phone_number) setContactPhone(userProfile.phone_number);
    }
  }, [userProfile]);

  if (!isSellModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !contactPhone) return;

    setSubmitting(true);
    try {
      const villageId = selectedVillage?.id || '11111111-1111-1111-1111-111111111111';
      await api.addProduct({
        village_id: villageId,
        title,
        price: Number(price),
        price_unit: priceUnit,
        category,
        quantity: quantity || 'Available for sale',
        description: description || 'Fresh rural produce directly from local farmer.',
        contact_phone: contactPhone,
        seller_name: sellerName || userProfile?.full_name || 'Local Farmer',
        is_organic: isOrganic,
      }, sessionToken || undefined);

      showToast('🛒 Produce listed on Village Marketplace successfully!');
      triggerRefresh();
      setIsSellModalOpen(false);
    } catch (err: any) {
      alert(`Error listing product: ${err.message}`);
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
              {t.sellProduce}
            </h3>
            <p className="text-xs text-stone-500">
              Sell directly to local buyers in {selectedVillage?.name} with 0% commission
            </p>
          </div>
          <button
            onClick={() => setIsSellModalOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Produce / Item Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fresh Desi Tomatoes (Country Variety)"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 28"
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Pricing Unit</label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 bg-white"
              >
                <option value="per kg">per kg</option>
                <option value="per quintal">per quintal</option>
                <option value="per crate">per crate</option>
                <option value="per bag">per bag</option>
                <option value="total">total / fixed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500 bg-white"
              >
                <option value="produce">Farm Produce / Crops</option>
                <option value="agriculture">Agricultural Inputs</option>
                <option value="farm_equipment">Equipment / Sprayers</option>
                <option value="local_products">Local Handmade Goods</option>
                <option value="household">Household Items</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Available Quantity</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 400 kg (16 crates)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Seller Name</label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="e.g., Lakshmi Bai"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+919876543213"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Description / Quality Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, variety, harvest date, location for pickup..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-saffron-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-krishi-50 border border-krishi-200 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-krishi-900">Certified Organic Produce?</span>
              <p className="text-[10px] text-krishi-700">Display verified organic badge to buyers</p>
            </div>
            <input
              type="checkbox"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              className="w-4 h-4 text-krishi-600 rounded"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSellModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-stone-200 font-bold text-xs text-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 rounded-xl bg-krishi-600 hover:bg-krishi-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{submitting ? 'Listing...' : 'List in Marketplace'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
