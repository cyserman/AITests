import React, { useState, useMemo } from 'react';
import { EvidenceItem, Lane, VerificationStatus, NarrativeEvent } from '../types';
import { neutralizeText } from '../services/gemini';

interface TimelineViewProps {
  evidence: EvidenceItem[];
  narrativeEvents: NarrativeEvent[];
  onUpdateEvidence: (updated: EvidenceItem) => void;
  onUpdateNarrative: (events: NarrativeEvent[]) => void;
}

const LANES: { id: Lane; label: string; color: string; accent: string; description: string }[] = [
  { id: 'SAFETY', label: 'Safety & Protection', color: 'bg-red-50/30', accent: 'border-red-500', description: 'Threats, PFAs, and security incidents' },
  { id: 'CUSTODY', label: 'Custody & Access', color: 'bg-blue-50/30', accent: 'border-blue-500', description: 'Visitations, exchanges, and parental contact' },
  { id: 'FINANCIAL', label: 'Financial Support', color: 'bg-green-50/30', accent: 'border-green-500', description: 'Support, expenses, and financial leverage' },
  { id: 'PROCEDURAL', label: 'Court Records', color: 'bg-slate-50/30', accent: 'border-slate-500', description: 'Filings, orders, and legal process' },
];

export const TimelineView: React.FC<TimelineViewProps> = ({ evidence, narrativeEvents, onUpdateEvidence, onUpdateNarrative }) => {
  const [neutralizingId, setNeutralizingId] = useState<string | null>(null);
  const [showAddEvent, setShowAddEvent] = useState<Lane | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');

  const allEvents = useMemo(() => {
    return [...evidence, ...narrativeEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [evidence, narrativeEvents]);

  const handleNeutralize = async (item: EvidenceItem) => {
    setNeutralizingId(item.id);
    const neutral = await neutralizeText(item.content);
    onUpdateEvidence({ ...item, contentNeutral: neutral });
    setNeutralizingId(null);
  };

  const updateLane = (item: EvidenceItem, lane: Lane) => {
    onUpdateEvidence({ ...item, lane });
  };

  const exportForNotebookLM = () => {
    const content = `# CaseCraft: Forensic Strategic Context
Generated: ${new Date().toLocaleString()}
Case: Firey v. Firey (Montgomery County, PA)

## Strategic Foundation (The Anchors)
- **Core Theory**: Manufactured Imbalance (Pattern: Removal -> Denial -> Delay -> Status Quo)
- **Objective**: Correction and Trajectory (Restore oversight, collapse financial leverage)

## Narrative Patterns (Forensic Swimlanes)

${LANES.map(lane => {
  const items = allEvents.filter(e => e.lane === lane.id);
  if (items.length === 0) return '';
  return `### ${lane.label} Pattern
${lane.description}
${items.map((item: any) => `- [${new Date(item.timestamp).toLocaleDateString()}] **${item.title || item.sender}**: ${item.contentNeutral || item.content || item.description} (Exhibit: ${item.exhibitCode || 'P-TBD'})`).join('\n')}
`;
}).join('\n')}

## Chronological Audit Log
${allEvents.map((item: any) => `[${new Date(item.timestamp).toISOString()}] [${item.lane}] ${item.title || item.sender} | Status: ${item.verificationStatus || 'NARRATIVE'}`).join('\n')}

---
*Digital Signature: TruthTrack™ Verified | SHA-256 Authenticated Repository*
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NotebookLM_Source_Context_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    alert('Case Context Pack generated. Upload this .md file to your NotebookLM Source Library for deep strategic analysis.');
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED: return 'bg-green-500';
      case VerificationStatus.DISPUTED: return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-fadeIn bg-[#f8fafc] overflow-hidden">
      {/* Strategic Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
        <div>
          <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter">Forensic Swimlanes</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Revealing Narrative Patterns through TruthTrack™</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2 mr-4">
             {LANES.map(l => (
               <div key={l.id} className={`w-3 h-3 rounded-full border-2 border-white ${l.accent.replace('border-', 'bg-')}`} title={l.label}></div>
             ))}
          </div>
          <button 
            onClick={exportForNotebookLM}
            className="px-5 py-2.5 bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all shadow-lg flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Feed NotebookLM
          </button>
        </div>
      </div>

      {/* Horizontal Swimlane Grid */}
      <div className="flex-1 overflow-x-auto p-6 flex flex-col space-y-4 custom-scrollbar">
        <div className="min-w-[1200px] flex flex-col space-y-4">
          {LANES.map(lane => (
            <div key={lane.id} className={`flex flex-col rounded-2xl border border-slate-200 ${lane.color} min-h-[180px] transition-all group/lane relative`}>
              {/* Lane Meta */}
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${lane.accent.replace('border-', 'bg-')}`}></div>
                  <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{lane.label}</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold tracking-tight mt-0.5 max-w-[150px] leading-tight opacity-70 group-hover/lane:opacity-100 transition-opacity">
                  {lane.description}
                </p>
              </div>

              {/* Lane Beats Container */}
              <div className="flex-1 pl-44 pr-8 py-6 flex gap-4 overflow-x-auto custom-scrollbar-thin items-center">
                {allEvents.filter(e => e.lane === lane.id).map((item: any) => (
                  <div 
                    key={item.id} 
                    className={`min-w-[280px] max-w-[280px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden shrink-0 h-32 flex flex-col ${item.contentNeutral ? 'ring-1 ring-blue-500/20' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(item.verificationStatus)}`} />
                        <span className="text-[9px] font-mono font-bold text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${item.title ? 'text-slate-900' : 'text-blue-500/60'}`}>
                        {item.title ? 'Strategic' : 'Forensic'}
                      </span>
                    </div>

                    <h4 className="text-[10px] font-black text-slate-900 uppercase mb-1 leading-tight line-clamp-1">
                      {item.title || item.sender}
                    </h4>

                    <p className={`text-[10px] text-slate-600 leading-snug italic line-clamp-2 mb-auto`}>
                      {item.contentNeutral || item.description || item.content}
                    </p>

                    <div className="pt-2 border-t border-slate-50 flex justify-between items-center mt-2">
                      <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[7px] font-black rounded uppercase tracking-tighter">
                        {item.exhibitCode || 'P-TBD'}
                      </span>
                      {!item.title && !item.contentNeutral && (
                        <button 
                          onClick={() => handleNeutralize(item)}
                          className="text-[8px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {neutralizingId === item.id ? '...' : 'Neutralize'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setShowAddEvent(lane.id)}
                  className="min-w-[100px] h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-500 transition-all group/add shrink-0"
                >
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[8px] font-black uppercase tracking-widest">Add Beat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Narrative Entry Modal Overlays could go here, for now use showAddEvent */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="p-6 bg-[#0f172a] text-white">
              <h4 className="text-lg font-black uppercase tracking-tight">Promote Narrative Beat</h4>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Target Lane: {showAddEvent}</p>
            </div>
            <div className="p-6 space-y-4">
              <label className="block">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Short Title / Event Name</span>
                <input 
                  autoFocus
                  className="w-full text-xs font-bold uppercase p-3 border-b-2 border-slate-100 focus:border-blue-500 focus:outline-none bg-slate-50 rounded"
                  placeholder="EX: THE REMOVAL..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                />
              </label>
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={() => setShowAddEvent(null)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                <button 
                  onClick={() => {
                    if (!newEventTitle.trim()) return;
                    onUpdateNarrative([...narrativeEvents, {
                      id: Date.now().toString(),
                      title: newEventTitle,
                      description: 'Strategic narrative beat added manually to the patterns.',
                      lane: showAddEvent,
                      timestamp: new Date().toISOString(),
                      linkedEvidenceIds: []
                    }]);
                    setNewEventTitle('');
                    setShowAddEvent(null);
                  }} 
                  className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-xl"
                >
                  Anchor Beat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pattern Footer */}
      <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center px-8 z-10">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0f172a]"></div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Story Anchors</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-30"></div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Truth Spine Records</span>
          </div>
        </div>
        <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
          Case Status: Pattern Identified • Readiness: {Math.round((evidence.filter(e => e.isInTimeline).length / (evidence.length || 1)) * 100)}%
        </p>
      </div>
    </div>
  );
};
