'use client';

import React, { useRef } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { formatTimecode } from '@/core/timeline/timecode';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Trash2,
  Undo2,
  Redo2,
  Magnet,
  ZoomIn,
  ZoomOut,
  Upload,
  Plus,
} from 'lucide-react';
import { TrackType } from '@/types/timeline';

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
    const file = e.target.files?.[0];
    if (file) {
      await importMedia(file);
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
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Lùi 1 Frame (Arrow Left)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition shadow-sm"
          title={isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          type="button"
          onClick={() => stepFrame(1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
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
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => splitClipAtPlayhead()}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs"
          title="Cắt Clip tại Playhead (S hoặc Ctrl+K)"
        >
          <Scissors className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Cắt</span>
        </button>

        <button
          type="button"
          disabled={selectedClipIds.length === 0}
          onClick={deleteSelectedClips}
          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition flex items-center gap-1 text-xs disabled:opacity-40"
          title="Xóa Clip đã chọn (Delete)"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Xóa</span>
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        <button
          type="button"
          disabled={!historyState.canUndo}
          onClick={undo}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-40"
          title={`Hoàn tác (${historyState.undoCount}) - Ctrl+Z`}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={!historyState.canRedo}
          onClick={redo}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-40"
          title={`Làm lại (${historyState.redoCount}) - Ctrl+Y`}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={toggleSnapping}
          className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs ${
            isSnappingEnabled
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
          title="Bật/Tắt chế độ Hút điểm (Snapping)"
        >
          <Magnet className="w-4 h-4" />
          <span className="hidden md:inline">Snap</span>
        </button>
      </div>

      {/* 3. Zoom & Add Media / Track */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <ZoomOut className="w-3.5 h-3.5" />
          <input
            type="range"
            min={15}
            max={200}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-20 accent-sky-400 cursor-pointer"
            title="Tỉ lệ phóng to Timeline (+ / -)"
          />
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] w-9 text-right text-slate-300">{zoom}px/s</span>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import Media</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*,image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="relative group">
          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Thêm Track mới"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 w-32">
            {(['video', 'audio', 'text', 'image'] as TrackType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addTrack(type)}
                className="px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white capitalize"
              >
                + Track {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
