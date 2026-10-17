import React from 'react';
import { ExportProgress } from '@/types/export';
import { AlertTriangle } from 'lucide-react';

interface ExportProgressViewProps {
  progress: ExportProgress;
}

export function ExportProgressView({ progress }: ExportProgressViewProps) {
  const statusText =
    progress.status === 'completed'
      ? 'Xuất video thành công!'
      : progress.status === 'muxing'
      ? 'Đang đóng gói file Muxer...'
      : 'Đang kết xuất khung hình...';

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">{statusText}</span>
        <span className="font-mono font-bold text-sky-400 text-sm">{progress.percent}%</span>
      </div>

      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          style={{ width: `${progress.percent}%` }}
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-200"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Frame: {progress.currentFrame} / {progress.totalFrames}</span>
        {progress.status === 'rendering' && <span>Còn khoảng: {progress.etaSeconds}s</span>}
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
  );
}
