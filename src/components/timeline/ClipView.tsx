'use client';

import React from 'react';
import { Clip, Track } from '@/types/timeline';
import { useTimelineStore } from '@/store/useTimelineStore';
import { formatCompactTime } from '@/core/timeline/timecode';
import { Film, Music, Type, Image as ImageIcon, Volume2, VolumeX } from 'lucide-react';
import { useClipDrag } from './useClipDrag';

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

  const { dragOffset, trimPreview, handleBodyMouseDown, handleTrimMouseDown } = useClipDrag({
    clip,
    track,
    tracks,
    zoom,
    playheadTime,
    isSnappingEnabled,
    selectClip,
    updateClipPosition,
    resizeClip,
    onSnapFeedback,
  });

  const clipDuration = clip.end - clip.start;
  const currentStart = trimPreview?.edge === 'start' ? trimPreview.time : (dragOffset !== null ? dragOffset : clip.start);
  const currentEnd = trimPreview?.edge === 'end' ? trimPreview.time : (dragOffset !== null ? dragOffset + clipDuration : clip.end);
  const displayDuration = Math.max(0.1, currentEnd - currentStart);

  const leftPx = currentStart * zoom;
  const widthPx = Math.max(16, displayDuration * zoom);

  const renderIcon = () => {
    switch (clip.type) {
      case 'video': return <Film className="w-3.5 h-3.5 text-sky-300 shrink-0" />;
      case 'audio': return <Music className="w-3.5 h-3.5 text-emerald-300 shrink-0" />;
      case 'text': return <Type className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-purple-300 shrink-0" />;
    }
  };

  const getClipBgColor = () => {
    if (isSelected) return 'bg-sky-600/80 border-sky-300 shadow-md shadow-sky-500/20';
    switch (clip.type) {
      case 'video': return 'bg-sky-950/70 border-sky-800/80 hover:border-sky-600';
      case 'audio': return 'bg-emerald-950/70 border-emerald-800/80 hover:border-emerald-600';
      case 'text': return 'bg-amber-950/70 border-amber-800/80 hover:border-amber-600';
      case 'image': return 'bg-purple-950/70 border-purple-800/80 hover:border-purple-600';
    }
  };

  return (
    <div
      style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
      onMouseDown={handleBodyMouseDown}
      className={`absolute top-1 bottom-1 rounded-md border select-none cursor-grab active:cursor-grabbing flex items-center justify-between px-2 overflow-hidden transition-colors ${getClipBgColor()}`}
      title={`${clip.name} (${formatCompactTime(currentStart)} - ${formatCompactTime(currentEnd)})`}
    >
      <div
        onMouseDown={(e) => handleTrimMouseDown('start', e)}
        className="absolute left-0 top-0 bottom-0 w-2 hover:w-2.5 bg-white/20 hover:bg-sky-400 cursor-ew-resize transition-all z-10"
        title="Kéo để cắt đầu Clip (Trim Start)"
      />

      <div className="flex items-center gap-1.5 min-w-0 pr-1 pointer-events-none">
        {renderIcon()}
        <span className="text-xs font-semibold text-slate-100 truncate">{clip.name}</span>
        {clip.muted && <VolumeX className="w-3 h-3 text-rose-400 shrink-0" />}
        {!clip.muted && clip.volume !== 1.0 && <Volume2 className="w-3 h-3 text-slate-400 shrink-0" />}
      </div>

      <div className="text-[10px] font-mono text-slate-400 shrink-0 pointer-events-none hidden sm:block">
        {formatCompactTime(displayDuration)}
      </div>

      <div
        onMouseDown={(e) => handleTrimMouseDown('end', e)}
        className="absolute right-0 top-0 bottom-0 w-2 hover:w-2.5 bg-white/20 hover:bg-sky-400 cursor-ew-resize transition-all z-10"
        title="Kéo để cắt đuôi Clip (Trim End)"
      />
    </div>
  );
}
