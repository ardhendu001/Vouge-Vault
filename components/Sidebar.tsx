import React from 'react';
import { LayoutDashboard, Archive, Layers, Leaf, Settings, ShieldCheck, X, Dna, Palette } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  moneySaved: number;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, moneySaved, isOpen, onClose }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { id: AppView.VAULT, icon: Archive, label: 'My Vault' },
    { id: AppView.ORCHESTRATOR, icon: Layers, label: 'Outfit Orchestrator' },
    { id: AppView.GATEKEEPER, icon: ShieldCheck, label: 'The Gatekeeper' },
    { id: AppView.MIXER, icon: Dna, label: 'Fashion Mixer' },
    { id: AppView.DESIGN_STUDIO, icon: Palette, label: 'AI Design Lab' },
    { id: AppView.IMPACT, icon: Leaf, label: 'Impact Score' },
    { id: AppView.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/10 flex flex-col 
        transform transition-transform duration-300 ease-in-out bg-[#0B0014]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tighter electric-gradient-text uppercase">
              VogueVault
            </h1>
            <p className="text-[10px] text-fuchsia-400 mt-1 uppercase tracking-[0.3em] font-black">The Conscious Closet</p>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-fuchsia-500/10 border-l-4 border-fuchsia-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.2)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <item.icon 
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-fuchsia-400' : 'text-gray-500 group-hover:text-white'}`} 
                />
                <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-green-950/40 to-emerald-950/40 border border-green-500/30 shadow-2xl">
            <p className="text-[10px] text-green-400/80 mb-1 font-black tracking-[0.2em] uppercase">Total Saved</p>
            <p className="text-2xl font-black text-green-400">${moneySaved.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;