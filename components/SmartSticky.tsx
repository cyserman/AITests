
import React, { useState, useEffect, useRef } from 'react';
import { StickyNote } from '../types';

interface SmartStickyProps extends StickyNote {
  onUpdate: (note: StickyNote) => void;
  onDelete: (id: string) => void;
}

export const SmartSticky: React.FC<SmartStickyProps> = ({ id, text, x, y, onUpdate, onDelete }) => {
  const [isListening, setIsListening] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const [localText, setLocalText] = useState(text);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setLocalText(prev => prev + ' ' + transcript);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;
    
    const onMouseMove = (ev: MouseEvent) => {
      const newPos = { x: ev.clientX - startX, y: ev.clientY - startY };
      setPosition(newPos);
      onUpdate({ id, text: localText, ...newPos });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div 
      className="fixed z-[9999] bg-yellow-200 border-2 border-yellow-400 rounded-lg shadow-2xl p-3 w-64 group"
      style={{ left: position.x, top: position.y }}
    >
      <div 
        className="cursor-move border-b border-yellow-300 pb-2 mb-2 flex justify-between items-center"
        onMouseDown={handleMouseDown}
      >
        <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-tighter">Draft Note</span>
        <button onClick={() => onDelete(id)} className="text-yellow-600 hover:text-red-600">×</button>
      </div>
      <textarea
        className="w-full h-24 bg-transparent text-sm text-yellow-900 resize-none focus:outline-none placeholder-yellow-600/50"
        value={localText}
        onChange={(e) => {
          setLocalText(e.target.value);
          onUpdate({ id, text: e.target.value, ...position });
        }}
        placeholder="Type or speak..."
      />
      <div className="flex justify-between items-center mt-2">
        <button 
          onClick={toggleListening}
          className={`p-1.5 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-400 text-yellow-800'}`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
            <path d="M5 9a1 1 0 00-2 0v1a7 7 0 0014 0V9a1 1 0 10-2 0v1a5 5 0 01-10 0V9z" />
          </svg>
        </button>
        <span className="text-[9px] text-yellow-600 italic">Draggable Note</span>
      </div>
    </div>
  );
};
