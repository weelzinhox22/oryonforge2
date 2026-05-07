'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Move, Trash2 } from 'lucide-react';

interface Props {
  src: string;
  offsetX: number; // 0–100
  offsetY: number; // 0–100
  onChange: (x: number, y: number) => void;
  index: number;
  onRemove: (e: React.MouseEvent) => void;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function ImageCropEditor({ src, offsetX, offsetY, onChange, index, onRemove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  // Store mutable drag state in a ref to avoid stale closures
  const drag = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  const getSensitivity = useCallback(() => {
    const c = containerRef.current;
    if (!c || !naturalSize.w || !naturalSize.h) return { sx: 150, sy: 150 };

    const cw = c.clientWidth;
    const ch = c.clientHeight;
    const imgAspect = naturalSize.w / naturalSize.h;
    const cAspect = cw / ch;

    let renderedW: number, renderedH: number;
    if (imgAspect > cAspect) {
      renderedH = ch;
      renderedW = ch * imgAspect;
    } else {
      renderedW = cw;
      renderedH = cw / imgAspect;
    }

    const overflowX = renderedW - cw;
    const overflowY = renderedH - ch;

    // sensitivity = how many % per pixel
    const sx = overflowX > 1 ? (cw / overflowX) * 100 : 0;
    const sy = overflowY > 1 ? (ch / overflowY) * 100 : 0;
    return { sx, sy };
  }, [naturalSize]);

  const applyMove = useCallback((clientX: number, clientY: number) => {
    const c = containerRef.current;
    if (!c) return;
    const { sx, sy } = getSensitivity();
    const dx = clientX - drag.current.mouseX;
    const dy = clientY - drag.current.mouseY;
    // Invert: drag right → reveal left → X decreases
    const newX = sx > 0 ? clamp(drag.current.startX - (dx / c.clientWidth) * sx, 0, 100) : offsetX;
    const newY = sy > 0 ? clamp(drag.current.startY - (dy / c.clientHeight) * sy, 0, 100) : offsetY;
    onChange(newX, newY);
  }, [getSensitivity, onChange, offsetX, offsetY]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    drag.current = { mouseX: clientX, mouseY: clientY, startX: offsetX, startY: offsetY };
    setIsDragging(true);
  }, [offsetX, offsetY]);

  // Global mouse events while dragging
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => applyMove(e.clientX, e.clientY);
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, applyMove]);

  return (
    <div className="bg-[#050505] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* ── Crop preview ── */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ aspectRatio: '1' }}
        onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          startDrag(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          applyMove(t.clientX, t.clientY);
        }}
        onTouchEnd={() => setIsDragging(false)}
      >
        <img
          ref={imgRef}
          src={src}
          alt={`Foto ${index + 1}`}
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
          }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${offsetX}% ${offsetY}%` }}
        />

        {/* Corner rule lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-6 h-0.5 bg-[#CCCC00]/60" />
          <div className="absolute top-0 left-0 w-0.5 h-6 bg-[#CCCC00]/60" />
          <div className="absolute top-0 right-0 w-6 h-0.5 bg-[#CCCC00]/60" />
          <div className="absolute top-0 right-0 w-0.5 h-6 bg-[#CCCC00]/60" />
          <div className="absolute bottom-0 left-0 w-6 h-0.5 bg-[#CCCC00]/60" />
          <div className="absolute bottom-0 left-0 w-0.5 h-6 bg-[#CCCC00]/60" />
          <div className="absolute bottom-0 right-0 w-6 h-0.5 bg-[#CCCC00]/60" />
          <div className="absolute bottom-0 right-0 w-0.5 h-6 bg-[#CCCC00]/60" />
        </div>

        {/* Header */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10">
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Foto {index + 1}</span>
          </div>
          <button
            className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-[#606070] hover:bg-red-500/80 hover:text-white transition-all flex items-center justify-center pointer-events-auto"
            onClick={onRemove}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Drag hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all ${
            isDragging
              ? 'bg-[#CCCC00]/20 border-[#CCCC00]/40'
              : 'bg-black/70 border-white/10'
          }`}>
            <Move size={10} className="text-[#CCCC00]" />
            <span className="text-[8px] font-black text-white/70 uppercase tracking-wider whitespace-nowrap">
              {isDragging ? 'Posicionando...' : 'Arraste para enquadrar'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Position bars ── */}
      <div className="px-4 py-2.5 flex items-center gap-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[7px] font-black text-[#303035] uppercase tracking-widest">H</span>
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#CCCC00]/50 rounded-full transition-[width]" style={{ width: `${offsetX}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[7px] font-black text-[#303035] uppercase tracking-widest">V</span>
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#CCCC00]/50 rounded-full transition-[width]" style={{ width: `${offsetY}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
