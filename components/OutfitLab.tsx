
import React, { useState, useRef } from 'react';
import { Plus, X, Sparkles, Share2, Wand2, Upload, Check, Copy, Save } from 'lucide-react';
import { WardrobeItem } from '../types';
import { suggestOutfit, fileToGenerativePart } from '../services/geminiService';

interface OutfitLabProps {
  wardrobe: WardrobeItem[];
  selectedItems: WardrobeItem[];
  onToggleItem: (item: WardrobeItem) => void;
}

const OutfitLab: React.FC<OutfitLabProps> = ({ wardrobe, selectedItems, onToggleItem }) => {
  const [aiResult, setAiResult] = useState<{ text: string, image?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAskAI = async () => {
    setIsLoading(true);
    setAiResult(null);
    
    // Extract images from selected items to use as context
    const inputImages = selectedItems
      .map(item => item.imageUrl.startsWith('data:') ? item.imageUrl.split(',')[1] : null)
      .filter((img): img is string => !!img);

    const context = selectedItems.length > 0 
      ? `The user has placed these items on the digital canvas: ${selectedItems.map(i => i.title).join(', ')}. Use these as the foundation of the look.`
      : "The canvas is empty. Create a complete, show-stopping outfit from the available wardrobe for a high-end tech gala.";
    
    const result = await suggestOutfit(wardrobe, context, inputImages.length > 0 ? inputImages : undefined);
    setAiResult(result);
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64Data = await fileToGenerativePart(file);
        const newItem: WardrobeItem = {
          id: `custom-${Date.now()}`,
          title: "Custom Piece",
          category: "Accessories",
          imageUrl: `data:${file.type};base64,${base64Data}`,
          tags: ["#Custom", "#Upload"],
          dateAdded: new Date().toISOString(),
          color: "Unknown",
          fabric: "Unknown",
          wearCount: 0,
          cost: 0
        };
        onToggleItem(newItem);
      } catch (error) {
        console.error("Failed to upload custom item", error);
        showToast("Failed to upload image.");
      }
    }
  };

  const handleSaveLook = () => {
    // Mock save functionality
    showToast("Look saved to your Collection!");
  };

  const handleShareLook = () => {
    // Mock share functionality
    navigator.clipboard.writeText("https://voguevault.app/share/look/123xyz");
    showToast("Link copied to clipboard!");
  };

  // --- Drag and Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, item: WardrobeItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const item = JSON.parse(data) as WardrobeItem;
        if (!selectedItems.find(i => i.id === item.id)) {
           onToggleItem(item);
        }
      }
    } catch (err) {
      console.error("Drop failed", err);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-down">
          <div className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Sidebar Selector */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xl font-bold">Wardrobe Source</h3>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-xs flex items-center gap-1 text-fuchsia-300 hover:text-white border border-fuchsia-500/50 hover:bg-fuchsia-500/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <Upload className="w-3 h-3" /> Custom
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {wardrobe.map(item => {
            const isSelected = selectedItems.find(i => i.id === item.id);
            return (
              <div 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => onToggleItem(item)}
                className={`group p-3 rounded-xl border flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all duration-200
                  ${isSelected 
                    ? 'bg-fuchsia-900/10 border-fuchsia-500/50' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-white/30 transition-colors">
                  <img src={item.imageUrl} className="w-full h-full object-cover pointer-events-none" alt={item.title} />
                  {isSelected && (
                    <div className="absolute inset-0 bg-fuchsia-500/20 backdrop-blur-[1px] flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pointer-events-none">
                  <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-fuchsia-300' : 'text-gray-200'}`}>{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                
                <div className="pointer-events-none">
                   {isSelected ? (
                     <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-500 group-hover:border-red-500 group-hover:text-red-500 transition-colors">
                        <span className="text-xs font-bold group-hover:hidden">On</span>
                        <X className="w-4 h-4 hidden group-hover:block" />
                     </div>
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-900/50 group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4" />
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        <h3 className="text-xl font-bold flex justify-between items-center z-10 px-1">
          <span>Canvas</span>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors group">
            <Share2 className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </button>
        </h3>
        
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 glass-panel rounded-2xl p-0 relative flex flex-col items-center justify-center border-dashed border-2 transition-all duration-300 bg-[#0B0014]/50 overflow-hidden
            ${isDraggingOver ? 'border-fuchsia-500 bg-fuchsia-500/10 scale-[1.01] shadow-[0_0_30px_rgba(236,72,153,0.2)]' : 'border-white/10'}
          `}
        >
          {/* Default Canvas State */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar">
             {selectedItems.length === 0 ? (
                <div className={`text-center transition-colors duration-300 ${isDraggingOver ? 'text-fuchsia-300' : 'text-gray-500'}`}>
                  <Sparkles className={`w-12 h-12 mx-auto mb-4 ${isDraggingOver ? 'opacity-100 animate-pulse' : 'opacity-20'}`} />
                  <p className="font-medium text-lg">{isDraggingOver ? 'Drop to Add Item' : 'Start Designing'}</p>
                  <p className="text-sm mt-2 opacity-60">Select or Drag items from the wardrobe</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl pointer-events-none">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="relative group aspect-square pointer-events-auto">
                      <div className="w-full h-full rounded-xl overflow-hidden border border-white/5 bg-white/5 p-4 flex items-center justify-center shadow-2xl">
                         <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <button 
                        onClick={() => onToggleItem(item)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Visual Drop Hint */}
                  {isDraggingOver && (
                    <div className="aspect-square border-2 border-dashed border-fuchsia-500/50 rounded-xl flex items-center justify-center bg-fuchsia-500/10 animate-pulse">
                      <Plus className="w-8 h-8 text-fuchsia-400" />
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* AI Result Overlay */}
          {aiResult && (
            <div className="absolute inset-0 z-20 flex flex-col animate-fade-in bg-[#0B0014] md:bg-[#0B0014]/95 backdrop-blur-xl">
              {/* Overlay Header */}
              <div className="flex-none p-4 border-b border-white/10 flex items-center justify-between bg-fuchsia-900/10">
                <div className="flex items-center gap-2 text-fuchsia-400">
                  <Wand2 className="w-5 h-5" />
                  <span className="font-bold tracking-wider uppercase text-sm">VogueVault AI Stylist</span>
                </div>
                <button 
                  onClick={() => setAiResult(null)}
                  className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Overlay Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-0 md:h-full">
                  
                  {/* Image Section */}
                  {aiResult.image && (
                    <div className="w-full md:w-1/2 flex-none flex flex-col">
                      <div className="aspect-square rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)] bg-black relative group">
                        <img src={aiResult.image} alt="AI Generated Outfit" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/10 flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-fuchsia-400" /> Generative AI Preview
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Section */}
                  <div className="flex-1 flex flex-col">
                    <div className="prose prose-invert prose-sm md:prose-base text-gray-300 max-w-none flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
                      <div className="whitespace-pre-line leading-relaxed text-sm md:text-base space-y-4">
                        {aiResult.text.split('**').map((part, index) => {
                          if (index % 2 === 1) return <strong key={index} className="text-fuchsia-300 font-bold text-lg block mt-6 mb-2 border-l-2 border-fuchsia-500 pl-3">{part}</strong>;
                          return <span key={index}>{part}</span>;
                        })}
                      </div>
                    </div>
                    
                    {/* Functional Buttons */}
                    <div className="pt-4 flex gap-3 mt-auto border-t border-white/10">
                      <button 
                        onClick={handleSaveLook}
                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-bold border border-white/10 flex items-center justify-center gap-2 group"
                      >
                        <Save className="w-4 h-4 text-gray-400 group-hover:text-white" />
                        Save Look
                      </button>
                      <button 
                        onClick={handleShareLook}
                        className="flex-1 py-3 rounded-xl bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-300 transition-colors text-sm font-bold border border-fuchsia-500/30 flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="h-20 glass-panel rounded-xl p-4 flex items-center justify-end flex-shrink-0">
          <button 
            onClick={handleAskAI}
            disabled={isLoading}
            className={`px-6 md:px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all w-full md:w-auto justify-center ${
              isLoading 
                ? 'bg-white/10 text-gray-400 cursor-wait' 
                : 'electric-gradient-bg text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Designing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Finish Look with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutfitLab;
