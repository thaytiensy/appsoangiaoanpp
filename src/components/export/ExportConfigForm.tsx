import React from 'react';
import { ExportResolution, EXPORT_RESOLUTIONS } from '@/types/export';
import { AspectRatio } from '@/types/preview';

interface ExportConfigFormProps {
  resolution: ExportResolution;
  aspectRatio: AspectRatio;
  fps: number;
  bitrate: number;
  onResolutionChange: (val: ExportResolution) => void;
  onAspectRatioChange: (val: AspectRatio) => void;
  onFpsChange: (val: number) => void;
  onBitrateChange: (val: number) => void;
}

export function ExportConfigForm({
  resolution,
  aspectRatio,
  fps,
  bitrate,
  onResolutionChange,
  onAspectRatioChange,
  onFpsChange,
  onBitrateChange,
}: ExportConfigFormProps) {
  const dim = EXPORT_RESOLUTIONS[resolution][aspectRatio];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Độ Phân Giải</label>
          <select
            value={resolution}
            onChange={(e) => onResolutionChange(e.target.value as ExportResolution)}
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
            onChange={(e) => onAspectRatioChange(e.target.value as AspectRatio)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-hidden"
          >
            <option value="16:9">16:9 Ngang (YouTube)</option>
            <option value="9:16">9:16 Dọc (TikTok/Reels)</option>
            <option value="1:1">1:1 Vuông (Instagram)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tốc Độ Khung Hình (FPS)</label>
          <select
            value={fps}
            onChange={(e) => onFpsChange(Number(e.target.value))}
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
            onChange={(e) => onBitrateChange(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-hidden"
          >
            <option value={3_000_000}>Tiêu Chuẩn (3 Mbps)</option>
            <option value={6_000_000}>Chất Lượng Cao (6 Mbps)</option>
            <option value={12_000_000}>Tối Đa (12 Mbps)</option>
          </select>
        </div>
      </div>

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
  );
}
