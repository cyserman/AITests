import React, { useState } from 'react';
import { SpineItem, TimelineEvent, EventStatus, db } from '../lib/spine-db';

interface PromoteToTimelineProps {
    selectedItems: SpineItem[];
    onClose: () => void;
    onSuccess: () => void;
}

export const PromoteToTimeline: React.FC<PromoteToTimelineProps> = ({
    selectedItems,
    onClose,
    onSuccess,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [lane, setLane] = useState<'CUSTODY' | 'FINANCIAL' | 'SAFETY' | 'PROCEDURAL'>('CUSTODY');
    const [status, setStatus] = useState<EventStatus>(EventStatus.ASSERTED);
    const [isSaving, setIsSaving] = useState(false);

    // Pre-fill date from earliest selected item
    const earliestDate = selectedItems.length > 0
        ? new Date(Math.min(...selectedItems.map(item => new Date(item.timestamp).getTime())))
        : new Date();

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Please enter a title for the timeline event');
            return;
        }

        setIsSaving(true);

        try {
            const event: TimelineEvent = {
                id: `timeline-${Date.now()}`,
                date: earliestDate.toISOString(),
                title: title.trim(),
                description: description.trim(),
                lane,
                status,
                spineRefs: selectedItems.map(item => item.id),
                createdAt: new Date().toISOString(),
            };

            await db.timeline.add(event);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save timeline event:', error);
            alert('Failed to save timeline event');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Promote to Timeline</h2>
                            <p className="text-xs opacity-90 mt-1">Create timeline event from {selectedItems.length} spine items</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="e.g., Custody Exchange Refusal"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                            placeholder="Enter event description..."
                        />
                    </div>

                    {/* Date (auto-filled) */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                            Date (from earliest selected item)
                        </label>
                        <input
                            type="text"
                            value={earliestDate.toISOString().split('T')[0]}
                            disabled
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600"
                        />
                    </div>

                    {/* Lane */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                            Lane
                        </label>
                        <select
                            value={lane}
                            onChange={(e) => setLane(e.target.value as any)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        >
                            <option value="CUSTODY">Custody</option>
                            <option value="FINANCIAL">Financial</option>
                            <option value="SAFETY">Safety</option>
                            <option value="PROCEDURAL">Procedural</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as EventStatus)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                        >
                            <option value={EventStatus.ASSERTED}>Asserted</option>
                            <option value={EventStatus.DENIED}>Denied</option>
                            <option value={EventStatus.WITHDRAWN}>Withdrawn</option>
                            <option value={EventStatus.PENDING}>Pending</option>
                            <option value={EventStatus.RESOLVED}>Resolved</option>
                            <option value={EventStatus.FACT}>Fact</option>
                        </select>
                    </div>

                    {/* Selected Items Preview */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                            Linked Spine Items ({selectedItems.length})
                        </label>
                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 max-h-48 overflow-y-auto space-y-2">
                            {selectedItems.map((item) => (
                                <div key={item.id} className="bg-white p-3 rounded border border-slate-200">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-black text-slate-900 mb-1">
                                                {item.counterpart || 'Unknown'}
                                            </div>
                                            <div className="text-[11px] text-slate-600 italic line-clamp-2">
                                                "{item.contentOriginal}"
                                            </div>
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 p-6 rounded-b-xl border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-6 py-3 border border-slate-300 rounded-lg text-sm font-black uppercase tracking-widest text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !title.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-black uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isSaving ? 'Saving...' : 'Create Timeline Event'}
                    </button>
                </div>
            </div>
        </div>
    );
};
