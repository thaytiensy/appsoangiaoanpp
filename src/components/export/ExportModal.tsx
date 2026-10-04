'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { ExportManager } from '@/core/export/ExportManager';
import {
  ExportConfig,
  ExportProgress,
  ExportResolution,
  EXPORT_RESOLUTIONS,
} from '@/types/export';
import { AspectRatio } from '@/types/preview';
import {
  Download,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Film,
  Zap,
} from 'lucide-react';

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
      // Lỗi đã được ghi nhận trong progress callback
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

  const dim = EXPORT_RESOLUTIONS[resolution][aspectRatio];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
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
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
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
            <div className="space-y-4">
              {/* Cấu hình Độ phân giải & Tỷ lệ */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Độ Phân Giải</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as ExportResolution)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-hidden"
                  >
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD (Chuẩn)</option>
                    <option value="4K">4K Ultra HD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tỷ Lệ Khung Hình</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-hidden"
                  >
                    <option value="16:9">16:9 Ngang (YouTube)</option>
                    <option value="9:16">9:16 Dọc (TikTok/Reels)</option>
                    <option value="1:1">1:1 Vuông (Instagram)</option>
                  </select>
                </div>
              </div>

              {/* Tốc độ khung hình & Bitrate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tốc Độ Khung Hình (FPS)</label>
                  <select
                    value={fps}
                    onChange={(e) => setFps(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-hidden"
                  >
                    <option value={30}>30 FPS (Mặc định)</option>
                    <option value={60}>60 FPS (Mượt mà)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chất Lượng (Bitrate)</label>
                  <select
                    value={bitrate}
                    onChange={(e) => setBitrate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-hidden"
                  >
                    <option value={3_000_000}>Tiêu Chuẩn (3 Mbps)</option>
                    <option value={6_000_000}>Chất Lượng Cao (6 Mbps)</option>
                    <option value={12_000_000}>Tối Đa (12 Mbps)</option>
                  </select>
                </div>
              </div>

              {/* Thông số đầu ra tóm tắt */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Kích thước xuất:</span>
                  <span className="font-mono text-white font-semibold">
                    {dim.width} x {dim.height} px
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Định dạng container:</span>
                  <span className="font-mono text-sky-400 font-semibold">WebM (VP8/WebCodecs)</span>
                </div>
              </div>
            </div>
          ) : (
            /* Tiến trình Render */
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {progress.status === 'completed'
                    ? 'Xuất video thành công!'
                    : progress.status === 'muxing'
                    ? 'Đang đóng gói file Muxer...'
                    : 'Đang kết xuất khung hình...'}
                </span>
                <span className="font-mono font-bold text-sky-400 text-sm">{progress.percent}%</span>
              </div>

              {/* Thanh tiến trình Progress Bar */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  style={{ width: `${progress.percent}%` }}
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-200"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>
                  Frame: {progress.currentFrame} / {progress.totalFrames}
                </span>
                {progress.status === 'rendering' && (
                  <span>Còn khoảng: {progress.etaSeconds}s</span>
                )}
                {progress.status === 'completed' && progress.fileSizeBytes && (
                  <span className="text-emerald-400 font-bold">
                    Dung lượng: {(progress.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </div>

              {progress.error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{progress.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
          {progress.status === 'idle' && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleStartExport}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-sky-500/20"
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
              className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl transition flex items-center gap-1.5"
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
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
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
