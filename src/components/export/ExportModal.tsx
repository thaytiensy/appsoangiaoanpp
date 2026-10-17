'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { ExportManager } from '@/core/export/ExportManager';
import { ExportConfig, ExportProgress, ExportResolution } from '@/types/export';
import { AspectRatio } from '@/types/preview';
import { Download, X, AlertTriangle, Loader2, Film, Zap } from 'lucide-react';
import { ExportConfigForm } from './ExportConfigForm';
import { ExportProgressView } from './ExportProgressView';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAspectRatio?: AspectRatio;
}

export function ExportModal({ isOpen, onClose, defaultAspectRatio = '16:9' }: ExportModalProps) {
  const exportManagerRef = useRef<ExportManager | null>(null);

  const [resolution, setResolution] = useState<ExportResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(defaultAspectRatio);
  const [fps, setFps] = useState<number>(30);
  const [bitrate, setBitrate] = useState<number>(6_000_000);

  const [progress, setProgress] = useState<ExportProgress>({
    status: 'idle',
    percent: 0,
    currentFrame: 0,
    totalFrames: 0,
    elapsedSeconds: 0,
    etaSeconds: 0,
  });

  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    exportManagerRef.current = new ExportManager();
    setIsSupported(ExportManager.isWebCodecsSupported());

    return () => {
      exportManagerRef.current?.cleanupBlobUrl();
    };
  }, []);

  useEffect(() => {
    setAspectRatio(defaultAspectRatio);
  }, [defaultAspectRatio]);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    if (!exportManagerRef.current) return;

    const timeline = useTimelineStore.getState();
    const config: ExportConfig = {
      resolution,
      aspectRatio,
      fps,
      bitrate,
      format: 'webm',
    };

    try {
      await exportManagerRef.current.startExport(timeline, config, (prog) => {
        setProgress(prog);
      });
    } catch {
      // Handled in progress callback
    }
  };

  const handleCancelExport = () => {
    exportManagerRef.current?.cancelExport();
    setProgress({
      status: 'idle',
      percent: 0,
      currentFrame: 0,
      totalFrames: 0,
      elapsedSeconds: 0,
      etaSeconds: 0,
    });
  };

  const handleClose = () => {
    if (progress.status === 'rendering') {
      handleCancelExport();
    }
    exportManagerRef.current?.cleanupBlobUrl();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xuất Video Studio (Export)</h3>
              <p className="text-xs text-slate-400">WebCodecs Pipeline • Mã hóa phần cứng GPU</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!isSupported && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Trình duyệt chưa kích hoạt WebCodecs API. Khuyến nghị sử dụng Chrome, Edge hoặc Cốc Cốc 94+ để xuất video.
              </span>
            </div>
          )}

          {progress.status === 'idle' ? (
            <ExportConfigForm
              resolution={resolution}
              aspectRatio={aspectRatio}
              fps={fps}
              bitrate={bitrate}
              onResolutionChange={setResolution}
              onAspectRatioChange={setAspectRatio}
              onFpsChange={setFps}
              onBitrateChange={setBitrate}
            />
          ) : (
            <ExportProgressView progress={progress} />
          )}
        </div>

        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
          {progress.status === 'idle' && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleStartExport}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Bắt Đầu Xuất Video</span>
              </button>
            </>
          )}

          {progress.status === 'rendering' && (
            <button
              type="button"
              onClick={handleCancelExport}
              className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Dừng Tiến Trình</span>
            </button>
          )}

          {progress.status === 'completed' && progress.blobUrl && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Đóng
              </button>
              <a
                href={progress.blobUrl}
                download={`Antigravity_Export_${Date.now()}.webm`}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Video Về Máy</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
