'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { getPreviewEngine } from '@/core/player/playerContext';
import { AspectRatio, ASPECT_RATIO_CONFIGS } from '@/types/preview';
import { formatTimecode } from '@/core/timeline/timecode';

interface VideoCanvasProps {
  aspectRatio?: AspectRatio;
  onAspectRatioChange?: (ratio: AspectRatio) => void;
}

export function VideoCanvas({ aspectRatio = '16:9', onAspectRatioChange }: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentRatio, setCurrentRatio] = useState<AspectRatio>(aspectRatio);

  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const playheadTime = useTimelineStore((s) => s.playheadTime);
  const setPlayheadTime = useTimelineStore((s) => s.setPlayheadTime);
  const setIsPlaying = useTimelineStore((s) => s.setIsPlaying);
  const tracks = useTimelineStore((s) => s.tracks);
  const assets = useTimelineStore((s) => s.assets);
  const duration = useTimelineStore((s) => s.duration);
  const fps = useTimelineStore((s) => s.fps);

  useEffect(() => {
    setCurrentRatio(aspectRatio);
  }, [aspectRatio]);

  // Khởi tạo Canvas và gắn kết PreviewEngine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = getPreviewEngine();
    engine.attachCanvas(canvas);
    engine.setAspectRatio(currentRatio);
    engine.renderFrame(playheadTime, tracks, assets);

    engine.setOnPlaybackEnd(() => {
      setIsPlaying(false);
    });
  }, [currentRatio]);

  // Đồng bộ Playback khi isPlaying thay đổi
  useEffect(() => {
    const engine = getPreviewEngine();

    if (isPlaying) {
      const state = useTimelineStore.getState();
      engine.startPlayback(state, (nextTime) => {
        setPlayheadTime(nextTime);
      });
    } else {
      engine.stopPlayback();
    }

    return () => {
      engine.stopPlayback();
    };
  }, [isPlaying, setPlayheadTime, setIsPlaying]);

  // Vẽ lại frame khi playheadTime hoặc tracks thay đổi mà đang tạm dừng
  useEffect(() => {
    if (!isPlaying) {
      const engine = getPreviewEngine();
      engine.seek(playheadTime, tracks, assets, false);
    }
  }, [playheadTime, tracks, assets, isPlaying]);

  const getAspectClass = () => {
    switch (currentRatio) {
      case '16:9':
        return 'aspect-[16/9] max-h-[460px]';
      case '9:16':
        return 'aspect-[9/16] max-h-[460px]';
      case '1:1':
        return 'aspect-square max-h-[460px]';
    }
  };

  const resConfig = ASPECT_RATIO_CONFIGS[currentRatio];

  return (
    <div className="w-full flex flex-col items-center justify-center p-3 bg-slate-950 relative select-none">
      {/* Khung chứa Canvas với Aspect Ratio tự động */}
      <div
        className={`relative ${getAspectClass()} w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center`}
      >
        <canvas ref={canvasRef} className="w-full h-full object-contain block" />

        {/* HUD Info Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-sky-400 border border-slate-700/50">
            {resConfig.width}x{resConfig.height}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono text-slate-300 border border-slate-700/50">
            {fps} FPS
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-200 border border-slate-700/50 z-10 pointer-events-none">
          {formatTimecode(playheadTime, fps)}
        </div>
      </div>
    </div>
  );
}
