
import React, { useState } from 'react';
import { EvidenceItem, AnalysisResult, AgentStatus } from '../types';
import { analyzeEvidence } from '../services/gemini';

interface AIAnalysisViewProps {
  evidence: EvidenceItem[];
}

export const AIAnalysisView: React.FC<AIAnalysisViewProps> = ({ evidence }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agents] = useState<AgentStatus[]>([
    { id: '1', name: 'Conflict Agent', status: 'IDLE', task: 'Cross-referencing sources' },
    { id: '2', name: 'Pattern Agent', status: 'IDLE', task: 'Identifying "Say Less" beats' },
    { id: '3', name: 'Spine Validator', status: 'IDLE', task: 'Verifying SHA-256 hashes' }
  ]);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeEvidence(evidence);
      setResult({...analysis, agentName: 'Advocate Prime Agent'});
    } catch (err) {
      setError("Analysis failed. Advocate connectivity interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const exportToNotebookLM = () => {
    if (!result) return;
    const content = `# CaseTimeline: TruthTrack™ Advocate Analysis
## Strategic Summary
${result.summary}

## "Say Less" Strategy
${result.sayLessStrategy}

## Identified Conflicts
${result.conflicts.map(c => `- ${c}`).join('\n')}

## Evidence Spine Excerpt
${evidence.map(e => `### [${e.timestamp}] ${e.sender}
- Hash: ${e.hash}
- Content: ${e.content}
`).join('\n')}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Advocate_Report_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn py-4">
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center space-x-3">
             <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'animate-pulse bg-blue-600' : 'bg-slate-300'}`}></div>
             <div>
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{agent.name}</p>
               <p className="text-[9px] text-slate-500 font-medium">{loading ? agent.task : 'Active'}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-[#0f172a] p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Advocate AI Suite</h3>
            <p className="text-slate-400 text-xs font-medium">Executing 'Say Less' pattern recognition and conflict detection.</p>
          </div>
          {result && !loading && (
            <button 
              onClick={exportToNotebookLM}
              className="px-4 py-2 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg"
            >
              Export for NotebookLM
            </button>
          )}
        </div>

        <div className="p-8">
          {!result && !loading && (
            <div className="text-center py-12">
              <button onClick={handleAnalysis} className="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded shadow-xl hover:bg-slate-800 transition-all border border-slate-700">
                Initiate Pattern Audit
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-20">
               <div className="flex justify-center mb-6">
                 <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               </div>
               <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Cross-referencing Truth Spine with Legal Rules...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded border border-slate-100 text-center">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Integrity Score</p>
                   <p className="text-5xl font-black text-blue-600">{result.readinessScore}%</p>
                </div>
                <div className="col-span-2 bg-slate-50 p-6 rounded border border-slate-100">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">"Say Less" Strategic Summary</p>
                   <p className="text-sm text-slate-800 leading-relaxed font-medium">"{result.sayLessStrategy}"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded border border-slate-200">
                  <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center">
                    <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    High-Severity Conflicts
                  </h4>
                  <ul className="space-y-3">
                    {result.conflicts.map((conflict, i) => (
                      <li key={i} className="text-xs text-slate-700 font-medium pl-4 border-l-2 border-red-200">
                        {conflict}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded border border-slate-200">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Advocate Suggestions</h4>
                  <ul className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-slate-700 font-medium pl-4 border-l-2 border-blue-200">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
