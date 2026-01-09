
import React from 'react';
import { EvidenceItem, VerificationStatus } from '../types';

interface FloatingEvidenceConsoleProps {
  evidence: EvidenceItem[];
  onClose: () => void;
}

export const FloatingEvidenceConsole: React.FC<FloatingEvidenceConsoleProps> = ({ evidence, onClose }) => {
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED: return <span className="text-[8px] font-black text-green-600 bg-green-50 px-1 rounded uppercase tracking-tighter border border-green-100">Verified</span>;
      case VerificationStatus.DISPUTED: return <span className="text-[8px] font-black text-red-600 bg-red-50 px-1 rounded uppercase tracking-tighter border border-red-100">Disputed</span>;
      default: return <span className="text-[8px] font-black text-yellow-600 bg-yellow-50 px-1 rounded uppercase tracking-tighter border border-yellow-100">Pending</span>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] z-[1000] border-l border-slate-200 flex flex-col animate-slideInRight">
      <div className="bg-[#0f172a] p-8 text-white flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-lg font-black uppercase tracking-widest leading-none mb-2">Exhibit Console</h3>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Master Audit & Control</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Spine Density</span>
          <p className="text-[14px] font-black text-slate-900">{evidence.length} Records Indexed</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black rounded-full uppercase tracking-widest border border-green-200">System Healthy</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-[#fcfdfe]">
        {evidence.map(item => (
          <div key={item.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold text-slate-300">ID-{item.id.substring(0, 6)}</span>
                {getStatusBadge(item.verificationStatus)}
              </div>
              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest">{item.exhibitCode || 'P-TBD'}</span>
            </div>
            
            <p className="text-[12px] font-bold text-slate-800 leading-snug mb-3 line-clamp-3">"{item.content}"</p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Reliability</p>
                  <p className={`text-[10px] font-black uppercase ${item.reliability?.toLowerCase().includes('high') ? 'text-green-600' : 'text-orange-600'}`}>
                    {item.reliability || 'Unrated'}
                  </p>
               </div>
               <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Source Control</p>
                  <p className="text-[10px] font-black text-slate-700 uppercase truncate">
                    {item.source || 'Direct Entry'}
                  </p>
               </div>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[8px] font-black text-slate-500 border border-slate-100 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
              <div className="flex gap-2">
                <span className="text-[8px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">{item.lane}</span>
                <span className="text-[8px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">{item.type}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 border-t border-slate-200 bg-white">
        <button className="w-full py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center space-x-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          <span>Download Master Index</span>
        </button>
      </div>
    </div>
  );
};
