import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Wardrobe from './components/Wardrobe';
import OutfitOrchestrator from './components/OutfitOrchestrator';
import UploadModal from './components/UploadModal';
import SustainabilityModal from './components/SustainabilityModal';
import SustainabilityView from './components/SustainabilityView';
import Gatekeeper from './components/Gatekeeper';
import FashionMixer from './components/FashionMixer';
import DesignStudio from './components/DesignStudio';
import { AppView, WardrobeItem } from './types';
import { INITIAL_WARDROBE, MOCK_WEATHER } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(INITIAL_WARDROBE);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedItemForSustainability, setSelectedItemForSustainability] = useState<WardrobeItem | null>(null);
  const [outfitSelectedItems, setOutfitSelectedItems] = useState<WardrobeItem[]>([]);
  const [moneySaved, setMoneySaved] = useState(1250);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddItem = (newItem: WardrobeItem) => {
    setWardrobe(prev => [newItem, ...prev]);
  };

  const handleUpdateItem = (updatedItem: WardrobeItem) => {
    setWardrobe(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleAddToOutfit = (item: WardrobeItem) => {
    setOutfitSelectedItems(prev => {
      if (!prev.find(i => i.id === item.id)) return [...prev, item];
      return prev;
    });
    setCurrentView(AppView.ORCHESTRATOR);
  };

  const handleToggleOutfitItem = (item: WardrobeItem) => {
    setOutfitSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      return [...prev, item];
    });
  };

  const handleAvoidPurchase = (amount: number) => {
    setMoneySaved(prev => prev + amount);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            weather={MOCK_WEATHER} 
            items={wardrobe} 
            onNavigate={setCurrentView} 
            moneySaved={moneySaved}
          />
        );
      case AppView.VAULT:
        return (
          <Wardrobe 
            items={wardrobe} 
            onSelectItem={setSelectedItemForSustainability}
            onOpenUpload={() => setIsUploadOpen(true)}
            onAddToOutfit={handleAddToOutfit}
            onUpdateItem={handleUpdateItem}
          />
        );
      case AppView.ORCHESTRATOR:
        return (
          <OutfitOrchestrator 
            wardrobe={wardrobe} 
            selectedItems={outfitSelectedItems} 
            onToggleItem={handleToggleOutfitItem}
          />
        );
      case AppView.GATEKEEPER:
        return (
          <Gatekeeper 
            wardrobe={wardrobe} 
            onAvoidPurchase={handleAvoidPurchase}
          />
        );
      case AppView.MIXER:
        return <FashionMixer onSaveToVault={handleAddItem} />;
      case AppView.DESIGN_STUDIO:
        return <DesignStudio onSaveToVault={handleAddItem} />;
      case AppView.IMPACT:
        return <SustainabilityView wardrobe={wardrobe} onGoToWardrobe={() => setCurrentView(AppView.VAULT)} />;
      case AppView.SETTINGS:
        return <div className="flex items-center justify-center h-full text-gray-500"><p>Settings locked.</p></div>;
      default:
        return (
          <Dashboard 
            weather={MOCK_WEATHER} 
            items={wardrobe} 
            onNavigate={setCurrentView} 
            moneySaved={moneySaved}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0014] text-white selection:bg-fuchsia-500/30 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0B0014]/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
           >
             <Menu className="w-6 h-6 text-white" />
           </button>
           <span className="font-bold text-lg electric-gradient-text tracking-tighter">VogueVault</span>
        </div>
      </div>

      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false); // Close sidebar on mobile nav
        }} 
        moneySaved={moneySaved}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <main className="md:ml-64 p-4 md:p-8 pt-24 md:pt-8 min-h-screen transition-all duration-300">
        {renderContent()}
      </main>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onAddItem={handleAddItem}
      />

      <SustainabilityModal 
        item={selectedItemForSustainability}
        onClose={() => setSelectedItemForSustainability(null)}
      />
    </div>
  );
};

export default App;