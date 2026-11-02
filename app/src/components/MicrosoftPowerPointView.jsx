import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Download, 
  Maximize2, 
  Minimize2, 
  Tv, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  PenTool, 
  Eraser, 
  Radio, 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline, 
  HelpCircle, 
  Save, 
  Check, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Sliders, 
  Share2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportSmasPowerPoint } from '../services/smasExport';
import { ttsService } from '../services/tts';

export default function MicrosoftPowerPointView({
  selectedGrade = 1,
  selectedUnit,
  teacher = { name: 'Thầy Cọ Nhí', title: 'Thầy giáo' },
  isTvMode = false,
  onToggleTvMode,
  onStartDrawingOnCanvas
}) {
  const teacherName = teacher?.name || 'Thầy Cọ Nhí';
  const pronoun = teacher?.pronoun || 'Thầy';
  const avatarUrl = teacher?.avatarUrl || './teacher.jpg';

  // Ribbon Tabs: 'home' | 'insert' | 'draw' | 'slideshow' | 'view' | 'file'
  const [activeRibbonTab, setActiveRibbonTab] = useState('home');

  // Editable Slides Deck State (Initialized from unit or local copy)
  const [slides, setSlides] = useState(() => {
    return selectedUnit?.powerpointSlides ? JSON.parse(JSON.stringify(selectedUnit.powerpointSlides)) : [];
  });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Formatting Toolbar State
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [fontColor, setFontColor] = useState('#1e293b');

  // Slide Show Presentation Mode (F5)
  const [isSlideShowMode, setIsSlideShowMode] = useState(false);
  const [slideShowTimer, setSlideShowTimer] = useState(0);

  // Drawing Pen & Laser Pointer on Slide
  const [isPenActive, setIsPenActive] = useState(false);
  const [penColor, setPenColor] = useState('#ef4444');
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [isWhiteScreen, setIsWhiteScreen] = useState(false);

  // Auto-Lecture Engine
  const [isAutoLecturing, setIsAutoLecturing] = useState(false);
  const [autoLecturePaused, setAutoLecturePaused] = useState(false);
  const [autoLectureCountdown, setAutoLectureCountdown] = useState(null);
  const autoLectureTimerRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Presenter Notes Drawer
  const [showNotesDrawer, setShowNotesDrawer] = useState(true);
  const [zoomArtworkModal, setZoomArtworkModal] = useState(false);

  // Interactive Answers Reveal
  const [revealedAnswers, setRevealedAnswers] = useState({});

  // Slide Canvas Refs
  const penCanvasRef = useRef(null);
  const slideContainerRef = useRef(null);

  // Sync slides when selectedUnit changes
  useEffect(() => {
    if (selectedUnit?.powerpointSlides) {
      setSlides(JSON.parse(JSON.stringify(selectedUnit.powerpointSlides)));
      setCurrentSlideIndex(0);
      setRevealedAnswers({});
      clearPenCanvas();
      stopAutoLecture();
    }
  }, [selectedUnit]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (autoLectureTimerRef.current) {
        clearInterval(autoLectureTimerRef.current);
      }
      ttsService.stop();
    };
  }, []);

  const currentSlide = slides[currentSlideIndex] || slides[0] || {};

  // Update specific field of the current slide
  const updateCurrentSlide = (field, value) => {
    setSlides(prev => {
      const next = [...prev];
      next[currentSlideIndex] = {
        ...next[currentSlideIndex],
        [field]: value
      };
      return next;
    });
  };

  // Update bullet point item
  const updateBulletPoint = (bulletIndex, text) => {
    setSlides(prev => {
      const next = [...prev];
      const slide = { ...next[currentSlideIndex] };
      const bullets = [...(slide.bullets || [])];
      bullets[bulletIndex] = text;
      slide.bullets = bullets;
      next[currentSlideIndex] = slide;
      return next;
    });
  };

  // Add new bullet point
  const addBulletPoint = () => {
    setSlides(prev => {
      const next = [...prev];
      const slide = { ...next[currentSlideIndex] };
      slide.bullets = [...(slide.bullets || []), 'Nội dung thực hành mới...'];
      next[currentSlideIndex] = slide;
      return next;
    });
  };

  // Delete bullet point
  const deleteBulletPoint = (bulletIndex) => {
    setSlides(prev => {
      const next = [...prev];
      const slide = { ...next[currentSlideIndex] };
      slide.bullets = slide.bullets.filter((_, idx) => idx !== bulletIndex);
      next[currentSlideIndex] = slide;
      return next;
    });
  };

  // Slide Deck Management: Add, Duplicate, Delete
  const handleAddNewSlide = () => {
    const newSlide = {
      phase: `Hoạt động ${slides.length + 1}`,
      title: 'Tiêu đề hoạt động bổ sung',
      subtitle: 'Mục tiêu & Hướng dẫn thực hành mĩ thuật',
      teacherLecture: `${pronoun} chào các con! Chúng ta cùng bước vào hoạt động sáng tạo tiếp theo nhé!`,
      bullets: [
        'Học sinh chuẩn bị đồ dùng học vẽ cần thiết',
        'Quan sát hình khối và phân bố mảng chính phụ',
        'Lựa chọn gam màu yêu thích để thể hiện tác phẩm'
      ],
      teacherQuestions: ['Con dự định sử dụng màu sắc nào làm trọng tâm cho bức tranh?'],
      studentSampleAnswer: 'Con sẽ dùng màu ấm để làm nổi bật hình ảnh chính ạ!'
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const handleDuplicateSlide = () => {
    if (!currentSlide) return;
    const duplicated = JSON.parse(JSON.stringify(currentSlide));
    duplicated.title = `${duplicated.title} (Bản sao)`;
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, duplicated);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 1) {
      alert('Bài giảng cần có tối thiểu 1 slide trình chiếu.');
      return;
    }
    const nextSlides = slides.filter((_, idx) => idx !== currentSlideIndex);
    setSlides(nextSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  // Reset to original curriculum slides
  const handleResetSlides = () => {
    if (confirm('Khôi phục bài giảng về mẫu gốc chuẩn SGK Kết nối tri thức? Mọi chỉnh sửa của bạn sẽ được đặt lại.')) {
      if (selectedUnit?.powerpointSlides) {
        setSlides(JSON.parse(JSON.stringify(selectedUnit.powerpointSlides)));
        setCurrentSlideIndex(0);
        showSaveToastNotification('Đã khôi phục slide về mẫu gốc!');
      }
    }
  };

  // Save edits notification
  const showSaveToastNotification = (msg) => {
    setSaveToast(msg || 'Đã lưu mọi thay đổi vào bài giảng!');
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Export to Real Microsoft PowerPoint (.pptx)
  const handleExportPptx = async () => {
    setIsExporting(true);
    try {
      await exportSmasPowerPoint({
        unit: selectedUnit,
        teacher,
        grade: selectedGrade,
        slidesData: slides
      });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showSaveToastNotification('Đã xuất thành công tệp PowerPoint (.pptx)!');
    } catch (e) {
      console.error('Lỗi xuất PowerPoint SMAS:', e);
      alert('Không thể xuất tệp PowerPoint. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  // Auto-Lecture Logic
  const startAutoLecture = (startIdx = 0) => {
    setIsAutoLecturing(true);
    setAutoLecturePaused(false);
    playSlideLecture(startIdx);
  };

  const stopAutoLecture = () => {
    if (autoLectureTimerRef.current) {
      clearInterval(autoLectureTimerRef.current);
      autoLectureTimerRef.current = null;
    }
    ttsService.stop();
    setIsSpeaking(false);
    setIsAutoLecturing(false);
    setAutoLecturePaused(false);
    setAutoLectureCountdown(null);
  };

  const pauseAutoLecture = () => {
    ttsService.stop();
    setIsSpeaking(false);
    setAutoLecturePaused(true);
    if (autoLectureTimerRef.current) {
      clearInterval(autoLectureTimerRef.current);
      autoLectureTimerRef.current = null;
    }
  };

  const resumeAutoLecture = () => {
    setAutoLecturePaused(false);
    playSlideLecture(currentSlideIndex);
  };

  const playSlideLecture = (idx) => {
    if (idx < 0 || idx >= slides.length) {
      stopAutoLecture();
      return;
    }

    setCurrentSlideIndex(idx);
    setAutoLectureCountdown(null);
    setAutoLecturePaused(false);

    const s = slides[idx];
    const textToRead = s.teacherLecture || `${pronoun} chào các con! Chúng ta cùng đến với hoạt động: ${s.title}`;

    ttsService.speak(
      textToRead,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        if (idx < slides.length - 1) {
          let count = 3;
          setAutoLectureCountdown(count);
          const interval = setInterval(() => {
            count -= 1;
            if (count > 0) {
              setAutoLectureCountdown(count);
            } else {
              clearInterval(interval);
              setAutoLectureCountdown(null);
              playSlideLecture(idx + 1);
            }
          }, 1000);
          autoLectureTimerRef.current = interval;
        } else {
          // Hoàn thành bài giảng!
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          const endMsg = `Tuyệt vời! ${pronoun} chúc mừng cả lớp đã hoàn thành toàn bộ bài học "${selectedUnit.title}"! Bây giờ các con cùng thực hành vẽ tranh nhé!`;
          ttsService.speak(endMsg);
          stopAutoLecture();
        }
      }
    );
  };

  // Speak current slide lecture
  const speakCurrentSlideOnly = () => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
      return;
    }
    const s = currentSlide;
    const text = s?.teacherLecture || `${pronoun} chào các con! Chúng mình đang học bài ${selectedUnit.title}`;
    ttsService.speak(text, () => setIsSpeaking(true), () => setIsSpeaking(false));
  };

  // Pen Canvas Handlers
  const clearPenCanvas = () => {
    const canvas = penCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (!isPenActive) return;
    const canvas = penCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.isDrawing = true;
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = penCanvasRef.current;
    if (isLaserActive) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
    if (!isPenActive || !canvas?.isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    const canvas = penCanvasRef.current;
    if (canvas) canvas.isDrawing = false;
  };

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      // F5: Start Slide Show
      if (e.key === 'F5' && !e.shiftKey) {
        e.preventDefault();
        setIsSlideShowMode(true);
        setCurrentSlideIndex(0);
      }
      // Shift + F5: Slide Show from Current Slide
      else if (e.key === 'F5' && e.shiftKey) {
        e.preventDefault();
        setIsSlideShowMode(true);
      }
      // Esc: Exit Slide Show
      else if (e.key === 'Escape' && isSlideShowMode) {
        e.preventDefault();
        setIsSlideShowMode(false);
      }
      // Right / Space / PageDown: Next Slide
      else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        if (currentSlideIndex < slides.length - 1) {
          e.preventDefault();
          setCurrentSlideIndex(prev => prev + 1);
        }
      }
      // Left / PageUp / Backspace: Prev Slide
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
        if (currentSlideIndex > 0) {
          e.preventDefault();
          setCurrentSlideIndex(prev => prev - 1);
        }
      }
      // 'B' / 'b': Toggle Black Screen
      else if (e.key === 'b' || e.key === 'B') {
        setIsBlackScreen(prev => !prev);
      }
      // 'W' / 'w': Toggle White Screen
      else if (e.key === 'w' || e.key === 'W') {
        setIsWhiteScreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideShowMode, currentSlideIndex, slides.length]);

  return (
    <div className="w-full flex flex-col rounded-3xl overflow-hidden shadow-2xl border-4 border-[#C43E1C] bg-[#f3f4f6]">
      {/* 1. MICROSOFT 365 POWERPOINT TOP BAR */}
      <div className="bg-[#D24726] text-white px-4 py-2 flex items-center justify-between border-b border-[#B9381A] shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#B9381A] px-2.5 py-1 rounded-xl text-xs font-black shadow-inner">
            <span className="w-5 h-5 rounded-lg bg-white text-[#D24726] font-black flex items-center justify-center text-xs shadow-xs">
              P
            </span>
            <span>PowerPoint</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white/95">
              {selectedUnit?.unitNumber}: {selectedUnit?.title} - Lớp {selectedGrade} (SMAS Viettel)
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-white/80 bg-white/15 px-2 py-0.5 rounded-md font-semibold">
              <Check className="w-3 h-3 text-emerald-300" /> Đã đồng bộ GDPT 2018
            </span>
          </div>
        </div>

        {/* Quick Top Actions: Start Slide Show, Save, Export */}
        <div className="flex items-center gap-2">
          {/* Nút Bắt đầu Trình Chiếu F5 */}
          <button
            onClick={() => {
              setIsSlideShowMode(true);
              setCurrentSlideIndex(0);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-black text-xs shadow-md transition transform hover:scale-105"
            title="Bắt đầu trình chiếu từ slide đầu tiên (Phím: F5)"
          >
            <Play className="w-3.5 h-3.5 fill-amber-950" />
            <span>Trình Chiếu (F5)</span>
          </button>

          {/* Nút Xuất PowerPoint .pptx Chuẩn SMAS */}
          <button
            onClick={handleExportPptx}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow transition disabled:opacity-50"
            title="Tải tệp bài giảng số Microsoft PowerPoint (.pptx) chuẩn nộp SMAS Viettel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Đang xuất...' : 'Xuất PPTX (SMAS)'}</span>
          </button>

          {/* Nút Lưu Thay Đổi */}
          <button
            onClick={() => showSaveToastNotification('Đã lưu bài giảng vào bộ nhớ!')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition text-white"
            title="Lưu các nội dung vừa chỉnh sửa"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưu</span>
          </button>
        </div>
      </div>

      {/* 2. MICROSOFT POWERPOINT OFFICE RIBBON TABS */}
      <div className="bg-[#FAF9F8] border-b border-gray-300 px-4 pt-1 flex items-center justify-between overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1">
          {[
            { id: 'file', label: 'Tệp' },
            { id: 'home', label: 'Trang đầu' },
            { id: 'insert', label: 'Chèn' },
            { id: 'draw', label: 'Vẽ' },
            { id: 'slideshow', label: 'Trình chiếu' },
            { id: 'view', label: 'Xem' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveRibbonTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-black rounded-t-xl transition-all ${
                activeRibbonTab === tab.id
                  ? 'bg-white text-[#D24726] border-t-2 border-x border-[#D24726] shadow-xs'
                  : 'text-gray-700 hover:bg-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* AI Teacher Avatar Voice Indicator */}
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
            <img
              src={avatarUrl}
              alt={teacherName}
              className="w-5 h-5 rounded-full object-cover border border-amber-400"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/teacher.jpg'; }}
            />
            <span className="text-[11px] font-extrabold text-gray-800 hidden sm:inline">
              {teacherName}
            </span>
            <button
              onClick={speakCurrentSlideOnly}
              className={`p-1 rounded-lg transition ${
                isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Nghe Thầy/Cô AI đọc lời giảng slide này"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. RIBBON TOOLBAR ACTION BOXES */}
      <div className="bg-white border-b border-gray-300 p-2 flex items-center justify-between flex-wrap gap-2 text-gray-700 text-xs">
        {/* TAB: TRANG ĐẦU (HOME) */}
        {activeRibbonTab === 'home' && (
          <div className="flex items-center gap-3 flex-wrap w-full justify-between">
            {/* Slide Operations */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200">
              <button
                onClick={handleAddNewSlide}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-black text-xs transition"
                title="Thêm một slide mới vào bài giảng"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                <span>Thêm Slide</span>
              </button>
              <button
                onClick={handleDuplicateSlide}
                className="p-1.5 hover:bg-gray-100 rounded-xl transition text-gray-700"
                title="Nhân bản slide hiện tại"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDeleteSlide}
                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-xl transition"
                title="Xóa slide hiện tại"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font & Text Formatting Tools */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200">
              <span className="text-[11px] font-bold text-gray-400 hidden lg:inline">Phông:</span>
              <button
                onClick={() => setIsBold(prev => !prev)}
                className={`p-1.5 rounded-lg font-black transition ${
                  isBold ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400' : 'hover:bg-gray-100'
                }`}
                title="In đậm (Bold)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsItalic(prev => !prev)}
                className={`p-1.5 rounded-lg italic font-black transition ${
                  isItalic ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400' : 'hover:bg-gray-100'
                }`}
                title="In nghiêng (Italic)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTextAlign('left')}
                  className={`p-1.5 rounded-lg transition ${textAlign === 'left' ? 'bg-gray-200 text-black' : 'hover:bg-gray-100'}`}
                  title="Căn trái"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign('center')}
                  className={`p-1.5 rounded-lg transition ${textAlign === 'center' ? 'bg-gray-200 text-black' : 'hover:bg-gray-100'}`}
                  title="Căn giữa"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign('right')}
                  className={`p-1.5 rounded-lg transition ${textAlign === 'right' ? 'bg-gray-200 text-black' : 'hover:bg-gray-100'}`}
                  title="Căn phải"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Insert Bullets & Items */}
            <div className="flex items-center gap-2">
              <button
                onClick={addBulletPoint}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs transition"
              >
                <Type className="w-3.5 h-3.5" />
                <span>+ Thêm Nét/Gạch Đầu Dòng</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: VẼ (DRAW) */}
        {activeRibbonTab === 'draw' && (
          <div className="flex items-center gap-3 flex-wrap w-full">
            <button
              onClick={() => {
                setIsPenActive(prev => !prev);
                setIsLaserActive(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition ${
                isPenActive ? 'bg-rose-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isPenActive ? 'Đang Bật Bút Vẽ' : 'Bật Bút Vẽ Trực Tiếp'}</span>
            </button>

            {/* Bảng màu bút vẽ */}
            {isPenActive && (
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(c => (
                  <button
                    key={c}
                    onClick={() => setPenColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full transition transform ${penColor === c ? 'scale-125 ring-2 ring-black' : 'hover:scale-110'}`}
                  />
                ))}
                <button
                  onClick={clearPenCanvas}
                  className="flex items-center gap-1 px-2 py-0.5 bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-[11px] font-bold border border-gray-200"
                >
                  <Eraser className="w-3 h-3" />
                  <span>Xóa Nét Vẽ</span>
                </button>
              </div>
            )}

            {/* Con trỏ Laser */}
            <button
              onClick={() => {
                setIsLaserActive(prev => !prev);
                setIsPenActive(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition ${
                isLaserActive ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Con Trỏ Laser (Soi Tranh)</span>
            </button>
          </div>
        )}

        {/* TAB: TRÌNH CHIẾU (SLIDESHOW) */}
        {activeRibbonTab === 'slideshow' && (
          <div className="flex items-center gap-3 flex-wrap w-full">
            <button
              onClick={() => {
                setIsSlideShowMode(true);
                setCurrentSlideIndex(0);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-black text-xs shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Trình Chiếu Từ Đầu (F5)</span>
            </button>

            <button
              onClick={() => setIsSlideShowMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl font-bold text-xs"
            >
              <span>Từ Slide Hiện Tại (Shift+F5)</span>
            </button>

            {/* Giảng Tự Động */}
            {!isAutoLecturing ? (
              <button
                onClick={() => startAutoLecture(currentSlideIndex)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow transition animate-pulse"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI {teacherName} Giảng Tự Động 5 Hoạt Động</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-300">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Đang Giảng Slide {currentSlideIndex + 1}/{slides.length}
                </span>
                <button
                  onClick={autoLecturePaused ? resumeAutoLecture : pauseAutoLecture}
                  className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  {autoLecturePaused ? 'Tiếp tục' : 'Tạm dừng'}
                </button>
                <button
                  onClick={stopAutoLecture}
                  className="px-2 py-0.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                >
                  Dừng
                </button>
              </div>
            )}

            {/* Smart TV Mode Toggle */}
            {onToggleTvMode && (
              <button
                onClick={onToggleTvMode}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs transition ${
                  isTvMode ? 'bg-amber-400 text-amber-950' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Chế Độ Smart TV</span>
              </button>
            )}
          </div>
        )}

        {/* TAB: TỆP (FILE) */}
        {activeRibbonTab === 'file' && (
          <div className="flex items-center gap-3 flex-wrap w-full">
            <button
              onClick={handleExportPptx}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Đang tạo...' : 'Tải Về File PowerPoint (.pptx) SMAS'}</span>
            </button>
            <button
              onClick={handleResetSlides}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi Phục Bản Gốc SGK</span>
            </button>
          </div>
        )}

        {/* TAB: CHÈN (INSERT) */}
        {activeRibbonTab === 'insert' && (
          <div className="flex items-center gap-3 flex-wrap w-full">
            <button
              onClick={addBulletPoint}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xs"
            >
              <Type className="w-3.5 h-3.5 text-blue-600" />
              <span>Chèn Đoạn Văn Bản / Nét Vẽ</span>
            </button>
            <button
              onClick={() => onStartDrawingOnCanvas && onStartDrawingOnCanvas()}
              className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold text-xs"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Chèn Tranh Tự Vẽ Từ Bảng Vẽ</span>
            </button>
          </div>
        )}

        {/* TAB: XEM (VIEW) */}
        {activeRibbonTab === 'view' && (
          <div className="flex items-center gap-3 flex-wrap w-full">
            <button
              onClick={() => setShowNotesDrawer(prev => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>{showNotesDrawer ? 'Ẩn Ghi Chú Giảng Bài' : 'Hiện Ghi Chú Giảng Bài'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. MAIN POWERPOINT WORKSPACE: LEFT THUMBNAILS + CENTER SLIDE STAGE */}
      <div className="flex flex-1 min-h-[580px] bg-[#EAE8E4] relative overflow-hidden">
        {/* LEFT SLIDE THUMBNAIL STRIP */}
        <div className="w-36 sm:w-44 bg-[#F0EEEA] border-r border-gray-300 p-2 overflow-y-auto flex flex-col gap-2 shrink-0">
          <div className="text-[11px] font-black uppercase text-gray-500 px-1 mb-1 flex items-center justify-between">
            <span>Danh Sách Slide</span>
            <span className="bg-white px-1.5 py-0.2 rounded text-[10px] text-gray-700 font-bold border">
              {slides.length}
            </span>
          </div>

          {slides.map((s, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-1.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1 relative ${
                currentSlideIndex === idx
                  ? 'border-[#D24726] bg-white shadow-md scale-102 ring-2 ring-[#D24726]/30'
                  : 'border-gray-200 bg-white/70 hover:bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-black text-gray-500 px-1">
                <span>Slide {idx + 1}</span>
                <span className="text-[9px] text-[#D24726] truncate max-w-[80px]">
                  {s.phase || `HĐ ${idx + 1}`}
                </span>
              </div>

              {/* 16:9 Thumbnail Box */}
              <div className="w-full aspect-video bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-gray-200 p-1 flex flex-col justify-between overflow-hidden text-[8px] text-gray-600 select-none">
                <p className="font-extrabold text-[#D24726] truncate leading-tight">
                  {s.title}
                </p>
                <div className="space-y-0.5">
                  <div className="w-3/4 h-1 bg-gray-300 rounded-full" />
                  <div className="w-1/2 h-1 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          ))}

          {/* Quick Add Slide in Strip */}
          <button
            onClick={handleAddNewSlide}
            className="w-full py-2 bg-white/80 hover:bg-white border-2 border-dashed border-gray-300 hover:border-[#D24726] rounded-xl text-gray-600 hover:text-[#D24726] font-black text-xs flex items-center justify-center gap-1 transition mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Slide</span>
          </button>
        </div>

        {/* CENTER SLIDE STAGE */}
        <div className="flex-1 p-3 sm:p-6 flex flex-col items-center justify-between overflow-y-auto">
          {/* Real 16:9 Slide Canvas */}
          <div 
            ref={slideContainerRef}
            className="w-full max-w-4xl aspect-[16/9] bg-white rounded-2xl shadow-xl border border-gray-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all"
            style={{
              fontFamily: 'Nunito, sans-serif'
            }}
          >
            {/* Slide Header: Phase & Editable Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={currentSlide.phase || ''}
                  onChange={(e) => updateCurrentSlide('phase', e.target.value)}
                  className="text-xs sm:text-sm font-black text-[#D24726] uppercase tracking-wider bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#D24726] outline-none transition w-1/2"
                  placeholder="Nhập giai đoạn hoạt động..."
                />
                <span className="text-xs font-bold text-gray-400">
                  Slide {currentSlideIndex + 1} / {slides.length}
                </span>
              </div>

              {/* Editable Slide Title */}
              <input
                type="text"
                value={currentSlide.title || ''}
                onChange={(e) => updateCurrentSlide('title', e.target.value)}
                className="w-full text-lg sm:text-2xl font-black text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#D24726] outline-none transition pb-1"
                placeholder="Nhập tiêu đề hoạt động..."
                style={{
                  fontWeight: isBold ? '900' : '700',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textAlign: textAlign
                }}
              />

              {/* Editable Subtitle */}
              <input
                type="text"
                value={currentSlide.subtitle || ''}
                onChange={(e) => updateCurrentSlide('subtitle', e.target.value)}
                className="w-full text-xs sm:text-sm font-bold text-amber-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-amber-500 outline-none transition mt-1"
                placeholder="Nhập mục tiêu hoạt động..."
              />
            </div>

            {/* Slide Content: Bullets on Left + Visual Artwork on Right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-auto items-center">
              {/* Left Column: Bullet points list */}
              <div className="md:col-span-7 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Nội dung trọng tâm & Bước thực hiện:
                </span>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {(currentSlide.bullets || []).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 group">
                      <span className="text-[#D24726] font-black mt-0.5">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => updateBulletPoint(bIdx, e.target.value)}
                        className="w-full text-xs sm:text-sm text-gray-800 bg-transparent border border-transparent hover:border-gray-200 focus:border-[#D24726] rounded-lg p-1 outline-none resize-none transition"
                        placeholder="Nội dung bước thực hành..."
                      />
                      <button
                        onClick={() => deleteBulletPoint(bIdx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-600 transition"
                        title="Xóa dòng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Visual Artwork Card */}
              <div className="md:col-span-5 bg-gradient-to-br from-amber-50 to-orange-50/80 p-3 rounded-2xl border-2 border-amber-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-amber-950 uppercase">
                    🎨 Tranh Thị Phạm
                  </span>
                  <button
                    onClick={() => setZoomArtworkModal(true)}
                    className="p-1 hover:bg-white rounded-lg text-amber-900 transition"
                    title="Phóng to tranh"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-full aspect-[4/3] bg-white rounded-xl overflow-hidden border border-amber-300 shadow-inner flex items-center justify-center p-2">
                  <img
                    src={currentSlide.visualArt?.imageUrl || selectedUnit?.visualArt?.imageUrl || './teacher.jpg'}
                    alt="Tranh mẫu"
                    className="max-h-full max-w-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = './teacher.jpg';
                    }}
                  />
                </div>

                <p className="text-[11px] font-bold text-gray-700 text-center mt-1.5 truncate">
                  {currentSlide.visualArt?.title || selectedUnit?.visualArt?.title || selectedUnit?.title}
                </p>
              </div>
            </div>

            {/* Slide Footer: Bottom Meta */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-bold">
              <span>Môn Mĩ Thuật Lớp {selectedGrade} • Bộ sách Kết nối tri thức</span>
              <span>Hệ thống Quản lý Nhà trường SMAS Viettel</span>
            </div>

            {/* Pen Annotation Canvas Overlay */}
            {isPenActive && (
              <canvas
                ref={penCanvasRef}
                width={800}
                height={450}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="absolute inset-0 w-full h-full cursor-crosshair z-20 pointer-events-auto"
              />
            )}
          </div>

          {/* 5. BOTTOM PRESENTER NOTES & AI LECTURE DRAWER */}
          {showNotesDrawer && (
            <div className="w-full max-w-4xl mt-3 bg-white p-3 sm:p-4 rounded-2xl border-2 border-amber-200 shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#D24726] uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Ghi Chú Của Diễn Giả (Lời Giảng Của {teacherName})</span>
                  </span>
                  <span className="text-[11px] text-gray-400 italic hidden sm:inline">
                    (Có thể chỉnh sửa trực tiếp, AI sẽ đọc đúng lời này)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={speakCurrentSlideOnly}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-xs transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Dừng Đọc' : 'Đọc Lời Giảng'}</span>
                  </button>
                </div>
              </div>

              {/* Editable Presenter Speech Textarea */}
              <textarea
                rows={2}
                value={currentSlide.teacherLecture || ''}
                onChange={(e) => updateCurrentSlide('teacherLecture', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-[#D24726] focus:ring-1 focus:ring-[#D24726] text-xs sm:text-sm text-gray-800 bg-amber-50/30 outline-none transition font-sans leading-relaxed"
                placeholder="Nhập lời giảng sư phạm của Thầy/Cô cho slide này..."
              />
            </div>
          )}
        </div>
      </div>

      {/* 6. BOTTOM STATUS BAR */}
      <div className="bg-[#FAF9F8] border-t border-gray-300 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-600 font-bold flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span>Slide {currentSlideIndex + 1} / {slides.length}</span>
          <span>Tiếng Việt (Việt Nam)</span>
          <span className="text-emerald-700">● Chuẩn GDPT 2018</span>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
            disabled={currentSlideIndex === 0}
            className="px-2.5 py-1 bg-white hover:bg-gray-100 disabled:opacity-30 rounded-lg border border-gray-300 font-bold transition flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trước</span>
          </button>
          <button
            onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlideIndex === slides.length - 1}
            className="px-2.5 py-1 bg-white hover:bg-gray-100 disabled:opacity-30 rounded-lg border border-gray-300 font-bold transition flex items-center gap-1"
          >
            <span>Tiếp</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7. FULLSCREEN SLIDE SHOW PRESENTATION MODE (F5) */}
      {isSlideShowMode && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-between p-4 sm:p-8 select-none">
          {/* Top Bar in Slide Show */}
          <div className="w-full flex items-center justify-between text-xs text-white/70">
            <span>
              {selectedUnit?.title} - {currentSlide?.phase}
            </span>
            <button
              onClick={() => setIsSlideShowMode(false)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition"
            >
              Thoát Trình Chiếu (Esc)
            </button>
          </div>

          {/* Centered Large Slide Canvas */}
          <div className="w-full max-w-5xl aspect-[16/9] bg-white text-gray-900 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div>
              <p className="text-xs sm:text-sm font-black text-[#D24726] uppercase tracking-wider mb-1">
                {currentSlide.phase}
              </p>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-950">
                {currentSlide.title}
              </h2>
              <p className="text-sm sm:text-base font-bold text-amber-800 mt-2">
                {currentSlide.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-center">
              <div className="md:col-span-7 space-y-3">
                {(currentSlide.bullets || []).map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-lg font-bold text-gray-800">
                    <span className="text-[#D24726] font-black text-xl">•</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="md:col-span-5 bg-amber-50 p-4 rounded-2xl border border-amber-300">
                <img
                  src={currentSlide.visualArt?.imageUrl || selectedUnit?.visualArt?.imageUrl || './teacher.jpg'}
                  alt="Tranh mẫu"
                  className="w-full aspect-[4/3] object-contain rounded-xl bg-white p-2 shadow-sm"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = './teacher.jpg'; }}
                />
                <p className="text-xs font-black text-center text-gray-700 mt-2 truncate">
                  {currentSlide.visualArt?.title || selectedUnit?.visualArt?.title}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span>Giáo án Mĩ thuật GDPT 2018</span>
              <span>Slide {currentSlideIndex + 1} / {slides.length}</span>
            </div>
          </div>

          {/* Bottom Floating Presenter Controls */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-xl transition"
              title="Slide trước (Phím: Mũi tên trái)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-black px-2">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-xl transition"
              title="Slide tiếp theo (Phím: Mũi tên phải / Space)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="h-5 w-px bg-white/20 mx-1" />
            <button
              onClick={speakCurrentSlideOnly}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'Dừng Giảng' : 'Thầy/Cô Giảng Slide'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2 text-xs font-black animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}
    </div>
  );
}
