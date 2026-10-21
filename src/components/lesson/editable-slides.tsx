'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Monitor, MessageSquare, Image as ImageIcon, Copy, Check, Sparkles } from 'lucide-react';
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
      {/* Khung Slide 16:9 Nền Trắng Chuẩn Hiện Đại */}
      <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between text-slate-700 text-sm mb-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-xs sm:text-sm">
              Slide {currentSlide.slideNumber} / {slides.length} (Tỷ lệ 16:9 Trình Chiếu Nền Trắng)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySlides}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-xs text-slate-700 font-medium rounded-lg border border-slate-200 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép toàn bộ Slide'}</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentIdx((p) => (p > 0 ? p - 1 : slides.length - 1))}
              aria-label="Slide trước"
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentIdx((p) => (p < slides.length - 1 ? p + 1 : 0))}
              aria-label="Slide tiếp theo"
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Khung Canvas Trình Chiếu 16:9 Tone Trắng Tinh Tế */}
        <div
          contentEditable
          suppressContentEditableWarning
          className="aspect-video w-full bg-white rounded-xl p-6 sm:p-8 flex flex-col justify-between border-2 border-slate-200 text-slate-900 shadow-md relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {/* Header Slide & Nội dung phân 2 cột với ảnh minh họa */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start h-full">
            {/* Cột Trái: Tiêu đề & Bullet points */}
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>SLIDE {currentSlide.slideNumber}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug">
                {currentSlide.title}
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pt-1">
                {currentSlide.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột Phải: Hình ảnh minh họa phù hợp nội dung */}
            {currentSlide.imageUrl && (
              <div className="w-full md:w-5/12 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs flex flex-col">
                <div className="aspect-16/9 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover transition hover:scale-105 duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
                <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-slate-600 truncate max-w-[170px]">
                    <ImageIcon className="w-3 h-3 text-blue-600 shrink-0" />
                    <span>Ảnh minh họa AI phù hợp</span>
                  </span>
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">16:9 HD</span>
                </div>
              </div>
            )}
          </div>

          {currentSlide.visualNote && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-amber-900 bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200/70">
              <ImageIcon className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span><strong>Gợi ý sư phạm:</strong> {currentSlide.visualNote}</span>
            </div>
          )}
        </div>

        {currentSlide.speakerNotes && (
          <div className="mt-4 p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 shadow-2xs">
            <MessageSquare className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-emerald-700">Gợi ý lời giảng của giáo viên: </span>
              <span className="leading-relaxed">{currentSlide.speakerNotes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Danh sách Thumbnails Slide */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {slides.map((slide, idx) => (
          <button
            key={slide.slideNumber}
            type="button"
            onClick={() => setCurrentIdx(idx)}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              currentIdx === idx
                ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500'
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
