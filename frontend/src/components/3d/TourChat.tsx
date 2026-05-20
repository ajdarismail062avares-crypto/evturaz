'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

interface ChatMessage { userId: string; name: string; message: string; timestamp: string; }
interface Props { messages: ChatMessage[]; onSend: (msg: string) => void; onClose: () => void; }

export function TourChat({ messages, onSend, onClose }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="absolute bottom-20 right-4 w-80 h-96 glass rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-luxury z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="font-semibold text-sm">Tur Söhbəti</span>
        <button onClick={onClose} className="text-white/50 hover:text-white"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="font-semibold text-brand-300">{m.name}: </span>
            <span className="text-white/80">{m.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Nəsə yazın..." className="input flex-1 py-2 text-sm"
        />
        <button onClick={send} className="btn-primary p-2.5"><Send size={16} /></button>
      </div>
    </div>
  );
}
