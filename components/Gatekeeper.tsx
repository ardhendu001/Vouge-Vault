
import React, { useState, useRef } from 'react';
import { Upload, ShieldCheck, AlertTriangle, CheckCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { WardrobeItem, GatekeeperVerdict } from '../types';
import { fileToGenerativePart, analyzeGatekeeperItem } from '../services/geminiService';

interface GatekeeperProps {
  wardrobe: WardrobeItem[];
  onAvoidPurchase: (amount: number) => void;
}

const Gatekeeper: React.FC<GatekeeperProps> = ({ wardrobe, onAvoidPurchase }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [verdict, setVerdict] = useState<GatekeeperVerdict | null>(null);
  const [showSaveToast, setShowSaveToast] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToGenerativePart(file);
        setImagePreview(`data:${file.type};base64,${base64}`);
        setStatus('scanning');
        setShowSaveToast(null);
        
        const result = await analyzeGatekeeperItem(base64, wardrobe, file.type);
        setVerdict(result);
        setStatus('complete');
      } catch (error) {
        console.error("Gatekeeper failed", error);
        setStatus('idle');
      }
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setStatus('idle');
    setVerdict(null);
  };

  const handleDiscard = () => {
    const savedAmount = Math.floor(Math.random() * (120 - 45 + 1) + 45); // Random saved amount
    onAvoidPurchase(savedAmount);
    setShowSaveToast(savedAmount);
    
    setTimeout(() => {
        handleReset();
        setShowSaveToast(null);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-5xl mx-auto animate-fade-in pb-10 relative">
      
      {showSaveToast && (
        <div className="absolute top-10 z-50 animate-bounce">
           <div className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(34,197,94,0.6)] flex items-center gap-3 text-2xl border border-green-400">
              <CheckCircle className="w-8 h-8" />
              Saved ${showSaveToast}!
           </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-fuchsia-500/10 mb-4 border border-fuchsia-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
             <ShieldCheck className="w-10 h-10 text-fuchsia-500" />
        </div>
        <h2 className="text-5xl font-bold mb-3 tracking-tight">
          The Gatekeeper
        </h2>
        <p className="text-gray-400 text-xl font-light">
          Buying something new? Run it through the scanner first.
        </p>
      </div>

      {/* Main Scanner Zone */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
        
        {/* Left: Input */}
        <div 
          onClick={() => status === 'idle' && fileInputRef.current?.click()}
          className={`
            relative h-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden
            ${status === 'idle' 
              ? 'border-white/10 hover:border-fuchsia-500/50 bg-white/5 hover:bg-white/10' 
              : 'border-white/10 bg-black'
            }
          `}
        >
          {imagePreview ? (
            <div className="relative w-full h-full">
              <img src={imagePreview} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Potential Purchase" />
              {status === 'complete' && !showSaveToast && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleReset(); }}
                     className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium backdrop-blur-md transition-all"
                   >
                     Scan New Item
                   </button>
                 </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 transition-transform duration-300 group-hover:scale-105">
              <div className="w-24 h-24 rounded-full bg-[#1A1025] border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:border-fuchsia-500/30 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all">
                <Upload className="w-10 h-10 text-gray-400 group-hover:text-fuchsia-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Upload Product Photo</h3>
              <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">Drag & drop or click to scan</p>
            </div>
          )}

          {status === 'scanning' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <div className="w-full absolute top-0 h-1 bg-fuchsia-500 shadow-[0_0_20px_#d946ef] animate-[scan_1.5s_ease-in-out_infinite]" />
              <Loader2 className="w-16 h-16 text-fuchsia-500 animate-spin mb-6" />
              <p className="text-fuchsia-300 font-mono text-sm tracking-widest uppercase animate-pulse">Analyzing Wardrobe...</p>
            </div>
          )}
        </div>

        {/* Right: Verdict */}
        <div className="relative h-full">
          {status === 'idle' && (
            <div className="h-full rounded-3xl border border-white/5 bg-[#0F0518] flex flex-col items-center justify-center p-12 text-center text-gray-600 shadow-inner">
              <p className="text-lg font-medium">Upload an item to generate a compatibility report.</p>
            </div>
          )}

          {status === 'scanning' && (
            <div className="h-full rounded-3xl border border-white/5 bg-[#0F0518] flex flex-col items-center justify-center p-12 text-center gap-6">
               <div className="w-full max-w-xs space-y-4">
                 <div className="flex justify-between text-xs text-gray-500 uppercase font-mono">
                   <span>Matching Fabrics</span>
                   <span>34%</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded overflow-hidden">
                   <div className="h-full bg-fuchsia-500 w-1/3 animate-pulse"></div>
                 </div>
                 
                 <div className="flex justify-between text-xs text-gray-500 uppercase font-mono mt-2">
                   <span>Calculating Impact</span>
                   <span>78%</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded overflow-hidden">
                   <div className="h-full bg-blue-500 w-3/4 animate-pulse"></div>
                 </div>
               </div>
               <p className="text-sm text-gray-500 animate-pulse">AI is determining necessity...</p>
            </div>
          )}

          {status === 'complete' && verdict && (
            <div className={`h-full rounded-3xl border p-8 flex flex-col justify-between animate-fade-in-up bg-[#0F0518] relative overflow-hidden ${
              verdict.decision === 'APPROVED' 
                ? 'border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.05)]' 
                : 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.05)]'
            }`}>
              {/* Background Glow */}
              <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 ${
                 verdict.decision === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
              }`} />

              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  {verdict.decision === 'APPROVED' ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                  ) : (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
                      <X className="w-10 h-10" />
                    </div>
                  )}
                  <div>
                    <h3 className={`text-4xl font-bold tracking-tight ${verdict.decision === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>
                      {verdict.decision}
                    </h3>
                    <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mt-1">Gatekeeper Verdict</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                     <p className="text-xl text-white leading-relaxed font-light">"{verdict.reason}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-gray-500 uppercase mb-2 font-bold tracking-wider">Carbon Impact</p>
                      <p className={`text-2xl font-bold ${
                        verdict.carbonImpact === 'High' ? 'text-red-400' : 'text-green-400'
                      }`}>{verdict.carbonImpact}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-xs text-gray-500 uppercase mb-2 font-bold tracking-wider">Potential Outfits</p>
                      <p className="text-2xl font-bold text-white flex items-center gap-2">
                        {verdict.potentialOutfits} <span className="text-sm font-normal text-gray-500">New Combos</span>
                      </p>
                    </div>
                  </div>
                  
                  {verdict.similarItemId && (
                    <div className="flex items-center gap-4 p-4 border border-red-500/30 rounded-2xl bg-red-500/5">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <div>
                        <p className="text-sm font-bold text-red-300">Duplicate Alert</p>
                        <p className="text-xs text-red-400/70">You own a similar item (ID: #{verdict.similarItemId}).</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 relative z-10">
                {verdict.decision === 'APPROVED' ? (
                   <button onClick={handleReset} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/40 hover:scale-[1.02]">
                     Add to Vault
                   </button>
                ) : (
                   <button onClick={handleDiscard} className="w-full py-4 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold rounded-xl transition-all hover:border-red-500/60">
                     Discard & Save Money
                   </button>
                )}
              </div>
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

export default Gatekeeper;
