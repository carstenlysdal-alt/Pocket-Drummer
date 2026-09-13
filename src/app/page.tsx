'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const landingSeen = localStorage.getItem('pocketdrummer_landing_seen');
      if (!landingSeen) {
        router.replace('/landing');
      } else {
        router.replace('/prototype');
      }
    } catch {
      router.replace('/prototype');
    }
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#252525' }}>
        Pocket Drummer<span style={{ color: '#F25545' }}>.</span>
      </div>
    </div>
  );
}
