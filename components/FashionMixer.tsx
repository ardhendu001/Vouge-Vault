import React, { useState, useRef } from 'react';
import { Upload, X, Dna, Sparkles, Wand2, Share2, Download, CheckCircle, Plus, Archive, Check } from 'lucide-react';
import { fileToGenerativePart, mixFashionStyles } from '../services/geminiService';
import { WardrobeItem } from '../types';

interface FashionMixerProps {
  onSaveToVault?: (item: WardrobeItem) => void;
}

const FashionMixer: React.FC<FashionMixerProps> = ({ onSaveToVault }) => {
  const [images, setImages] = useState<{ id: string, data: string, mimeType: string }[]>([]);
  const [isMixing, setIsMixing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [result, setResult] = useState<{ text: string, image: string | null } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= 3) break;
        const base64 = await fileToGenerativePart(files[i]);
        newImages.push({ id: Math.random().toString(), data: base64, mimeType: files[i].type });
      }
      setImages(newImages);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setResult(null);
  };

  const handleMix = async () => {
    if (images.length < 2) return;
    setIsMixing(true);
    setIsSaved(false);
    setResult(null);
    const blend = await mixFashionStyles(images);
    setResult(blend);
    setIsMixing(false);
  };

  const handleSave = () => {
    if (result?.image && onSaveToVault) {
      const newItem: WardrobeItem = {
        id: `mix-${Date.now()}`,
        title: "Mixed Synthesis Hybrid",
        category: "Outerwear",
        imageUrl: result.image,
        tags: ["#AI-Mix", "#Futuristic", "#Synthesis"],
        color: "Multi",
        fabric: "Cyber-Silk Blend",
        wearCount: 0,
        cost: 0,
        dateAdded: new Date().toISOString(),
        brand: "VogueVault AI"
      };
      onSaveToVault(newItem);
      setIsSaved(true);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-fade-in pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-3 text-white">
            Fashion Mixer
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-fuchsia-500/20 text-fuchsia-400 px-3 py-1.5 rounded-full border border-fuchsia-500/30">
              DNA Sequencing
            </span>
          </h2>
          <p className="text-gray-400 mt-3 font-medium text-lg">Upload garments to synthesize a high-fashion hybrid.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Input Controls */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-5 border-white/5 bg-black/40">
             <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
               <Dna className="w-4 h-4 text-fuchsia-400" /> Source Assets ({images.length}/3)
             </h3>
             
             <div className="grid grid-cols-3 gap-3">
                {images.map(img => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group shadow-2xl">
                    <img src={`data:${img.mimeType};base64,${img.data}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {images.length < 3 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-fuchsia-500/40 bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center transition-all group"
                  >
                    <Plus className="w-6 h-6 text-gray-600 group-hover:text-fuchsia-400 mb-1 transition-colors" />
                    <span className="text-[8px] text-gray-500 group-hover:text-gray-300 font-black uppercase tracking-[0.1em]">Upload</span>
                  </button>
                )}
             </div>

             <button
               onClick={handleMix}
               disabled={images.length < 2 || isMixing}
               className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 mt-4 ${
                 images.length < 2 || isMixing 
                   ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' 
                   : 'electric-gradient-bg text-white hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:scale-[1.02] shadow-xl'
               }`}
             >
               {isMixing ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Processing...
                 </>
               ) : (
                 <>
                   <Wand2 className="w-5 h-5" />
                   Mix Aesthetics
                 </>
               )}
             </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-blue-500/20 bg-[#0B0014]/40">
             <div className="flex items-start gap-4">
               <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/20">
                 <Sparkles className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="font-black text-blue-400 text-xs uppercase tracking-widest mb-1">Design Tip</h4>
                 <p className="text-xs text-gray-300 leading-relaxed font-medium">Try mixing luxury materials—like a tech-mesh DNA with an organic silk drape.</p>
               </div>
             </div>
          </div>
        </div>

        {/* Display Pane */}
        <div className="lg:col-span-2 glass-panel rounded-[2rem] relative overflow-hidden flex flex-col bg-[#0B0014] border-white/10 shadow-inner">
          <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
             {result ? (
               <div className="w-full h-full flex flex-col md:flex-row gap-8 animate-fade-in p-2 overflow-y-auto custom-scrollbar">
                  {result.image && (
                    <div className="w-full md:w-1/2 aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] flex-shrink-0 border border-white/10">
                      <img src={result.image} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-center bg-black/40 p-8 rounded-[2rem] backdrop-blur-3xl border border-white/10">
                    <div className="inline-flex items-center gap-2 text-fuchsia-400 mb-6">
                       <CheckCircle className="w-6 h-6" />
                       <span className="text-xs font-black uppercase tracking-[0.3em]">Analysis Complete</span>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-line text-white leading-relaxed font-medium text-base md:text-lg opacity-90 italic">
                        {result.text}
                      </div>
                    </div>
                    <div className="mt-10 grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleSave}
                        disabled={isSaved}
                        className={`py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest border ${
                          isSaved 
                          ? 'bg-green-500/10 border-green-500 text-green-400 cursor-default' 
                          : 'electric-gradient-bg text-white border-transparent hover:brightness-110 shadow-lg shadow-fuchsia-900/20'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-4 h-4" /> Added to Vault
                          </>
                        ) : (
                          <>
                            <Archive className="w-4 h-4" /> Save to Vault
                          </>
                        )}
                      </button>
                      <button className="py-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-[10px] font-black border border-white/10 text-white uppercase tracking-widest">
                        <Download className="w-3 h-3" /> Export
                      </button>
                      <button className="col-span-2 py-4 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 hover:bg-fuchsia-600/30 transition-colors flex items-center justify-center gap-2 text-xs font-black border border-fuchsia-500/30 uppercase tracking-widest">
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                    </div>
                  </div>
               </div>
             ) : (
               <div className="text-center space-y-6">
                  <div className={`p-10 rounded-full border-2 border-dashed border-white/10 mx-auto w-fit bg-white/[0.02] ${isMixing ? 'animate-pulse border-fuchsia-500/30' : ''}`}>
                    <Dna className="w-20 h-20 opacity-30 text-fuchsia-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-white uppercase tracking-[0.3em] opacity-90">Mix Aesthetics</p>
                    <p className="text-xs max-w-xs mx-auto text-fuchsia-400/60 font-black uppercase tracking-[0.2em]">Awaiting Style DNA Sequence</p>
                  </div>
               </div>
             )}

             {isMixing && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-10 overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500 shadow-[0_0_30px_#d946ef] animate-[scan_2s_linear_infinite]" />
                   <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin shadow-[0_0_30px_rgba(217,70,239,0.2)]" />
                      <p className="font-black text-fuchsia-400 text-sm tracking-[0.6em] uppercase animate-pulse">Synthesizing...</p>
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        multiple
        onChange={handleFileChange} 
      />
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FashionMixer;