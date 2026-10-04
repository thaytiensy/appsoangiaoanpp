'use client';

import React, { useState } from 'react';
import { StudioPreviewPlayer } from '@/components/preview/StudioPreviewPlayer';
import { MultiTrackTimeline } from '@/components/timeline/MultiTrackTimeline';
import { ExportModal } from '@/components/export/ExportModal';
import { useTimelineStore } from '@/store/useTimelineStore';
import Link from 'next/link';
import { Download, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';

export function StudioEditor() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const cleanupMedia = useTimelineStore((s) => s.cleanupMedia);
  const tracks = useTimelineStore((s) => s.tracks);

  const totalClips = tracks.reduce((acc, t) => acc + t.clips.length, 0);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none font-sans">
      {/* Studio Header Bar */}
      <header className="h-14 px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Quay lại Soạn Giáo Án"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Giáo án</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden md:block" />
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white flex items-center gap-2">
              ANTIGRAVITY STUDIO
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                WebCodecs 2026
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Headless Multi-track Video Processing Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            {tracks.length} Tracks • {totalClips} Clips
          </div>

          <button
            type="button"
            onClick={cleanupMedia}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Làm mới Timeline & Dọn RAM"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white transition flex items-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Video (Export)</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace: Preview Player (Top) & Multi-Track Timeline (Bottom) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Vùng Preview Player */}
        <div className="flex-1 min-h-[380px] p-4 flex items-center justify-center bg-slate-950 overflow-hidden">
          <div className="w-full max-w-5xl">
            <StudioPreviewPlayer />
          </div>
        </div>

        {/* Vùng Multi-track Timeline */}
        <div className="shrink-0 w-full">
          <MultiTrackTimeline />
        </div>
      </main>

      {/* Modal Xuất Video WebCodecs Headless */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
