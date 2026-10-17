'use client';

import React, { useRef } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { formatTimecode } from '@/core/timeline/timecode';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  Upload,
  Plus,
} from 'lucide-react';
import { TrackType } from '@/types/timeline';
import { TimelineEditButtons } from './TimelineEditButtons';

export function TimelineToolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const setIsPlaying = useTimelineStore((s) => s.setIsPlaying);
  const playheadTime = useTimelineStore((s) => s.playheadTime);
  const setPlayheadTime = useTimelineStore((s) => s.setPlayheadTime);
  const duration = useTimelineStore((s) => s.duration);
  const fps = useTimelineStore((s) => s.fps);
  const zoom = useTimelineStore((s) => s.zoom);
  const setZoom = useTimelineStore((s) => s.setZoom);

  const isSnappingEnabled = useTimelineStore((s) => s.isSnappingEnabled);
  const toggleSnapping = useTimelineStore((s) => s.toggleSnapping);

  const selectedClipIds = useTimelineStore((s) => s.selectedClipIds);
  const splitClipAtPlayhead = useTimelineStore((s) => s.splitClipAtPlayhead);
  const deleteSelectedClips = useTimelineStore((s) => s.deleteSelectedClips);

  const historyState = useTimelineStore((s) => s.historyState);
  const undo = useTimelineStore((s) => s.undo);
  const redo = useTimelineStore((s) => s.redo);

  const importMedia = useTimelineStore((s) => s.importMedia);
  const addTrack = useTimelineStore((s) => s.addTrack);

  const stepFrame = (frames: number) => {
    setPlayheadTime(playheadTime + frames / fps);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await importMedia(files[i]);
      }
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="h-12 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 select-none flex-wrap">
      {/* 1. Playback Controls & Timecode */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => stepFrame(-1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Lùi 1 Frame (Arrow Left)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition shadow-xs cursor-pointer"
          title={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          type="button"
          onClick={() => stepFrame(1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Tới 1 Frame (Arrow Right)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs flex items-center gap-1.5">
          <span className="text-sky-400 font-bold">{formatTimecode(playheadTime, fps)}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{formatTimecode(duration, fps)}</span>
        </div>
      </div>

      {/* 2. Edit Tools: Split, Delete, Undo, Redo, Snapping */}
      <TimelineEditButtons
        onSplit={() => splitClipAtPlayhead()}
        onDelete={deleteSelectedClips}
        hasSelectedClips={selectedClipIds.length > 0}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
        isSnappingEnabled={isSnappingEnabled}
        onToggleSnapping={toggleSnapping}
      />

      {/* 3. Zoom & Media Import */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setZoom(zoom - 10)}
            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
            title="Thu nhỏ Timeline (Ctrl+-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-1">{zoom}px/s</span>
          <button
            type="button"
            onClick={() => setZoom(zoom + 10)}
            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
            title="Phóng to Timeline (Ctrl++)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*,image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          title="Nhập Video/Audio/Hình ảnh từ máy tính"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Nhập Media</span>
        </button>

        <div className="relative group">
          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Thêm Track Mới"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
            {(['video', 'audio', 'text'] as TrackType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTrack(t)}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white capitalize transition cursor-pointer"
              >
                + Track {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
