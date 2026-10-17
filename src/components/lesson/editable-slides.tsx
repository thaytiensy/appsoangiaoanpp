'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, MessageSquare, Image as ImageIcon, Copy, Check } from 'lucide-react';
import type { SlideItem } from '../../contracts/app.schema';

interface EditableSlidesProps {
  readonly slides: readonly SlideItem[];
}

export function EditableSlides({ slides }: EditableSlidesProps): React.JSX.Element {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!slides || slides.length === 0) {
    return <div className="text-center p-8 text-slate-500">Chưa có dữ liệu Slide.</div>;
  }

  const currentSlide = slides[currentIdx] || slides[0];

  const handleCopySlides = async (): Promise<void> => {
    try {
      const text = slides
        .map(
          (s) =>
            `SLIDE ${s.slideNumber}: ${s.title}\n` +
            s.bulletPoints.map((p) => `- ${p}`).join('\n') +
            (s.visualNote ? `\n[Hình ảnh gợi ý]: ${s.visualNote}` : '') +
            (s.speakerNotes ? `\n[Lời giảng GV]: ${s.speakerNotes}` : '')
        )
        .join('\n\n---\n\n');
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Bỏ qua lỗi clipboard
    }
  };

  return (
    <div className="space-y-6">
      {/* Khung Slide 16:9 */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between text-white text-sm mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-xs sm:text-sm">
              Slide {currentSlide.slideNumber} / {slides.length} (Tỷ lệ 16:9 Chuẩn Trình Chiếu)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySlides}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép toàn bộ Slide'}</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentIdx((p) => (p > 0 ? p - 1 : slides.length - 1))}
              aria-label="Slide trước"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentIdx((p) => (p < slides.length - 1 ? p + 1 : 0))}
              aria-label="Slide tiếp theo"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Khung Slide 16:9 contentEditable */}
        <div
          contentEditable
          suppressContentEditableWarning
          className="aspect-video w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-xl p-6 sm:p-10 flex flex-col justify-between border border-slate-700 text-white shadow-2xl relative overflow-hidden focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <div>
            <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              Slide {currentSlide.slideNumber}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-4">
              {currentSlide.title}
            </h3>
            <ul className="space-y-2.5 text-sm sm:text-base text-slate-200">
              {currentSlide.bulletPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {currentSlide.visualNote && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg">
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span><strong>Gợi ý hình ảnh:</strong> {currentSlide.visualNote}</span>
            </div>
          )}
        </div>

        {currentSlide.speakerNotes && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-emerald-400">Gợi ý lời giảng của giáo viên: </span>
              <span>{currentSlide.speakerNotes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {slides.map((slide, idx) => (
          <button
            key={slide.slideNumber}
            type="button"
            onClick={() => setCurrentIdx(idx)}
            className={`p-2.5 rounded-xl border text-left transition ${
              currentIdx === idx
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold text-slate-500 mb-1">Slide {slide.slideNumber}</div>
            <div className="text-xs font-semibold text-slate-800 truncate">{slide.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
