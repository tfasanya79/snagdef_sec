
import React from 'react';
import { View } from '../types';
import { SnagDefIcon } from './icons/NavIcons'; // Main app icon

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  navigationItems: { name: View; icon: React.FC<{className?: string}> }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, navigationItems }) => {
  return (
    <nav className="w-64 bg-slate-900 p-4 space-y-4 border-r border-slate-700 flex flex-col">
      <div className="flex items-center space-x-2 mb-6 p-2">
        <SnagDefIcon className="h-10 w-10 text-cyan-400" />
        <h1 className="text-xl font-bold text-slate-100">SnagDef</h1>
      </div>
      <ul className="space-y-2 flex-grow">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.name}>
              <button
                onClick={() => setCurrentView(item.name)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-150
                            ${currentView === item.name 
                              ? 'bg-cyan-500 text-white shadow-lg' 
                              : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                            }`}
              >
                <IconComponent className="h-6 w-6" />
                <span>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto p-2 text-xs text-slate-500">
        &copy; {new Date().getFullYear()} SnagDef Sim.
      </div>
    </nav>
  );
};
