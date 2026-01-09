
import React from 'react';
import { EvidenceItem, VerificationStatus } from '../types';

interface DashboardProps {
  evidence: EvidenceItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ evidence }) => {
  const totalCount = evidence.length;
  const verifiedCount = evidence.filter(e => e.verificationStatus === VerificationStatus.VERIFIED).length;
  const integrityScore = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;
  const beatsCount = evidence.filter(e => e.isInTimeline).length;
  const readinessScore = totalCount > 0 ? Math.round((beatsCount / totalCount) * 100) : 0;

  const recentItems = [...evidence]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  const highReliabilityCount = evidence.filter(e => e.reliability?.toLowerCase().includes('high')).length;
  const sourceDiversity = new Set(evidence.map(e => e.source)).size;

  return (
    <div className="animate-fadeIn space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-[#0f172a] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
               <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-500/30">TruthTrack™ Engine v2.5</span>
               <h2 className="text-4xl font-black uppercase tracking-tighter mt-4 leading-none">Case Integrity <br/> Dashboard</h2>
               <p className="text-slate-400 text-sm mt-4 max-w-md font-medium">
                 Real-time monitoring of Case Firey v. Firey. Patterns detected through SHA-256 validated forensic evidence.
               </p>
            </div>
            <div className="flex space-x-6">
               <div className="text-center">
                  <p className="text-5xl font-black text-blue-500">{integrityScore}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Integrity</p>
               </div>
               <div className="w-px h-16 bg-slate-800"></div>
               <div className="text-center">
                  <p className="text-5xl font-black text-white">{readinessScore}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Readiness</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-blue-500 transition-colors">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 inline-block mb-4 group-hover:scale-110 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Truth Spine</p>
          <p className="text-3xl font-black text-slate-900">{totalCount}</p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold italic">Forensic Records Indexed</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-green-500 transition-colors">
          <div className="p-3 bg-green-50 rounded-xl text-green-600 inline-block mb-4 group-hover:scale-110 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">High Reliability</p>
          <p className="text-3xl font-black text-slate-900">{highReliabilityCount}</p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold italic">Top-Tier Source Validation</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-purple-500 transition-colors">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 inline-block mb-4 group-hover:scale-110 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Library Beats</p>
          <p className="text-3xl font-black text-slate-900">{beatsCount}</p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold italic">Narrative Pattern Ready</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-orange-500 transition-colors">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600 inline-block mb-4 group-hover:scale-110 transition-transform">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Source Diversity</p>
          <p className="text-3xl font-black text-slate-900">{sourceDiversity}</p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold italic">Unique Data Channels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black text-slate-900 flex items-center uppercase tracking-tighter">
               <span className="w-2 h-6 bg-blue-600 mr-3 rounded-full"></span>
               Vault Intake Log
             </h3>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Recent SHA-256 Commits</span>
           </div>
           <div className="space-y-4">
             {recentItems.length > 0 ? recentItems.map(item => (
               <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-slate-100 group">
                 <div className="flex items-center space-x-5 overflow-hidden">
                   <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm group-hover:bg-blue-600 transition-colors">
                     {item.sender.substring(0, 2).toUpperCase()}
                   </div>
                   <div className="overflow-hidden">
                     <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{item.sender}</p>
                     <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{new Date(item.timestamp).toLocaleDateString()} • UUID-{item.id.substring(0, 4)}</p>
                   </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      {item.hash.substring(0, 8)}
                    </span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${item.verificationStatus === VerificationStatus.VERIFIED ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.verificationStatus}
                    </span>
                 </div>
               </div>
             )) : (
               <div className="py-20 text-center text-slate-400 text-xs italic">
                 The Vault is currently empty. Initiate sync to begin.
               </div>
             )}
           </div>
        </div>

        <div className="bg-[#1e293b] p-10 rounded-3xl shadow-2xl flex flex-col justify-center items-center text-center text-white relative overflow-hidden group">
           <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
           <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl transform rotate-3 group-hover:rotate-6 transition-transform">
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
           </div>
           <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">Promote to Library</h3>
           <p className="text-slate-400 text-sm mb-8 max-w-xs font-medium leading-relaxed">
             Transfer high-integrity evidence from the Vault into the Narrative Library to reveal strategic patterns.
           </p>
           <div className="flex space-x-4">
             <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95">
               Open Vault
             </button>
             <button className="px-8 py-3 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-700 transition-all">
               Library View
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
