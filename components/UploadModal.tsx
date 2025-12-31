
import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { WardrobeItem } from '../types';
import { analyzeClothingItem, fileToGenerativePart } from '../services/geminiService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: WardrobeItem) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onAddItem }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success'>('idle');
  const [analysisText, setAnalysisText] = useState('AI Scanner Ready...');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToGenerativePart(file);
        setImagePreview(`data:${file.type};base64,${base64}`);
        
        setStatus('analyzing');
        setAnalysisText('Detecting Fabric Composition...');
        
        // Mocking progress steps for UX
        setTimeout(() => setAnalysisText('Identifying Brand & Style...'), 1000);
        setTimeout(() => setAnalysisText('Calculating Eco-Impact...'), 2000);

        // Actual API Call
        const analysis = await analyzeClothingItem(base64, file.type);
        
        const newItem: WardrobeItem = {
          id: Date.now().toString(),
          title: analysis.title || "New Item",
          category: analysis.category || "Tops",
          imageUrl: `data:${file.type};base64,${base64}`,
          tags: analysis.tags || ["#New"],
          sustainability: analysis.sustainability,
          dateAdded: new Date().toISOString(),
          color: analysis.color || "Unknown",
          fabric: analysis.fabric || "Unknown",
          wearCount: 0,
          cost: 0
        };

        // Artificial delay to finish the "UX animations" if API was too fast
        setTimeout(() => {
           onAddItem(newItem);
           setStatus('success');
           setAnalysisText('Item Digitized Successfully!');
           setTimeout(() => {
             onClose();
             setStatus('idle');
             setImagePreview(null);
           }, 1500);
        }, 2500);

      } catch (error) {
        console.error(error);
        setStatus('idle');
        setAnalysisText('Analysis Failed. Try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-8 overflow-hidden border border-white/20 shadow-2xl shadow-fuchsia-900/20">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Digitize Wardrobe
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div 
          onClick={() => status === 'idle' && fileInputRef.current?.click()}
          className={`
            relative h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500
            ${status === 'analyzing' ? 'border-fuchsia-500 bg-fuchsia-500/5' : 'border-white/20 hover:border-fuchsia-400 hover:bg-white/5'}
          `}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg opacity-50" />
          ) : (
            <>
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <Upload className="w-8 h-8 text-fuchsia-400" />
              </div>
              <p className="text-gray-300 font-medium">Click to upload photo</p>
              <p className="text-xs text-gray-500 mt-2">Supports PNG, JPG</p>
            </>
          )}

          {/* Scanner Effect Overlay */}
          {status === 'analyzing' && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
               <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500 shadow-[0_0_15px_#d946ef] animate-[scan_2s_linear_infinite]" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-12 h-12 text-white animate-spin" />
               </div>
            </div>
          )}

          {status === 'success' && (
             <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl backdrop-blur-sm">
                <div className="text-center animate-bounce">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">Added!</p>
                </div>
             </div>
          )}
        </div>

        {/* Status Text */}
        <div className="mt-6 text-center">
          <p className={`text-sm font-medium transition-colors ${status === 'analyzing' ? 'text-fuchsia-400' : 'text-gray-400'}`}>
            {analysisText}
          </p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
      </div>
      
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

export default UploadModal;
