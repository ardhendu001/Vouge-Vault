import React from 'react';
import { Leaf, Droplets, Wind, ArrowRight, Recycle, TrendingUp } from 'lucide-react';
import { WardrobeItem } from '../types';

interface SustainabilityViewProps {
  wardrobe: WardrobeItem[];
  onGoToWardrobe: () => void;
}

const SustainabilityView: React.FC<SustainabilityViewProps> = ({ wardrobe, onGoToWardrobe }) => {
  // Calculate stats
  const totalItems = wardrobe.length;
  const ecoFriendlyItems = wardrobe.filter(i => i.sustainability?.rating === 'A' || i.sustainability?.rating === 'B').length;
  const ecoScore = totalItems > 0 ? Math.round((ecoFriendlyItems / totalItems) * 100) : 0;
  
  // Grade Logic
  let grade = 'C';
  let gradeColor = 'text-yellow-400 border-yellow-500';
  if (ecoScore >= 80) { grade = 'A'; gradeColor = 'text-green-400 border-green-500'; }
  else if (ecoScore >= 60) { grade = 'B'; gradeColor = 'text-lime-400 border-lime-500'; }
  else if (ecoScore < 40) { grade = 'D'; gradeColor = 'text-orange-400 border-orange-500'; }

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-20">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold">Global Impact Report</h2>
           <p className="text-gray-400 text-sm mt-1">Real-time analysis of your digital wardrobe footprint.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-full text-green-400 text-xs font-bold uppercase tracking-wider">
          <Leaf className="w-3 h-3" />
          Live Tracking Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Grade Card */}
        <div className="md:col-span-4 glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-center group">
          <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-white/5 transition-colors duration-500`} />
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-6xl font-bold mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${gradeColor} bg-black/20 backdrop-blur-md`}>
            {grade}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Wardrobe Rating</h3>
          <p className="text-sm text-gray-400 px-4">
            You are in the top <span className="text-white font-bold">{ecoScore}%</span> of sustainable users.
            Switching 2 items to organic materials could boost you to an <span className="text-green-400 font-bold">A</span>.
          </p>
          <div className="mt-6 w-full">
            <button onClick={onGoToWardrobe} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 transition-all text-sm font-bold flex items-center justify-center gap-2">
              Audt Wardrobe <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
             {/* CO2 Metric */}
             <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start">
                   <div className="p-3 bg-gray-700/30 rounded-lg text-gray-300">
                     <Wind className="w-6 h-6" />
                   </div>
                   <span className="text-xs text-gray-500 uppercase font-bold">Carbon Offset</span>
                </div>
                <div>
                   <h4 className="text-3xl font-bold text-white mt-4">128 kg</h4>
                   <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                     <TrendingUp className="w-3 h-3" /> 12% better than average
                   </p>
                </div>
             </div>
             
             {/* Water Metric */}
             <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start">
                   <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                     <Droplets className="w-6 h-6" />
                   </div>
                   <span className="text-xs text-gray-500 uppercase font-bold">Water Saved</span>
                </div>
                <div>
                   <h4 className="text-3xl font-bold text-white mt-4">2.4k L</h4>
                   <p className="text-xs text-blue-300 mt-1">Equivalent to 30 showers</p>
                </div>
             </div>
          </div>

          {/* Material Breakdown */}
          <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col justify-center">
             <h4 className="font-bold text-gray-300 mb-4 flex items-center gap-2">
               <Recycle className="w-4 h-4" /> Material Composition
             </h4>
             <div className="space-y-4">
                {[
                  { label: 'Organic Cotton', val: 45, color: 'bg-green-500' },
                  { label: 'Recycled Polyester', val: 30, color: 'bg-blue-500' },
                  { label: 'Synthetic/Other', val: 25, color: 'bg-fuchsia-500' }
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{stat.label}</span>
                      <span className="text-white font-bold">{stat.val}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color} shadow-[0_0_10px_currentColor]`} style={{ width: `${stat.val}%` }}></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityView;