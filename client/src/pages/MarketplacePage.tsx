import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Product } from '../types';
import { 
  ShoppingBag, Search, Plus, Phone, MessageSquare, 
  Tag, CheckCircle2, Sparkles, Filter
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const { selectedVillage, t, setIsSellModalOpen, refreshTrigger } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'produce', label: '🍅 Farm Produce' },
    { id: 'agriculture', label: '🌾 Agriculture' },
    { id: 'farm_equipment', label: '⚙️ Farm Equipment' },
    { id: 'local_products', label: '🍯 Local & Dairy' },
    { id: 'tools', label: '🛠️ Tools' },
  ];

  useEffect(() => {
    if (!selectedVillage) return;
    setLoading(true);

    api.getProducts({
      village_id: selectedVillage.id,
      category: selectedCategory,
      search: searchTerm,
    })
      .then(setProducts)
      .catch(err => console.error('Marketplace fetch error:', err))
      .finally(() => setLoading(false));
  }, [selectedVillage, selectedCategory, searchTerm, refreshTrigger]);

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>🛒</span>
            <span>{t.navMarketplace} — {selectedVillage?.name}</span>
          </h2>
          <p className="text-xs text-stone-600">
            Buy and sell fresh farm produce, dairy, agricultural supplies, and rural goods directly with 0% middleman fees
          </p>
        </div>

        <button
          onClick={() => setIsSellModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-krishi-700 hover:bg-krishi-800 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.sellProduce}</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-stone-200 p-1.5">
        <Search className="w-4 h-4 text-stone-400 ml-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search produce (e.g. tomatoes, paddy, sprayer, desi cow ghee)..."
          className="w-full px-3 py-2 text-stone-900 placeholder-stone-400 text-xs sm:text-sm focus:outline-none"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-stone-400 mr-2">
            Clear
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.id
                ? 'bg-rose-700 text-white shadow-rose-200'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">
          Loading marketplace items...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h4 className="font-bold text-stone-800 text-sm">No items in marketplace yet</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {t.emptyMarket}
          </p>
          <button
            onClick={() => setIsSellModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-krishi-700 text-white font-bold text-xs"
          >
            {t.sellProduce}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-stone-900 text-base">
                        {product.title}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 font-medium">
                      Seller: {product.seller_name} • {product.quantity}
                    </p>
                  </div>

                  {product.is_organic && (
                    <span className="text-[10px] font-bold bg-krishi-100 text-krishi-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-krishi-600" />
                      Organic
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4">
                  {product.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-stone-500">Price:</span>
                  <div className="text-base font-extrabold text-rose-700">
                    ₹{product.price} <span className="text-xs font-normal text-stone-500">/{product.price_unit}</span>
                  </div>
                </div>

                <a
                  href={`tel:${product.contact_phone}`}
                  className="px-4 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Seller</span>
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
