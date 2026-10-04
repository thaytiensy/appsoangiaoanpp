'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { formatCompactTime } from '@/core/timeline/timecode';

interface TimelineRulerProps {
  scrollLeft: number;
}

export function TimelineRuler({ scrollLeft }: TimelineRulerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const duration = useTimelineStore((s) => s.duration);
  const zoom = useTimelineStore((s) => s.zoom);
  const playheadTime = useTimelineStore((s) => s.playheadTime);
  const setPlayheadTime = useTimelineStore((s) => s.setPlayheadTime);

  // Tính bước nhảy tick theo mức zoom
  const calculateTickInterval = (currentZoom: number): { major: number; minor: number } => {
    if (currentZoom >= 150) return { major: 1, minor: 0.2 };
    if (currentZoom >= 80) return { major: 1, minor: 0.5 };
    if (currentZoom >= 40) return { major: 2, minor: 1 };
    if (currentZoom >= 20) return { major: 5, minor: 1 };
    return { major: 10, minor: 2 };
  };

  const drawRuler = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    const { major, minor } = calculateTickInterval(zoom);
    const startSec = Math.floor(scrollLeft / zoom);
    const endSec = Math.ceil((scrollLeft + width) / zoom);

    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textBaseline = 'top';

    // Vẽ minor ticks
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let t = Math.max(0, startSec - 1); t <= endSec + 1; t += minor) {
      const x = t * zoom - scrollLeft;
      if (x >= 0 && x <= width) {
        ctx.moveTo(x, height - 6);
        ctx.lineTo(x, height);
      }
    }
    ctx.stroke();

    // Vẽ major ticks & nhãn thời gian
    ctx.strokeStyle = '#64748b'; // slate-500
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.beginPath();
    for (let t = Math.max(0, startSec - 2); t <= endSec + 2; t += major) {
      const x = t * zoom - scrollLeft;
      if (x >= 0 && x <= width) {
        ctx.moveTo(x, height - 14);
        ctx.lineTo(x, height);
        ctx.fillText(formatCompactTime(t), x + 4, 4);
      }
    }
    ctx.stroke();

    // Vẽ playhead marker nhỏ trên ruler
    const playheadX = playheadTime * zoom - scrollLeft;
    if (playheadX >= -10 && playheadX <= width + 10) {
      ctx.fillStyle = '#38bdf8'; // sky-400
      ctx.beginPath();
      ctx.moveTo(playheadX - 6, 0);
      ctx.lineTo(playheadX + 6, 0);
      ctx.lineTo(playheadX + 6, height - 8);
      ctx.lineTo(playheadX, height);
      ctx.lineTo(playheadX - 6, height - 8);
      ctx.closePath();
      ctx.fill();
    }
  }, [scrollLeft, zoom, playheadTime]);

  useEffect(() => {
    drawRuler();
  }, [drawRuler]);

  const updatePlayheadFromMouseEvent = (e: React.MouseEvent | MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const targetTime = (mouseX + scrollLeft) / zoom;
    setPlayheadTime(Math.max(0, Math.min(targetTime, duration)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    updatePlayheadFromMouseEvent(e);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updatePlayheadFromMouseEvent(moveEvent);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className="w-full h-8 relative select-none cursor-pointer border-b border-slate-800 bg-slate-900"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
