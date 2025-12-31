import React, { useState } from 'react';
import { Sparkles, Zap, Leaf, Download, Share2 } from 'lucide-react';
import { generateSustainablePrototype } from '../services/geminiService';

const EcoLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    const result = await generateSustainablePrototype(prompt);
    setGeneratedImage(result);
    setIsGenerating(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            Eco-Innovation Lab
            <span className="px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Nano Banana Engine
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl">
            Design the future of sustainable fashion. Describe your concept, and our Nano Banana model will generate a high-fidelity prototype using recycled materials.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Left Panel: Controls */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col">
            <label className="text-sm font-bold text-gray-300 mb-3 block">Concept Description</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A futuristic trench coat made from transparent recycled ocean plastic with bioluminescent accents..."
              className="w-full h-48 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors resize-none mb-4"
            />
            
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
              {['Recycled Ocean Plastic', 'Organic Hemp', 'Mushroom Leather', 'Solar Fabric'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setPrompt(prev => prev ? `${prev}, ${tag}` : tag)}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 whitespace-nowrap transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mt-auto ${
                isGenerating 
                  ? 'bg-white/5 cursor-wait text-gray-500' 
                  : 'electric-gradient-bg text-white hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-[1.02]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Prototyping...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Prototype
                </>
              )}
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
             <h3 className="font-bold text-white mb-2 flex items-center gap-2">
               <Leaf className="w-4 h-4 text-green-400" />
               Sustainability Impact
             </h3>
             <p className="text-sm text-gray-400">
               Digital prototyping reduces physical waste by 100%. Create freely without material cost.
             </p>
          </div>
        </div>

        {/* Right Panel: Display */}
        <div className="flex-1 glass-panel rounded-3xl p-2 md:p-4 bg-gradient-to-br from-gray-900/50 to-black/50 border border-white/10 flex flex-col">
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center group">
             {generatedImage ? (
               <img 
                 src={generatedImage} 
                 alt="Generated Prototype" 
                 className="w-full h-full object-contain animate-fade-in"
               />
             ) : (
               <div className="text-center text-gray-600">
                 <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
                   <Sparkles className="w-8 h-8 opacity-50" />
                 </div>
                 <p className="text-lg font-medium">Ready to Visualize</p>
                 <p className="text-sm opacity-50">Enter a prompt to start the engine</p>
               </div>
             )}

             {/* Scan Effect */}
             {isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/10 to-transparent h-full w-full animate-scan" style={{ backgroundSize: '100% 200%' }} />
             )}
          </div>

          {/* Action Bar */}
          {generatedImage && (
            <div className="h-16 mt-4 flex items-center justify-between px-2">
               <div className="text-sm text-gray-400">
                 Generated with <span className="text-fuchsia-400 font-bold">Gemini 2.5 Flash</span>
               </div>
               <div className="flex gap-3">
                 <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                   <Download className="w-5 h-5" />
                 </button>
                 <button className="p-3 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/30 transition-colors">
                   <Share2 className="w-5 h-5" />
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcoLab;