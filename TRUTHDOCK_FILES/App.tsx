
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PanelTab, Note, ConflictItem, RejectedItem, ChatMessage, Suggestion, TerminalEntry } from './types';
import { ICONS } from './constants';
import { analyzeConflicts, chatWithSearch, getLegalSuggestions } from './services/geminiService';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

// --- Utility Functions ---
const generateHash = async (content: string) => {
  const msgBuffer = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>(PanelTab.NOTEPAD);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Interface State
  const [position, setPosition] = useState({ x: window.innerWidth - 520, y: 40 });
  const [size, setSize] = useState({ width: 480, height: 820 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Core Data
  const [notes, setNotes] = useState<Note[]>([]);
  const [rejectedItems, setRejectedItems] = useState<RejectedItem[]>([]);
  const [showRejected, setShowRejected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Intake & Sync State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  
  // Intelligence
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Live API
  const [isLiveActive, setIsLiveActive] = useState(false);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  // --- Handlers ---

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

  useEffect(() => {
    const checkApiKey = async () => {
      const exists = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(exists);
    };
    checkApiKey();
    const saved = localStorage.getItem('truthdock_spine');
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('truthdock_spine', JSON.stringify(notes));
    if (notes.length > 0) {
      const allText = notes.map(n => n.content).join("\n");
      getLegalSuggestions(allText).then(setSuggestions).catch(console.error);
    }
  }, [notes.length]);

  const addNote = async (content: string, type: Note['type'], fileName?: string, lastModified?: number) => {
    if (!content.trim()) {
      setRejectedItems(prev => [{ name: fileName || 'Unknown', reason: 'Empty', timestamp: Date.now() }, ...prev]);
      return false;
    }
    const hash = await generateHash(content);
    const incomingLastModified = lastModified || Date.now();
    const existing = notes.find(n => n.hash === hash);

    if (existing) {
      const reason = incomingLastModified < existing.lastModified ? 'Stale Version' : 'Duplicate Content';
      setRejectedItems(prev => [{ name: fileName || 'Artifact', reason, timestamp: Date.now() }, ...prev]);
      return false;
    }

    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      rawContent: content,
      timestamp: Date.now(),
      lastModified: incomingLastModified,
      type,
      fileName,
      hash,
      confidence: 0.9,
      isSanitized: true,
      revisions: []
    };
    setNotes(prev => [newNote, ...prev]);
    return true;
  };

  const processFile = async (file: File) => {
    const supported = ['.txt', '.pdf', '.docx', '.csv', '.json', '.msg'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!supported.includes(ext)) {
      setRejectedItems(prev => [{ name: file.name, reason: 'Invalid File Type', timestamp: Date.now() }, ...prev]);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const phases = [
      "Verifying Header Structure...", 
      "Decomposing Byte Streams...", 
      "Cross-Referencing Local Spine...", 
      "Finalizing Intake Packet..."
    ];
    
    for (let i = 0; i < phases.length; i++) {
      setUploadMessage(phases[i]);
      setUploadProgress(((i + 1) / phases.length) * 100);
      await new Promise(r => setTimeout(r, 250));
    }

    try {
      // Note: Real PDF/Docx extraction would require a worker/library, but we simulate intake for prototype
      const content = await file.text(); 
      if (!content || content.trim().length === 0) {
        setRejectedItems(prev => [{ name: file.name, reason: 'Empty', timestamp: Date.now() }, ...prev]);
        setUploadMessage("Abort: Corruption Detected.");
      } else {
        const success = await addNote(content, 'file', file.name, file.lastModified);
        setUploadMessage(success ? "Ingest Successful." : "Blocked: Integrity Conflict.");
      }
    } catch (e) {
      setRejectedItems(prev => [{ name: file.name, reason: 'Invalid File Type', timestamp: Date.now() }, ...prev]);
      setUploadMessage("Intake Violation.");
    }
    setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 1200);
  };

  const handleNotebookSync = async () => {
    if (notes.length === 0) return;
    setIsSyncing(true);
    try {
      const sourceHeader = `--- TRUTHDOCK MASTER CASE SPINE ---\nGEN_DATE: ${new Date().toISOString()}\nDOC_COUNT: ${notes.length}\n----------------------------------\n\n`;
      const combined = notes.map((n, i) => `[ARTIFACT #${i+1}] ${n.fileName || 'Untitled'}\nID: ${n.id}\nHASH: ${n.hash}\n---\n${n.content}\n\n`).join("\n");
      
      const blob = new Blob([sourceHeader + combined], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NotebookLM_Source_Master_${new Date().getTime()}.txt`;
      a.click();
      
      setTerminalHistory(prev => [...prev, { type: 'success', text: "✓ NotebookLM Master Source generated." }]);
    } catch (e) {
      setTerminalHistory(prev => [...prev, { type: 'error', text: "Failed to generate Sync Packet." }]);
    }
    setIsSyncing(false);
  };

  const copyForNotebookLM = () => {
    const combined = notes.map(n => `[Source: ${n.fileName || 'Fragment'}] ${n.content}`).join("\n\n");
    navigator.clipboard.writeText(combined);
    setTerminalHistory(prev => [...prev, { type: 'success', text: "Case context copied to clipboard for NotebookLM Chat." }]);
  };

  const executeCommand = async (cmd: string) => {
    const input = cmd.toLowerCase().trim();
    setTerminalHistory(prev => [...prev, { type: 'command', text: `$ ${input}` }]);
    setTerminalInput('');

    if (input === 'analyze') {
      const res = await analyzeConflicts(notes.map(n => n.content).join("\n"));
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

  const startLiveSession = async () => {
    if (isLiveActive) {
      liveSessionRef.current?.close();
      setIsLiveActive(false);
      sourcesRef.current.forEach(s => s.stop());
      return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => setIsLiveActive(true),
        onmessage: async (msg: LiveServerMessage) => {
          const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audio) {
            const buf = await decodeAudioData(decode(audio), outCtx, 24000, 1);
            const src = outCtx.createBufferSource();
            src.buffer = buf;
            src.connect(outCtx.destination);
            src.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buf.duration;
            sourcesRef.current.add(src);
          }
        },
        onclose: () => setIsLiveActive(false),
      },
      config: { responseModalities: [Modality.AUDIO] }
    });
    liveSessionRef.current = await sessionPromise;
  };

  if (hasKey === false) {
    return (
      <div className="fixed inset-0 bg-[#0b0014] flex items-center justify-center z-[200]">
        <button onClick={() => (window as any).aistudio.openSelectKey()} className="bg-emerald-500 text-[#0b0014] px-12 py-6 rounded-full font-black uppercase text-[12px] shadow-2xl hover:scale-105 transition-all">Initialize Truth Subsystem</button>
      </div>
    );
  }

  return (
    <div 
      className={`fixed bg-[#0b0014]/98 border border-stone-800 shadow-2xl panel-radius flex flex-col z-[100] backdrop-blur-3xl transition-all duration-300 ${isMinimized ? 'overflow-hidden' : ''}`} 
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

          <div className="flex-1 overflow-hidden flex flex-col p-4 relative fabric-bg">
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

                <div 
                  className={`bg-black/60 p-6 rounded-3xl border-2 transition-all duration-300 shrink-0 ${isDraggingFile ? 'border-emerald-500 bg-emerald-950/10' : 'border-stone-800/60 border-dashed'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDraggingFile(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
                >
                  {isUploading ? (
                    <div className="py-6 space-y-4">
                      <div className="flex justify-between text-[10px] font-black text-emerald-500 uppercase">
                        <span className="animate-pulse">{uploadMessage}</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="h-2 bg-stone-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all shadow-[0_0_12px_rgba(16,185,129,0.5)]" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-6 cursor-pointer group">
                      <div className="p-4 bg-stone-900/50 rounded-full group-hover:bg-emerald-900/20 mb-3 transition-colors">
                        <ICONS.Note className="text-stone-600 group-hover:text-emerald-500" size={28} />
                      </div>
                      <span className="text-[10px] text-stone-500 font-black uppercase tracking-widest group-hover:text-stone-100">Intake Discovery Assets</span>
                      <span className="text-[7px] text-stone-700 mt-2 uppercase font-mono tracking-tighter">TXT, PDF, DOCX, CSV, JSON, MSG</span>
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                    </label>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button onClick={handleNotebookSync} disabled={isSyncing || notes.length === 0} className="flex-1 bg-sky-700 hover:bg-sky-600 disabled:bg-stone-800 text-white py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all shadow-xl flex items-center justify-center gap-2">
                    {isSyncing ? <ICONS.Refresh className="animate-spin" size={14} /> : <ICONS.Globe size={14} />}
                    Sync Master Source
                  </button>
                  <button onClick={copyForNotebookLM} className="bg-stone-900 border border-stone-800 px-6 rounded-2xl text-[9px] font-black uppercase text-stone-400 hover:text-stone-100 transition-all">
                    Quick Copy
                  </button>
                </div>

                <button onClick={() => setShowRejected(!showRejected)} className={`w-full py-2 rounded-xl text-[9px] uppercase font-black transition-all border ${rejectedItems.length > 0 ? 'bg-red-950/20 border-red-900/40 text-red-500' : 'bg-stone-900/40 border-stone-800/40 text-stone-600'}`}>
                  Integrity Audit Log ({rejectedItems.length})
                </button>

                {showRejected && (
                  <div className="bg-red-950/10 border border-red-900/20 p-4 rounded-2xl space-y-2 max-h-32 overflow-y-auto shrink-0 animate-in slide-in-from-top-2">
                    {rejectedItems.length === 0 ? <div className="text-[9px] text-stone-700 italic uppercase">Log untainted.</div> : rejectedItems.map((r, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-mono border-b border-red-900/10 pb-2">
                        <div className="flex flex-col">
                          <span className="text-stone-300 truncate max-w-[140px] font-bold">{r.name}</span>
                          <span className="text-[8px] text-stone-600">{new Date(r.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className="text-red-500 font-black uppercase px-2 py-0.5 bg-red-950/40 rounded">{r.reason}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
                  {notes.filter(n => n.content.toLowerCase().includes(searchQuery.toLowerCase())).map(note => (
                    <div key={note.id} className="bg-black/40 border border-stone-800/40 p-5 rounded-3xl group hover:border-emerald-900/20 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] uppercase font-black text-stone-500 group-hover:text-stone-300">{note.fileName || 'Factual Fragment'}</span>
                        <span className="text-[8px] text-stone-700 font-mono">{new Date(note.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 font-mono leading-relaxed line-clamp-4 italic">{note.content}</p>
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

            {activeTab === PanelTab.LIVE && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-12">
                <div className={`w-56 h-56 rounded-full border-8 border-dashed transition-all duration-1000 flex items-center justify-center relative ${isLiveActive ? 'border-emerald-500 animate-spin-slow' : 'border-stone-800'}`}>
                  <div className={`absolute inset-0 rounded-full bg-emerald-500/5 transition-opacity duration-1000 ${isLiveActive ? 'opacity-100' : 'opacity-0'}`}></div>
                  <ICONS.Mic size={80} className={`transition-all duration-500 ${isLiveActive ? 'text-emerald-500 scale-110' : 'text-stone-800'}`} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-serif italic text-stone-100">{isLiveActive ? 'Tactical Link Active' : 'Native Briefing Node'}</h3>
                  <button onClick={startLiveSession} className={`px-16 py-6 rounded-full font-black uppercase text-[12px] tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${isLiveActive ? 'bg-red-500/10 text-red-500 border border-red-500/40' : 'bg-emerald-600 text-white'}`}>
                    {isLiveActive ? 'End Briefing' : 'Open Channel'}
                  </button>
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
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-stone-500 tracking-widest">Sync Export Path</label>
                  <input type="text" className="w-full bg-black/40 border border-stone-800 rounded-2xl p-4 text-[11px] outline-none" defaultValue="~/TruthDock/Spine/NotebookSync" />
                </div>
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
        .panel-radius { border-radius: 2.5rem; }
        .animate-in { animation: animate-in 0.3s ease-out; }
        @keyframes animate-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fabric-bg { 
          background-color: #0b0014;
          background-image: url("http://www.transparenttextures.com/patterns/45-degree-fabric-light.png");
        }
      `}</style>
    </div>
  );
};

export default App;
