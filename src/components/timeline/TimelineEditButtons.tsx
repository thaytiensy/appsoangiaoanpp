import React from 'react';
import { Scissors, Trash2, Undo2, Redo2, Magnet } from 'lucide-react';

interface TimelineEditButtonsProps {
  onSplit: () => void;
  onDelete: () => void;
  hasSelectedClips: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSnappingEnabled: boolean;
  onToggleSnapping: () => void;
}

export function TimelineEditButtons({
  onSplit,
  onDelete,
  hasSelectedClips,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSnappingEnabled,
  onToggleSnapping,
}: TimelineEditButtonsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onSplit}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs cursor-pointer"
        title="Cắt Clip tại Playhead (S hoặc Ctrl+K)"
      >
        <Scissors className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">Cắt</span>
      </button>

      <button
        type="button"
        disabled={!hasSelectedClips}
        onClick={onDelete}
        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition flex items-center gap-1 text-xs disabled:opacity-40 cursor-pointer"
        title="Xóa Clip đã chọn (Delete)"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Xóa</span>
      </button>

      <div className="w-px h-5 bg-slate-800 mx-1" />

      <button
        type="button"
        disabled={!canUndo}
        onClick={onUndo}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 cursor-pointer"
        title="Hoàn tác (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        disabled={!canRedo}
        onClick={onRedo}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 cursor-pointer"
        title="Làm lại (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-800 mx-1" />

      <button
        type="button"
        onClick={onToggleSnapping}
        className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs cursor-pointer ${
          isSnappingEnabled ? 'text-sky-400 bg-sky-500/10' : 'text-slate-500 hover:text-slate-300'
        }`}
        title={isSnappingEnabled ? 'Bật Hút Dính (N)' : 'Tắt Hút Dính (N)'}
      >
        <Magnet className="w-4 h-4" />
        <span className="hidden md:inline">Snap</span>
      </button>
    </div>
  );
}
