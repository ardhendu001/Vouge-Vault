
import React, { useState } from 'react';
import { Filter, Search, Plus, Tag, X, Save, Layers, ArrowUpDown, ChevronDown } from 'lucide-react';
import { WardrobeItem, Category } from '../types';

interface WardrobeProps {
  items: WardrobeItem[];
  onSelectItem: (item: WardrobeItem) => void;
  onOpenUpload: () => void;
  onAddToOutfit: (item: WardrobeItem) => void;
  onUpdateItem: (item: WardrobeItem) => void;
}

type SortOption = 'newest' | 'wear-desc' | 'wear-asc';

const Wardrobe: React.FC<WardrobeProps> = ({ items, onSelectItem, onOpenUpload, onAddToOutfit, onUpdateItem }) => {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('wear-desc');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [brandModalItem, setBrandModalItem] = useState<WardrobeItem | null>(null);
  const [brandInput, setBrandInput] = useState('');

  const categories: (Category | 'All')[] = ['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories', 'Outerwear'];

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'All' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortOption) {
      case 'wear-desc':
        return b.wearCount - a.wearCount;
      case 'wear-asc':
        return a.wearCount - b.wearCount;
      case 'newest':
      default:
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
  });

  const openBrandModal = (item: WardrobeItem) => {
    setBrandModalItem(item);
    setBrandInput(item.brand || '');
  };

  const saveBrand = () => {
    if (brandModalItem) {
      onUpdateItem({ ...brandModalItem, brand: brandInput });
      setBrandModalItem(null);
      setBrandInput('');
    }
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'wear-desc': return 'Most Worn';
      case 'wear-asc': return 'Least Worn';
      case 'newest': return 'Newest';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">My Vault</h2>
        <button 
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-6 py-2 rounded-full electric-gradient-bg text-white font-medium hover:brightness-110 shadow-lg shadow-fuchsia-900/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> <span>Digitize Item</span>
          </button>
      </div>

      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-30 backdrop-blur-xl bg-[#0B0014]/80 border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1 flex-1">
           <Filter className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
           {categories.map(cat => (
             <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border ${
                filter === cat 
                  ? 'electric-gradient-bg border-transparent text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/30'
              }`}
             >
               {cat}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar Integration */}
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-2 w-full md:w-64 focus-within:border-fuchsia-500/50 transition-all shadow-inner">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search vault..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-600 w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-0.5 hover:bg-white/10 rounded-full">
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 relative flex-shrink-0">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors min-w-[140px] justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-fuchsia-400" />
                <span className="text-white hidden sm:inline">{getSortLabel(sortOption)}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-full min-w-[160px] bg-[#0F0518] glass-panel border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-down">
                  {[
                    { id: 'wear-desc', label: 'Most Worn' },
                    { id: 'wear-asc', label: 'Least Worn' },
                    { id: 'newest', label: 'Newest Added' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setSortOption(opt.id as SortOption); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition-colors ${
                        sortOption === opt.id ? 'text-fuchsia-400 font-bold bg-white/5' : 'text-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 pb-20">
        {sortedItems.map(item => (
          <div 
            key={item.id} 
            onClick={() => onSelectItem(item)}
            className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-fuchsia-500/50 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          >
            <img src={item.imageUrl} alt={item.title} className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-white mb-1 truncate">{item.title}</h3>
              <p className="text-xs text-gray-400 flex flex-wrap gap-2 items-center">
                <span className={`${sortOption.includes('wear') ? 'text-fuchsia-300 font-bold' : ''}`}>{item.wearCount} Wears</span>
                <span>•</span>
                <span>{item.fabric}</span>
                {item.brand && (
                  <>
                    <span>•</span>
                    <span className="text-fuchsia-300 font-medium">{item.brand}</span>
                  </>
                )}
              </p>
              
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToOutfit(item); }}
                  className="w-full py-2 text-xs font-bold uppercase bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Layers className="w-3 h-3" /> Create Outfit
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); openBrandModal(item); }}
                  className="w-full py-2 text-xs font-bold uppercase bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded transition-colors flex items-center justify-center gap-1 backdrop-blur-md"
                >
                  <Tag className="w-3 h-3" /> {item.brand ? 'Edit Brand' : 'Add Brand'}
                </button>
              </div>
            </div>
            
            {item.sustainability && (
               <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border backdrop-blur-md ${
                 item.sustainability.rating === 'A' ? 'bg-green-500/20 border-green-500 text-green-400' :
                 item.sustainability.rating === 'F' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-500/20 border-gray-500 text-gray-300'
               }`}>
                 {item.sustainability.rating}
               </div>
            )}
          </div>
        ))}
      </div>

      {/* Brand Input Modal */}
      {brandModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setBrandModalItem(null)} />
          <div className="relative w-full max-w-sm glass-panel rounded-2xl p-6 border border-white/20 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Brand</h3>
              <button onClick={() => setBrandModalItem(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">Brand Name</label>
              <input 
                type="text" 
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                placeholder="E.g. Prada, Nike, Zara..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-fuchsia-500 transition-colors"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveBrand()}
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setBrandModalItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveBrand}
                className="flex-1 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wardrobe;
