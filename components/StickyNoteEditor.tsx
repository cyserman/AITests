import React, { useState } from 'react';
import { StickyNote, db } from '../lib/spine-db';

interface StickyNoteEditorProps {
    targetType: 'spine' | 'timeline' | 'evidence';
    targetId: string;
    existingNote?: StickyNote;
    onClose: () => void;
    onSave?: (note: StickyNote) => void;
}

export const StickyNoteEditor: React.FC<StickyNoteEditorProps> = ({
    targetType,
    targetId,
    existingNote,
    onClose,
    onSave,
}) => {
    const [text, setText] = useState(existingNote?.text || '');
    const [color, setColor] = useState<'yellow' | 'pink' | 'blue' | 'green'>(
        existingNote?.color || 'yellow'
    );
    const [isPrivate, setIsPrivate] = useState(existingNote?.isPrivate ?? true);
    const [isSaving, setIsSaving] = useState(false);

    const colorOptions = [
        { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
        { value: 'pink', label: 'Pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
        { value: 'blue', label: 'Blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
        { value: 'green', label: 'Green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
    ];

    const selectedColorStyle = colorOptions.find(c => c.value === color);

    const handleSave = async () => {
        if (!text.trim()) {
            alert('Please enter note text');
            return;
        }

        setIsSaving(true);

        try {
            const note: StickyNote = {
                id: existingNote?.id || `note-${Date.now()}`,
                targetType,
                targetId,
                text: text.trim(),
                color,
                isPrivate,
                createdAt: existingNote?.createdAt || new Date().toISOString(),
                x: existingNote?.x,
                y: existingNote?.y,
            };

            await db.stickyNotes.put(note);

            if (onSave) {
                onSave(note);
            }

            onClose();
        } catch (error) {
            console.error('Failed to save sticky note:', error);
            alert('Failed to save sticky note');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!existingNote || !confirm('Delete this note?')) return;

        try {
            await db.stickyNotes.delete(existingNote.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete note:', error);
            alert('Failed to delete note');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${selectedColorStyle?.bg} rounded-xl shadow-2xl max-w-md w-full border-2 ${selectedColorStyle?.border}`}>
                {/* Header */}
                <div className="p-4 border-b-2 border-dashed border-slate-300/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className={`w-5 h-5 ${selectedColorStyle?.text}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <h3 className={`font-black uppercase text-xs tracking-widest ${selectedColorStyle?.text}`}>
                            {existingNote ? 'Edit Note' : 'New Sticky Note'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={`${selectedColorStyle?.text} hover:opacity-70 transition-opacity`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Text Input */}
                    <div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className={`w-full px-3 py-2 border-2 ${selectedColorStyle?.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 text-sm resize-none ${selectedColorStyle?.bg}`}
                            placeholder="Enter your note here..."
                            rows={6}
                            autoFocus
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">
                            Color
                        </label>
                        <div className="flex gap-2">
                            {colorOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setColor(option.value as any)}
                                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${color === option.value
                                            ? `${option.border} ${option.bg} shadow-md scale-105`
                                            : `border-slate-200 bg-white hover:${option.bg}`
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full ${option.bg} border-2 ${option.border} mx-auto`} />
                                    <div className={`text-[9px] font-black uppercase mt-1 ${option.text}`}>
                                        {option.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Privacy Toggle */}
                    <div className="bg-white/50 rounded-lg p-3 border-2 border-dashed border-slate-300">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="text-xs font-black text-slate-700 uppercase tracking-wide">
                                    Private Note
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                    {isPrivate
                                        ? '🔒 Will NOT be included in exports by default'
                                        : '⚠️ Will be included in exports'}
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t-2 border-dashed border-slate-300/50 flex justify-between gap-2">
                    {existingNote && (
                        <button
                            onClick={handleDelete}
                            disabled={isSaving}
                            className="px-4 py-2 bg-red-100 text-red-700 border-2 border-red-300 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                            Delete
                        </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 bg-white border-2 border-slate-300 rounded-lg text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !text.trim()}
                            className={`px-4 py-2 ${selectedColorStyle?.bg} ${selectedColorStyle?.text} border-2 ${selectedColorStyle?.border} rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
                        >
                            {isSaving ? 'Saving...' : existingNote ? 'Update' : 'Save Note'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
