'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IcSpark, IcSend, IcMin, IcPlay } from '@/components/DesktopIcons';
import { useAuth } from '@/lib/authContext';

interface CoachAction {
  category: string;
  label: string;
  description: string;
}

interface ChatMessage {
  id: number;
  role: 'ai' | 'user';
  text: string;
  action?: CoachAction;
}

const ACCENT = '#EF5A3A';
const ACCENT_SOFT = 'rgba(239,90,58,0.12)';

export default function FloatingCoach() {
  const { user } = useAuth();
  const isPremium = user?.isPremium ?? false;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: 0, role: 'ai', text: 'Hej! Jeg er din personlige trommelærer.\n\nHvordan gik øvningen sidst — og hvad vil du arbejde med i dag?' },
  ]);
  const msgIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const send = async () => {
    if (!input.trim()) return;
    if (!isPremium && msgs.filter(m => m.role === 'user').length >= 2) return;
    const q = input.trim();
    setInput('');
    const userMsg: ChatMessage = { id: msgIdRef.current++, role: 'user', text: q };
    setMsgs(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const history = [...msgs, userMsg].slice(-12).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));
      const res = await fetch('https://us-central1-gen-lang-client-0782413722.cloudfunctions.net/kaldDeepSeek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTyping(false);
      setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'ai', text: data.message, action: data.action }]);
    } catch {
      setTyping(false);
      setMsgs(prev => [...prev, { id: msgIdRef.current++, role: 'ai', text: 'Beklager, der opstod en fejl. Prøv igen.' }]);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Åbn AI Coach"
        style={{
          position: 'fixed', bottom: 28, right: 24, zIndex: 9999,
          width: 52, height: 52, borderRadius: '50%',
          background: ACCENT, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(239,90,58,0.45)',
        }}
      >
        <IcSpark size={22} color="#fff" />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      width: 340, height: 480, borderRadius: 16,
      background: '#111', border: '1px solid #2a2a2a',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <IcSpark size={15} color={ACCENT} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>AI Coach</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, background: ACCENT_SOFT, padding: '2px 7px', borderRadius: 999 }}>PRO</span>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: 4 }}>
          <IcMin size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '9px 13px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? ACCENT : '#1e1e1e',
              color: '#fff',
              border: m.role === 'user' ? 'none' : '1px solid #2a2a2a',
              fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre-wrap',
            }}>
              {m.text}
            </div>
            {m.role === 'ai' && m.action && (
              <button
                style={{
                  marginTop: 6, maxWidth: '82%', width: '100%', padding: '8px 12px',
                  borderRadius: 10, background: ACCENT_SOFT,
                  border: `1px solid ${ACCENT}40`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'system-ui, sans-serif', textAlign: 'left',
                }}
              >
                <IcPlay size={12} color={ACCENT} />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: ACCENT }}>{m.action.label}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{m.action.description}</div>
                </div>
              </button>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 4, padding: '9px 13px', background: '#1e1e1e', borderRadius: 14, width: 'fit-content', border: '1px solid #2a2a2a' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#666', animation: `dotPulse 0.8s ${i * 0.2}s infinite ease-in-out` }} />
            ))}
          </div>
        )}
      </div>

      {/* Chips */}
      <div style={{ padding: '6px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Timing-tip', 'Fills til begyndere', 'Ghost notes'].map(chip => (
          <button key={chip} onClick={() => setInput(chip)} style={{
            padding: '4px 10px', borderRadius: 999, background: '#1e1e1e',
            border: '1px solid #2a2a2a', fontSize: 11, color: '#888',
            cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
          }}>{chip}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 12px 14px', borderTop: '1px solid #2a2a2a' }}>
        {!isPremium && msgs.filter(m => m.role === 'user').length >= 2 && (
          <div style={{ marginBottom: 8, padding: '7px 11px', background: ACCENT_SOFT, borderRadius: 8, fontSize: 11, color: ACCENT }}>
            Opgrader til Premium for ubegrænset AI Coach adgang.
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Spørg din coach…"
            style={{
              flex: 1, background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 10,
              padding: '8px 12px', color: '#fff', fontFamily: 'system-ui, sans-serif',
              fontSize: 12.5, outline: 'none',
            }}
          />
          <button onClick={send} style={{
            width: 36, height: 36, borderRadius: 10, background: ACCENT, border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239,90,58,0.3)',
          }}>
            <IcSend size={15} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
