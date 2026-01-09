
import React, { useState } from 'react';
import { EvidenceItem, VerificationStatus } from '../types';
import { SmartImport } from './SmartImport';

interface SpineViewProps {
  evidence: EvidenceItem[];
  onToggleTimeline: (id: string) => void;
  onUpdateEvidence: (updated: EvidenceItem) => void;
}

// Added explicit type definition to STATUS_CONFIG to ensure property access is correctly typed when indexing by VerificationStatus enum.
const STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string; dot: string }> = {
  [VerificationStatus.VERIFIED]: { label: 'Verified', color: 'text-green-600 bg-green-50 border-green-100', dot: 'bg-green-500' },
  [VerificationStatus.PENDING]: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50 border-yellow-100', dot: 'bg-yellow-500' },
  [VerificationStatus.DISPUTED]: { label: 'Disputed', color: 'text-red-600 bg-red-50 border-red-100', dot: 'bg-red-500' },
};

export const SpineView: React.FC<SpineViewProps> = ({ evidence, onToggleTimeline, onUpdateEvidence }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInputId, setTagInputId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState<string>('');
  const [showSmartImport, setShowSmartImport] = useState(false);

  const allTags = Array.from(new Set(evidence.flatMap(e => e.tags || []))).sort();

  const filtered = evidence.filter(e => {
    const matchesSearch = 
      e.sender.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.exhibitCode && e.exhibitCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesTags = selectedTags.length === 0 || 
      (e.tags && selectedTags.every(tag => e.tags.includes(tag)));

    return matchesSearch && matchesTags;
  });

  const cycleStatus = (item: EvidenceItem) => {
    const statuses = [VerificationStatus.PENDING, VerificationStatus.VERIFIED, VerificationStatus.DISPUTED];
    const currentIndex = statuses.indexOf(item.verificationStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onUpdateEvidence({ ...item, verificationStatus: nextStatus, verified: nextStatus === VerificationStatus.VERIFIED });
  };

  const addTag = (item: EvidenceItem, tag: string) => {
    const normalized = tag.trim().toUpperCase();
    if (normalized && !(item.tags || []).includes(normalized)) {
      onUpdateEvidence({ ...item, tags: [...(item.tags || []), normalized] });
    }
    setNewTag('');
    setTagInputId(null);
  };

  const removeTag = (item: EvidenceItem, tagToRemove: string) => {
    onUpdateEvidence({ ...item, tags: item.tags.filter(t => t !== tagToRemove) });
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
                  The Truth Spine
                  <span className="ml-3 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded uppercase tracking-widest">Git Audited</span>
                </h3>
                <p className="text-xs text-slate-500">Immutable forensic log. SHA-256 protected. Data verified against Case DB.</p>
              </div>
              <button
                onClick={() => setShowSmartImport(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Smart Import</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded leading-5 bg-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-xs"
                placeholder="Search by keyword, sender, ID, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">
              {searchTerm || selectedTags.length > 0 ? (
                <span>Showing {filtered.length} of {evidence.length} forensic records</span>
              ) : (
                <span>Displaying all {evidence.length} records</span>
              )}
            </div>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-widest">Active Tags:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`px-2 py-1 rounded text-[9px] font-black transition-all ${
                  selectedTags.includes(tag) 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button 
                onClick={() => setSelectedTags([])}
                className="ml-auto text-[9px] font-black text-blue-600 uppercase hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto border rounded border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Forensic ID</th>
                <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Content</th>
                <th scope="col" className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">SHA-256 Digest</th>
                <th scope="col" className="px-6 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400">UUID-{item.id}</span>
                        <button 
                          onClick={() => cycleStatus(item)}
                          className={`mt-2 flex items-center px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest transition-all ${STATUS_CONFIG[item.verificationStatus].color}`}
                        >
                          <div className={`mr-1.5 w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[item.verificationStatus].dot}`} />
                          {STATUS_CONFIG[item.verificationStatus].label}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-black text-slate-900 mb-0.5">
                        {item.sender}
                        {item.exhibitCode && (
                          <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] rounded border border-blue-100">
                            {item.exhibitCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 italic leading-snug">"{item.content}"</div>
                      
                      {/* Tags Section */}
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        {item.tags?.map(tag => (
                          <span key={tag} className="flex items-center px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[8px] font-black uppercase tracking-widest group/tag">
                            {tag}
                            <button onClick={() => removeTag(item, tag)} className="ml-1 opacity-0 group-hover/tag:opacity-100 text-slate-400 hover:text-red-500">×</button>
                          </span>
                        ))}
                        {tagInputId === item.id ? (
                          <input
                            autoFocus
                            className="w-24 px-1 py-0.5 border border-blue-300 rounded text-[8px] uppercase font-black focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="TAG NAME..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addTag(item, newTag);
                              if (e.key === 'Escape') setTagInputId(null);
                            }}
                            onBlur={() => addTag(item, newTag)}
                          />
                        ) : (
                          <button 
                            onClick={() => setTagInputId(item.id)}
                            className="text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                          >
                            + Add Tag
                          </button>
                        )}
                      </div>

                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {item.type}
                        </span>
                        {/* Fix: Explicitly cast timestamp to any to resolve "unknown" to "string | number | Date" assignment error in new Date constructor */}
                        <span className="text-[9px] text-slate-400 font-mono">{new Date(item.timestamp as any).toISOString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 group cursor-help">
                        <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.666.945V10c0 5.825-4.139 10.285-8.5 11.5-4.361-1.215-8.5-5.675-8.5-11.5V5.845a1 1 0 01.666-.945zM10 3.35L3.5 6.133V10c0 4.75 3.308 8.441 6.5 9.475 3.192-1.034 6.5-4.725 6.5-9.475V6.133L10 3.35zM9 13V7h2v6H9zm1 2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 group-hover:text-blue-600 transition-colors">
                          {item.hash.substring(0, 12)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => onToggleTimeline(item.id)}
                        className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                          item.isInTimeline 
                          ? 'bg-slate-100 text-slate-400' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform active:scale-95'
                        }`}
                      >
                        {item.isInTimeline ? 'Beats Active' : 'Promote to Beats'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-xs font-medium italic">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No forensic records found matching "{searchTerm}"</p>
                      <button 
                        onClick={() => {setSearchTerm(''); setSelectedTags([]);}}
                        className="text-blue-600 hover:text-blue-800 font-black uppercase tracking-widest text-[10px]"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showSmartImport && (
        <SmartImport 
          onImport={(items) => {
            items.forEach(item => onUpdateEvidence(item));
            setShowSmartImport(false);
          }}
          onClose={() => setShowSmartImport(false)}
        />
      )}
    </div>
  );
};
