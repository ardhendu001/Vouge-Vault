
import React, { useState } from 'react';
import { X, Sparkles, Share2, Wand2, Plus, Save, Check } from 'lucide-react';
import { WardrobeItem } from '../types';
import { suggestOutfit } from '../services/geminiService';

interface OutfitOrchestratorProps {
  wardrobe: WardrobeItem[];
  selectedItems: WardrobeItem[];
  onToggleItem: (item: WardrobeItem) => void;
}

const OutfitOrchestrator: React.FC<OutfitOrchestratorProps> = ({ wardrobe, selectedItems, onToggleItem }) => {
  const [aiResult, setAiResult] = useState<{ text: string, image?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSuggestMissingPiece = () => {
    // Simple logic: find a missing category
    const hasTop = selectedItems.some(i => i.category === 'Tops');
    const hasBottom = selectedItems.some(i => i.category === 'Bottoms');
    
    let neededCategory = '';
    if (!hasTop) neededCategory = 'Tops';
    else if (!hasBottom) neededCategory = 'Bottoms';
    else neededCategory = 'Accessories';

    const suggestion = wardrobe.find(i => i.category === neededCategory && !selectedItems.find(s => s.id === i.id));
    if (suggestion) {
      onToggleItem(suggestion);
    }
  };

  const handleAskAI = async () => {
    setIsLoading(true);
    setAiResult(null);
    const context = `The user has selected: ${selectedItems.map(i => i.title).join(', ')}. Create a cohesive look.`;
    
    const inputImages = selectedItems.map(i => {
      const match = i.imageUrl.match(/^data:(.+);base64,(.+)$/);
      if (match) return { mimeType: match[1], data: match[2] };
      return null;
    }).filter((i): i is { mimeType: string, data: string } => !!i);
    
    const result = await suggestOutfit(wardrobe, context, inputImages);
    setAiResult(result);
    setIsLoading(false);
  };

  const handleSaveLook = () => {
    showToast("Look saved to Collection");
  };

  const handleShareLook = () => {
    navigator.clipboard.writeText("https://voguevault.app/look/123");
    showToast("Link copied to clipboard");
  };

  const handleDragStart = (e: React.DragEvent, item: WardrobeItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const item = JSON.parse(data) as WardrobeItem;
        if (!selectedItems.find(i => i.id === item.id)) onToggleItem(item);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 relative">
      
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
            <Check className="w-4 h-4 text-green-600" /> {toast}
          </div>
        </div>
      )}

      {/* Sidebar Selector */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <h3 className="text-xl font-bold px-1">My Vault</h3>
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
                  ${isSelected ? 'bg-fuchsia-900/10 border-fuchsia-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}
                `}
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl} className="w-full h-full object-cover pointer-events-none" alt={item.title} />
                  {isSelected && <div className="absolute inset-0 bg-fuchsia-500/20 backdrop-blur-[1px]" />}
                </div>
                <div className="flex-1 min-w-0 pointer-events-none">
                  <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-fuchsia-300' : 'text-gray-200'}`}>{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.category} • {item.wearCount} wears</p>
                </div>
                <div className="pointer-events-none">
                   {isSelected ? (
                     <X className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                   ) : (
                     <Plus className="w-4 h-4 text-fuchsia-500" />
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center z-10 px-1">
          <h3 className="text-xl font-bold">Orchestrator Canvas</h3>
          <button onClick={handleSuggestMissingPiece} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            Auto-Complete Look
          </button>
        </div>
        
        <div 
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`flex-1 glass-panel rounded-2xl relative flex flex-col items-center justify-center border-dashed border-2 transition-all duration-300 bg-[#0B0014]/50 overflow-hidden
            ${isDraggingOver ? 'border-fuchsia-500 bg-fuchsia-500/10 scale-[1.01]' : 'border-white/10'}
          `}
        >
          {selectedItems.length === 0 ? (
             <div className="text-center text-gray-600">
               <p>Drag items here to orchestrate an outfit.</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl p-8">
               {selectedItems.map((item) => (
                 <div key={item.id} className="relative group aspect-square">
                   <div className="w-full h-full rounded-xl overflow-hidden border border-white/5 bg-white/5 p-4 flex items-center justify-center shadow-2xl">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain drop-shadow-xl" />
                   </div>
                   <button 
                     onClick={() => onToggleItem(item)}
                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                   >
                     <X className="w-3 h-3" />
                   </button>
                 </div>
               ))}
             </div>
           )}

           {/* AI Result Overlay */}
           {aiResult && (
            <div className="absolute inset-0 z-20 flex flex-col animate-fade-in bg-[#0B0014]/95 backdrop-blur-xl">
              <div className="p-4 border-b border-white/10 flex justify-between">
                <span className="font-bold flex items-center gap-2"><Wand2 className="w-4 h-4 text-fuchsia-400"/> AI Stylist</span>
                <button onClick={() => setAiResult(null)}><X className="w-5 h-5"/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8">
                 {aiResult.image && (
                   <div className="w-full md:w-1/2 aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/10">
                     <img src={aiResult.image} className="w-full h-full object-cover" />
                   </div>
                 )}
                 <div className="flex-1 flex flex-col">
                    <div className="flex-1 prose prose-invert overflow-y-auto custom-scrollbar">
                       <div className="whitespace-pre-line text-gray-300">{aiResult.text}</div>
                    </div>
                    
                    <div className="pt-4 flex gap-3 mt-4 border-t border-white/10">
                      <button onClick={handleSaveLook} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 font-bold text-sm">
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button onClick={handleShareLook} className="flex-1 py-3 rounded-xl bg-fuchsia-600/20 text-fuchsia-300 hover:bg-fuchsia-600/30 flex items-center justify-center gap-2 font-bold text-sm">
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                    </div>
                 </div>
              </div>
            </div>
           )}
        </div>

        <div className="h-20 glass-panel rounded-xl p-4 flex items-center justify-end">
          <button 
            onClick={handleAskAI}
            disabled={isLoading || selectedItems.length === 0}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              isLoading ? 'bg-white/10 text-gray-500' : 'electric-gradient-bg text-white hover:scale-105'
            }`}
          >
            {isLoading ? <span className="animate-pulse">Orchestrating...</span> : <><Sparkles className="w-5 h-5" /> Visualize</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutfitOrchestrator;
