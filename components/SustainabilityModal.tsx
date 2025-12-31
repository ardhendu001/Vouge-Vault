import React, { useState, useEffect } from 'react';
import { X, Leaf, Droplets, Recycle, AlertTriangle, ArrowRight, Factory, Truck, User, Trash2 } from 'lucide-react';
import { WardrobeItem } from '../types';

interface SustainabilityModalProps {
  item: WardrobeItem | null;
  onClose: () => void;
}

const SustainabilityModal: React.FC<SustainabilityModalProps> = ({ item, onClose }) => {
  const [showLifecycle, setShowLifecycle] = useState(false);

  // Reset view when opening a new item
  useEffect(() => {
    if (item) setShowLifecycle(false);
  }, [item]);

  if (!item || !item.sustainability) return null;

  const { rating, carbonFootprint, waterUsage, materialAnalysis } = item.sustainability;

  const getRatingColor = (r: string) => {
    switch (r) {
      case 'A': return 'text-green-400 border-green-500';
      case 'B': return 'text-lime-400 border-lime-500';
      case 'C': return 'text-yellow-400 border-yellow-500';
      case 'D': return 'text-orange-400 border-orange-500';
      default: return 'text-red-400 border-red-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-0 overflow-hidden flex flex-col md:flex-row shadow-2xl h-[600px] md:h-auto">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Image Side */}
        <div className="w-full md:w-2/5 relative h-48 md:h-auto flex-shrink-0">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0014] to-transparent opacity-80 md:hidden" />
          <div className="absolute bottom-4 left-4 md:hidden">
             <h3 className="text-xl font-bold">{item.title}</h3>
          </div>
        </div>

        {/* Data Side */}
        <div className="w-full md:w-3/5 p-8 bg-[#0B0014]/80 backdrop-blur-xl flex flex-col h-full overflow-y-auto">
           <div className="hidden md:block mb-6 flex-shrink-0">
              <h3 className="text-2xl font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.category} • {item.tags.join(' ')}</p>
           </div>

           {!showLifecycle ? (
             <div className="animate-fade-in flex-1 flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <div className="text-gray-300">
                    <p className="text-sm uppercase tracking-wider mb-1">Impact Score</p>
                    <div className="flex items-center gap-2">
                       <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl font-bold ${getRatingColor(rating)}`}>
                         {rating}
                       </div>
                       <span className="text-sm text-gray-400">Grade</span>
                    </div>
                  </div>
                  <Leaf className={`w-12 h-12 opacity-20 ${getRatingColor(rating).split(' ')[0]}`} />
               </div>

               <div className="space-y-6 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200">Water Usage</h4>
                      <p className="text-sm text-gray-400">{waterUsage} used in production</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-500/10 rounded-lg text-gray-400 mt-1">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200">Carbon Footprint</h4>
                      <p className="text-sm text-gray-400">{carbonFootprint} estimated emission</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 mt-1">
                      <Recycle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200">Material Analysis</h4>
                      <p className="text-sm text-gray-400 italic">"{materialAnalysis}"</p>
                    </div>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-white/10 flex-shrink-0">
                  <button 
                    onClick={() => setShowLifecycle(true)}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold text-gray-300 transition-colors flex items-center justify-center gap-2 group"
                  >
                    View Lifecycle Details
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
             </div>
           ) : (
             <div className="animate-fade-in flex-1 flex flex-col">
                <button 
                  onClick={() => setShowLifecycle(false)}
                  className="mb-4 text-xs text-fuchsia-400 font-bold hover:underline flex items-center gap-1"
                >
                  ← Back to Overview
                </button>
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-green-400" />
                  Product Journey
                </h4>
                
                <div className="space-y-0 relative pl-4 border-l border-white/10 ml-2">
                  {[
                    { icon: Factory, title: 'Production', desc: 'Manufactured in Vietnam using 60% renewable energy.', color: 'text-blue-400' },
                    { icon: Truck, title: 'Transport', desc: 'Shipped via sea freight (lower carbon than air).', color: 'text-orange-400' },
                    { icon: User, title: 'Usage', desc: 'Estimated 50+ wears. Recommended cold wash.', color: 'text-purple-400' },
                    { icon: Trash2, title: 'End of Life', desc: '80% Recyclable fibers. Drop off at local bin.', color: 'text-green-400' }
                  ].map((step, idx) => (
                    <div key={idx} className="relative pb-8 pl-6 last:pb-0">
                      <div className={`absolute -left-[21px] top-0 p-1 rounded-full bg-[#0B0014] border border-white/20 ${step.color}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <h5 className={`font-bold text-sm ${step.color}`}>{step.title}</h5>
                      <p className="text-xs text-gray-400 mt-1">{step.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400 text-center">
                      <span className="text-fuchsia-400 font-bold">VogueVault Tip:</span> Extend this item's life by air drying to reduce micro-shedding.
                    </p>
                  </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SustainabilityModal;