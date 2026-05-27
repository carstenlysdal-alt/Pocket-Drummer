'use client';

import React, { useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  maxTilt?: number; // max tilt degrees, default 10
}

export default function TiltCard({ children, style = {}, className = '', onClick, maxTilt = 10 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg) scale(1)');
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate within element
    const y = e.clientY - rect.top;  // y coordinate within element
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = x - xc;
    const dy = y - yc;
    
    // Calculate rotation: maps to degree range [-maxTilt, maxTilt]
    const rX = -(dy / yc) * maxTilt;
    const rY = (dx / xc) * maxTilt;
    
    setTransform(`perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.025)`);

    // Glare position
    const percentageX = (x / rect.width) * 100;
    const percentageY = (y / rect.height) * 100;
    setGlareStyle({
      background: `radial-gradient(circle at ${percentageX}% ${percentageY}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 85%)`,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform,
        transition: 'transform 0.12s ease-out, box-shadow 0.12s ease-out',
        transformStyle: 'preserve-3d',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: transform.includes('0deg') ? 'none' : '0 15px 35px rgba(0, 0, 0, 0.35)',
        ...style
      }}
      className={className}
    >
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: style.borderRadius || '18px',
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'opacity 0.15s ease-out',
          ...glareStyle
        }}
      />
      <div style={{ transform: 'translateZ(15px)', transformStyle: 'preserve-3d', height: '100%', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}
