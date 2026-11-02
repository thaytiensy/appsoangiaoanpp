import React, { useState, useEffect } from 'react';
import { DRAWING_LESSONS } from '../data/lessons';
import { ChevronRight, ChevronLeft, Sparkles, BookOpen, Volume2, VolumeX, ZoomIn, X, Palette } from 'lucide-react';
import { ttsService } from '../services/tts';

export default function StepByStepView({ onSelectToDraw, isTvMode = false, teacher }) {
  const [selectedLesson, setSelectedLesson] = useState(DRAWING_LESSONS[5] || DRAWING_LESSONS[0]); // Default to Grade 4 Landscape if present
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentStepIndex(0);
    ttsService.stop();
    setIsSpeaking(false);
  };

  const nextStep = () => {
    ttsService.stop();
    setIsSpeaking(false);
    if (currentStepIndex < selectedLesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    ttsService.stop();
    setIsSpeaking(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const activeStep = selectedLesson.steps[currentStepIndex];

  const toggleSpeakStep = () => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      const pronoun = teacher?.pronoun || (teacher?.gender === 'female' ? 'Cô' : 'Thầy');
      const textToSpeak = `Bước ${activeStep.step}: ${activeStep.title}. ${activeStep.detail}. Bí quyết của ${pronoun}: ${activeStep.tip}`;
      const voice = teacher?.gender || ttsService.getVoice();
      ttsService.speak(
        textToSpeak,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        voice
      );
    }
  };

  // Keyboard navigation for TV remote or desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleSpeakStep();
      } else if (e.key === 'z' || e.key === 'Z') {
        setIsZoomOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsZoomOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, selectedLesson, isSpeaking]);

  return (
    <div className={`max-w-6xl mx-auto p-3 sm:p-6 flex flex-col gap-6 ${isTvMode ? 'text-lg max-w-7xl' : ''}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4 ${isTvMode ? 'p-8 border-4 border-amber-300' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-inner shrink-0 bg-white">
            <img
              src="./teacher.jpg"
              alt="Thầy Cọ Nhí"
              className="w-full h-full object-cover animate-bounce-gentle"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/teacher.jpg';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-black tracking-tight ${isTvMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
                Tập Vẽ Từng Bước Cùng Thầy
              </h2>
              {isTvMode && (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-md">
                  📺 Chế độ Smart TV
                </span>
              )}
            </div>
            <p className={`font-semibold text-blue-100 ${isTvMode ? 'text-base sm:text-lg mt-1' : 'text-sm sm:text-base'}`}>
              Thầy chia nhỏ mọi đề tài (đặc biệt là Phong cảnh Lớp 4 và con vật) thành các hình khối & luật viễn cận dễ vẽ nhất!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-2xl font-black text-xs uppercase tracking-wider">
            Chuẩn Mĩ Thuật GDPT 2018
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Selector */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <h3 className="font-black text-gray-700 text-base px-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Chọn Đề Tài Bé Thích:</span>
          </h3>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {DRAWING_LESSONS.map((lesson) => {
              const isSelected = selectedLesson.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`w-full p-4 rounded-3xl border-2 text-left flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-white border-blue-500 shadow-lg scale-102 ring-4 ring-blue-300'
                      : 'bg-white/80 border-gray-100 hover:bg-white hover:border-blue-200'
                  } ${isTvMode ? 'p-5 focus:ring-4 focus:ring-amber-400' : ''}`}
                >
                  <span className="text-3xl sm:text-4xl p-2.5 bg-blue-50 rounded-2xl shrink-0">
                    {lesson.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-extrabold text-gray-800 ${isTvMode ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                        {lesson.title}
                      </h4>
                      <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                        lesson.grade.includes('Lớp 4') ? 'bg-emerald-100 text-emerald-800 font-black' : 'bg-blue-100 text-blue-800'
                      } ${isTvMode ? 'text-xs' : 'text-[11px]'}`}>
                        {lesson.grade}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-medium">
                      {lesson.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Step-by-Step Interactive Guide */}
        <div className={`lg:col-span-8 bg-white rounded-3xl shadow-xl border-4 border-blue-200 flex flex-col gap-6 ${isTvMode ? 'p-8 border-indigo-300' : 'p-6 sm:p-8'}`}>
          {/* Active Lesson Header & Progress */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-blue-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl">{selectedLesson.icon}</span>
              <div>
                <h3 className={`font-black text-gray-800 ${isTvMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                  {selectedLesson.title}
                </h3>
                <span className="text-xs sm:text-sm font-bold text-blue-600">
                  {selectedLesson.grade} • {selectedLesson.steps.length} Bước Đơn Giản
                </span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2">
              {selectedLesson.steps.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`rounded-full font-black transition-all ${
                    isTvMode ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
                  } ${
                    currentStepIndex === idx
                      ? 'bg-blue-600 text-white shadow-md scale-110 ring-2 ring-amber-400'
                      : idx < currentStepIndex
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Step Content Card */}
          <div className={`bg-blue-50/70 border-2 border-blue-200 rounded-3xl flex flex-col md:flex-row gap-6 items-center ${isTvMode ? 'p-8' : 'p-6'}`}>
            {/* Visual Step Illustration (SVG Crisp Vector Display with Zoom) */}
            <div 
              className={`w-full md:w-72 aspect-[4/3] bg-white rounded-2xl shadow-inner border-2 border-blue-300 relative overflow-hidden flex flex-col items-center justify-center p-2 text-center shrink-0 group cursor-pointer`}
              onClick={() => setIsZoomOpen(true)}
              title="Bấm để phóng to hình nét vẽ của Thầy"
            >
              {activeStep.svg ? (
                <div 
                  className="w-full h-full flex items-center justify-center select-none"
                  dangerouslySetInnerHTML={{ __html: activeStep.svg }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-6xl animate-bounce-gentle mb-2">
                    {selectedLesson.icon}
                  </span>
                  <span className="text-xs font-extrabold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                    Bước {activeStep.step}: {activeStep.title}
                  </span>
                </div>
              )}

              <button
                className="absolute top-2 right-2 p-1.5 rounded-xl bg-white/90 text-gray-700 shadow opacity-80 group-hover:opacity-100 transition"
                title="Phóng to tranh mẫu"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Step Instructions */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="inline-block px-3 py-1 bg-amber-400 text-amber-950 font-black text-xs rounded-full shadow-sm">
                  BƯỚC {activeStep.step} / {selectedLesson.steps.length}
                </div>

                <button
                  onClick={toggleSpeakStep}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 shadow-sm ${
                    isSpeaking
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? 'Dừng Giọng' : 'Nghe Thầy Giảng'}</span>
                </button>
              </div>

              <h4 className={`font-black text-gray-800 ${isTvMode ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
                {activeStep.title}
              </h4>

              <p className={`font-bold text-gray-700 leading-relaxed ${isTvMode ? 'text-lg sm:text-xl' : 'text-base'}`}>
                {activeStep.detail}
              </p>

              {/* Teacher Tip Box */}
              <div className="bg-white p-4 rounded-2xl border-2 border-blue-200 shadow-sm flex items-start gap-3 mt-2">
                <span className="text-2xl">💡</span>
                <p className={`font-bold text-blue-900 leading-normal ${isTvMode ? 'text-sm sm:text-base' : 'text-xs'}`}>
                  <span className="font-extrabold text-amber-600">Bí quyết của Thầy:</span> {activeStep.tip}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-gray-700 font-extrabold rounded-2xl transition ${
                isTvMode ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Bước Trước (←)</span>
            </button>

            {onSelectToDraw && (
              <button
                onClick={() => onSelectToDraw(null)}
                className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition ${
                  isTvMode ? 'px-8 py-3.5 text-lg' : 'px-5 py-2.5 text-sm'
                }`}
              >
                <Palette className="w-5 h-5 text-amber-300" />
                <span>Mở Bảng Vẽ & Thực Hành Ngay</span>
              </button>
            )}

            <button
              onClick={nextStep}
              disabled={currentStepIndex === selectedLesson.steps.length - 1}
              className={`flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-extrabold rounded-2xl shadow-lg transition ${
                isTvMode ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm'
              }`}
            >
              <span>Bước Tiếp (→)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal for SVG Drawing Step */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-800">
                  {selectedLesson.title} - Bước {activeStep.step}: {activeStep.title}
                </h3>
                <p className="text-xs font-bold text-gray-500">
                  Nét vẽ mẫu thị phạm phóng to cho cả lớp quan sát
                </p>
              </div>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-[16/10] bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-200 p-4 flex items-center justify-center">
              {activeStep.svg ? (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: activeStep.svg }}
                />
              ) : (
                <span className="text-8xl">{selectedLesson.icon}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>💡 Mẹo: Bấm phím ESC hoặc bấm ra ngoài để đóng</span>
              <button
                onClick={() => {
                  setIsZoomOpen(false);
                  if (onSelectToDraw) onSelectToDraw(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition"
              >
                🎨 Vào Bảng Vẽ Thực Hành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
