'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2, User, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Property } from '@/types';

interface Message { role: 'user' | 'assistant'; content: string }
interface Props { property?: Property; floating?: boolean }

export function AIAssistant({ property, floating = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Salam! Mən sizin AI əmlak köməkçinizəm${property ? ` — **${property.title}** üçün` : ''}. İstənilən sualı verin: qiymət, məhəllə, müqayisəli evlər və ya investisiya mövzusunda!` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!floating);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = property
        ? `Əmlak: ${property.title}, ${property.bedrooms} otaqlı/${property.bathrooms} hamamlı, ${property.squareFeet} kv.fut, ${property.price.toLocaleString()} ₼, ${property.city}, Azərbaycan`
        : undefined;

      const { data } = await api.post('/ai/chat', {
        messages: [...messages, userMsg].slice(-10),
        propertyContext: context,
      });
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Bağlantı xətası baş verdi. Zəhmət olmasa yenidən cəhd edin.' }]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK = property
    ? ['Bu ev yaxşı investisiyadırmı?', 'Yaxın evlərlə müqayisə et', 'Əmlak vergisi nə qədərdir?', 'Məhəllə haqqında məlumat ver']
    : ['500.000 ₼-dən ucuz ev tap', 'Bakıda ən yaxşı məhəllələr', 'İpoteka necə alınır?', 'Alıcı agenti nədir?'];

  const ChatPanel = () => (
    <div className="flex flex-col h-full">
      {/* Başlıq */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
          <Bot size={18} />
        </div>
        <div>
          <div className="font-semibold text-sm">AI Əmlak Köməkçisi</div>
          <div className="text-xs text-white/40 flex items-center gap-1"><Sparkles size={10} /> GPT-4o ilə işləyir</div>
        </div>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${m.role === 'assistant' ? 'bg-brand-gradient' : 'bg-white/20'}`}>
              {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'assistant' ? 'glass' : 'bg-brand-500'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center"><Bot size={14} /></div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-brand-400" />
              <span className="text-sm text-white/60">Düşünürəm...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sürətli suallar */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK.map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="text-xs glass rounded-full px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Giriş sahəsi */}
      <div className="p-4 border-t border-white/10 flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Bu əmlak haqqında soruşun..."
          className="input flex-1 py-2.5 text-sm"
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          className="btn-primary p-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );

  if (!floating) {
    return (
      <div className="card h-[500px] flex flex-col overflow-hidden">
        <ChatPanel />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-gradient rounded-full shadow-brand flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Bot size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] glass rounded-2xl overflow-hidden shadow-luxury border border-white/10"
          >
            <ChatPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
