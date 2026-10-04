'use client';

import React, { useRef, useState } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useTimelineHotkeys } from '@/hooks/useTimelineHotkeys';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineRuler } from './TimelineRuler';
import { TrackHeader } from './TrackHeader';
import { ClipView } from './ClipView';

export function MultiTrackTimeline() {
  useTimelineHotkeys();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | undefined>(undefined);

  const tracks = useTimelineStore((s) => s.tracks);
  const zoom = useTimelineStore((s) => s.zoom);
  const duration = useTimelineStore((s) => s.duration);
  const playheadTime = useTimelineStore((s) => s.playheadTime);
  const setPlayheadTime = useTimelineStore((s) => s.setPlayheadTime);
  const deselectAllClips = useTimelineStore((s) => s.deselectAllClips);

  const timelineWidthPx = Math.max(1200, duration * zoom + 400);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleTimelineBodyClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-clip-id]')) return;
    deselectAllClips();

    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left + container.scrollLeft;
    const targetTime = Math.max(0, Math.min(clickX / zoom, duration));
    setPlayheadTime(targetTime);
  };

  return (
    <div className="w-full flex flex-col bg-slate-950 text-slate-100 border-t border-slate-800 shadow-2xl select-none">
      {/* 1. Timeline Toolbar */}
      <TimelineToolbar />

      {/* 2. Timeline Multi-track Container */}
      <div className="flex w-full h-80 overflow-hidden relative">
        {/* Cột cố định bên trái: Track Headers */}
        <div className="w-56 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-md">
          {/* Góc trên của Header (khớp với độ cao Ruler 32px) */}
          <div className="h-8 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>TRACKS ({tracks.length})</span>
            <span className="text-[10px] text-sky-400 font-mono">16:9 HD</span>
          </div>

          {/* Danh sách Headers */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {tracks.map((track) => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </div>
        </div>

        {/* Khung cuộn ngang bên phải: Ruler + Track Lanes + Playhead */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-slate-950"
        >
          <div style={{ width: `${timelineWidthPx}px` }} className="min-h-full relative flex flex-col">
            {/* Top Ruler (sticky) */}
            <div className="sticky top-0 z-30 w-full">
              <TimelineRuler scrollLeft={scrollLeft} />
            </div>

            {/* Các làn rãnh Track (Lanes) */}
            <div onClick={handleTimelineBodyClick} className="flex-1 relative flex flex-col">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  data-track-id={track.id}
                  className={`h-14 w-full relative border-b border-slate-900/80 transition-colors ${
                    track.locked
                      ? 'bg-slate-950/90'
                      : 'bg-slate-950/40 hover:bg-slate-900/30'
                  }`}
                >
                  {/* Grid Lines phân chia mỗi giây */}
                  <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#334155_1px,transparent_1px)] bg-[size:50px_100%]" />

                  {/* Render Clips trên track này */}
                  {track.clips.map((clip) => (
                    <div key={clip.id} data-clip-id={clip.id}>
                      <ClipView
                        clip={clip}
                        track={track}
                        tracks={tracks}
                        onSnapFeedback={(point) => setActiveSnapPoint(point)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Snapping Guide Line thời gian thực */}
            {activeSnapPoint !== undefined && (
              <div
                style={{ left: `${activeSnapPoint * zoom}px` }}
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-35 pointer-events-none shadow-[0_0_8px_#38bdf8]"
              >
                <div className="absolute top-8 -left-2 px-1 py-0.5 bg-cyan-500 text-slate-950 text-[9px] font-bold rounded font-mono">
                  SNAP
                </div>
              </div>
            )}

            {/* Playhead Scrubber Bar xuyên suốt tất cả các Track */}
            <div
              style={{ left: `${playheadTime * zoom}px` }}
              className="absolute top-0 bottom-0 w-px bg-sky-400 z-40 pointer-events-none shadow-[0_0_10px_rgba(56,189,248,0.7)]"
            >
              <div className="w-3 h-3 bg-sky-400 rotate-45 -translate-x-1.5 -translate-y-1 shadow-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
