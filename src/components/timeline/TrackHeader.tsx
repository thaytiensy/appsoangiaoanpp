'use client';

import React from 'react';
import { Track } from '@/types/timeline';
import { useTimelineStore } from '@/store/useTimelineStore';
import {
  Film,
  Music,
  Type,
  Image as ImageIcon,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';

interface TrackHeaderProps {
  track: Track;
}

export function TrackHeader({ track }: TrackHeaderProps) {
  const toggleTrackMute = useTimelineStore((s) => s.toggleTrackMute);
  const toggleTrackLock = useTimelineStore((s) => s.toggleTrackLock);
  const toggleTrackVisibility = useTimelineStore((s) => s.toggleTrackVisibility);
  const removeTrack = useTimelineStore((s) => s.removeTrack);

  const getIcon = () => {
    switch (track.type) {
      case 'video':
        return <Film className="w-4 h-4 text-indigo-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'text':
        return <Type className="w-4 h-4 text-amber-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="h-14 px-3 bg-slate-900 border-b border-r border-slate-800 flex items-center justify-between gap-2 select-none">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1 rounded-md bg-slate-800 shrink-0">{getIcon()}</div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">{track.name}</p>
          <p className="text-[10px] text-slate-500 capitalize">{track.type} Track</p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Toggle Lock */}
        <button
          type="button"
          onClick={() => toggleTrackLock(track.id)}
          className={`p-1.5 rounded hover:bg-slate-800 transition ${
            track.locked ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          title={track.locked ? 'Mở khóa Track' : 'Khóa Track'}
        >
          {track.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        {/* Toggle Mute (Audio / Video) */}
        {(track.type === 'audio' || track.type === 'video') && (
          <button
            type="button"
            onClick={() => toggleTrackMute(track.id)}
            className={`p-1.5 rounded hover:bg-slate-800 transition ${
              track.muted ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={track.muted ? 'Bật âm thanh' : 'Tắt tiếng Track'}
          >
            {track.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Toggle Visibility (Video / Text / Image) */}
        {track.type !== 'audio' && (
          <button
            type="button"
            onClick={() => toggleTrackVisibility(track.id)}
            className={`p-1.5 rounded hover:bg-slate-800 transition ${
              !track.visible ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={track.visible ? 'Ẩn Track' : 'Hiện Track'}
          >
            {track.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Xóa Track */}
        <button
          type="button"
          onClick={() => removeTrack(track.id)}
          className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
          title="Xóa Track"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
