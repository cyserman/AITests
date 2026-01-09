
import React from 'react';
import { EvidenceItem } from '../types';

interface StickyNotesViewProps {
  evidence: EvidenceItem[];
  onUpdateNotes: (id: string, notes: string) => void;
}

export const StickyNotesView: React.FC<StickyNotesViewProps> = ({ evidence, onUpdateNotes }) => {
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Sticky Notes Layer</h3>
        <p className="text-sm text-gray-500">Private attorney/client work product. These annotations are <b>never</b> included in final exports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evidence.map((item) => (
          <div key={item.id} className="flex flex-col h-full bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 border-b border-yellow-200 bg-yellow-100/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-tight">Evidence Ref: {item.id}</p>
                  <p className="text-xs text-gray-600 line-clamp-1 italic">"{item.content}"</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4">
              <textarea
                className="w-full h-32 bg-transparent text-sm text-yellow-900 placeholder-yellow-600/50 resize-none focus:outline-none"
                placeholder="Type private annotations here..."
                value={item.notes || ''}
                onChange={(e) => onUpdateNotes(item.id, e.target.value)}
              />
            </div>
            <div className="p-3 bg-yellow-100/30 flex items-center justify-between">
              <span className="text-[10px] text-yellow-700 font-medium">Auto-saving...</span>
              <div className="flex space-x-2">
                <button className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
