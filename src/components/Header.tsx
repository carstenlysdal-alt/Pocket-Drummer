'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drum, Award, User } from 'lucide-react';
import { getPremiumStatus } from '@/lib/mockData';

export default function Header() {
  const pathname = usePathname();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Update state asynchronously after hydration to avoid cascading renders
    const timer = setTimeout(() => {
      setIsPremium(getPremiumStatus());
    }, 0);
    
    const interval = setInterval(() => {
      setIsPremium(getPremiumStatus());
    }, 1000); // Poll status once per second to keep in sync for simple demo
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="app-header">
      <Link href="/" className="logo logo-brand">
        <Drum size={28} className="text-purple" />
        <span>DRUMM<span style={{ color: 'var(--accent-purple)' }}>.</span></span>
      </Link>
      
      <nav className="nav-links">
        <Link 
          href="/dashboard" 
          className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
        >
          Mit Dashboard
        </Link>
        <Link 
          href="/drumkit" 
          className={`nav-link ${pathname === '/drumkit' ? 'active' : ''}`}
        >
          Virtuelt Trommesæt
        </Link>
        <Link 
          href="/prototype" 
          className={`nav-link ${pathname === '/prototype' ? 'active' : ''}`}
        >
          Mobil Prototype
        </Link>
        <Link 
          href="/admin" 
          className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}
        >
          Admin Panel
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isPremium ? (
            <span className="badge badge-purple" style={{ gap: '0.25rem' }}>
              <Award size={14} /> Premium Medlem
            </span>
          ) : (
            <span className="badge badge-cyan">
              Gratis Plan
            </span>
          )}
          
          <Link href="/onboarding" className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
            <User size={14} /> Skift Profil
          </Link>
        </div>
      </nav>
    </header>
  );
}
