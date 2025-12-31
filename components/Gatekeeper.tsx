import React, { useState, useRef } from 'react';
import { Upload, ShieldCheck, AlertTriangle, CheckCircle, X, Loader2, ArrowRight, Sparkles, TrendingUp, Leaf } from 'lucide-react';
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
        <div className="absolute top-10 z-[60] animate-bounce">
           <div className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-[0_0_40px_rgba(34,197,94,0.6)] flex items-center gap-3 text-2xl border border-green-400">
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
        <h2 className="text-5xl font-black mb-3 tracking-tighter uppercase italic">
          The <span className="electric-gradient-text">Gatekeeper</span>
        </h2>
        <p className="text-gray-400 text-xl font-medium tracking-tight">
          Our AI ensures your wardrobe remains essential and sustainable.
        </p>
      </div>

      {/* Main Scanner Zone */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[500px]">
        
        {/* Left: Input */}
        <div 
          onClick={() => status === 'idle' && fileInputRef.current?.click()}
          className={`
            relative min-h-[400px] md:h-full rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group overflow-hidden
            ${status === 'idle' 
              ? 'border-white/10 hover:border-fuchsia-500/50 bg-white/[0.02] hover:bg-white/[0.05]' 
              : 'border-white/10 bg-black shadow-2xl'
            }
          `}
        >
          {imagePreview ? (
            <div className="relative w-full h-full">
              <img src={imagePreview} className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-all duration-700 scale-105 group-hover:scale-110" alt="Potential Purchase" />
              {status === 'complete' && !showSaveToast && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleReset(); }}
                     className="px-8 py-3 rounded-full bg-white text-black text-sm font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                   >
                     Rescan
                   </button>
                 </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 transition-transform duration-500 group-hover:scale-105">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:border-fuchsia-500/30 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all">
                <Upload className="w-10 h-10 text-gray-500 group-hover:text-fuchsia-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight italic">Scan Garment</h3>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Awaiting Visual Input</p>
            </div>
          )}

          {status === 'scanning' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-10">
              <div className="w-full absolute top-0 h-1.5 bg-fuchsia-500 shadow-[0_0_30px_#d946ef] animate-[scan_1.5s_ease-in-out_infinite]" />
              <Loader2 className="w-16 h-16 text-fuchsia-500 animate-spin mb-6 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
              <p className="text-fuchsia-400 font-black text-xs tracking-[0.8em] uppercase animate-pulse">Running Neural Sync...</p>
            </div>
          )}
        </div>

        {/* Right: Verdict */}
        <div className="relative min-h-[400px] md:h-full">
          {status === 'idle' && (
            <div className="h-full rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center p-12 text-center text-gray-600 shadow-inner">
              <div className="p-8 rounded-full bg-white/[0.02] mb-6">
                <ShieldCheck className="w-16 h-16 opacity-10" />
              </div>
              <p className="text-lg font-bold uppercase tracking-widest opacity-40">compatibility report pending</p>
            </div>
          )}

          {status === 'scanning' && (
            <div className="h-full rounded-[2.5rem] border border-white/5 bg-[#0F0518]/50 flex flex-col items-center justify-center p-12 text-center gap-10">
               <div className="w-full max-w-xs space-y-6">
                 <div className="space-y-2">
                   <div className="flex justify-between text-[10px] text-gray-500 uppercase font-black tracking-widest">
                     <span>Style Consistency</span>
                     <span className="text-fuchsia-400">88%</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-fuchsia-500 w-full animate-[progress_1s_ease-in-out_infinite]" />
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="flex justify-between text-[10px] text-gray-500 uppercase font-black tracking-widest">
                     <span>Sustainability Index</span>
                     <span className="text-blue-400">Calculating...</span>
                   </div>
                   <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-3/4 animate-[progress_1.5s_ease-in-out_infinite]" />
                   </div>
                 </div>
               </div>
               <p className="text-xs text-gray-500 font-black uppercase tracking-[0.3em] animate-pulse">Consulting the Archive</p>
            </div>
          )}

          {status === 'complete' && verdict && (
            <div className={`h-full rounded-[2.5rem] border-2 p-10 flex flex-col justify-between animate-fade-in bg-black relative overflow-hidden shadow-2xl ${
              verdict.decision === 'APPROVED' 
                ? 'border-green-500/40' 
                : 'border-red-500/40'
            }`}>
              
              {/* Dynamic Gradient Backgrounds */}
              <div className={`absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br ${
                 verdict.decision === 'APPROVED' ? 'from-green-600/40 via-transparent to-black' : 'from-red-600/40 via-transparent to-black'
              }`} />

              {/* Large Background Icon for Flair */}
              <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                 {verdict.decision === 'APPROVED' ? <CheckCircle className="w-64 h-64 text-green-400" /> : <X className="w-64 h-64 text-red-400" />}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-10">
                  <div className={`p-5 rounded-3xl border-2 shadow-2xl flex items-center justify-center ${
                    verdict.decision === 'APPROVED' 
                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {verdict.decision === 'APPROVED' ? <ShieldCheck className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                  </div>
                  <div>
                    <h3 className={`text-5xl font-black italic uppercase tracking-tighter ${
                      verdict.decision === 'APPROVED' ? 'text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    }`}>
                      {verdict.decision}
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.5em] font-black mt-1">Gatekeeper Directive</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/10 backdrop-blur-md relative overflow-hidden group">
                     <Sparkles className="absolute top-4 right-4 w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
                     <p className="text-2xl text-white leading-tight font-black italic">"{verdict.reason}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 flex flex-col items-center text-center">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                        <Leaf className="w-3 h-3" /> Impact
                      </p>
                      <p className={`text-2xl font-black italic uppercase ${
                        verdict.carbonImpact === 'High' ? 'text-red-400' : 'text-green-400'
                      }`}>{verdict.carbonImpact}</p>
                    </div>
                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 flex flex-col items-center text-center">
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> Utility
                      </p>
                      <p className="text-2xl font-black italic text-white">
                        +{verdict.potentialOutfits} <span className="text-[10px] font-black uppercase not-italic text-gray-500">Looks</span>
                      </p>
                    </div>
                  </div>
                  
                  {verdict.similarItemId && (
                    <div className="flex items-center gap-4 p-5 border border-red-500/30 rounded-3xl bg-red-500/5 animate-pulse">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-red-400">Archive Conflict Detected</p>
                        <p className="text-[10px] text-red-400/60 font-medium uppercase tracking-tighter">Matches Item Signature: #{verdict.similarItemId}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 relative z-10 flex flex-col gap-4">
                {verdict.decision === 'APPROVED' ? (
                   <button 
                     onClick={handleReset} 
                     className="w-full py-5 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-green-900/40 hover:scale-[1.02] flex items-center justify-center gap-3"
                   >
                     Add to Wardrobe <ArrowRight className="w-4 h-4" />
                   </button>
                ) : (
                   <div className="flex flex-col gap-3">
                     <button 
                       onClick={handleDiscard} 
                       className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-red-900/40 hover:scale-[1.02]"
                     >
                       Abort Purchase
                     </button>
                     <button 
                       onClick={handleReset}
                       className="w-full py-3 text-gray-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-colors"
                     >
                       Override Gatekeeper (Not Recommended)
                     </button>
                   </div>
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
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Gatekeeper;