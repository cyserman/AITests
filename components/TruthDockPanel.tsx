import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, SpineItem } from '../lib/spine-db';
import { analyzeConflicts, chatWithSearch, getLegalSuggestions, ConflictItem, Suggestion } from '../services/geminiService';
import { generateNotebookLMSource, downloadNotebookLMSource } from '../lib/data-export';

// Import icons from TRUTHDOCK_FILES
import { ICONS } from '../TRUTHDOCK_FILES/constants';

enum PanelTab {
    NOTEPAD = 'NOTEPAD',
    CHAT = 'CHAT',
    LIVE = 'LIVE',
    CONFLICT = 'CONFLICT',
    SETTINGS = 'SETTINGS',
    TERMINAL = 'TERMINAL'
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    urls?: { uri: string; title: string }[];
}

interface TerminalEntry {
    type: 'command' | 'output' | 'error' | 'success';
    text: string;
}

interface TruthDockPanelProps {
    isOpen: boolean;
    onClose: () => void;
    evidence?: any[]; // Evidence from main app
}

export const TruthDockPanel: React.FC<TruthDockPanelProps> = ({ isOpen, onClose, evidence = [] }) => {
    const [activeTab, setActiveTab] = useState<PanelTab>(PanelTab.NOTEPAD);
    const [isMinimized, setIsMinimized] = useState(false);

    // Interface State
    const [position, setPosition] = useState({ x: window.innerWidth - 520, y: 40 });
    const [size, setSize] = useState({ width: 480, height: 820 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Core Data - now from database
    const [spineItems, setSpineItems] = useState<SpineItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Intelligence
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Drag/resize handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, input, textarea, a, label')) return;
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
        if (isResizing) setSize({ width: Math.max(320, e.clientX - position.x), height: Math.max(480, e.clientY - position.y) });
    }, [isDragging, isResizing, dragOffset, position]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Load spine items from database AND sync from main app evidence
    useEffect(() => {
        if (isOpen) {
            loadSpineItems();
            // Sync evidence from main app to database
            if (evidence && evidence.length > 0) {
                syncEvidenceToDatabase();
            }
        }
    }, [isOpen, evidence]);

    const syncEvidenceToDatabase = async () => {
        try {
            // Only sync if there's evidence to sync
            if (!evidence || evidence.length === 0) return;

            for (const item of evidence) {
                // Check if item already exists by hash
                const existing = await db.spine.where('hash').equals(item.hash).first();
                if (!existing) {
                    // Only add if it doesn't exist - never overwrite user data
                    await db.spine.add({
                        fileName: item.exhibitCode || item.sender,
                        contentOriginal: item.content,
                        contentNeutral: item.contentNeutral,
                        hash: item.hash,
                        timestamp: new Date(item.timestamp).getTime(),
                        verified: item.verified
                    });
                }
            }
            // Reload to show updated list
            loadSpineItems();
        } catch (e) {
            console.error('Failed to sync evidence to TruthDock:', e);
        }
    };

    const loadSpineItems = async () => {
        const items = await db.spine.toArray();
        setSpineItems(items);

        if (items.length > 0) {
            const allText = items.map(n => n.contentOriginal).join("\n");
            getLegalSuggestions(allText).then(setSuggestions).catch(console.error);
        }
    };

    const handleNotebookSync = async () => {
        setIsSyncing(true);
        try {
            const content = await generateNotebookLMSource();
            downloadNotebookLMSource(content);
            setTerminalHistory(prev => [...prev, { type: 'success', text: "✓ NotebookLM Master Source generated." }]);
        } catch (e) {
            setTerminalHistory(prev => [...prev, { type: 'error', text: "Failed to generate Sync Packet." }]);
        }
        setIsSyncing(false);
    };

    const copyForNotebookLM = () => {
        const combined = spineItems.map(n => `[Source: ${n.fileName || 'Fragment'}] ${n.contentOriginal}`).join("\n\n");
        navigator.clipboard.writeText(combined);
        setTerminalHistory(prev => [...prev, { type: 'success', text: "Case context copied to clipboard for NotebookLM Chat." }]);
    };

    const executeCommand = async (cmd: string) => {
        const input = cmd.toLowerCase().trim();
        setTerminalHistory(prev => [...prev, { type: 'command', text: `$ ${input}` }]);
        setTerminalInput('');

        if (input === 'analyze') {
            const res = await analyzeConflicts(spineItems.map(n => n.contentOriginal).join("\n"));
            setConflicts(res);
            setActiveTab(PanelTab.CONFLICT);
        } else if (input === 'sync' || input === 'notebooklm') {
            handleNotebookSync();
        } else if (input === 'clear') {
            setTerminalHistory([]);
        } else if (input === 'help') {
            setTerminalHistory(prev => [...prev, { type: 'output', text: "Directives: analyze, sync, copy, clear, help" }]);
        } else if (input === 'copy') {
            copyForNotebookLM();
        } else {
            setTerminalHistory(prev => [...prev, { type: 'error', text: "Instruction unrecognized." }]);
        }
    };

    const handleChat = async () => {
        if (!chatInput.trim() || isChatLoading) return;
        const msg: ChatMessage = { role: 'user', text: chatInput };
        setChatMessages(prev => [...prev, msg]);
        setChatInput('');
        setIsChatLoading(true);
        try {
            const hist = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
            const res = await chatWithSearch(chatInput, hist);
            setChatMessages(prev => [...prev, { role: 'model', text: res.text, urls: res.urls }]);
        } catch (e) { console.error(e); }
        setIsChatLoading(false);
    };

    if (!isOpen) return null;

    const filteredItems = spineItems.filter(item =>
        item.contentOriginal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.fileName && item.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div
            className={`fixed bg-[#0b0014]/98 border border-stone-800 shadow-2xl rounded-[2.5rem] flex flex-col z-[100] backdrop-blur-3xl transition-all duration-300 ${isMinimized ? 'overflow-hidden' : ''}`}
            style={{ left: position.x, top: position.y, width: isMinimized ? '280px' : `${size.width}px`, height: isMinimized ? '48px' : `${size.height}px` }}
            onMouseDown={handleMouseDown}
        >
            <div className="flex items-center justify-between p-4 bg-stone-900/40 border-b border-stone-800/40 cursor-move">
                <div className="flex items-center gap-3">
                    <ICONS.Shield className="text-emerald-500" size={16} />
                    <span className="text-[11px] uppercase font-black tracking-widest text-stone-200">TruthDock™ Tactical</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="text-stone-500 hover:text-white transition-colors">
                        {isMinimized ? <ICONS.History size={16} /> : <ICONS.Minimize size={18} />}
                    </button>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <ICONS.Close size={18} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="bg-black/20 border-b border-stone-800/40 flex p-3 gap-1 overflow-x-auto no-scrollbar">
                        {Object.values(PanelTab).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-[9px] uppercase font-black tracking-widest rounded-full transition-all ${activeTab === tab ? 'bg-stone-100 text-[#0b0014]' : 'text-stone-500 hover:text-stone-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col p-4 relative" style={{ backgroundColor: '#0b0014', backgroundImage: 'url("http://www.transparenttextures.com/patterns/45-degree-fabric-light.png")' }}>
                        {activeTab === PanelTab.NOTEPAD && (
                            <div className="flex-1 flex flex-col gap-4 overflow-hidden">

                                {suggestions.length > 0 && (
                                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-3xl p-3 flex flex-col gap-2 shrink-0">
                                        <div className="flex items-center gap-2 px-1">
                                            <ICONS.Spark className="text-emerald-500" size={12} />
                                            <span className="text-[8px] uppercase font-black text-emerald-500/80">Spine Intelligence Brief</span>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                            {suggestions.map(s => (
                                                <div key={s.id} className="shrink-0 p-3 rounded-2xl border bg-black/40 border-emerald-800/20 text-[10px] font-mono italic text-emerald-400 max-w-[180px]">
                                                    {s.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 shrink-0">
                                    <button onClick={handleNotebookSync} disabled={isSyncing || spineItems.length === 0} className="flex-1 bg-sky-700 hover:bg-sky-600 disabled:bg-stone-800 text-white py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all shadow-xl flex items-center justify-center gap-2">
                                        {isSyncing ? <ICONS.Refresh className="animate-spin" size={14} /> : <ICONS.Globe size={14} />}
                                        Sync Master Source
                                    </button>
                                    <button onClick={copyForNotebookLM} className="bg-stone-900 border border-stone-800 px-6 rounded-2xl text-[9px] font-black uppercase text-stone-400 hover:text-stone-100 transition-all">
                                        Quick Copy
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
                                    {filteredItems.map(item => (
                                        <div key={item.id} className="bg-black/40 border border-stone-800/40 p-5 rounded-3xl group hover:border-emerald-900/20 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[9px] uppercase font-black text-stone-500 group-hover:text-stone-300">{item.fileName || 'Factual Fragment'}</span>
                                                <span className="text-[8px] text-stone-700 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[11px] text-stone-400 font-mono leading-relaxed line-clamp-4 italic">{item.contentOriginal}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === PanelTab.TERMINAL && (
                            <div className="flex-1 flex flex-col bg-black/80 p-6 font-mono text-emerald-500 rounded-3xl shadow-inner border border-stone-800/40">
                                <div className="flex-1 overflow-y-auto text-[11px] space-y-2 no-scrollbar">
                                    <div className="text-stone-700 text-[9px] mb-4 uppercase tracking-[0.2em]">Truth Subsystem [Ver 3.1.5]</div>
                                    {terminalHistory.map((h, i) => (
                                        <div key={i} className={`animate-in fade-in slide-in-from-left-2 ${h.type === 'command' ? 'text-emerald-300' : h.type === 'error' ? 'text-red-500' : h.type === 'success' ? 'text-sky-400' : 'text-stone-500'}`}>
                                            {h.text}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 border-t border-stone-800 pt-4 mt-4 items-center">
                                    <span className="text-emerald-600 font-black">$</span>
                                    <input type="text" value={terminalInput} onChange={e => setTerminalInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && executeCommand(terminalInput)} className="bg-transparent outline-none flex-1 text-[12px] placeholder:text-stone-900" placeholder="analyze | sync | help" />
                                </div>
                            </div>
                        )}

                        {activeTab === PanelTab.CHAT && (
                            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                                <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
                                    {chatMessages.map((m, i) => (
                                        <div key={i} className={`p-5 rounded-3xl text-[12px] max-w-[92%] font-mono leading-relaxed shadow-lg animate-in fade-in ${m.role === 'user' ? 'bg-stone-800 self-end ml-auto text-stone-200' : 'bg-black border border-stone-800 text-stone-400'}`}>
                                            {m.text}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {m.urls?.map((u, ui) => <a key={ui} href={u.uri} target="_blank" className="text-[9px] uppercase font-black px-3 py-1.5 bg-stone-900 text-emerald-500/60 rounded-full border border-stone-800">Source</a>)}
                                            </div>
                                        </div>
                                    ))}
                                    {isChatLoading && <div className="text-[10px] uppercase text-emerald-500/40 animate-pulse font-black px-4">Parsing Spine Inconsistencies...</div>}
                                </div>
                                <div className="flex gap-2 bg-black/40 p-2 rounded-3xl border border-stone-800/40">
                                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} className="flex-1 bg-transparent px-4 py-3 text-[12px] outline-none" placeholder="Query Intelligence Layer..." />
                                    <button onClick={handleChat} className="bg-stone-100 text-[#0b0014] px-6 rounded-2xl font-black uppercase text-[10px] active:scale-95 transition-all">Send</button>
                                </div>
                            </div>
                        )}

                        {activeTab === PanelTab.CONFLICT && (
                            <div className="flex-1 overflow-y-auto space-y-5 pr-1 no-scrollbar">
                                {conflicts.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-stone-700 uppercase font-black text-[10px] gap-6 opacity-40">
                                        <ICONS.Warning size={40} />
                                        <span>Inconsistencies Null</span>
                                    </div>
                                ) : conflicts.map(c => (
                                    <div key={c.id} className={`p-6 rounded-3xl border shadow-xl animate-in slide-in-from-bottom-2 ${c.severity === 'high' ? 'bg-red-950/10 border-red-900/40' : 'bg-black border-stone-800'}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className={`text-[8px] uppercase font-black px-3 py-1 rounded-full ${c.severity === 'high' ? 'bg-red-600 text-white shadow-lg' : 'bg-stone-800 text-stone-400'}`}>{c.severity} Severity</span>
                                            <ICONS.Warning size={14} className={c.severity === 'high' ? 'text-red-500' : 'text-stone-600'} />
                                        </div>
                                        <div className="space-y-3 font-mono text-[10px]">
                                            <div className="p-3 bg-stone-900/20 rounded-xl"><span className="text-stone-600 mr-2 font-bold">A:</span>{c.statementA}</div>
                                            <div className="p-3 bg-stone-900/20 rounded-xl"><span className="text-stone-600 mr-2 font-bold">B:</span>{c.statementB}</div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-stone-800/40 text-[10px] italic text-emerald-500/80 leading-relaxed font-serif">
                                            {c.analysis}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === PanelTab.SETTINGS && (
                            <div className="flex-1 space-y-8 p-4 overflow-y-auto no-scrollbar">
                                <h3 className="text-xl font-serif italic text-stone-100 border-b border-stone-800/40 pb-4">Tactical Configuration</h3>
                                <div className="p-6 bg-stone-900/20 rounded-3xl border border-stone-800 text-[10px] text-stone-700 uppercase tracking-widest text-center italic">
                                    TruthDock Subsystem // Sync Node v3.1.5
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="absolute bottom-2 right-2 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 hover:text-emerald-500 transition-colors"
                        onMouseDown={(e) => { e.stopPropagation(); setIsResizing(true); }}
                    >
                        <ICONS.Minimize size={14} className="opacity-20 rotate-180" />
                    </div>
                </>
            )}

            <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-in { animation: animate-in 0.3s ease-out; }
        @keyframes animate-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};
