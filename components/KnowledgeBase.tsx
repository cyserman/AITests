
import React from 'react';
import { LegalRule, Anchor } from '../types';

export const KnowledgeBase: React.FC = () => {
  const [anchors] = React.useState<Anchor[]>([
    { 
      id: 'A1', 
      type: 'STRATEGIC', 
      title: 'Success Logic', 
      content: 'Winning is correction and trajectory, not domination. Status quo loses immunity; Court oversight restored; Ramped custody begins.' 
    },
    { 
      id: 'A2', 
      type: 'LEGAL', 
      title: 'Theory: Manufactured Imbalance', 
      content: 'Pattern: Removal -> Denial -> PFA Filings -> Delay -> Status Quo. Neutralize manufactured imbalances by making the pattern undeniable.' 
    },
    { 
      id: 'A3', 
      type: 'CONSTITUTIONAL', 
      title: 'The Truth Spine', 
      content: 'Every change is logged, hashed, and committed to Git. Forensic integrity is non-negotiable.' 
    }
  ]);

  const [rules, setRules] = React.useState<LegalRule[]>([
    { id: 'R1', name: 'Rule 403: Exclusion', description: 'Check for prejudicial vs probative value.', isActive: true },
    { id: 'R2', name: 'Procedural Beat Audit', description: 'Strip adjectives; extract verifiable actions.', isActive: true },
    { id: 'R3', name: 'Conflict Logic', description: 'Flag contradictions between disparate data logs (e.g. AppClose vs Email).', isActive: true },
  ]);

  return (
    <div className="animate-fadeIn space-y-8 py-4 max-w-5xl mx-auto">
      <div className="bg-[#0f172a] text-white p-8 rounded shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.666.945V10c0 5.825-4.139 10.285-8.5 11.5-4.361-1.215-8.5-5.675-8.5-11.5V5.845a1 1 0 01.666-.945zM10 3.35L3.5 6.133V10c0 4.75 3.308 8.441 6.5 9.475 3.192-1.034 6.5-4.725 6.5-9.475V6.133L10 3.35zM9 13V7h2v6H9zm1 2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Advocate Anchor Rules</h2>
        <p className="text-slate-400 text-xs font-medium mb-8">The strategic foundation that governs AI analysis and case trajectory.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {anchors.map(anchor => (
            <div key={anchor.id} className="bg-slate-800/50 border border-slate-700 p-5 rounded hover:border-blue-500 transition-colors">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3">{anchor.title}</h4>
              <p className="text-xs leading-relaxed font-medium text-slate-300 italic">"{anchor.content}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
            Active Logic Modules
          </h3>
          <div className="space-y-4">
            {rules.map(rule => (
              <div key={rule.id} className={`p-4 rounded border transition-all ${rule.isActive ? 'border-blue-100 bg-blue-50/50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-slate-900 uppercase">{rule.name}</span>
                  <button 
                    onClick={() => setRules(rules.map(r => r.id === rule.id ? {...r, isActive: !r.isActive} : r))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${rule.isActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rule.isActive ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Advocate Audit Log</h3>
          <div className="space-y-4">
             <div className="p-4 bg-green-50 border border-green-100 rounded">
               <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">Git: Auto-update Committed</span>
               <p className="text-[11px] font-mono mt-2 text-green-900">COMMIT: #JD-2025-12-17</p>
               <p className="text-[9px] text-green-600 mt-1 font-bold uppercase">Digital Chain of Custody Verified</p>
             </div>
             <div className="p-4 bg-slate-50 border border-slate-100 rounded opacity-60">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NotebookLM: Analysis Ready</span>
               <p className="text-[11px] font-mono mt-2 text-slate-600">STRUCTURED_DATA_READY.MD</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
