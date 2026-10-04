'use client';

import React, { useState, useRef } from 'react';
import { Clip, Track } from '@/types/timeline';
import { useTimelineStore } from '@/store/useTimelineStore';
import { calculateSnapping } from '@/core/timeline/snapping';
import { formatCompactTime } from '@/core/timeline/timecode';
import { Film, Music, Type, Image as ImageIcon, Volume2, VolumeX } from 'lucide-react';

interface ClipViewProps {
  clip: Clip;
  track: Track;
  tracks: Track[];
  onSnapFeedback?: (activePoint?: number) => void;
}

export function ClipView({ clip, track, tracks, onSnapFeedback }: ClipViewProps) {
  const zoom = useTimelineStore((s) => s.zoom);
  const playheadTime = useTimelineStore((s) => s.playheadTime);
  const selectedClipIds = useTimelineStore((s) => s.selectedClipIds);
  const isSnappingEnabled = useTimelineStore((s) => s.isSnappingEnabled);

  const selectClip = useTimelineStore((s) => s.selectClip);
  const updateClipPosition = useTimelineStore((s) => s.updateClipPosition);
  const resizeClip = useTimelineStore((s) => s.resizeClip);

  const isSelected = selectedClipIds.includes(clip.id);

  // Trạng thái preview khi đang drag
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [trimPreview, setTrimPreview] = useState<{ edge: 'start' | 'end'; time: number } | null>(null);

  const clipDuration = clip.end - clip.start;
  const currentStart = trimPreview?.edge === 'start' ? trimPreview.time : (dragOffset !== null ? dragOffset : clip.start);
  const currentEnd = trimPreview?.edge === 'end' ? trimPreview.time : (dragOffset !== null ? dragOffset + clipDuration : clip.end);
  const displayDuration = Math.max(0.1, currentEnd - currentStart);

  const leftPx = currentStart * zoom;
  const widthPx = Math.max(16, displayDuration * zoom);

  // 1. Xử lý Drag Di chuyển Clip
  const handleBodyMouseDown = (e: React.MouseEvent) => {
    if (track.locked) return;
    if (e.button !== 0) return; // Chỉ xử lý chuột trái
    e.stopPropagation();

    selectClip(clip.id, e.shiftKey);

    const startX = e.clientX;
    const initialStart = clip.start;
    let finalSnappedStart = initialStart;
    let finalTrackId = track.id;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startX;
      const rawStart = Math.max(0, initialStart + deltaPx / zoom);

      if (isSnappingEnabled) {
        const snap = calculateSnapping(rawStart, clipDuration, tracks, playheadTime, zoom, clip.id);
        finalSnappedStart = snap.snappedTime;
        if (onSnapFeedback) onSnapFeedback(snap.activeSnapPoint);
      } else {
        finalSnappedStart = rawStart;
        if (onSnapFeedback) onSnapFeedback(undefined);
      }

      // Phát hiện kéo sang track khác qua Y coordinate
      const elUnderMouse = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const trackEl = elUnderMouse?.closest('[data-track-id]');
      if (trackEl) {
        const targetId = trackEl.getAttribute('data-track-id');
        const targetTrack = tracks.find((t) => t.id === targetId);
        if (targetTrack && !targetTrack.locked && targetTrack.type === clip.type) {
          finalTrackId = targetTrack.id;
        }
      }

      setDragOffset(finalSnappedStart);
    };

    const onMouseUp = () => {
      setDragOffset(null);
      if (onSnapFeedback) onSnapFeedback(undefined);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (finalSnappedStart !== clip.start || finalTrackId !== track.id) {
        updateClipPosition(clip.id, finalSnappedStart, finalTrackId);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // 2. Xử lý Trimming / Resizing đầu hoặc đuôi Clip
  const handleTrimMouseDown = (edge: 'start' | 'end', e: React.MouseEvent) => {
    if (track.locked) return;
    e.stopPropagation();
    selectClip(clip.id);

    const startX = e.clientX;
    const initialTime = edge === 'start' ? clip.start : clip.end;
    let finalTime = initialTime;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startX;
      const rawTime = Math.max(0, initialTime + deltaPx / zoom);

      if (isSnappingEnabled) {
        const snap = calculateSnapping(rawTime, 0, tracks, playheadTime, zoom, clip.id);
        finalTime = snap.snappedTime;
        if (onSnapFeedback) onSnapFeedback(snap.activeSnapPoint);
      } else {
        finalTime = rawTime;
        if (onSnapFeedback) onSnapFeedback(undefined);
      }

      setTrimPreview({ edge, time: finalTime });
    };

    const onMouseUp = () => {
      setTrimPreview(null);
      if (onSnapFeedback) onSnapFeedback(undefined);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (finalTime !== initialTime) {
        resizeClip(clip.id, edge, finalTime);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Kiểu hiển thị theo loại Clip
  const getTypeStyles = () => {
    switch (clip.type) {
      case 'video':
        return {
          bg: 'bg-gradient-to-r from-indigo-700 to-indigo-600',
          border: 'border-indigo-400/40',
          icon: <Film className="w-3.5 h-3.5 text-indigo-200 shrink-0" />,
        };
      case 'audio':
        return {
          bg: 'bg-gradient-to-r from-emerald-800 to-teal-700',
          border: 'border-emerald-400/40',
          icon: <Music className="w-3.5 h-3.5 text-emerald-200 shrink-0" />,
        };
      case 'text':
        return {
          bg: 'bg-gradient-to-r from-amber-700 to-yellow-600',
          border: 'border-amber-400/40',
          icon: <Type className="w-3.5 h-3.5 text-amber-200 shrink-0" />,
        };
      case 'image':
        return {
          bg: 'bg-gradient-to-r from-cyan-800 to-blue-700',
          border: 'border-cyan-400/40',
          icon: <ImageIcon className="w-3.5 h-3.5 text-cyan-200 shrink-0" />,
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
      onMouseDown={handleBodyMouseDown}
      className={`absolute top-1 bottom-1 rounded-md border select-none transition-shadow ${styles.bg} ${styles.border} ${
        isSelected ? 'ring-2 ring-sky-400 shadow-lg z-20 brightness-110' : 'hover:brightness-105 z-10'
      } ${track.locked ? 'cursor-not-allowed opacity-80' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Handle Trim Đầu (Start Edge) */}
      {!track.locked && (
        <div
          onMouseDown={(e) => handleTrimMouseDown('start', e)}
          className="absolute left-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-white/60 cursor-ew-resize rounded-l-md flex items-center justify-center group z-30 transition-colors"
          title="Kéo để cắt đầu clip"
        >
          <div className="w-0.5 h-3 bg-white/60 group-hover:bg-white rounded-full" />
        </div>
      )}

      {/* Nội dung Clip */}
      <div className="w-full h-full px-3 flex items-center justify-between overflow-hidden pointer-events-none">
        <div className="flex items-center gap-1.5 min-w-0">
          {styles.icon}
          <span className="text-[11px] font-semibold text-white truncate drop-shadow-xs">
            {clip.name}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/80 shrink-0 font-mono">
          {clip.muted ? <VolumeX className="w-3 h-3 text-rose-300" /> : clip.volume !== 1.0 && <Volume2 className="w-3 h-3 text-cyan-200" />}
          <span>{formatCompactTime(displayDuration)}</span>
        </div>
      </div>

      {/* Handle Trim Đuôi (End Edge) */}
      {!track.locked && (
        <div
          onMouseDown={(e) => handleTrimMouseDown('end', e)}
          className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-white/60 cursor-ew-resize rounded-r-md flex items-center justify-center group z-30 transition-colors"
          title="Kéo để cắt đuôi clip"
        >
          <div className="w-0.5 h-3 bg-white/60 group-hover:bg-white rounded-full" />
        </div>
      )}
    </div>
  );
}
