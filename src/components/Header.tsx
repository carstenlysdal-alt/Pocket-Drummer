'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

const SNARE_RED = '#F25545';
const BG = 'rgba(10,10,10,0.82)';
const BORDER = 'rgba(255,255,255,0.07)';
const TEXT_PRIMARY = '#FAF8F5';
const TEXT_MUTED = '#8a8580';
const SURFACE_RAISED = '#1c1c1f';

function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `rgba(242,85,69,0.18)`,
      border: `1px solid rgba(242,85,69,0.35)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: SNARE_RED,
      fontFamily: 'Inter, system-ui, sans-serif',
      flexShrink: 0,
      userSelect: 'none',
    }}>{initials}</div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDashboard = pathname === '/dashboard';

  return (
    <>
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: BG,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${BORDER}`,
      padding: '0 2rem',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        textDecoration: 'none',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="10" ry="6" stroke={SNARE_RED} strokeWidth="1.8"/>
          <ellipse cx="12" cy="12" rx="5" ry="2.8" stroke={SNARE_RED} strokeWidth="1.6"/>
          <line x1="12" y1="6" x2="12" y2="18" stroke={SNARE_RED} strokeWidth="1.4"/>
          <line x1="2" y1="12" x2="22" y2="12" stroke={SNARE_RED} strokeWidth="1.4"/>
        </svg>
        <span style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          fontSize: '1.05rem',
          letterSpacing: '-0.02em',
          color: TEXT_PRIMARY,
        }}>
          Pocket Drummer<span style={{ color: SNARE_RED }}>.</span>
        </span>
      </Link>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          href="/dashboard"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '0.875rem',
            fontWeight: isDashboard ? 600 : 450,
            color: isDashboard ? TEXT_PRIMARY : TEXT_MUTED,
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            background: isDashboard ? 'rgba(255,255,255,0.05)' : 'transparent',
            transition: 'color 0.15s, background 0.15s',
          }}
        >
          Mit Dashboard
        </Link>
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: TEXT_MUTED,
              textDecoration: 'none',
              padding: '4px 10px',
              borderRadius: 6,
              border: `1px solid rgba(255,255,255,0.08)`,
              letterSpacing: '0.04em',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            Admin
          </Link>
        )}
      </nav>

      {/* Auth */}
      {loading ? (
        <div style={{ width: 80, height: 32, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : user ? (
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: menuOpen ? SURFACE_RAISED : 'transparent',
              border: `1px solid ${menuOpen ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
              borderRadius: 9999,
              padding: '4px 10px 4px 4px',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <Avatar name={user.displayName || user.email} />
            <span style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: TEXT_PRIMARY,
              maxWidth: 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user.displayName?.split(' ')[0] || user.email.split('@')[0]}
            </span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{
              transform: menuOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
              flexShrink: 0,
            }}>
              <path d="M1 1l4 4 4-4" stroke={TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: '#161618',
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 12,
              padding: '6px',
              minWidth: 160,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 200,
            }}>
              <div style={{
                padding: '8px 10px 10px',
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
                marginBottom: 4,
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: TEXT_PRIMARY }}>
                  {user.displayName || user.email.split('@')[0]}
                </div>
                <div style={{ fontSize: '0.7rem', color: TEXT_MUTED, marginTop: 2 }}>
                  {user.email}
                </div>
                {user.isPremium && (
                  <div style={{
                    marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(93,211,158,0.12)', borderRadius: 9999,
                    padding: '2px 8px',
                    fontSize: '0.65rem', fontWeight: 700, color: '#5dd39e',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    Premium
                  </div>
                )}
              </div>
              <button
                onClick={async () => { setMenuOpen(false); await logout(); }}
                style={{
                  width: '100%', textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  color: TEXT_MUTED,
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.target as HTMLButtonElement).style.color = TEXT_PRIMARY;
                }}
                onMouseLeave={e => {
                  (e.target as HTMLButtonElement).style.background = 'transparent';
                  (e.target as HTMLButtonElement).style.color = TEXT_MUTED;
                }}
              >
                Log ud
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/login" style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 450,
            color: TEXT_MUTED,
            textDecoration: 'none',
            padding: '7px 14px',
            borderRadius: 9999,
            transition: 'color 0.15s',
          }}>
            Log ind
          </Link>
          <Link href="/onboarding" style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#fff',
            textDecoration: 'none',
            padding: '7px 16px',
            borderRadius: 9999,
            background: SNARE_RED,
            letterSpacing: '0.02em',
            boxShadow: '0 4px 14px rgba(242,85,69,0.28)',
            transition: 'background 0.15s, box-shadow 0.15s',
          }}>
            Prøv gratis
          </Link>
        </div>
      )}
    </header>
    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </>
  );
}
