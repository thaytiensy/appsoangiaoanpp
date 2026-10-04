'use client';

import React, { useState } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { getPreviewEngine, getAudioMixer } from '@/core/player/playerContext';
import { formatTimecode } from '@/core/timeline/timecode';
import { AspectRatio, ASPECT_RATIO_CONFIGS } from '@/types/preview';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Maximize2,
  Monitor,
} from 'lucide-react';

interface PlaybackControlsProps {
  currentAspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onToggleFullscreen?: () => void;
}

export function PlaybackControls({
  currentAspectRatio,
  onAspectRatioChange,
  onToggleFullscreen,
}: PlaybackControlsProps) {
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const setIsPlaying = useTimelineStore((s) => s.setIsPlaying);
  const playheadTime = useTimelineStore((s) => s.playheadTime);
  const setPlayheadTime = useTimelineStore((s) => s.setPlayheadTime);
  const duration = useTimelineStore((s) => s.duration);
  const fps = useTimelineStore((s) => s.fps);

  const [isLooping, setIsLooping] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    getPreviewEngine().setLooping(nextLoop);
  };

  const handleVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    setIsMuted(vol === 0);
    getAudioMixer().setMasterVolume(vol);
  };

  const handleToggleMute = () => {
    const muted = getAudioMixer().toggleMute();
    setIsMuted(muted);
  };

  const stepFrame = (frames: number) => {
    setPlayheadTime(playheadTime + frames / fps);
  };

  return (
    <div className="w-full px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 select-none flex-wrap">
      {/* 1. Nút phát & Điều hướng Frame */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setPlayheadTime(0)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Về đầu Timeline (0s)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => stepFrame(-1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Lùi 1 Frame"
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
          title="Tiến 1 Frame"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Nút Lặp lại (Loop) */}
        <button
          type="button"
          onClick={handleToggleLoop}
          className={`p-1.5 rounded-lg transition ${
            isLooping ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isLooping ? 'Tắt phát lặp lại' : 'Bật phát lặp lại (Loop)'}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Hiển thị Timecode chuẩn Studio */}
      <div className="flex items-center gap-2 font-mono text-xs px-3 py-1 rounded bg-slate-950 border border-slate-800">
        <span className="text-sky-400 font-bold">{formatTimecode(playheadTime, fps)}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400">{formatTimecode(duration, fps)}</span>
      </div>

      {/* 3. Tỷ lệ Aspect Ratio & Master Volume */}
      <div className="flex items-center gap-3">
        {/* Chọn Tỷ lệ Aspect Ratio */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
          <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={currentAspectRatio}
            onChange={(e) => onAspectRatioChange(e.target.value as AspectRatio)}
            className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
          >
            {(Object.keys(ASPECT_RATIO_CONFIGS) as AspectRatio[]).map((ratio) => (
              <option key={ratio} value={ratio} className="bg-slate-900 text-slate-200">
                {ratio}
              </option>
            ))}
          </select>
        </div>

        {/* Điều chỉnh Master Volume */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1 rounded hover:text-white transition"
            title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng Master'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : masterVolume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-16 accent-sky-400 cursor-pointer"
            title="Âm lượng Master"
          />
        </div>

        {/* Nút Phóng to Preview */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Toàn màn hình Preview"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
