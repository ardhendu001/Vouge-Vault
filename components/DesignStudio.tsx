
import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sparkles, Wand2, Image as ImageIcon, X, Loader2, Download, Share2, AlertCircle, Info, Archive, Check } from 'lucide-react';
import { fileToGenerativePart, generateProDesign } from '../services/geminiService';
import { WardrobeItem } from '../types';

interface DesignStudioProps {
  onSaveToVault?: (item: WardrobeItem) => void;
}

const DesignStudio: React.FC<DesignStudioProps> = ({ onSaveToVault }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4" | "4:3" | "16:9" | "9:16">("1:1");
  const [reference, setReference] = useState<{ data: string, mimeType: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [result, setResult] = useState<{ text: string, image: string | null } | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    setNeedsKey(!hasKey);
  };

  const handleOpenKeyDialog = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setNeedsKey(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToGenerativePart(file);
      setReference({ data: base64, mimeType: file.type });
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    // Check key again just in case
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setNeedsKey(true);
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);
    setResult(null);
    try {
      const design = await generateProDesign(prompt, aspectRatio, reference || undefined);
      setResult(design);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setNeedsKey(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (result?.image && onSaveToVault) {
      const newItem: WardrobeItem = {
        id: `ai-${Date.now()}`,
        title: prompt ? prompt.split(' ').slice(0, 3).join(' ') + " Concept" : "AI Masterpiece",
        category: "Tops",
        imageUrl: result.image,
        tags: ["#AI-Design", "#HighFashion", "#Prototyping"],
        color: "Visionary",
        fabric: "Neural-Mesh",
        wearCount: 0,
        cost: 0,
        dateAdded: new Date().toISOString(),
        brand: "Design Lab Pro"
      };
      onSaveToVault(newItem);
      setIsSaved(true);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-3 text-white uppercase tracking-tighter">
            AI Design Lab
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Nano Banana Pro
            </span>
          </h2>
          <p className="text-gray-400 mt-3 font-medium text-lg">Generate high-fidelity fashion masterpieces.</p>
        </div>
      </div>

      {needsKey && (
        <div className="glass-panel p-6 rounded-3xl border-blue-500/30 bg-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-down">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                <AlertCircle className="w-8 h-8" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white">API Key Required</h3>
                <p className="text-sm text-gray-300 mt-1">To use Gemini 3 Pro, select your paid API key.</p>
             </div>
          </div>
          <button 
            onClick={handleOpenKeyDialog}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/40"
          >
            Select API Key
          </button>
        </div>
      )}

      {/* Main Container - unified background */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Designer Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-6 bg-[#0B0014] border border-white/10 shadow-2xl">
              {/* Reference Asset Slot - Scaled down to h-24 as per universal standards */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-400 mb-3 block">Reference Asset (Optional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                    reference ? 'border-blue-500/50 p-0' : 'border-white/10 hover:border-blue-500/30 bg-black/40 shadow-inner'
                  }`}
                >
                  {reference ? (
                    <div className="relative w-full h-full group">
                      <img src={`data:${reference.mimeType};base64,${reference.data}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Replace</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setReference(null); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-gray-600 mb-1.5" />
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Upload Reference</p>
                    </>
                  )}
                </div>
              </div>

              {/* Prompt Area */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-400 mb-3 block">Design Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your haute couture vision..."
                  className="w-full h-32 bg-black/60 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all resize-none font-medium text-sm shadow-inner"
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-400 mb-3 block">Canvas Ratio</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(["1:1", "3:4", "4:3", "16:9", "9:16"] as const).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 rounded-lg text-[9px] font-black transition-all border ${
                        aspectRatio === ratio 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                          : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 mt-2 ${
                  !prompt.trim() || isGenerating
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 hover:scale-[1.02]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Synthesize
                  </>
                )}
              </button>
           </div>
        </div>

        {/* Display Pane */}
        <div className="lg:col-span-8 glass-panel rounded-[2rem] bg-[#0B0014] border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner">
           {result ? (
             <div className="w-full h-full flex flex-col p-8 animate-fade-in overflow-y-auto custom-scrollbar">
                <div className="flex-1 min-h-0 flex items-center justify-center mb-8">
                  {result.image && (
                    <img src={result.image} className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-white/10" alt="Generated Fashion" />
                  )}
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10 pt-8">
                   <div className="flex-1 text-white italic text-sm text-center md:text-left font-medium opacity-80 leading-relaxed">
                     {result.text}
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={handleSave}
                        disabled={isSaved}
                        className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                          isSaved 
                          ? 'bg-green-500/10 border-green-500 text-green-400' 
                          : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-4 h-4" /> Digitized
                          </>
                        ) : (
                          <>
                            <Archive className="w-4 h-4" /> Save to Vault
                          </>
                        )}
                      </button>
                      <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/10">
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="p-4 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-2xl transition-all border border-blue-500/30">
                        <Share2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="text-center space-y-6 max-w-sm px-8">
               <div className={`p-12 rounded-full border-2 border-dashed border-white/5 mx-auto w-fit bg-white/[0.02] ${isGenerating ? 'animate-pulse' : ''}`}>
                 <Palette className="w-16 h-16 text-blue-500 opacity-20" />
               </div>
               <div className="space-y-2">
                 <p className="text-3xl font-black text-white uppercase tracking-[0.3em] opacity-90">Design Lab</p>
                 <p className="text-xs max-w-xs mx-auto text-blue-400/60 font-black uppercase tracking-[0.2em]">Awaiting Input Sequence</p>
               </div>
             </div>
           )}

           {isGenerating && (
             <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-10 flex flex-col items-center justify-center gap-6">
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-[progress_2s_ease-in-out_infinite]" />
                </div>
                <p className="text-blue-400 text-xs font-black uppercase tracking-[0.5em] animate-pulse tracking-widest">Synthesizing Neural Model...</p>
             </div>
           )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default DesignStudio;
