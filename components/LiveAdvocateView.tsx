import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type, FunctionDeclaration } from '@google/genai';
import { EvidenceItem } from '../types';

interface LiveAdvocateViewProps {
  evidence: EvidenceItem[];
}

interface Insight {
  id: string;
  timestamp: Date;
  type: 'CONTRADICTION' | 'SUGGESTION' | 'TRANSCRIPT';
  text: string;
}

export const LiveAdvocateView: React.FC<LiveAdvocateViewProps> = ({ evidence }) => {
  const [isActive, setIsActive] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'LISTENING' | 'ERROR'>('IDLE');
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(24).fill(0));
  
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Helper: Base64 Decoding
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Helper: Audio Data Decoding
  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  // Helper: Base64 Encoding
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const stopLive = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.input.close();
      audioContextRef.current.output.close();
      audioContextRef.current = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsActive(false);
    setStatus('IDLE');
    setVisualizerData(new Array(24).fill(0));
  };

  const startLive = async () => {
    setStatus('CONNECTING');
    setIsActive(true);
    
    try {
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputAudioContext, output: outputAudioContext };

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const queryTruthSpineTool: FunctionDeclaration = {
        name: 'queryTruthSpine',
        parameters: {
          type: Type.OBJECT,
          description: 'Search through the Truth Spine evidence records for specific keywords or dates to check for inconsistencies.',
          properties: {
            query: { type: Type.STRING, description: 'The search term or topic to look up in the evidence database.' }
          },
          required: ['query']
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('LISTENING');
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            // Visualizer logic for that "Courtroom Monitor" vibe
            const analyzer = inputAudioContext.createAnalyser();
            analyzer.fftSize = 64;
            source.connect(analyzer);
            const dataArray = new Uint8Array(analyzer.frequencyBinCount);
            
            const updateVisualizer = () => {
              analyzer.getByteFrequencyData(dataArray);
              const scaled = Array.from(dataArray.slice(0, 24)).map(v => v / 255);
              setVisualizerData(scaled);
              animationRef.current = requestAnimationFrame(updateVisualizer);
            };
            updateVisualizer();

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.outputTranscription) {
               const text = message.serverContent.outputTranscription.text;
               setInsights(prev => [...prev.slice(-100), {
                 id: Math.random().toString(),
                 timestamp: new Date(),
                 type: 'TRANSCRIPT',
                 text
               }]);
            }

            // Handle Tool Calls (Querying the "Truth Spine")
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'queryTruthSpine') {
                  const q = (fc.args as any).query.toLowerCase();
                  const results = evidence.filter(e => 
                    e.content.toLowerCase().includes(q) || 
                    e.sender.toLowerCase().includes(q)
                  );
                  const resultStr = results.length > 0 
                    ? `Found ${results.length} matches in Truth Spine: ` + results.map(r => `[${new Date(r.timestamp).toLocaleDateString()}] ${r.sender}: ${r.content}`).join('; ')
                    : "No matching records found in the Truth Spine for this claim.";
                  
                  sessionPromise.then(session => session.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: resultStr } }
                  }));

                  setInsights(prev => [...prev, {
                    id: Math.random().toString(),
                    timestamp: new Date(),
                    type: 'CONTRADICTION',
                    text: `Audit Pulse: Cross-referencing claim against record for "${q}"... Result: ${results.length} findings.`
                  }]);
                }
              }
            }

            // Handle Audio Output (Whispering Advice)
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Advocate Error:", e);
            setStatus('ERROR');
          },
          onclose: () => {
            setStatus('IDLE');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          tools: [{ functionDeclarations: [queryTruthSpineTool] }],
          systemInstruction: `
            You are the "Live Advocate Monitor", a silent AI strategist for a pro se litigant.
            You are monitoring live courtroom proceedings via the TruthTrack™ engine.
            
            YOUR CORE DIRECTIVE:
            1. SILENT AUDIT: Listen to statements from opposing counsel or witnesses.
            2. TRUTH CROSS-CHECK: Use 'queryTruthSpine' immediately if a statement contradicts known facts.
            3. WHISPERED REBUTTAL: If a contradiction is found, speak softly (audio) with the date and exhibit code.
            4. PATTERN DETECTION: Identify attempts to "Status Quo Harden" or "Deny Tools."
            5. TONE: Clinical, professional, discreet, forensic.
          `
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setIsActive(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn bg-[#0f172a] overflow-hidden text-white">
      {/* Courtroom Monitor HUD */}
      <div className="p-8 border-b border-white/5 relative bg-[#0f172a] shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
             <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
           </svg>
        </div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black rounded uppercase tracking-widest border border-blue-500/30">TruthTrack™ Session: ACTIVE</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                status === 'LISTENING' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {status}
              </span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Live Advocate Monitor</h2>
            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Real-Time Forensic Surveillance & Strategic Correction</p>
          </div>
          
          <div className="flex items-center space-x-6">
            {isActive && (
              <div className="flex items-end space-x-1 h-8 px-8 border-x border-white/10">
                {visualizerData.map((val, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-blue-400 rounded-full transition-all duration-75" 
                    style={{ height: `${Math.max(15, val * 100)}%`, opacity: 0.2 + val * 0.8 }}
                  ></div>
                ))}
              </div>
            )}
            
            <button 
              onClick={isActive ? stopLive : startLive}
              className={`px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${
                isActive 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isActive ? 'Cease Surveillance' : 'Engage Monitor'}
            </button>
          </div>
        </div>
      </div>

      {/* Monitor Feed */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
        {/* Transcript Panel (Room Feed) */}
        <div className="bg-[#111827] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0f172a] px-6">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audio Stream Transcript</span>
             <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Montgomery County Courtroom Feed</span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar-dark">
            {insights.filter(i => i.type === 'TRANSCRIPT').map(insight => (
              <div key={insight.id} className="text-[13px] text-slate-400 border-l-2 border-white/10 pl-6 py-1 leading-relaxed animate-fadeIn">
                <span className="text-[9px] font-mono text-white/10 block mb-1">{insight.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                {insight.text}
              </div>
            ))}
            {insights.filter(i => i.type === 'TRANSCRIPT').length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700/50">
                <svg className="w-12 h-12 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                <p className="text-[9px] uppercase font-black tracking-widest">No Incoming Audio Signal Detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Audit Panel (Pattern Guard) */}
        <div className="bg-[#0f172a] flex flex-col overflow-hidden border-l border-white/5">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#111827] px-6">
             <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Strategic Pattern Audit</span>
             <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-black rounded uppercase">Truth Spine Shield</span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar-dark">
            {insights.filter(i => i.type !== 'TRANSCRIPT').map(insight => (
              <div 
                key={insight.id} 
                className={`p-6 rounded-2xl border-l-4 shadow-2xl animate-slideInRight ${
                  insight.type === 'CONTRADICTION' 
                  ? 'bg-red-500/5 border-red-500' 
                  : 'bg-blue-500/5 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${insight.type === 'CONTRADICTION' ? 'text-red-400' : 'text-blue-400'}`}>
                    {insight.type} Flagged
                  </span>
                  <span className="text-[8px] font-mono text-white/20">{insight.timestamp.toLocaleTimeString()}</span>
                </div>
                <p className="text-sm font-bold text-white/90 leading-relaxed">
                  {insight.text}
                </p>
              </div>
            ))}
            {insights.filter(i => i.type !== 'TRANSCRIPT').length === 0 && (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-center px-8">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 animate-pulse"></div>
                </div>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest leading-tight max-w-[220px]">
                  Listening for forensic contradictions and strategic openings...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forensic Telemetry Footer */}
      <div className="p-4 bg-[#0f172a] border-t border-white/5 flex items-center justify-between px-8">
         <div className="flex items-center space-x-6 text-slate-500">
           <div className="flex items-center space-x-2">
             <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-white/10'}`}></div>
             <span className="text-[9px] font-black uppercase tracking-widest">Tether: {isActive ? 'SECURE' : 'IDLE'}</span>
           </div>
           <span className="text-[9px] font-black uppercase tracking-widest">SHA-256 SESSION: {Math.random().toString(36).substring(7).toUpperCase()}</span>
         </div>
         <div className="text-[9px] font-mono text-white/20 uppercase">
            Advocate Engine: 2.5-FLASH-NATIVE-AUDIO • COURTROOM MODE
         </div>
      </div>
    </div>
  );
};
