'use client';

import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface OsmdRendererProps {
  xmlData: string;
  zoom?: number;
  currentMeasure: number; // 1-indexed
  onLoadStatus?: (loaded: boolean) => void;
}

export default function OsmdRenderer({ xmlData, zoom = 1.0, currentMeasure, onLoadStatus }: OsmdRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Ryd op i containeren først
    containerRef.current.innerHTML = '';
    setError(null);
    if (onLoadStatus) onLoadStatus(false);

    try {
      // Opret OSMD instans med optimal visning
      const osmd = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        backend: 'svg',
        drawTitle: false,
        drawSubtitle: false,
        drawComposer: false,
        drawMetronomeMarks: true,
        drawPartNames: false,
        coloringEnabled: true,
        cursorsOptions: [{
          type: 0, // standard streg
          color: '#f25c3d',
          alpha: 0.4,
          follow: true
        }]
      });

      osmdRef.current = osmd;

      osmd.load(xmlData).then(
        () => {
          if (!containerRef.current) return;
          
          osmd.render();
          
          // Vis cursor
          osmd.cursor.show();
          osmd.cursor.reset();
          
          if (onLoadStatus) onLoadStatus(true);
        },
        (err) => {
          console.error("OSMD loading error:", err);
          setError("Kunne ikke indlæse nodedata. Kontroller om MusicXML-strukturen er gyldig.");
        }
      );
    } catch (e: unknown) {
      console.error("OSMD creation error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      setTimeout(() => {
        setError("Der opstod en fejl under oprettelse af nodemotoren: " + msg);
      }, 0);
    }

    return () => {
      osmdRef.current = null;
    };
  }, [xmlData, onLoadStatus]);

  // Håndter zoom ændringer
  useEffect(() => {
    const osmd = osmdRef.current;
    if (osmd && osmd.Sheet) {
      osmd.Zoom = zoom;
      osmd.render();
    }
  }, [zoom]);

  // Håndter cursor position synkronisering
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !osmd.cursor) return;

    try {
      osmd.cursor.reset();
      
      // Flyt cursor frem til den ønskede takt (1-indexed)
      // Bemærk: osmd.cursor.next() flytter typisk pr. slag eller nodegruppe.
      // For en 4/4 takt er der ca. 4 slag pr takt.
      // Her er en simpel løkke, der flytter cursoren frem:
      const currentC = osmd.cursor;
      
      // Da cursor.next() går et slag frem, kan vi estimere placering eller bare loope
      // For at synkronisere præcist til takter, kan vi tjekke hvilken takt cursoren står i:
      // osmd.cursor.iterator.CurrentMeasureIndex er 0-indexed.
      const targetIndex = currentMeasure - 1; // 0-indexed mål
      
      let attempts = 0;
      while (
        currentC.iterator && 
        currentC.iterator.CurrentMeasureIndex < targetIndex && 
        attempts < 100
      ) {
        currentC.next();
        attempts++;
      }
    } catch (e) {
      console.warn("Fejl ved flytning af cursor:", e);
    }
  }, [currentMeasure, xmlData]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
      {error && (
        <div style={{ 
          padding: '1.5rem', 
          background: 'rgba(244,63,94,0.1)', 
          border: '1px solid rgba(244,63,94,0.2)', 
          color: '#f43f5e', 
          borderRadius: '8px', 
          fontSize: '0.9rem',
          margin: '1rem' 
        }}>
          {error}
        </div>
      )}
      <div 
        ref={containerRef} 
        id="osmd-svg-container"
        style={{ 
          width: '100%', 
          background: '#ffffff', 
          padding: '1rem', 
          borderRadius: '8px' 
        }} 
      />
    </div>
  );
}
