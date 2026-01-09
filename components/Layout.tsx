
import React from 'react';
import { ActiveLayer } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeLayer: ActiveLayer;
  setActiveLayer: (layer: ActiveLayer) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onImport: (content: string) => void;
  onOpenConsole: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeLayer, 
  setActiveLayer,
  isSidebarOpen,
  setSidebarOpen,
  onImport,
  onOpenConsole
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const navItems = [
    { id: ActiveLayer.SPINE, label: 'The Vault', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', description: 'Immutable Truth Spine' },
    { id: ActiveLayer.TIMELINE, label: 'The Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', description: 'Narrative Strategy' },
    { id: ActiveLayer.MOTIONS, label: 'Court Prep', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', description: 'Motion Builder' },
    { id: ActiveLayer.LIVE, label: 'Live Advocate', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', description: 'Real-time Court Monitor' },
    { id: ActiveLayer.NOTES, label: 'Sticky Notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', description: 'Private Annotations' },
    { id: ActiveLayer.AI, label: 'Pattern Audit', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.593-.903l-.547-.547z', description: 'Advocate AI Suite' },
    { id: ActiveLayer.KNOWLEDGE, label: 'Anchor Rules', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', description: 'Strategic Foundation' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) onImport(ev.target.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#0f172a] text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="font-black text-lg tracking-tight uppercase">CaseCraft</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
            </svg>
          </button>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveLayer(item.id)}
              className={`w-full flex items-center p-3 rounded-lg transition-all group ${
                activeLayer === item.id ? 'bg-blue-600 shadow-lg text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <svg className={`w-6 h-6 flex-shrink-0 ${activeLayer === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {isSidebarOpen && (
                <div className="ml-3 text-left">
                  <p className={`text-xs font-black uppercase ${activeLayer === item.id ? 'text-white' : 'text-slate-300'}`}>{item.label}</p>
                  <p className="text-[10px] opacity-60 leading-tight">{item.description}</p>
                </div>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center space-x-2 text-slate-500 hover:text-white cursor-pointer transition-colors" onClick={onOpenConsole}>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">TruthTrack™ Engine Active</span>
           </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{navItems.find(i => i.id === activeLayer)?.label}</h2>
            <p className="text-[10px] text-slate-500">Secure Environment • Forensic Mode</p>
          </div>
          <div className="flex items-center space-x-4">
             <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Import Evidence</button>
             <button onClick={onOpenConsole} className="px-4 py-2 border border-slate-200 text-slate-700 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Exhibit Console</button>
          </div>
        </header>
        <div className="flex-1 overflow-hidden relative">{children}</div>
      </main>
    </div>
  );
};
