import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Palette, 
  FileText, 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  CheckCircle2, 
  Lightbulb, 
  Target,
  Image as ImageIcon,
  MessageCircle,
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  HelpCircle,
  Camera,
  PenTool,
  Radio,
  Eraser,
  Eye,
  EyeOff,
  Tv,
  Smartphone,
  Mouse,
  Keyboard,
  ZoomIn,
  ZoomOut,
  X,
  Sliders,
  Monitor,
  Table,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { KET_NOI_TRI_THUC_DATA } from '../data/ketNoiTriThucCurriculum';
import { generateTeacherResponse } from '../services/gemini';
import { ttsService } from '../services/tts';
import SmasExcelView from './SmasExcelView';
import { exportSmasPowerPoint } from '../services/smasExport';

export default function ThematicTeacherChat({ 
  apiKey, 
  onStartDrawingOnCanvas, 
  onGoToCritique, 
  teacher,
  onUnitChange,
  onSlideChange,
  isTvMode: externalTvMode,
  onToggleTvMode
}) {
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(KET_NOI_TRI_THUC_DATA[0]);
  const [viewMode, setViewMode] = useState('powerpoint'); // 'powerpoint' | 'word' | 'excel' | 'chat'
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  
  // PowerPoint Slide & Presentation State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLaserOn, setIsLaserOn] = useState(false);
  const [laserCoords, setLaserCoords] = useState({ x: -100, y: -100 });
  const [isPenOn, setIsPenOn] = useState(false);
  const [isDrawingOnSlide, setIsDrawingOnSlide] = useState(false);
  
  // Interactive Quiz & Activities State
  const [activeInteractiveTab, setActiveInteractiveTab] = useState(null); // 'quiz' | 'explore' | 'apply'
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);

  // Student Answers Reveal State (Hidden by default, user clicks to reveal)
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [allAnswersRevealed, setAllAnswersRevealed] = useState(false);

  // Multi-Device & Presentation Controls State (Smart TV, Mobile, Mouse, Clicker)
  const [internalTvMode, setInternalTvMode] = useState(false);
  const isTvMode = externalTvMode !== undefined ? externalTvMode : internalTvMode;
  const setIsTvMode = (valOrFn) => {
    if (typeof valOrFn === 'function') {
      const nextVal = valOrFn(isTvMode);
      if (onToggleTvMode && nextVal !== isTvMode) onToggleTvMode();
      else setInternalTvMode(nextVal);
    } else {
      if (onToggleTvMode && valOrFn !== isTvMode) onToggleTvMode();
      else setInternalTvMode(valOrFn);
    }
  };
  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [isWhiteScreen, setIsWhiteScreen] = useState(false);
  const [showDeviceControllerModal, setShowDeviceControllerModal] = useState(false);
  const [zoomArtworkModal, setZoomArtworkModal] = useState(false);
  const [deviceTab, setDeviceTab] = useState('tv'); // 'tv' | 'mobile' | 'mouse' | 'keyboard'

  // Visual Artwork Studio State (High-res artwork vs SGK vector)
  const [visualMode, setVisualMode] = useState('ai'); // 'ai' | 'vector'
  const [aiImageSeed, setAiImageSeed] = useState(1);
  const [slideImageLoaded, setSlideImageLoaded] = useState(false);
  const [slideImageError, setSlideImageError] = useState(false);

  // Device Input Refs (Touch Swipe & Mouse Wheel)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastWheelTimeRef = useRef(0);

  const toggleRevealAnswer = (slideIdx, qIdx) => {
    const key = `${slideIdx}_${qIdx}`;
    setRevealedAnswers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleRevealAllAnswers = (slideIdx, count) => {
    const nextState = !allAnswersRevealed;
    setAllAnswersRevealed(nextState);
    const updated = { ...revealedAnswers };
    for (let i = 0; i < count; i++) {
      updated[`${slideIdx}_${i}`] = nextState;
    }
    setRevealedAnswers(updated);
  };

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const chatBottomRef = useRef(null);
  const slideContainerRef = useRef(null);
  const penCanvasRef = useRef(null);
  const topicRibbonRef = useRef(null);

  const teacherName = teacher?.name || 'Thầy Cọ Nhí';
  const pronoun = teacher?.pronoun || 'Thầy';
  const avatarUrl = teacher?.avatarUrl || './teacher.jpg';

  // Filter lessons for selected grade
  const gradeUnits = KET_NOI_TRI_THUC_DATA.filter(u => u.grade === selectedGrade);
  const slides = selectedUnit.powerpointSlides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Sequential Auto-Lecture Engine (Giảng Bài Tuần Tự Theo Các Hoạt Động Giáo Án)
  const [isAutoLecturing, setIsAutoLecturing] = useState(false);
  const [autoLecturePaused, setAutoLecturePaused] = useState(false);
  const [autoLectureCountdown, setAutoLectureCountdown] = useState(null);
  const autoLectureTimerRef = useRef(null);

  // Clean up auto lecture timer on unmount
  useEffect(() => {
    return () => {
      if (autoLectureTimerRef.current) {
        clearInterval(autoLectureTimerRef.current);
        clearTimeout(autoLectureTimerRef.current);
      }
    };
  }, []);

  // Update unit when grade changes
  const handleSelectGrade = (grade) => {
    stopAutoLecture();
    setSelectedGrade(grade);
    const firstOfGrade = KET_NOI_TRI_THUC_DATA.find(u => u.grade === grade);
    if (firstOfGrade) {
      setSelectedUnit(firstOfGrade);
      setCurrentSlideIndex(0);
      setQuizAnswered(false);
      setSelectedQuizOption(null);
      setQuizFeedback(null);
      clearPenCanvas();
    }
  };

  const handleSelectUnit = (unit) => {
    stopAutoLecture();
    setSelectedUnit(unit);
    setCurrentSlideIndex(0);
    setQuizAnswered(false);
    setSelectedQuizOption(null);
    setQuizFeedback(null);
    clearPenCanvas();
    ttsService.stop();
    setIsSpeaking(false);
  };

  // Synchronize unit & slide with parent App
  useEffect(() => {
    if (onUnitChange && selectedUnit) {
      onUnitChange(selectedUnit);
    }
  }, [selectedUnit, onUnitChange]);

  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentSlideIndex);
    }
  }, [currentSlideIndex, onSlideChange]);

  // Pre-warm audio cache for all slides of this unit in the background
  useEffect(() => {
    if (selectedUnit?.powerpointSlides) {
      selectedUnit.powerpointSlides.forEach((s) => {
        if (s.teacherLecture) {
          ttsService.preload(s.teacherLecture);
        }
      });
    }
  }, [selectedUnit]);

  const getLectureTextForIndex = (idx) => {
    if (viewMode === 'word') {
      const act = selectedUnit.wordLessonPlan?.activities?.[idx];
      if (!act) return `Hoạt động ${idx + 1}`;
      let text = `${act.phase}. Thời lượng ${act.duration || '5 phút'}. ${act.objective || ''}. `;
      if (act.teacherAct) text += `Nội dung của ${pronoun}: ${act.teacherAct}. `;
      if (act.teacherQuestions && act.teacherQuestions.length > 0) {
        text += `${pronoun} có câu hỏi gợi mở cho các con: ${act.teacherQuestions[0]} `;
      }
      return text;
    } else {
      const s = slides[idx];
      return s?.teacherLecture || `${pronoun} chào các con! Chúng ta cùng đến với ${s?.title || ('hoạt động ' + (idx + 1))}.`;
    }
  };

  const stopAutoLecture = () => {
    if (autoLectureTimerRef.current) {
      clearInterval(autoLectureTimerRef.current);
      clearTimeout(autoLectureTimerRef.current);
      autoLectureTimerRef.current = null;
    }
    ttsService.stop();
    setIsSpeaking(false);
    setIsAutoLecturing(false);
    setAutoLecturePaused(false);
    setAutoLectureCountdown(null);
  };

  const playActivityLecture = (idx) => {
    if (idx < 0 || idx >= slides.length) {
      stopAutoLecture();
      return;
    }

    if (autoLectureTimerRef.current) {
      clearInterval(autoLectureTimerRef.current);
      clearTimeout(autoLectureTimerRef.current);
      autoLectureTimerRef.current = null;
    }

    setCurrentSlideIndex(idx);
    setAutoLectureCountdown(null);
    setAutoLecturePaused(false);

    const lectureText = getLectureTextForIndex(idx);

    ttsService.speak(
      lectureText,
      () => {
        setIsSpeaking(true);
      },
      () => {
        setIsSpeaking(false);

        // If auto lecturing is still active and not paused
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
              playActivityLecture(idx + 1);
            }
          }, 1000);

          autoLectureTimerRef.current = interval;
        } else {
          // Finished all 5 activities!
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });

          const victoryMsg = `Tuyệt vời! ${pronoun} chúc mừng các con đã hoàn thành xuất sắc toàn bộ 5 hoạt động của bài học "${selectedUnit.title}"! Các con hãy cùng nhau bước vào Bảng vẽ để thực hành sáng tạo tác phẩm thật đẹp nhé!`;
          ttsService.speak(
            victoryMsg,
            () => setIsSpeaking(true),
            () => {
              setIsSpeaking(false);
              setIsAutoLecturing(false);
            }
          );
        }
      }
    );
  };

  const startAutoLecture = (startIdx = 0) => {
    setIsAutoLecturing(true);
    setAutoLecturePaused(false);
    playActivityLecture(startIdx);
  };

  const pauseAutoLecture = () => {
    if (autoLectureTimerRef.current) {
      clearInterval(autoLectureTimerRef.current);
      clearTimeout(autoLectureTimerRef.current);
      autoLectureTimerRef.current = null;
    }
    ttsService.stop();
    setIsSpeaking(false);
    setAutoLecturePaused(true);
  };

  const resumeAutoLecture = () => {
    setAutoLecturePaused(false);
    playActivityLecture(currentSlideIndex);
  };

  const autoNextActivity = () => {
    if (currentSlideIndex < slides.length - 1) {
      if (autoLectureTimerRef.current) {
        clearInterval(autoLectureTimerRef.current);
        clearTimeout(autoLectureTimerRef.current);
        autoLectureTimerRef.current = null;
      }
      playActivityLecture(currentSlideIndex + 1);
    }
  };

  const autoPrevActivity = () => {
    if (currentSlideIndex > 0) {
      if (autoLectureTimerRef.current) {
        clearInterval(autoLectureTimerRef.current);
        clearTimeout(autoLectureTimerRef.current);
        autoLectureTimerRef.current = null;
      }
      playActivityLecture(currentSlideIndex - 1);
    }
  };

  // Next / Prev Slide & Direct Navigation
  const goToSlide = (idx) => {
    if (isAutoLecturing) stopAutoLecture();
    if (idx >= 0 && idx < slides.length) {
      setCurrentSlideIndex(idx);
    }
  };

  const goToNextSlide = () => {
    if (isAutoLecturing) stopAutoLecture();
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (isAutoLecturing) stopAutoLecture();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  // When switching slides manually, auto speak lecture if voice is enabled and not in auto lecture
  useEffect(() => {
    setQuizAnswered(false);
    setSelectedQuizOption(null);
    setQuizFeedback(null);
    setAllAnswersRevealed(false);
    setRevealedAnswers({});
    setSlideImageError(false);
    setIsBlackScreen(false);
    setIsWhiteScreen(false);
    clearPenCanvas();

    if (!isAutoLecturing && viewMode === 'powerpoint' && voiceEnabled && currentSlide?.teacherLecture) {
      const timer = setTimeout(() => {
        ttsService.speak(
          currentSlide.teacherLecture,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentSlideIndex, selectedUnit, viewMode, isAutoLecturing]);

  // Universal Keyboard, Remote & Clicker Navigation Engine
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in chat or text inputs
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key;
      const code = e.code;
      const keyCode = e.keyCode;

      // 1. Next slide: Right arrow, PageDown, Space, Enter, NumpadEnter
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || code === 'NumpadEnter') {
        e.preventDefault();
        goToNextSlide();
      }
      // 2. Previous slide: Left arrow, PageUp, Backspace
      else if (key === 'ArrowLeft' || key === 'PageUp' || key === 'Backspace') {
        e.preventDefault();
        goToPrevSlide();
      }
      // 3. Number keys 1 - 5: Direct Jump to Activity
      else if (['1', '2', '3', '4', '5'].includes(key)) {
        const targetIndex = parseInt(key, 10) - 1;
        if (targetIndex < slides.length) {
          goToSlide(targetIndex);
        }
      }
      // 4. Toggle Student Answers: 'A' key, or Green TV Remote button (ColorF1Green / 404)
      else if (key.toLowerCase() === 'a' || key === 'ColorF1Green' || keyCode === 404) {
        e.preventDefault();
        toggleRevealAllAnswers(currentSlideIndex, currentSlide?.teacherQuestions?.length || 0);
      }
      // 5. Toggle Teacher Speech: 'V' / 'S' key, or Red TV Remote button (ColorF0Red / 403)
      else if (key.toLowerCase() === 'v' || key.toLowerCase() === 's' || key === 'ColorF0Red' || keyCode === 403) {
        e.preventDefault();
        toggleCurrentSlideSpeech();
      }
      // 6. Toggle Visual Mode (Photo vs Vector): 'M' / 'I' key, or Yellow TV Remote button (ColorF2Yellow / 405)
      else if (key.toLowerCase() === 'm' || key.toLowerCase() === 'i' || key === 'ColorF2Yellow' || keyCode === 405) {
        e.preventDefault();
        setVisualMode(prev => (prev === 'ai' ? 'vector' : 'ai'));
      }
      // 7. Fullscreen & Smart TV Mode: 'F' key, 'T' key, or Blue TV Remote button (ColorF3Blue / 406)
      else if (key.toLowerCase() === 'f' || key === 'ColorF3Blue' || keyCode === 406) {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      } else if (key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTvMode(prev => !prev);
      }
      // 8. Laser pointer: 'L' key
      else if (key.toLowerCase() === 'l') {
        setIsLaserOn(prev => !prev);
        setIsPenOn(false);
      }
      // 9. Interactive Pen: 'P' key
      else if (key.toLowerCase() === 'p') {
        setIsPenOn(prev => !prev);
        setIsLaserOn(false);
      }
      // 10. Clear pen drawing: 'C' key
      else if (key.toLowerCase() === 'c') {
        clearPenCanvas();
      }
      // 11. Black screen mode ('B' key or Period '.' on wireless clicker)
      else if (key.toLowerCase() === 'b' || key === '.') {
        e.preventDefault();
        setIsBlackScreen(prev => !prev);
        setIsWhiteScreen(false);
      }
      // 12. White screen whiteboard mode ('W' key or Comma ',')
      else if (key.toLowerCase() === 'w' || key === ',') {
        e.preventDefault();
        setIsWhiteScreen(prev => !prev);
        setIsBlackScreen(false);
      }
      // 13. Zoom artwork modal: 'Z' key
      else if (key.toLowerCase() === 'z') {
        setZoomArtworkModal(prev => !prev);
      }
      // 14. Escape key
      else if (key === 'Escape') {
        if (isBlackScreen) setIsBlackScreen(false);
        else if (isWhiteScreen) setIsWhiteScreen(false);
        else if (zoomArtworkModal) setZoomArtworkModal(false);
        else if (showDeviceControllerModal) setShowDeviceControllerModal(false);
        else if (isFullscreen) setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentSlideIndex, 
    slides.length, 
    isFullscreen, 
    isSpeaking, 
    currentSlide, 
    allAnswersRevealed, 
    isBlackScreen, 
    isWhiteScreen, 
    zoomArtworkModal, 
    showDeviceControllerModal
  ]);

  // Mouse Wheel navigation (Wireless & Wired Mouse)
  const handleWheel = (e) => {
    // Only scroll slides if not hovering over a scrollable text container
    const isScrollable = e.target.closest('.overflow-y-auto');
    if (isScrollable) return;

    const now = Date.now();
    if (now - lastWheelTimeRef.current < 250) return;

    if (e.deltaY > 25) {
      lastWheelTimeRef.current = now;
      goToNextSlide();
    } else if (e.deltaY < -25) {
      lastWheelTimeRef.current = now;
      goToPrevSlide();
    }
  };

  // Mouse side buttons (Wireless Mouse Back/Forward)
  const handleMouseSideButtons = (e) => {
    if (e.button === 3) {
      e.preventDefault();
      goToPrevSlide();
    } else if (e.button === 4) {
      e.preventDefault();
      goToNextSlide();
    }
  };

  // Touch Swipe navigation (Smartphones & Tablets)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;

      if (Math.abs(dx) > 50 && Math.abs(dy) < 80 && dt < 600) {
        if (dx < 0) {
          goToNextSlide();
        } else {
          goToPrevSlide();
        }
      }
    }
  };

  // Toggle Slide Speech
  const toggleCurrentSlideSpeech = () => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else if (currentSlide?.teacherLecture) {
      ttsService.speak(
        currentSlide.teacherLecture,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  // Laser Pointer Mouse Tracker
  const handleSlideMouseMove = (e) => {
    if (!slideContainerRef.current) return;
    const rect = slideContainerRef.current.getBoundingClientRect();
    setLaserCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    if (isPenOn && isDrawingOnSlide && penCanvasRef.current) {
      const ctx = penCanvasRef.current.getContext('2d');
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const handlePenMouseDown = (e) => {
    if (!isPenOn || !penCanvasRef.current) return;
    setIsDrawingOnSlide(true);
    const rect = slideContainerRef.current.getBoundingClientRect();
    const ctx = penCanvasRef.current.getContext('2d');
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePenMouseUp = () => {
    if (isDrawingOnSlide) {
      setIsDrawingOnSlide(false);
    }
  };

  const clearPenCanvas = () => {
    if (penCanvasRef.current) {
      const ctx = penCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, penCanvasRef.current.width, penCanvasRef.current.height);
    }
  };

  // Handle Interactive Quiz
  const handleChooseQuizOption = (idx) => {
    setSelectedQuizOption(idx);
    const correctIdx = currentSlide.interactiveAction?.correctIndex ?? 0;
    const isCorrect = idx === correctIdx;
    
    if (isCorrect) {
      setQuizAnswered(true);
      const exp = currentSlide.interactiveAction?.explanation || 'Con trả lời hoàn toàn chính xác rồi!';
      setQuizFeedback({
        correct: true,
        text: exp
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (voiceEnabled) {
        ttsService.speak(
          `Hoan hô con! Con trả lời hoàn toàn chính xác rồi đấy! ${exp}`,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } else {
      setQuizFeedback({
        correct: false,
        text: '💡 Chưa đúng rồi con ơi! Con thử quan sát kĩ lại và chọn đáp án khác xem sao nhé!'
      });
      if (voiceEnabled) {
        ttsService.speak(
          'Chưa chính xác rồi con ơi, con hãy thử suy nghĩ và chọn lại xem sao nhé!',
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    }
  };

  const handleQuizAnswer = (isCorrect) => {
    setQuizAnswered(true);
    if (isCorrect) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
      ttsService.speak(
        'Hoan hô con! Con trả lời hoàn toàn chính xác rồi đấy! Thầy khen ngợi con!',
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } else {
      ttsService.speak(
        'Không sao đâu con yêu! Thầy trò mình cùng ngắm lại hình mẫu để khám phá bí quyết nhé!',
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  // Download Word Lesson Plan (Chuẩn Công văn 2345/BGDĐT-GDTH với bảng 4 cột & Tích hợp đầy đủ)
  const downloadWordPlan = () => {
    const plan = selectedUnit.wordLessonPlan;
    if (!plan) return;

    let content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${plan.title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; margin: 30px; color: #111; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; color: #b91c1c; margin-top: 10px; text-transform: uppercase; }
        h2 { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 18px; color: #1e3a8a; text-transform: uppercase; }
        h3 { font-size: 13pt; font-weight: bold; color: #1e3a8a; margin-top: 18px; border-bottom: 2px solid #1e3a8a; padding-bottom: 3px; }
        p, li { font-size: 13pt; margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 15px; }
        th, td { border: 1px solid #111; padding: 8px; text-align: left; vertical-align: top; font-size: 12pt; }
        th { background-color: #f3f4f6; font-weight: bold; text-align: center; }
        .meta-table { width: 100%; border: none; margin-bottom: 15px; }
        .meta-table td { border: none; padding: 2px; }
        .q-box { background: #fffbeb; padding: 6px 8px; border-left: 3px solid #f59e0b; margin: 6px 0; font-size: 11.5pt; }
        .a-box { background: #f0fdf4; padding: 6px 8px; border-left: 3px solid #22c55e; margin: 6px 0; font-size: 11.5pt; }
      </style>
      </head>
      <body>
        <table class="meta-table">
          <tr>
            <td style="width: 50%; text-align: center;">
              <b>TRƯỜNG TIỂU HỌC: .......................................</b><br/>
              <b>TỔ CHUYÊN MÔN KHỐI ${selectedGrade}</b><br/>
              <i>Mã kế hoạch bài dạy SMAS: SMAS_KHBD_MT${selectedGrade}_${selectedUnit.id}</i>
            </td>
            <td style="width: 50%; text-align: center;">
              <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/>
              <i>Độc lập - Tự do - Hạnh phúc</i><br/>
              -------------------
            </td>
          </tr>
        </table>

        <div style="background: #eff6ff; padding: 10px 14px; border: 1.5px solid #93c5fd; margin-bottom: 16px; border-radius: 6px; font-size: 11pt; color: #1e3a8a;">
          <b>HỆ THỐNG QUẢN LÝ NHÀ TRƯỜNG SMAS VIETTEL (smas.edu.vn) • QUẢN LÝ GIÁO ÁN ĐIỆN TỬ</b><br/>
          Kế hoạch bài dạy chuẩn Công văn 2345/BGDĐT-GDTH • Tích hợp liên môn GDPT 2018 môn Mĩ thuật
        </div>
        
        <h1>${plan.title}</h1>
        <h2>${plan.unit}</h2>
        <p><b>Bộ sách:</b> ${plan.book}</p>
        <p><b>Môn học:</b> Mĩ thuật • <b>Lớp:</b> ${selectedGrade} • <b>Thời lượng:</b> ${selectedUnit.duration}</p>
        <p><b>Giáo viên giảng dạy:</b> ${teacherName}</p>
        
        <h3>I. YÊU CẦU CẦN ĐẠT (MỤC TIÊU BÀI HỌC)</h3>
        <ul>
          ${plan.objectives.map(o => `<li>${o}</li>`).join('')}
        </ul>

        <h3>II. ĐỒ DÙNG DẠY HỌC & HỌC LIỆU TRỰC QUAN</h3>
        <p><b>1. Giáo viên:</b> ${plan.preparations.teacher}</p>
        <p><b>2. Học sinh:</b> ${plan.preparations.students}</p>
        ${plan.visualArt?.title ? `<p><b>3. Tác phẩm mẫu minh họa trực quan SGK:</b> ${plan.visualArt.title} (${plan.visualArt.caption})</p>` : ''}

        <h3>III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU (BẢNG 4 CỘT CHUẨN CÔNG VĂN 2345/BGDĐT-GDTH)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">Hoạt động dạy học & Thời lượng</th>
              <th style="width: 35%;">Hoạt động của Giáo viên (Hệ thống câu hỏi gợi mở & Thị phạm)</th>
              <th style="width: 30%;">Hoạt động của Học sinh (Thực hành & Câu trả lời dự kiến)</th>
              <th style="width: 15%;">Dự kiến sản phẩm</th>
            </tr>
          </thead>
          <tbody>
            ${plan.activities.map(a => `
              <tr>
                <td>
                  <p><b>${a.phase}</b></p>
                  <p><i>(${a.duration || 'Tiết dạy'})</i></p>
                  <p><b>Hình thức:</b> ${a.method || 'Cả lớp / Cá nhân'}</p>
                  <p><b>Mục tiêu:</b> ${a.objective || 'Nắm kiến thức bài học'}</p>
                </td>
                <td>
                  <p>${a.teacherAct}</p>
                  ${a.teacherQuestions && a.teacherQuestions.length > 0 ? `
                    <div class="q-box">
                      <b>❓ Dự kiến câu hỏi gợi mở của Thầy:</b>
                      <ul>
                        ${a.teacherQuestions.map(q => `<li>${q}</li>`).join('')}
                      </ul>
                    </div>
                  ` : ''}
                </td>
                <td>
                  <p>${a.studentAct}</p>
                  ${a.studentAnswers && a.studentAnswers.length > 0 ? `
                    <div class="a-box">
                      <b>💬 Dự kiến câu trả lời của Học sinh:</b>
                      <ul>
                        ${a.studentAnswers.map(ans => `<li>${ans}</li>`).join('')}
                      </ul>
                    </div>
                  ` : ''}
                </td>
                <td>
                  <p><b>${a.expectedProduct || 'Sản phẩm mĩ thuật theo chủ đề'}</b></p>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>IV. NỘI DUNG TÍCH HỢP LIÊN MÔN & GIÁO DỤC TOÀN DIỆN (CHƯƠNG TRÌNH GDPT 2018)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 28%;">Lĩnh vực tích hợp</th>
              <th style="width: 72%;">Nội dung và phương thức tích hợp trong bài dạy</th>
            </tr>
          </thead>
          <tbody>
            ${Array.isArray(plan.integrations) ? plan.integrations.map(integ => `
              <tr>
                <td><b>${integ.badge || '🌐'} ${integ.name}</b></td>
                <td>${integ.detail}</td>
              </tr>
            `).join('') : `
              <tr>
                <td><b>📐 Tích hợp Toán học (Hình học & Tỉ lệ)</b></td>
                <td>${plan.integrations?.math || 'Nhận diện các hình phẳng, hình khối và ước lượng tỉ lệ cân đối.'}</td>
              </tr>
              <tr>
                <td><b>🌿 Tích hợp Tự nhiên & Xã hội / Lịch sử - Địa lí</b></td>
                <td>${plan.integrations?.society || 'Khám phá vẻ đẹp thiên nhiên, đời sống văn hóa và con người quê hương.'}</td>
              </tr>
              <tr>
                <td><b>📖 Tích hợp Tiếng Việt / Văn học</b></td>
                <td>${plan.integrations?.vietnamese || 'Mở rộng vốn từ ngữ thẩm mĩ, rèn kĩ năng biểu đạt và kể chuyện tranh.'}</td>
              </tr>
              <tr>
                <td><b>🎵 Tích hợp Âm nhạc & Vận động</b></td>
                <td>${plan.integrations?.music || 'Cảm nhận nhịp điệu của đường nét và sắc thái vui tươi qua âm hưởng nghệ thuật.'}</td>
              </tr>
              <tr>
                <td><b>🌍 Tích hợp Môi trường & Địa phương</b></td>
                <td>${plan.integrations?.environment || 'Ý thức giữ gìn vệ sinh lớp học, thu dọn rác, tái chế vật liệu, yêu quý danh lam địa phương.'}</td>
              </tr>
              <tr>
                <td><b>🤝 Tích hợp Kĩ năng sống & Quyền con người (SEL)</b></td>
                <td>${plan.integrations?.sel || 'Lắng nghe, hợp tác tích cực, tôn trọng phong cách sáng tạo riêng biệt của bạn bè.'}</td>
              </tr>
              <tr>
                <td><b>💡 Tích hợp Giáo dục STEM / STEAM</b></td>
                <td>${plan.integrations?.steam || 'Khám phá cấu trúc vật liệu, pha trộn hòa sắc quang học và ứng dụng sản phẩm thực tế.'}</td>
              </tr>
            `}
          </tbody>
        </table>

        <h3>V. ĐIỀU CHỈNH SAU BÀI DẠY (NẾU CÓ)</h3>
        <p>................................................................................................................................................................</p>
        <p>................................................................................................................................................................</p>

        <table class="meta-table" style="margin-top: 35px;">
          <tr>
            <td style="width: 33%; text-align: center;">
              <b>BAN GIÁM HIỆU DUYỆT</b><br/>
              <i>(Ký duyệt điện tử SMAS)</i>
              <br/><br/><br/><br/>
            </td>
            <td style="width: 33%; text-align: center;">
              <b>TỔ TRƯỞNG CHUYÊN MÔN</b><br/>
              <i>(Ký và ghi rõ họ tên)</i>
              <br/><br/><br/><br/>
            </td>
            <td style="width: 34%; text-align: center;">
              <i>Ngày ..... tháng ..... năm 202...</i><br/>
              <b>GIÁO VIÊN SOẠN BÀI</b><br/>
              <i>(Ký và ghi rõ họ tên)</i><br/><br/>
              <b>${teacherName}</b>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Giao_An_SMAS_Viettel_Lop_${selectedGrade}_${selectedUnit.id}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download PowerPoint (.pptx) Chuẩn Kho Học Liệu Số SMAS Viettel
  const handleDownloadPptx = async () => {
    setIsExportingPptx(true);
    try {
      await exportSmasPowerPoint({
        unit: selectedUnit,
        teacher,
        grade: selectedGrade
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error('Lỗi khi xuất file PowerPoint SMAS:', e);
    } finally {
      setIsExportingPptx(false);
    }
  };

  // Chat message sending
  const handleSendMessage = async (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'student',
      text: text,
      time: 'Vừa xong'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const teacherReply = await generateTeacherResponse(text, selectedUnit, apiKey, teacher);
      const teacherMsg = {
        id: `teacher_${Date.now()}`,
        sender: 'teacher',
        text: teacherReply.text,
        imageUrl: teacherReply.imageUrl || null,
        time: 'Vừa xong'
      };

      setMessages(prev => [...prev, teacherMsg]);

      if (voiceEnabled && teacherReply.text) {
        ttsService.speak(
          teacherReply.text,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 flex flex-col gap-6">
      {/* Top Banner: SGK Kết Nối Tri Thức */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-500 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={teacherName}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl object-cover border-4 border-amber-300 shadow-2xl ring-4 ring-white/30 animate-bounce-gentle"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/teacher.jpg'; }}
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center text-[10px]">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black">
                {teacherName} Giảng Bài Tương Tác
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow">
                📚 SGK Kết Nối Tri Thức Với Cuộc Sống
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-blue-100 mt-1">
              Tiến trình 5 Hoạt động chuẩn Công văn 2345/BGDĐT-GDTH • Trình chiếu PowerPoint tương tác 2 chiều với Thầy!
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (!next) ttsService.stop();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition shadow-md ${
              voiceEnabled
                ? 'bg-white text-blue-700 hover:bg-blue-50'
                : 'bg-white/30 text-white hover:bg-white/40'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{voiceEnabled ? 'Giọng Thầy: BẬT' : 'Giọng Thầy: TẮT'}</span>
          </button>
        </div>
      </div>

      {/* 1. TOP CONTROL BAR: Grade Selector + Teaching Mode Switcher */}
      <div className="bg-white p-3 rounded-3xl shadow-md border-2 border-blue-100 flex items-center justify-between flex-wrap gap-3">
        {/* Grade Tabs (Lớp 1 -> Lớp 5) */}
        <div className="flex items-center gap-1.5 bg-blue-50/80 p-1.5 rounded-2xl border border-blue-200">
          <span className="text-xs font-black text-blue-900 px-2 hidden sm:inline">Khối Lớp:</span>
          {[1, 2, 3, 4, 5].map((g) => (
            <button
              key={g}
              onClick={() => handleSelectGrade(g)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black text-xs sm:text-sm transition-all ${
                selectedGrade === g
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'text-gray-600 hover:bg-white hover:text-blue-600'
              }`}
            >
              Lớp {g}
            </button>
          ))}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200 flex-wrap">
          <button
            onClick={() => setViewMode('powerpoint')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              viewMode === 'powerpoint'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:text-orange-600'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>📽️ Trình Chiếu PowerPoint</span>
          </button>

          <button
            onClick={() => setViewMode('word')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              viewMode === 'word'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:text-blue-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 Giáo Án Word (CV 2345)</span>
          </button>

          <button
            onClick={() => setViewMode('excel')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              viewMode === 'excel'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:text-emerald-600'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>📊 Đánh Giá Excel (SMAS Viettel)</span>
          </button>

          <button
            onClick={() => setViewMode('chat')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              viewMode === 'chat'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-white hover:text-rose-600'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>💬 Hỏi Thầy Bài Này</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={onStartDrawingOnCanvas}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-amber-500 text-white text-xs font-black rounded-xl shadow hover:scale-105 active:scale-95 transition"
        >
          <Palette className="w-4 h-4" />
          <span>Vào Bảng Vẽ Thực Hành</span>
        </button>
      </div>

      {/* 2. HORIZONTAL TOPIC CAROUSEL RIBBON: All units for current grade */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-blue-50 p-3 rounded-3xl border-2 border-amber-200 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-amber-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Chủ Đề Kết Nối Tri Thức Lớp {selectedGrade}:</span>
            </span>
            <span className="text-xs font-bold text-gray-500">
              ({gradeUnits.length} bài học chuẩn GDPT 2018)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (topicRibbonRef.current) {
                  topicRibbonRef.current.scrollBy({ left: -220, behavior: 'smooth' });
                }
              }}
              className="p-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-sm transition"
              title="Cuộn sang trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (topicRibbonRef.current) {
                  topicRibbonRef.current.scrollBy({ left: 220, behavior: 'smooth' });
                }
              }}
              className="p-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-sm transition"
              title="Cuộn sang phải"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable unit chips */}
        <div
          ref={topicRibbonRef}
          className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-thin scrollbar-thumb-amber-300"
        >
          {gradeUnits.map((unit) => {
            const isSelected = selectedUnit.id === unit.id;
            return (
              <button
                key={unit.id}
                onClick={() => handleSelectUnit(unit)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-102 ring-2 ring-blue-300'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <span className="text-2xl p-1 bg-white/20 rounded-xl shrink-0">
                  {unit.icon}
                </span>
                <div className="min-w-0 max-w-[200px]">
                  <span className={`text-[10px] font-black uppercase block truncate ${isSelected ? 'text-amber-200' : 'text-amber-600'}`}>
                    {unit.unitNumber} • {unit.duration}
                  </span>
                  <p className="text-xs font-black truncate leading-tight">
                    {unit.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN TEACHING AREA: Full-Width PowerPoint / Word / Chat */}
      <div className="w-full flex flex-col gap-4">

          {/* VIEW 1: POWERPOINT SLIDE DECK (INTERACTIVE PRESENTATION) */}
          {viewMode === 'powerpoint' && currentSlide && (
            <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-8 flex items-center justify-center' : ''}`}>
              <div 
                className={`bg-white rounded-3xl shadow-2xl border-4 border-orange-300 overflow-hidden flex flex-col transition-all duration-300 ${
                  isFullscreen ? 'w-full max-w-6xl max-h-[92vh] h-full ring-8 ring-orange-500/30' : 'min-h-[640px]'
                }`}
              >
                {/* 1. Pedagogical Stepper Bar: 5 Hoạt Động Giáo Án Chuẩn Công Văn 2345 */}
                <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-2 sm:p-3 text-white flex items-center justify-between gap-1 overflow-x-auto shadow-inner">
                  {slides.map((s, idx) => {
                    const isActive = currentSlideIndex === idx;
                    const isPast = currentSlideIndex > idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-white text-orange-900 shadow-md scale-105 ring-2 ring-white/60'
                            : isPast
                            ? 'bg-orange-600/60 text-white hover:bg-orange-600'
                            : 'bg-orange-600/30 text-orange-100 hover:bg-orange-600/50'
                        }`}
                      >
                        <span>{s.phaseIcon || '📌'}</span>
                        <span>{s.phase || `Hoạt động ${idx + 1}`}</span>
                      </button>
                    );
                  })}

                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* Nút Bắt Đầu / Trạng Thái Giảng Tự Động 5 Hoạt Động */}
                    {!isAutoLecturing ? (
                      <button
                        onClick={() => startAutoLecture(0)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-md transition hover:scale-105 active:scale-95 animate-pulse"
                        title={`Bắt đầu để ${teacherName} tự động giảng bài tuần tự theo 5 hoạt động của giáo án`}
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>▶️ Giảng Tự Động 5 Hoạt Động</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur px-2.5 py-1 rounded-xl border border-white/30">
                        <span className="text-[11px] font-black text-emerald-300 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>HĐ {currentSlideIndex + 1}/{slides.length}</span>
                        </span>
                        <button
                          onClick={autoLecturePaused ? resumeAutoLecture : pauseAutoLecture}
                          className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition text-xs font-black"
                          title={autoLecturePaused ? "Tiếp tục" : "Tạm dừng"}
                        >
                          {autoLecturePaused ? '▶️ Tiếp' : '⏸️ Dừng'}
                        </button>
                        <button
                          onClick={stopAutoLecture}
                          className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition text-xs font-black"
                          title="Kết thúc giảng tự động"
                        >
                          ⏹️ Thoát
                        </button>
                      </div>
                    )}

                    {/* Nút Chế độ Smart TV & Màn hình lớn */}
                    <button
                      onClick={() => setIsTvMode(prev => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-xs transition ${
                        isTvMode 
                          ? 'bg-amber-300 text-amber-950 shadow-md ring-2 ring-white' 
                          : 'bg-black/20 hover:bg-black/30 text-white'
                      }`}
                      title="Chế độ Smart TV & Màn hình lớn (Phím tắt: T)"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Smart TV</span>
                    </button>

                    {/* Nút Bảng Điều Khiển Đa Thiết Bị */}
                    <button
                      onClick={() => setShowDeviceControllerModal(true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-black text-xs transition"
                      title="Điều khiển ứng dụng (Smart TV, Điện thoại, Chuột, Bàn phím)"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Điều Khiển</span>
                    </button>

                    {/* Nút Xuất PowerPoint (.pptx) Kho Học Liệu SMAS Viettel */}
                    <button
                      onClick={handleDownloadPptx}
                      disabled={isExportingPptx}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm disabled:opacity-50"
                      title="Tải bài giảng số PowerPoint (.pptx) chuẩn Kho học liệu SMAS Viettel"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isExportingPptx ? 'Đang tạo...' : 'Tải PPTX (SMAS)'}</span>
                    </button>

                    {/* Fullscreen F5 Toggle */}
                    <button
                      onClick={() => setIsFullscreen(prev => !prev)}
                      className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white transition"
                      title={isFullscreen ? 'Thu nhỏ (Esc)' : 'Toàn màn hình trình chiếu (F5/F)'}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. Slide Screen Canvas Area (Hỗ trợ Vuốt Điện Thoại, Cuộn Chuột, TV D-Pad) */}
                <div 
                  ref={slideContainerRef}
                  onMouseMove={handleSlideMouseMove}
                  onMouseDown={(e) => {
                    handleMouseSideButtons(e);
                    handlePenMouseDown(e);
                  }}
                  onMouseUp={handlePenMouseUp}
                  onWheel={handleWheel}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className={`relative p-6 sm:p-10 flex-1 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/70 flex flex-col justify-between select-none overflow-hidden transition-all ${
                    isTvMode ? 'text-base sm:text-lg ring-4 ring-amber-400' : ''
                  }`}
                >
                  {/* Black Screen Layer (B key / Clicker button) */}
                  {isBlackScreen && (
                    <div 
                      onClick={() => setIsBlackScreen(false)}
                      className="absolute inset-0 bg-black/95 z-40 flex flex-col items-center justify-center text-white cursor-pointer select-none animate-in fade-in"
                    >
                      <span className="text-5xl mb-3">👁️</span>
                      <h3 className="text-2xl font-black tracking-wide">Cả Lớp Hướng Lên Thầy Giảng Bài</h3>
                      <p className="text-xs text-gray-400 mt-2">Bấm phím 'B' hoặc nhấp chuột để tiếp tục bài học</p>
                    </div>
                  )}

                  {/* White Screen Layer (W key / Whiteboard) */}
                  {isWhiteScreen && (
                    <div 
                      onClick={() => setIsWhiteScreen(false)}
                      className="absolute inset-0 bg-white z-40 flex flex-col items-center justify-center text-gray-800 cursor-pointer select-none animate-in fade-in border-4 border-blue-400"
                    >
                      <span className="text-5xl mb-3">📝</span>
                      <h3 className="text-2xl font-black text-blue-900">Bảng Trắng Tương Tác Sư Phạm</h3>
                      <p className="text-xs text-gray-500 mt-2">Bấm phím 'W' hoặc nhấp chuột để quay lại bài giảng</p>
                    </div>
                  )}
                  {/* Virtual Pen Canvas Layer */}
                  <canvas
                    ref={penCanvasRef}
                    width={1000}
                    height={600}
                    className={`absolute inset-0 w-full h-full pointer-events-none z-20 ${isPenOn ? 'cursor-crosshair' : ''}`}
                  />

                  {/* Virtual Laser Pointer Dot */}
                  {isLaserOn && (
                    <div 
                      className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                      style={{ left: `${laserCoords.x}px`, top: `${laserCoords.y}px` }}
                    >
                      <div className="w-5 h-5 rounded-full bg-red-500 animate-ping opacity-75" />
                      <div className="absolute inset-0 w-3 h-3 m-auto rounded-full bg-red-600 shadow-lg ring-4 ring-red-400" />
                    </div>
                  )}

                  {/* Slide Header Info */}
                  <div className="flex items-center justify-between border-b-2 border-orange-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-black shadow-sm">
                        Slide {currentSlide.slideNumber} / {slides.length}
                      </span>
                      <span className="text-xs font-extrabold text-orange-900 bg-orange-100/80 px-2.5 py-1 rounded-lg">
                        {currentSlide.phase || 'Tiến trình bài giảng'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Laser & Pen Toolbar */}
                      <button
                        onClick={() => {
                          setIsLaserOn(prev => !prev);
                          setIsPenOn(false);
                        }}
                        className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                          isLaserOn ? 'bg-red-500 text-white border-red-600 shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                        title="Bật con trỏ Laser chỉ bảng (Phím L)"
                      >
                        <Radio className="w-3.5 h-3.5 text-red-500" />
                        <span className="hidden sm:inline">Laser</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsPenOn(prev => !prev);
                          setIsLaserOn(false);
                        }}
                        className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                          isPenOn ? 'bg-blue-600 text-white border-blue-700 shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                        title="Bật bút vẽ ghi chú lên slide (Phím P)"
                      >
                        <PenTool className="w-3.5 h-3.5 text-blue-500" />
                        <span className="hidden sm:inline">Bút Slide</span>
                      </button>

                      {isPenOn && (
                        <button
                          onClick={clearPenCanvas}
                          className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                          title="Xóa nét vẽ trên slide"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span className="px-3 py-1 bg-white border-2 border-orange-300 rounded-full text-xs font-black text-orange-900 shadow-sm">
                        {currentSlide.badge}
                      </span>
                    </div>
                  </div>

                  {/* Floating Auto-Lecture HUD Banner */}
                  {isAutoLecturing && (
                    <div className="my-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-3 border-2 border-emerald-300 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={avatarUrl}
                            alt={teacherName}
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-white shadow"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/teacher.jpg'; }}
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-white/20 font-black text-[10px] tracking-wide uppercase">
                              🎙️ AI {teacherName} Đang Giảng Tự Động
                            </span>
                            <span className="text-xs font-bold text-emerald-200">
                              {slides[currentSlideIndex]?.phase || `Hoạt động ${currentSlideIndex + 1}`} ({currentSlideIndex + 1}/{slides.length})
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-black text-white mt-0.5 flex items-center gap-2">
                            {autoLectureCountdown !== null ? (
                              <span className="text-amber-200 animate-pulse flex items-center gap-1.5 font-black">
                                <span className="text-base">⏳</span>
                                <span>Chuyển sang hoạt động tiếp theo trong {autoLectureCountdown} giây...</span>
                              </span>
                            ) : (
                              <span>
                                {autoLecturePaused ? '⏸️ Đang tạm dừng bài giảng' : '🔊 ' + (isSpeaking ? 'Đang thuyết minh bài học...' : 'Đang chuyển giao hoạt động...')}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* HUD Navigation Controls */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={autoPrevActivity}
                          disabled={currentSlideIndex === 0}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-bold transition flex items-center gap-1"
                          title="Về hoạt động trước"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Trước</span>
                        </button>

                        {autoLecturePaused ? (
                          <button
                            onClick={resumeAutoLecture}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs font-black transition flex items-center gap-1 shadow"
                            title="Tiếp tục bài giảng"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Tiếp Tục</span>
                          </button>
                        ) : (
                          <button
                            onClick={pauseAutoLecture}
                            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1"
                            title="Tạm dừng bài giảng"
                          >
                            <span>⏸️</span>
                            <span>Tạm Dừng</span>
                          </button>
                        )}

                        <button
                          onClick={autoNextActivity}
                          disabled={currentSlideIndex === slides.length - 1}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-bold transition flex items-center gap-1"
                          title="Sang hoạt động tiếp theo"
                        >
                          <span className="hidden sm:inline">Tiếp</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={stopAutoLecture}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition flex items-center gap-1 shadow"
                          title="Dừng chế độ giảng tự động"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Dừng</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Slide Content Body: 2 Cột (Trái: Sư phạm & Đàm thoại Thầy - Trò; Phải: Tranh Mẫu Trực Quan SGK) */}
                  <div className="my-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Cột Trái (7 Cột): Tiến trình, Gạch đầu dòng, Câu hỏi Thầy & Trả lời Trò, Tương tác */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                          {currentSlide.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-extrabold text-orange-600 mt-1">
                          {currentSlide.subtitle}
                        </p>
                      </div>

                      {/* Bullet Points with Animation */}
                      <div className="flex flex-col gap-2.5">
                        {currentSlide.bullets.map((bullet, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-start gap-2.5 bg-white/95 p-3 rounded-2xl border border-orange-100 shadow-xs hover:border-orange-300 transition"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">
                              {bullet}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* ❓ DỰ KIẾN CÂU HỎI GỢI MỞ CỦA THẦY & 💬 CÂU TRẢ LỜI CỦA HỌC SINH (ẨN MẶC ĐỊNH, BẤM ĐỂ XEM) */}
                      {currentSlide.teacherQuestions && currentSlide.teacherQuestions.length > 0 && (
                        <div className="bg-amber-50/80 rounded-2xl p-3.5 border-2 border-amber-200 flex flex-col gap-2.5 shadow-xs">
                          <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5 flex-wrap gap-1">
                            <span className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Đàm Thoại Sư Phạm Giữa Thầy & Học Sinh:</span>
                            </span>
                            <button
                              onClick={() => toggleRevealAllAnswers(currentSlideIndex, currentSlide.teacherQuestions.length)}
                              className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 rounded-lg text-[10px] font-black transition flex items-center gap-1 shrink-0"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{allAnswersRevealed ? 'Ẩn tất cả câu trả lời' : 'Hiện tất cả câu trả lời'}</span>
                            </button>
                          </div>
                          {currentSlide.teacherQuestions.map((q, qIdx) => {
                            const isRevealed = revealedAnswers[`${currentSlideIndex}_${qIdx}`];
                            const studentAnswer = currentSlide.studentAnswers && currentSlide.studentAnswers[qIdx];

                            return (
                              <div key={qIdx} className="space-y-1.5">
                                <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-amber-200 shadow-xs">
                                  <span className="px-1.5 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded shrink-0 mt-0.5">
                                    Thầy hỏi
                                  </span>
                                  <p className="text-xs font-black text-amber-950 leading-relaxed">
                                    "{q}"
                                  </p>
                                </div>
                                {studentAnswer && (
                                  <div>
                                    {isRevealed ? (
                                      <div className="flex items-start justify-between gap-2 bg-emerald-50 p-2.5 rounded-xl border-2 border-emerald-300 ml-3 shadow-xs animate-in fade-in duration-200">
                                        <div className="flex items-start gap-2">
                                          <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-black text-[10px] rounded shrink-0 mt-0.5">
                                            Bé thưa
                                          </span>
                                          <p className="text-xs font-extrabold text-emerald-950 leading-relaxed">
                                            "{studentAnswer}"
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => toggleRevealAnswer(currentSlideIndex, qIdx)}
                                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-200/60 hover:bg-emerald-200 px-2 py-0.5 rounded shrink-0 ml-1"
                                          title="Ẩn câu trả lời này"
                                        >
                                          Ẩn ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => toggleRevealAnswer(currentSlideIndex, qIdx)}
                                        className="ml-3 py-1.5 px-3 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs hover:border-emerald-500"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Bấm để xem câu trả lời của học sinh</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. Interactive Action Box per Slide Type */}
                      {currentSlide.interactiveAction && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 border-2 border-amber-300 shadow-sm">
                          {currentSlide.interactiveAction.type === 'quiz' && (
                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                                  <HelpCircle className="w-4 h-4 text-amber-700" />
                                  <span>{currentSlide.interactiveAction.label}</span>
                                </span>
                                {currentSlide.interactiveAction.options && (
                                  <span className="text-[10px] font-black text-amber-800 bg-white/80 px-2 py-0.5 rounded-lg border border-amber-200">
                                    Bấm chọn 1 đáp án đúng
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">
                                "{currentSlide.interactiveAction.question}"
                              </p>
                              
                              {currentSlide.interactiveAction.options ? (
                                <div className="flex flex-col gap-2 mt-1">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {currentSlide.interactiveAction.options.map((opt, idx) => {
                                      const isSelected = selectedQuizOption === idx;
                                      const isCorrect = idx === (currentSlide.interactiveAction.correctIndex ?? 0);
                                      let btnStyle = 'bg-white hover:bg-amber-50 text-gray-800 border-amber-200';
                                      if (quizAnswered) {
                                        if (isCorrect) btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 scale-102';
                                        else if (isSelected) btnStyle = 'bg-rose-100 text-rose-800 border-rose-300';
                                      } else if (isSelected) {
                                        btnStyle = 'bg-amber-100 text-amber-900 border-amber-400';
                                      }

                                      return (
                                        <button
                                          key={idx}
                                          onClick={() => handleChooseQuizOption(idx)}
                                          className={`p-3 rounded-2xl border-2 text-xs font-black text-left transition-all flex items-center gap-2.5 shadow-xs ${btnStyle}`}
                                        >
                                          <span className="w-6 h-6 rounded-xl bg-black/10 flex items-center justify-center text-xs font-black shrink-0">
                                            {['A', 'B', 'C'][idx] || idx + 1}
                                          </span>
                                          <span className="leading-tight">{opt}</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {quizFeedback && (
                                    <div className={`p-3 rounded-2xl text-xs font-extrabold border-2 flex items-center gap-2.5 animate-in fade-in ${
                                      quizFeedback.correct 
                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm' 
                                        : 'bg-amber-50 text-amber-900 border-amber-300'
                                    }`}>
                                      <span className="text-xl shrink-0">{quizFeedback.correct ? '🎉' : '💡'}</span>
                                      <span className="leading-relaxed">{quizFeedback.text}</span>
                                    </div>
                                  )}
                                </div>
                              ) : !quizAnswered ? (
                                <div className="flex gap-2 flex-wrap mt-1">
                                  <button
                                    onClick={() => handleQuizAnswer(true)}
                                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow transition"
                                  >
                                    ✓ Con trả lời được rồi Thầy ơi!
                                  </button>
                                  <button
                                    onClick={() => handleQuizAnswer(false)}
                                    className="px-3.5 py-1.5 bg-white hover:bg-amber-50 text-amber-800 font-extrabold text-xs rounded-xl border border-amber-300 shadow-sm transition"
                                  >
                                    💡 Thầy cho con gợi ý với ạ!
                                  </button>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-white/80 rounded-xl text-xs font-bold text-amber-950 border border-amber-300">
                                  👏 {currentSlide.interactiveAction.hint}
                                </div>
                              )}
                            </div>
                          )}

                          {currentSlide.interactiveAction.type === 'draw' && (
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <span className="text-xs font-black text-pink-900 block">
                                  🎨 Hoạt Động Thực Hành:
                                </span>
                                <p className="text-xs font-bold text-gray-700">
                                  Sẵn sàng đưa ý tưởng vào bài vẽ cùng Thầy!
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  const svgContent = currentSlide.visualArt?.svg || selectedUnit.visualArt?.svg;
                                  if (svgContent && onStartDrawingOnCanvas) {
                                    const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent);
                                    onStartDrawingOnCanvas(dataUrl);
                                  } else if (onStartDrawingOnCanvas) {
                                    onStartDrawingOnCanvas();
                                  }
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-1.5 animate-pulse"
                              >
                                <Palette className="w-4 h-4" />
                                <span>Mở Bảng Vẽ Ngay</span>
                              </button>
                            </div>
                          )}

                          {currentSlide.interactiveAction.type === 'critique' && (
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <span className="text-xs font-black text-amber-900 block">
                                  🏅 Góc Triển Lãm & Đánh Giá:
                                </span>
                                <p className="text-xs font-bold text-gray-700">
                                  Đánh giá theo Thang Rubric 4 Tiêu chí GDPT 2018!
                                </p>
                              </div>
                              {onGoToCritique && (
                                <button
                                  onClick={onGoToCritique}
                                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
                                >
                                  <Camera className="w-4 h-4" />
                                  <span>Mắt Thần Chấm Tranh</span>
                                </button>
                              )}
                            </div>
                          )}

                          {currentSlide.interactiveAction.type === 'apply' && (
                            <div className="flex flex-col gap-2">
                              <div>
                                <span className="text-xs font-black text-indigo-900 block">
                                  🚀 Thử Thách Vận Dụng Đời Sống:
                                </span>
                                <p className="text-xs font-bold text-gray-700 mt-0.5">
                                  Mang bức tranh của con về trang trí góc học tập hoặc làm món quà tặng người thân thân yêu nhé!
                                </p>
                              </div>
                              {(currentSlide.integrations || selectedUnit.integrations) && (
                                <div className="mt-2 pt-2 border-t border-indigo-200 flex flex-col gap-1.5">
                                  <span className="text-[11px] font-black text-indigo-900 uppercase flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Tích Hợp Liên Môn Phù Hợp Bài Học (GDPT 2018):</span>
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {(currentSlide.integrations || selectedUnit.integrations).map((integ, idx) => (
                                      <div key={idx} className="bg-white/95 p-2 rounded-xl border border-indigo-200 shadow-xs text-[11px] leading-tight">
                                        <b className="text-indigo-950 block">{integ.badge} {integ.name}</b>
                                        <span className="text-gray-600 line-clamp-2">{integ.detail}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cột Phải (5 Cột): KHUNG TRANH MẪU TRỰC QUAN SINH ĐỘNG THEO SGK */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                      <div className="bg-white rounded-3xl p-3.5 sm:p-4 border-4 border-amber-300 shadow-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-amber-100 pb-2 flex-wrap gap-1">
                          <span className="text-xs font-black text-amber-900 flex items-center gap-1.5 truncate">
                            <Palette className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="truncate">{currentSlide.visualArt?.title || `Tranh Mẫu: ${selectedUnit.title}`}</span>
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setVisualMode('ai');
                                setSlideImageError(false);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition ${
                                visualMode === 'ai'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              }`}
                              title="Xem tranh minh họa nghệ thuật thực tế (Phím: M)"
                            >
                              🖼️ Tranh Ảnh
                            </button>
                            <button
                              onClick={() => setVisualMode('vector')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition ${
                                visualMode === 'vector'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              }`}
                              title="Xem tranh nét vẽ SGK vector chuẩn (Phím: M)"
                            >
                              📐 Nét SGK
                            </button>
                            <button
                              onClick={() => setZoomArtworkModal(true)}
                              className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                              title="Phóng to tranh toàn màn hình (Phím: Z)"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Visual Artwork Container with GUARANTEED Display (Never blank / broken) */}
                        <div 
                          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 shadow-inner group cursor-pointer"
                          onDoubleClick={() => setZoomArtworkModal(true)}
                          title="Nhấp đúp chuột để phóng to tranh toàn màn hình"
                        >
                          {/* 1. Underlying Vector SGK Art Layer (Always ready with 0ms delay) */}
                          <div 
                            className="absolute inset-0 w-full h-full p-2 flex items-center justify-center select-none"
                            dangerouslySetInnerHTML={{ __html: currentSlide.visualArt?.svg || selectedUnit.visualArt?.svg || '' }}
                          />

                          {/* 2. Photo Artwork Layer (Smoothly fades in over SVG when loaded) */}
                          {visualMode === 'ai' && !slideImageError && (
                            <img
                              key={`${selectedUnit.id}-${currentSlideIndex}-${currentSlide.visualArt?.imageUrl || selectedUnit.visualArt?.imageUrl}`}
                              src={currentSlide.visualArt?.imageUrl || selectedUnit.visualArt?.imageUrl}
                              alt={currentSlide.visualArt?.title || selectedUnit.title}
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:scale-105 ${
                                slideImageLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                              }`}
                              onLoad={() => setSlideImageLoaded(true)}
                              onError={() => {
                                setSlideImageError(true);
                                setSlideImageLoaded(false);
                              }}
                              ref={(el) => {
                                if (el && el.complete && el.naturalWidth > 0 && !slideImageLoaded) {
                                  setSlideImageLoaded(true);
                                }
                              }}
                            />
                          )}

                          {/* 3. Non-blocking Discreet Loading Indicator */}
                          {visualMode === 'ai' && !slideImageLoaded && !slideImageError && (
                            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-amber-200 text-[10px] font-bold flex items-center gap-1.5 shadow">
                              <Sparkles className="w-3 h-3 animate-spin text-amber-300" />
                              <span>Đang làm nét tranh ảnh...</span>
                            </div>
                          )}

                          {/* Mode Indicator Badge */}
                          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-black flex items-center gap-1 shadow">
                            {visualMode === 'ai' && slideImageLoaded && !slideImageError ? (
                              <>
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>Tranh Minh Họa Sống Động</span>
                              </>
                            ) : (
                              <>
                                <Palette className="w-3 h-3 text-amber-400" />
                                <span>Nét Vẽ SGK Vector</span>
                              </>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomArtworkModal(true);
                            }}
                            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-white/95 hover:bg-white text-gray-800 text-[10px] font-black shadow flex items-center gap-1 transition active:scale-95 border border-gray-200"
                          >
                            <ZoomIn className="w-3 h-3 text-amber-600" />
                            <span>Phóng to</span>
                          </button>
                        </div>

                        {/* Caption & Visual Analysis */}
                        <p className="text-xs font-semibold text-gray-700 italic bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 leading-relaxed">
                          {currentSlide.visualArt?.caption || selectedUnit.visualArt?.caption}
                        </p>

                        {/* Elements Analysis */}
                        {currentSlide.visualArt?.elements && (
                          <div className="flex flex-col gap-1.5 text-[11px]">
                            <div className="bg-sky-50 text-sky-950 p-2 rounded-xl border border-sky-200 font-bold leading-tight">
                              <span className="text-sky-700 font-black">🎨 Hòa sắc:</span> {currentSlide.visualArt.elements.color}
                            </div>
                            <div className="bg-purple-50 text-purple-950 p-2 rounded-xl border border-purple-200 font-bold leading-tight">
                              <span className="text-purple-700 font-black">📐 Bố cục:</span> {currentSlide.visualArt.elements.composition}
                            </div>
                          </div>
                        )}

                        {/* Action: Send to Canvas */}
                        <button
                          onClick={() => {
                            const svgContent = currentSlide.visualArt?.svg || selectedUnit.visualArt?.svg;
                            if (svgContent && onStartDrawingOnCanvas) {
                              const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent);
                              onStartDrawingOnCanvas(dataUrl);
                            } else if (onStartDrawingOnCanvas) {
                              onStartDrawingOnCanvas();
                            }
                          }}
                          className="w-full py-2.5 px-3 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md hover:scale-102 active:scale-98 transition flex items-center justify-center gap-1.5"
                        >
                          <Palette className="w-4 h-4" />
                          <span>Đưa Tranh Mẫu Này Vào Bảng Vẽ</span>
                        </button>

                        {/* Sample Artworks Multi-View (Bốn Phân Môn Mĩ Thuật Lớp 3) */}
                        {selectedUnit.sampleArtworks && selectedUnit.sampleArtworks.length > 0 && (
                          <div className="flex flex-col gap-2 pt-2 border-t border-amber-200">
                            <span className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Bộ Tranh Mẫu Thị Phạm 4 Phân Môn:</span>
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {selectedUnit.sampleArtworks.map((art) => (
                                <div
                                  key={art.id}
                                  className="p-2 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 shadow-2xs flex flex-col justify-between gap-1 transition"
                                >
                                  <div>
                                    <div className="flex items-center gap-1 font-black text-[11px] text-gray-800">
                                      <span>{art.icon}</span>
                                      <span className="truncate">{art.category}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 line-clamp-2 font-medium mt-0.5">
                                      {art.description}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (onStartDrawingOnCanvas && art.imageUrl) {
                                        onStartDrawingOnCanvas(art.imageUrl);
                                      }
                                    }}
                                    className="text-[10px] font-black text-rose-600 hover:text-rose-700 flex items-center justify-end gap-0.5 mt-1"
                                  >
                                    <span>Vẽ Mẫu Này →</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Grade 4 Landscape Practice Task Card */}
                        {selectedUnit.practiceTask && (
                          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-sm flex flex-col gap-1.5 mt-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg">🏞️</span>
                              <h4 className="text-xs font-black text-emerald-900">
                                {selectedUnit.practiceTask.title}
                              </h4>
                            </div>
                            <p className="text-[10px] font-bold text-emerald-800 line-clamp-2">
                              {selectedUnit.practiceTask.theme}
                            </p>
                            <div className="space-y-1 text-[10px] text-emerald-950 font-bold max-h-32 overflow-y-auto">
                              {selectedUnit.practiceTask.guidelines.map((g, idx) => (
                                <p key={idx} className="flex items-start gap-1">
                                  <span className="text-emerald-600 shrink-0 font-black">✓</span>
                                  <span>{g}</span>
                                </p>
                              ))}
                            </div>
                            <button
                              onClick={() => onStartDrawingOnCanvas && onStartDrawingOnCanvas()}
                              className="mt-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg shadow-sm transition text-center"
                            >
                              🎨 Bắt Đầu Thực Hành Vẽ Phong Cảnh Ngay
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. Teacher Lecture Speech Bar with Audio Waves */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={avatarUrl}
                          alt={teacherName}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-300 shadow"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/teacher.jpg'; }}
                        />
                        {isSpeaking && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-blue-900">
                            {teacherName} Thuyết Minh:
                          </span>
                          {isSpeaking && (
                            <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full animate-pulse">
                              🔊 Đang giảng...
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 italic line-clamp-2 mt-0.5">
                          "{currentSlide.teacherLecture}"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={toggleCurrentSlideSpeech}
                      className={`shrink-0 px-4 py-2 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow ${
                        isSpeaking
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSpeaking ? 'Dừng' : `Nghe ${pronoun}`}</span>
                    </button>
                  </div>
                </div>

                {/* 5. Slide Control Footer (Đa Phương Thức Điều Khiển) */}
                <div className="bg-gray-100 p-3 sm:p-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevSlide}
                      disabled={currentSlideIndex === 0}
                      className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-white text-gray-700 disabled:opacity-40 font-black rounded-xl text-xs sm:text-sm shadow-sm hover:bg-gray-50 transition"
                      title="Hoạt động trước (Phím: Mũi tên trái / PageUp / Vuốt phải)"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Trước</span>
                    </button>

                    {/* Quick Jump Buttons: 1, 2, 3, 4, 5 */}
                    <div className="hidden md:flex items-center gap-1">
                      {slides.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => goToSlide(idx)}
                          className={`w-7 h-7 rounded-lg text-xs font-black transition flex items-center justify-center ${
                            currentSlideIndex === idx
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-white text-gray-600 hover:bg-gray-200'
                          }`}
                          title={`Nhảy tới Hoạt Động ${idx + 1} (Phím: ${idx + 1})`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Multi-Device Hint Bar */}
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/80 rounded-xl border border-gray-200 text-[11px] font-bold text-gray-600 shadow-xs">
                    <span className="flex items-center gap-1">
                      <Tv className="w-3.5 h-3.5 text-blue-600" /> TV: D-Pad / Màu
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> Vuốt Cảm Ứng
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <Mouse className="w-3.5 h-3.5 text-purple-600" /> Cuộn Chuột
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <Keyboard className="w-3.5 h-3.5 text-amber-600" /> Phím 1-5 / Space
                    </span>
                  </div>

                  {/* Next Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRevealAllAnswers(currentSlideIndex, currentSlide?.teacherQuestions?.length || 0)}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl font-black text-xs transition flex items-center gap-1"
                      title="Hiện/Ẩn câu trả lời học sinh (Phím: A)"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">{allAnswersRevealed ? 'Ẩn Đáp Án' : 'Hiện Đáp Án'}</span>
                    </button>

                    <button
                      onClick={handleDownloadPptx}
                      disabled={isExportingPptx}
                      className="hidden sm:flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition shadow disabled:opacity-50"
                      title="Tải PowerPoint (.pptx) Chuẩn SMAS Viettel"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isExportingPptx ? 'Đang tạo...' : 'Tải PPTX (SMAS)'}</span>
                    </button>

                    <button
                      onClick={goToNextSlide}
                      disabled={currentSlideIndex === slides.length - 1}
                      className="flex items-center gap-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 font-black rounded-xl text-xs sm:text-sm shadow transition"
                      title="Hoạt động tiếp theo (Phím: Mũi tên phải / PageDown / Space / Vuốt trái)"
                    >
                      <span>Tiếp</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FLOATING MOBILE DOCK (DÀNH CHO ĐIỆN THOẠI & TABLET) */}
          {viewMode === 'powerpoint' && (
            <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-40 lg:hidden bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2 text-white">
              <button
                onClick={goToPrevSlide}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-xl bg-white/10 disabled:opacity-30 active:scale-95 transition"
                title="Trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-black px-2">
                {currentSlideIndex + 1}/{slides.length}
              </span>

              <button
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-2 rounded-xl bg-orange-500 disabled:opacity-30 active:scale-95 transition"
                title="Tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <button
                onClick={toggleCurrentSlideSpeech}
                className={`p-2 rounded-xl transition ${isSpeaking ? 'bg-rose-500' : 'bg-white/10'}`}
                title={`Nghe ${pronoun} giảng`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => toggleRevealAllAnswers(currentSlideIndex, currentSlide?.teacherQuestions?.length || 0)}
                className="p-2 rounded-xl bg-white/10 active:scale-95 transition"
                title="Hiện câu trả lời"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => setZoomArtworkModal(true)}
                className="p-2 rounded-xl bg-white/10 active:scale-95 transition"
                title="Phóng to tranh"
              >
                <ZoomIn className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          )}

          {/* MODAL 1: FULLSCREEN ARTWORK LIGHTBOX ZOOM (PHÓNG TO TRANH MẪU TRÊN TV / MÁY CHIẾU) */}
          {zoomArtworkModal && (
            <div 
              onClick={() => setZoomArtworkModal(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 select-none animate-in fade-in cursor-zoom-out"
            >
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 cursor-default"
              >
                <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-amber-200" />
                    <h4 className="font-black text-sm sm:text-base">
                      {currentSlide.visualArt?.title || selectedUnit.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => setZoomArtworkModal(false)}
                    className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="w-full aspect-[16/10] bg-amber-50 flex items-center justify-center overflow-hidden p-2">
                  {visualMode === 'ai' && !slideImageError ? (
                    <img
                      src={currentSlide.visualArt?.imageUrl || selectedUnit.visualArt?.imageUrl}
                      alt={selectedUnit.title}
                      className="w-full h-full object-contain"
                      onError={() => setSlideImageError(true)}
                    />
                  ) : (
                    <div 
                      className="w-full h-full p-4 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: currentSlide.visualArt?.svg || selectedUnit.visualArt?.svg || '' }}
                    />
                  )}
                </div>

                <div className="p-4 bg-amber-50/90 border-t border-amber-200 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-gray-700 italic font-semibold max-w-lg">
                    {currentSlide.visualArt?.caption || selectedUnit.visualArt?.caption}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVisualMode(v => v === 'ai' ? 'vector' : 'ai')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow transition"
                    >
                      {visualMode === 'ai' ? 'Chuyển Nét SGK' : 'Chuyển Tranh Ảnh'}
                    </button>
                    <button
                      onClick={() => setZoomArtworkModal(false)}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-black transition"
                    >
                      Đóng (Esc)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 2: BẢNG HƯỚNG DẪN & ĐIỀU KHIỂN ĐA THIẾT BỊ (UNIVERSAL REMOTE CONTROLLER) */}
          {showDeviceControllerModal && (
            <div 
              onClick={() => setShowDeviceControllerModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in"
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-orange-300"
              >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-200" />
                    <div>
                      <h4 className="font-black text-sm sm:text-base">
                        Bộ Điều Khiển Ứng Dụng Đa Thiết Bị
                      </h4>
                      <p className="text-[11px] text-amber-100">
                        Tương thích Smart TV, Điện Thoại, Chuột Không Dây, Bàn Phím & Bút Trình Chiếu
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeviceControllerModal(false)}
                    className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-black">
                  <button
                    onClick={() => setDeviceTab('tv')}
                    className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition ${
                      deviceTab === 'tv' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    <span>Smart TV</span>
                  </button>
                  <button
                    onClick={() => setDeviceTab('mobile')}
                    className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition ${
                      deviceTab === 'mobile' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Điện Thoại</span>
                  </button>
                  <button
                    onClick={() => setDeviceTab('mouse')}
                    className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition ${
                      deviceTab === 'mouse' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Mouse className="w-4 h-4" />
                    <span>Chuột Không Dây</span>
                  </button>
                  <button
                    onClick={() => setDeviceTab('keyboard')}
                    className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition ${
                      deviceTab === 'keyboard' ? 'border-b-2 border-orange-500 text-orange-600 bg-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Keyboard className="w-4 h-4" />
                    <span>Bàn Phím / Bút Clicker</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto text-xs text-gray-700">
                  {deviceTab === 'tv' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                        <b className="text-blue-900 block mb-1 text-sm">📺 Điều Khiển Bằng Remote Smart TV (Samsung, LG, Android TV):</b>
                        <p>Ứng dụng hỗ trợ 100% phím bấm chuẩn trên điều khiển TV từ xa:</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                          <b className="text-gray-900 block font-black">◄ ► Mũi tên Trái / Phải:</b>
                          <span>Chuyển hoạt động bài giảng trước hoặc kế tiếp</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                          <b className="text-gray-900 block font-black">🔘 Phím OK / Enter:</b>
                          <span>Chọn hoạt động, kích hoạt nghe giảng của Thầy</span>
                        </div>
                        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                          <b className="text-rose-900 block font-black">🔴 Nút Màu Đỏ TV:</b>
                          <span>Bật / Dừng giọng giảng thuyết minh của Thầy</span>
                        </div>
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                          <b className="text-emerald-900 block font-black">🟢 Nút Màu Xanh Lá TV:</b>
                          <span>Hiện / Ẩn câu trả lời dự kiến của học sinh</span>
                        </div>
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                          <b className="text-amber-900 block font-black">🟡 Nút Màu Vàng TV:</b>
                          <span>Đổi chế độ xem (Tranh ảnh minh họa ⇄ Nét vẽ SGK)</span>
                        </div>
                        <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200">
                          <b className="text-indigo-900 block font-black">🔵 Nút Màu Xanh Dương TV:</b>
                          <span>Phóng to toàn màn hình Smart TV (Fullscreen)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {deviceTab === 'mobile' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                        <b className="text-emerald-900 block mb-1 text-sm">📱 Điều Khiển Cảm Ứng Trên Điện Thoại & Tablet:</b>
                        <p>Tương thích mọi thao tác lướt ngón tay tự nhiên trên màn hình cảm ứng:</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-2xl shrink-0">👈</span>
                          <div>
                            <b className="text-gray-900 block font-black">Vuốt Sang Trái (Swipe Left):</b>
                            <span>Chuyển sang Hoạt động dạy học tiếp theo</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-2xl shrink-0">👉</span>
                          <div>
                            <b className="text-gray-900 block font-black">Vuốt Sang Phải (Swipe Right):</b>
                            <span>Quay lại Hoạt động dạy học trước đó</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-2xl shrink-0">👆</span>
                          <div>
                            <b className="text-gray-900 block font-black">Thanh Điều Khiển Nổi Dưới Đáy Màn Hình:</b>
                            <span>Dễ dàng cầm điện thoại 1 tay để điều khiển bài giảng trong lớp học</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {deviceTab === 'mouse' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
                        <b className="text-purple-900 block mb-1 text-sm">🖱️ Điều Khiển Bằng Chuột Không Dây / Có Dây:</b>
                        <p>Thầy cô chỉ cần cầm chuột không dây đi lại trong lớp để tương tác bài học:</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                          <b className="text-gray-900 block font-black">🎡 Lăn Bánh Xe Xuống (Wheel Down):</b>
                          <span>Chuyển hoạt động kế tiếp</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                          <b className="text-gray-900 block font-black">🎡 Lăn Bánh Xe Lên (Wheel Up):</b>
                          <span>Quay về hoạt động trước</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                          <b className="text-gray-900 block font-black">🖱️ Nút Hông Chuột Không Dây (Phím 3, 4):</b>
                          <span>Lùi lại / Tiến tới hoạt động bài học</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                          <b className="text-gray-900 block font-black">✨ Nhấp Đúp Vào Tranh Mẫu:</b>
                          <span>Phóng to tranh toàn màn hình để học sinh ngắm</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {deviceTab === 'keyboard' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                        <b className="text-amber-900 block mb-1 text-sm">⌨️ Bàn Phím Máy Tính & Bút Chỉ Trình Chiếu Laser:</b>
                        <p>Đầy đủ phím tắt sư phạm hỗ trợ giảng dạy chuyên nghiệp:</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-black text-amber-700">1 - 5</span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">Đến Hoạt động 1-5</span>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-black text-amber-700">Space / PgDn</span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">Hoạt động tiếp</span>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-black text-amber-700">Backspace / PgUp</span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">Hoạt động trước</span>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-black text-amber-700">A</span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">Hiện/Ẩn đáp án</span>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-black text-amber-700">V</span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">Nghe {pronoun} giảng</span>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-black text-amber-700">M</span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">Đổi chế độ tranh</span>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-black text-amber-700">F / F5</span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">Toàn màn hình</span>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-black text-amber-700">B hoặc dấu .</span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">Màn hình đen</span>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-black text-amber-700">W hoặc dấu ,</span>
                          <span className="block text-[11px] font-bold text-gray-700 mt-1">Bảng trắng</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsTvMode(v => !v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
                        isTvMode ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>{isTvMode ? 'Tắt Chế Độ Smart TV' : 'Bật Chế Độ Smart TV'}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowDeviceControllerModal(false)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition shadow"
                  >
                    Đã Hiểu & Tiếp Tục Giảng Dạy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: WORD LESSON PLAN (CHUẨN CÔNG VĂN 2345/BGDĐT) */}
          {viewMode === 'word' && selectedUnit.wordLessonPlan && (
            <div className="bg-white rounded-3xl shadow-xl border-4 border-blue-200 overflow-hidden flex flex-col">
              {/* Word Document Action Header */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-black text-sm text-blue-950">
                    Kế Hoạch Bài Dạy Chuẩn Công Văn 2345 & SMAS Viettel (smas.edu.vn)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => isAutoLecturing ? stopAutoLecture() : startAutoLecture(0)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-black rounded-xl shadow transition ${
                      isAutoLecturing
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 animate-pulse'
                    }`}
                    title={`Để ${teacherName} đọc và giảng bài tuần tự theo 5 hoạt động của giáo án`}
                  >
                    {isAutoLecturing ? <X className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>{isAutoLecturing ? 'Dừng Đọc Giáo Án' : `AI ${teacherName} Đọc Giáo Án Tuần Tự`}</span>
                  </button>

                  <button
                    onClick={downloadWordPlan}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow hover:scale-105 transition"
                    title="Tải giáo án Word (.doc) về máy tính"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Giáo Án Word (.doc) Chuẩn SMAS Viettel</span>
                  </button>
                </div>
              </div>

              {/* Word Document Preview */}
              <div className="p-6 sm:p-8 space-y-6 text-gray-800 bg-white font-sans text-xs sm:text-sm leading-relaxed max-h-[620px] overflow-y-auto">
                <div className="text-center border-b pb-4">
                  <p className="font-bold text-gray-500 uppercase text-xs">
                    Bộ Giáo Dục Và Đào Tạo • Trường Tiểu Học
                  </p>
                  <h3 className="text-lg sm:text-xl font-black text-rose-700 mt-1">
                    {selectedUnit.wordLessonPlan.title}
                  </h3>
                  <h4 className="font-extrabold text-blue-900 mt-0.5">
                    {selectedUnit.wordLessonPlan.unit}
                  </h4>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    {selectedUnit.wordLessonPlan.book} • Thời lượng: {selectedUnit.duration}
                  </p>
                </div>

                {/* Section I */}
                <div>
                  <h5 className="font-black text-blue-900 text-sm mb-2 uppercase flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>I. Yêu Cầu Cần Đạt (Mục tiêu bài học):</span>
                  </h5>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 pl-2">
                    {selectedUnit.wordLessonPlan.objectives.map((obj, i) => (
                      <li key={i} className="font-medium">{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Section II */}
                <div>
                  <h5 className="font-black text-blue-900 text-sm mb-2 uppercase flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>II. Đồ Dùng Dạy Học:</span>
                  </h5>
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
                    <p><b>1. Giáo viên:</b> {selectedUnit.wordLessonPlan.preparations.teacher}</p>
                    <p><b>2. Học sinh:</b> {selectedUnit.wordLessonPlan.preparations.students}</p>
                  </div>
                </div>

                {/* Section III: Bảng 4 cột chuẩn Công văn 2345/BGDĐT-GDTH */}
                <div>
                  <h5 className="font-black text-blue-900 text-sm mb-2 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>III. Các Hoạt Động Dạy Học Chủ Yếu (Bảng 4 Cột Chuẩn Công Văn 2345/BGDĐT-GDTH):</span>
                  </h5>
                  
                  <div className="overflow-x-auto rounded-2xl border-2 border-blue-200 shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs">
                          <th className="p-3 border border-blue-500 w-[22%]">Hoạt động dạy học & Thời lượng</th>
                          <th className="p-3 border border-blue-500 w-[34%]">Hoạt động của Giáo viên (Thị phạm & Câu hỏi gợi mở)</th>
                          <th className="p-3 border border-blue-500 w-[30%]">Hoạt động của Học sinh (Thực hành & Trả lời dự kiến)</th>
                          <th className="p-3 border border-blue-500 w-[14%]">Sản phẩm dự kiến</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100 bg-white">
                        {selectedUnit.wordLessonPlan.activities.map((act, i) => {
                          const isCurrentActive = isAutoLecturing && currentSlideIndex === i;
                          return (
                          <tr 
                            key={i} 
                            className={`transition-all duration-300 ${
                              isCurrentActive 
                                ? 'bg-amber-100/90 ring-4 ring-amber-400 border-2 border-amber-500 shadow-md scale-[1.01]' 
                                : (i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30')
                            }`}
                          >
                            <td className="p-3 border border-blue-100 align-top">
                              {isCurrentActive && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 mb-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] shadow-sm animate-pulse">
                                  <span>🔊</span>
                                  <span>{teacherName} Đang Giảng Hoạt Động Này</span>
                                </span>
                              )}
                              <span className="font-black text-blue-950 block text-xs sm:text-sm">
                                {act.phase}
                              </span>
                              <span className="text-[11px] font-bold text-amber-700 block mt-0.5">
                                ⏱️ {act.duration || 'Tiết dạy'}
                              </span>
                              <span className="text-[11px] font-semibold text-gray-500 block mt-1">
                                <b>Hình thức:</b> {act.method || 'Cả lớp'}
                              </span>
                              {act.objective && (
                                <p className="text-[11px] text-gray-600 mt-1 italic leading-tight">
                                  🎯 <i>{act.objective}</i>
                                </p>
                              )}
                            </td>

                            <td className="p-3 border border-blue-100 align-top space-y-2">
                              <p className="font-semibold text-gray-800 leading-relaxed">
                                {act.teacherAct}
                              </p>
                              {act.teacherQuestions && act.teacherQuestions.length > 0 && (
                                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 space-y-1">
                                  <span className="text-[11px] font-black text-amber-900 block">
                                    ❓ Dự kiến hệ thống câu hỏi của Thầy:
                                  </span>
                                  <ul className="list-disc list-inside space-y-0.5 text-amber-950 text-[11px]">
                                    {act.teacherQuestions.map((q, qIdx) => (
                                      <li key={qIdx} className="font-medium">"{q}"</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </td>

                            <td className="p-3 border border-blue-100 align-top space-y-2">
                              <p className="font-medium text-gray-700 leading-relaxed">
                                {act.studentAct || 'Tích cực tham gia và thực hành sáng tạo.'}
                              </p>
                              {act.studentAnswers && act.studentAnswers.length > 0 && (
                                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 space-y-1">
                                  <span className="text-[11px] font-black text-emerald-900 block">
                                    💬 Dự kiến câu trả lời của Học sinh:
                                  </span>
                                  <ul className="list-disc list-inside space-y-0.5 text-emerald-950 text-[11px]">
                                    {act.studentAnswers.map((ans, aIdx) => (
                                      <li key={aIdx} className="font-medium">"{ans}"</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </td>

                            <td className="p-3 border border-blue-100 align-top">
                              <span className="inline-block px-2 py-1 bg-purple-50 text-purple-900 font-bold rounded-lg border border-purple-200 text-[11px] leading-tight">
                                📦 {act.expectedProduct || 'Sản phẩm mĩ thuật theo chủ đề'}
                              </span>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section IV: Tích hợp liên môn & giáo dục toàn diện (GDPT 2018) */}
                <div>
                  <h5 className="font-black text-blue-900 text-sm mb-2 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>IV. Nội Dung Tích Hợp Liên Môn & Giáo Dục Toàn Diện Phù Hợp Chủ Đề (GDPT 2018):</span>
                  </h5>
                  {Array.isArray(selectedUnit.wordLessonPlan.integrations) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {selectedUnit.wordLessonPlan.integrations.map((integ, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3.5 rounded-2xl border-2 shadow-sm flex flex-col gap-1 transition ${
                            idx % 3 === 0 
                              ? 'bg-amber-50/70 border-amber-200' 
                              : idx % 3 === 1 
                                ? 'bg-emerald-50/70 border-emerald-200' 
                                : 'bg-blue-50/70 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-900 text-sm">
                              {integ.badge || '🌐 Tích hợp'}
                            </span>
                            <span className="font-bold text-gray-800 text-xs">
                              {integ.name}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium leading-relaxed mt-1">
                            {integ.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
                        <span className="font-black text-amber-900 block mb-0.5">📐 1. Tích Hợp Toán Học (Hình Học & Tỉ Lệ):</span>
                        <p className="text-gray-700 font-medium">{selectedUnit.wordLessonPlan.integrations?.math}</p>
                      </div>
                      <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
                        <span className="font-black text-emerald-900 block mb-0.5">🌿 2. Tự Nhiên - Xã Hội & Lịch Sử - Địa Lí:</span>
                        <p className="text-gray-700 font-medium">{selectedUnit.wordLessonPlan.integrations?.society}</p>
                      </div>
                      <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200">
                        <span className="font-black text-blue-900 block mb-0.5">📖 3. Tích Hợp Tiếng Việt / Văn Học:</span>
                        <p className="text-gray-700 font-medium">{selectedUnit.wordLessonPlan.integrations?.vietnamese}</p>
                      </div>
                      <div className="bg-pink-50/70 p-3 rounded-2xl border border-pink-200">
                        <span className="font-black text-pink-900 block mb-0.5">🎵 4. Tích Hợp Âm Nhạc & Vận Động:</span>
                        <p className="text-gray-700 font-medium">{selectedUnit.wordLessonPlan.integrations?.music}</p>
                      </div>
                      <div className="bg-teal-50/70 p-3 rounded-2xl border border-teal-200">
                        <span className="font-black text-teal-900 block mb-0.5">🌍 5. Bảo Vệ Môi Trường & Địa Phương:</span>
                        <p className="text-gray-700 font-medium">{selectedUnit.wordLessonPlan.integrations?.environment}</p>
                      </div>
                      <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200">
                        <span className="font-black text-rose-900 block mb-0.5">🤝 6. Kĩ Năng Sống & Quyền Trẻ Em (SEL):</span>
                        <p className="text-gray-700 font-medium">{selectedUnit.wordLessonPlan.integrations?.sel}</p>
                      </div>
                      <div className="md:col-span-2 bg-indigo-50/70 p-3 rounded-2xl border border-indigo-200">
                        <span className="font-black text-indigo-900 block mb-0.5">💡 7. Giáo Dục STEM / STEAM (Khoa Học Ứng Dụng):</span>
                        <p className="text-gray-700 font-medium">{selectedUnit.wordLessonPlan.integrations?.steam}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section V: Chữ ký hành chính */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600">
                  <div className="text-center">
                    <p className="uppercase">Ban Giám Hiệu Phê Duyệt</p>
                    <p className="text-[11px] text-gray-400 italic mt-8">(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div className="text-center">
                    <p className="uppercase">Giáo Viên Giảng Dạy</p>
                    <p className="text-blue-900 font-black mt-8">{teacherName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: EXCEL SMAS VIETTEL (THÔNG TƯ 27/2020/TT-BGDĐT) */}
          {viewMode === 'excel' && (
            <SmasExcelView
              selectedGrade={selectedGrade}
              selectedUnit={selectedUnit}
              teacher={teacher}
              isTvMode={isTvMode}
            />
          )}

          {/* VIEW 4: 2-WAY TEACHER CHAT */}
          {viewMode === 'chat' && (
            <div className="bg-white rounded-3xl shadow-xl border-4 border-rose-200 overflow-hidden flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt={teacherName}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/teacher.jpg'; }}
                  />
                  <div>
                    <h4 className="font-black text-sm">Hỏi Thầy Về Bài: {selectedUnit.title}</h4>
                    <span className="text-[10px] text-rose-100 font-semibold">
                      {teacherName} đang online giải đáp cho con
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-rose-50/20">
                <div className="flex items-start gap-2.5">
                  <img
                    src={avatarUrl}
                    alt={teacherName}
                    className="w-8 h-8 rounded-xl object-cover border border-amber-300 shadow-sm shrink-0 mt-1"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/teacher.jpg'; }}
                  />
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-rose-100 max-w-[85%]">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
                      Thầy chào con! Về bài học <b>"{selectedUnit.title}"</b>, con có thắc mắc gì về cách phác nét, phối màu hay cần Thầy vẽ mẫu tham khảo không?
                    </p>
                  </div>
                </div>

                {messages.map((m) => {
                  const isTeacher = m.sender === 'teacher';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2.5 ${isTeacher ? '' : 'flex-row-reverse'}`}
                    >
                      {isTeacher ? (
                        <img
                          src={avatarUrl}
                          alt={teacherName}
                          className="w-8 h-8 rounded-xl object-cover border border-amber-300 shadow-sm shrink-0 mt-1"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/teacher.jpg'; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-black text-xs shrink-0 mt-1 shadow-sm">
                          Bé
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl shadow-sm max-w-[85%] ${
                          isTeacher
                            ? 'bg-white rounded-tl-none border border-rose-100 text-gray-800'
                            : 'bg-rose-500 rounded-tr-none text-white'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-semibold whitespace-pre-line leading-relaxed">
                          {m.text}
                        </p>

                        {m.imageUrl && (
                          <div className="mt-3 rounded-xl overflow-hidden border-2 border-white shadow">
                            <img
                              src={m.imageUrl}
                              alt="Tranh mẫu của Thầy"
                              className="w-full h-auto max-h-48 object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80';
                              }}
                            />
                            <span className="block text-[10px] p-1 bg-black/60 text-white text-center font-bold">
                              🎨 Tranh mẫu tham khảo Thầy vẽ cho con
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-rose-500 font-bold text-xs p-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
                    <span>{teacherName} đang suy nghĩ lời khuyên...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-rose-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Hỏi Thầy: 'Cách vẽ con mèo?', 'Vẽ giúp con bức tranh mẫu'..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-rose-200 focus:outline-none focus:ring-4 focus:ring-rose-200 text-xs sm:text-sm font-semibold bg-rose-50/20"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isTyping}
                  className="p-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white shadow transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. BOTTOM OVERVIEW SECTION: Grid of all units of current grade */}
        <div className="bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm mt-2">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h4 className="font-black text-gray-800 text-sm sm:text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Chương Trình Mĩ Thuật Lớp {selectedGrade} ({gradeUnits.length} Bài Học - SGK Kết Nối Tri Thức)</span>
            </h4>
            <span className="text-xs font-bold text-gray-500">Bấm bài bất kỳ để trình chiếu ngay</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {gradeUnits.map((unit) => {
              const isSelected = selectedUnit.id === unit.id;
              return (
                <button
                  key={unit.id}
                  onClick={() => handleSelectUnit(unit)}
                  className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-300'
                      : 'bg-gray-50/70 border-gray-100 hover:bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-2xl p-1.5 bg-white rounded-xl shadow-xs">
                      {unit.icon}
                    </span>
                    <span className="text-[10px] font-black text-amber-600 uppercase">
                      {unit.unitNumber}
                    </span>
                  </div>
                  <div className="mt-2">
                    <h5 className="font-extrabold text-gray-800 text-xs line-clamp-2">
                      {unit.title}
                    </h5>
                    <span className="inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      {unit.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
