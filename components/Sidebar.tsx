import React from 'react';
import { LayoutDashboard, Archive, Layers, Leaf, Settings, ShieldCheck, X } from 'lucide-react';
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
    { id: AppView.IMPACT, icon: Leaf, label: 'Impact Score' },
    { id: AppView.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/10 flex flex-col 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter electric-gradient-text">
              VogueVault
            </h1>
            <p className="text-xs text-purple-200/50 mt-1 uppercase tracking-widest">The Conscious Closet</p>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-white/10 border-l-4 border-fuchsia-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                    : 'text-purple-200/60 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <item.icon 
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-fuchsia-400' : 'group-hover:text-white'}`} 
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 shadow-lg">
            <p className="text-xs text-green-200/80 mb-2 font-bold tracking-wide uppercase">Money Saved (YTD)</p>
            <p className="text-2xl font-bold text-green-400">${moneySaved.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;