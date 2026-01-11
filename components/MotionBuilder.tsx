
import React, { useState } from 'react';
import { EvidenceItem } from '../types';

interface MotionBuilderProps {
  evidence: EvidenceItem[];
}

export const MotionBuilder: React.FC<MotionBuilderProps> = ({ evidence }) => {
  const [motionType, setMotionType] = useState('Custody Modification');
  const [selectedIds, setSelectedIds] = useState<string[]>(evidence.map(e => e.id));

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedEvidence = evidence.filter(e => selectedIds.includes(e.id));

  const generateMarkdown = () => {
    return `
# IN THE COURT OF COMMON PLEAS OF MONTGOMERY COUNTY, PENNSYLVANIA
## ${motionType.toUpperCase()}

### STATEMENT OF FACTS

${selectedEvidence.map((e, idx) => `${idx + 1}. On ${new Date(e.timestamp).toLocaleDateString()}, ${e.contentNeutral || e.content} (See Exhibit ${e.exhibitCode || e.id}).`).join('\n\n')}

### ARGUMENT
The pattern of evidence demonstrates a manufactured imbalance in custodial access...
    `.trim();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMarkdown());
    alert('Motion text copied to clipboard.');
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">Select Procedural Beats</h3>
            <p className="text-[10px] text-slate-500 mb-6">Only neutralized "beats" are available for selection to ensure court-readiness.</p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {evidence.map(e => (
                <div
                  key={e.id}
                  onClick={() => toggleSelection(e.id)}
                  className={`p-3 rounded border cursor-pointer transition-all ${selectedIds.includes(e.id) ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-slate-400">{new Date(e.timestamp).toLocaleDateString()}</span>
                    {selectedIds.includes(e.id) && <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                  <p className="text-[10px] font-medium text-slate-700 line-clamp-2 leading-tight">{e.contentNeutral || e.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-white text-sm font-black uppercase tracking-widest">Motion Preview</h3>
                <p className="text-slate-400 text-[10px]">Rule-compliant structure • "Say Less" approach</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
              >
                Copy Markdown
              </button>
            </div>
            <div className="p-8 bg-white min-h-[600px] font-serif text-sm text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-blue-100">
              {generateMarkdown()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
