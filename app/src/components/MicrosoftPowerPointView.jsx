import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Download, 
  Upload, 
  Maximize2, 
  Minimize2, 
  Tv, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Copy, 
  Trash2, 
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
  AlignJustify, 
  Bold, 
  Italic, 
  Underline, 
  Save, 
  Check, 
  Palette, 
  Layout, 
  ZoomIn, 
  ZoomOut, 
  Sliders, 
  FileText, 
  FolderOpen,
  Music,
  Share2,
  Search,
  Star,
  Minus,
  Square,
  X,
  User,
  Lightbulb,
  MessageSquare,
  BookOpen,
  Monitor
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportSmasPowerPoint } from '../services/smasExport';
import { ttsService } from '../services/tts';
import { parsePptxFile } from '../services/officeParser';

// Mẫu Slide 12 Mục Tiêu Học Tập (Chuẩn trực quan hệt như ảnh mẫu người dùng gửi)
export const SAMPLE_GOAL_SLIDE = {
  slideNumber: 12,
  phase: "Hoạt động 1: Mục tiêu học tập",
  layout: "infographic-goals",
  title: "Em hãy nêu hai mục tiêu: ngắn hạn và dài hạn đối với môn học đó",
  subtitle: "Xác định mục tiêu ngắn hạn & dài hạn đối với môn học",
  goalShortTermLabel: "NGẮN HẠN",
  goalShortTermDesc: "Là những mục tiêu liên quan đến những kế hoạch và dự định của bạn trong thời gian gần đây nhất.",
  goalShortTermEx: "Cải thiện điểm kiểm tra trong tháng.",
  goalLongTermLabel: "DÀI HẠN",
  goalLongTermDesc: "Là những mục tiêu liên quan đến những kế hoạch trong một khoảng thời gian rất dài sau này của bạn.",
  goalLongTermEx: "Cải thiện điểm thi học kì và điểm tổng kết môn học, quyết tâm trang bị thêm nhiều kiến thức và kĩ năng liên quan đến môn học này.",
  quote: "Có mục tiêu – Có động lực – Có kết quả!",
  teacherLecture: "Thầy chào các con! Ở hoạt động này, các con hãy cùng suy nghĩ và nêu ra hai mục tiêu: mục tiêu ngắn hạn và mục tiêu dài hạn đối với môn học của mình nhé. Mục tiêu ngắn hạn là những kế hoạch gần nhất, như cải thiện điểm kiểm tra trong tháng. Mục tiêu dài hạn là kế hoạch xa hơn, như điểm thi học kì và tích lũy kĩ năng sáng tạo. Có mục tiêu, chúng ta sẽ có động lực và gặt hái kết quả tuyệt vời!",
  bullets: [
    "Xác định mục tiêu ngắn hạn đối với môn học",
    "Lập kế hoạch mục tiêu dài hạn cho năm học",
    "Ghi nhớ: Có mục tiêu - Có động lực - Có kết quả"
  ]
};

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

  // Ribbon Tabs: 'home' | 'insert' | 'draw' | 'design' | 'slideshow' | 'view' | 'file'
  const [activeRibbonTab, setActiveRibbonTab] = useState('home');

  // Presentation Title (Chuẩn thanh tiêu đề Microsoft PowerPoint)
  const [presentationTitle, setPresentationTitle] = useState(() => {
    return selectedUnit?.title 
      ? `PP HĐTN tuần 8- Ai mẩu - PowerPoint (${selectedUnit.title} - Lớp ${selectedGrade})`
      : 'PP HĐTN tuần 8- Ai mẩu - PowerPoint (Sản phẩm Chưa cấp phép)';
  });

  // Zoom Level on Slide (82% như trong ảnh mẫu)
  const [zoomLevel, setZoomLevel] = useState(82);

  // Khóa giọng đọc giáo viên rõ ràng: 'male' (Thầy Cọ Nhí) | 'female' (Cô Hoài My)
  const [selectedVoice, setSelectedVoice] = useState(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('ARTED_SELECTED_TEACHER') : null;
    return saved === 'female' ? 'female' : (teacher?.gender || 'male');
  });

  // Editable Slides Deck State
  const [slides, setSlides] = useState(() => {
    const raw = selectedUnit?.powerpointSlides ? JSON.parse(JSON.stringify(selectedUnit.powerpointSlides)) : [];
    // Luôn bổ sung slide mục tiêu học tập mẫu (Slide 12) để người dùng xem và dùng ngay
    if (!raw.some(s => s.layout === 'infographic-goals')) {
      raw.push(JSON.parse(JSON.stringify(SAMPLE_GOAL_SLIDE)));
    }
    return raw;
  });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(() => {
    // Ưu tiên chọn ngay slide mục tiêu học tập (Slide 12 như ảnh mẫu) khi khởi động
    return 0;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Hidden File Inputs for Uploading Files, Images & Audios
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const slideAudioRef = useRef(null);

  // Typography, Font Family & Size
  const [fontFamily, setFontFamily] = useState('Arial');
  const [titleFontSize, setTitleFontSize] = useState(26);
  const [bodyFontSize, setBodyFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState('left');

  // Slide Dimension / Aspect Ratio: '16:9' (Widescreen) vs '4:3' (Standard)
  const [slideAspectRatio, setSlideAspectRatio] = useState('16:9');
  const [imageFitMode, setImageFitMode] = useState('contain'); // 'contain' | 'cover'

  // Slide Layout: 'standard' | 'large-image' | 'title-only' | 'comparison'
  const [slideLayout, setSlideLayout] = useState('standard');

  // Slide Theme Background: 'white' | 'cream' | 'blue' | 'peach' | 'dark'
  const [slideTheme, setSlideTheme] = useState('cream');

  // Audio / Music Player State
  const [isPlayingSlideAudio, setIsPlayingSlideAudio] = useState(false);
  const [ambientMusicEnabled, setAmbientMusicEnabled] = useState(false);
  const ambientAudioContextRef = useRef(null);
  const ambientTimerRef = useRef(null);

  // Slide Show Presentation Mode (F5)
  const [isSlideShowMode, setIsSlideShowMode] = useState(false);

  // Drawing Pen & Laser Pointer on Slide
  const [isPenActive, setIsPenActive] = useState(false);
  const [penColor, setPenColor] = useState('#ef4444');
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });

  // Auto-Lecture Engine
  const [isAutoLecturing, setIsAutoLecturing] = useState(false);
  const [autoLecturePaused, setAutoLecturePaused] = useState(false);
  const [autoLectureCountdown, setAutoLectureCountdown] = useState(null);
  const autoLectureTimerRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Presenter Notes Drawer
  const [showNotesDrawer, setShowNotesDrawer] = useState(true);
  const [zoomArtworkModal, setZoomArtworkModal] = useState(false);
  const [zoomedImageSrc, setZoomedImageSrc] = useState(null);

  // Canvas Refs
  const penCanvasRef = useRef(null);
  const slideContainerRef = useRef(null);

  // Sync teacher voice when teacher prop changes
  useEffect(() => {
    if (teacher?.gender) {
      setSelectedVoice(teacher.gender);
      ttsService.setVoice(teacher.gender);
    }
  }, [teacher]);

  const handleSwitchVoice = (newVoice) => {
    const v = newVoice || (selectedVoice === 'male' ? 'female' : 'male');
    setSelectedVoice(v);
    ttsService.setVoice(v);
    showSaveToastNotification(v === 'male' ? '🎙️ Đã chọn: AI Thầy Cọ Nhí (Giọng Nam)' : '🎙️ Đã chọn: AI Cô Hoài My (Giọng Nữ)');
  };

  // Sync slides when selectedUnit changes
  useEffect(() => {
    if (selectedUnit?.powerpointSlides) {
      const copy = JSON.parse(JSON.stringify(selectedUnit.powerpointSlides));
      if (!copy.some(s => s.layout === 'infographic-goals')) {
        copy.push(JSON.parse(JSON.stringify(SAMPLE_GOAL_SLIDE)));
      }
      setSlides(copy);
      if (selectedUnit.title) {
        setPresentationTitle(`PP HĐTN tuần 8- Ai mẩu - PowerPoint (${selectedUnit.title} - Lớp ${selectedGrade})`);
      }
      clearPenCanvas();
      stopAutoLecture();
    }
  }, [selectedUnit, selectedGrade]);

  // Clean up timers & audio
  useEffect(() => {
    return () => {
      if (ambientAudioContextRef.current) {
        ambientAudioContextRef.current.close().catch(() => {});
        ambientAudioContextRef.current = null;
      }
      if (ambientTimerRef.current) {
        clearInterval(ambientTimerRef.current);
      }
      if (autoLectureTimerRef.current) {
        clearInterval(autoLectureTimerRef.current);
      }
      ttsService.stop();
    };
  }, []);

  // When changing slides, stop playing audio of previous slide & sync font/ratio
  useEffect(() => {
    if (slideAudioRef.current) {
      slideAudioRef.current.pause();
      setIsPlayingSlideAudio(false);
    }
    const s = slides[currentSlideIndex];
    if (s?.fontFamily) setFontFamily(s.fontFamily);
    if (s?.titleFontSize) setTitleFontSize(s.titleFontSize);
    if (s?.bodyFontSize) setBodyFontSize(s.bodyFontSize);
    if (s?.slideSize) setSlideAspectRatio(s.slideSize);
  }, [currentSlideIndex, slides]);

  // Audio Playback Handler for Embedded Slide Music
  const togglePlaySlideAudio = () => {
    if (!slideAudioRef.current) return;
    if (isPlayingSlideAudio) {
      slideAudioRef.current.pause();
      setIsPlayingSlideAudio(false);
    } else {
      slideAudioRef.current.play().then(() => {
        setIsPlayingSlideAudio(true);
      }).catch(err => console.warn('Không thể phát audio slide:', err));
    }
  };

  // Upload custom audio / song from computer onto current slide
  const handleUploadAudioForCurrentSlide = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const audioUrl = evt.target.result;
      setSlides(prev => {
        const next = [...prev];
        const s = { ...next[currentSlideIndex] };
        s.audio = {
          name: file.name,
          url: audioUrl,
          type: file.type || 'audio/mpeg'
        };
        next[currentSlideIndex] = s;
        return next;
      });
      showSaveToastNotification(`Đã gắn âm thanh/bài hát: ${file.name} vào slide này!`);
    };
    reader.readAsDataURL(file);
  };

  // Web Audio Soft Ambient Classroom Music (Nhạc nền mĩ thuật nhẹ nhàng)
  const toggleAmbientMusic = () => {
    if (ambientMusicEnabled) {
      if (ambientAudioContextRef.current) {
        ambientAudioContextRef.current.close().catch(() => {});
        ambientAudioContextRef.current = null;
      }
      if (ambientTimerRef.current) {
        clearInterval(ambientTimerRef.current);
        ambientTimerRef.current = null;
      }
      setAmbientMusicEnabled(false);
      showSaveToastNotification('Đã tắt nhạc nền mĩ thuật.');
    } else {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        ambientAudioContextRef.current = ctx;

        const chords = [
          [261.63, 329.63, 392.00], // C major (Do - Mi - Sol)
          [220.00, 261.63, 329.63], // A minor (La - Do - Mi)
          [174.61, 220.00, 261.63], // F major (Fa - La - Do)
          [196.00, 246.94, 293.66]  // G major (Sol - Si - Re)
        ];
        let chordIdx = 0;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.06, ctx.currentTime);
        masterGain.connect(ctx.destination);

        const playNextChord = () => {
          if (!ambientAudioContextRef.current || ambientAudioContextRef.current.state === 'closed') return;
          const currentNotes = chords[chordIdx % chords.length];
          chordIdx++;

          currentNotes.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.8);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start();
            osc.stop(ctx.currentTime + 5.0);
          });
        };

        playNextChord();
        ambientTimerRef.current = setInterval(playNextChord, 4800);

        setAmbientMusicEnabled(true);
        showSaveToastNotification('🎵 Đã bật nhạc nền sáng tạo mĩ thuật êm dịu!');
      } catch (err) {
        console.error('Không thể bật Web Audio:', err);
      }
    }
  };

  const currentSlide = slides[currentSlideIndex] || slides[0] || {};

  // Theme Styling Map
  const themeStyles = {
    white: { bg: '#FFFFFF', text: '#0F172A', card: '#F8FAFC', border: '#E2E8F0', accent: '#D24726' },
    cream: { bg: '#FFFBEB', text: '#1E293B', card: '#FEF3C7', border: '#FDE68A', accent: '#D97706' },
    blue: { bg: '#EFF6FF', text: '#0F172A', card: '#DBEAFE', border: '#BFDBFE', accent: '#1D4ED8' },
    peach: { bg: '#FFF7ED', text: '#1E293B', card: '#FFEDD5', border: '#FED7AA', accent: '#EA580C' },
    dark: { bg: '#1E293B', text: '#F8FAFC', card: '#334155', border: '#475569', accent: '#F59E0B' }
  };
  const activeTheme = themeStyles[slideTheme] || themeStyles.cream;

  // Save Toast
  const showSaveToastNotification = (msg) => {
    setSaveToast(msg || 'Đã lưu thay đổi vào bài giảng!');
    setTimeout(() => setSaveToast(false), 2500);
  };

  // 1. TẢI LÊN TỆP TỪ MÁY TÍNH (.pptx, ảnh slide, json)
  const handleUploadPresentation = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    // Trường hợp 1: Tải lên tệp Microsoft PowerPoint chuẩn (.pptx)
    if (fileName.endsWith('.pptx')) {
      try {
        const result = await parsePptxFile(file, pronoun);
        if (result.slides && result.slides.length > 0) {
          setSlides(result.slides);
          setCurrentSlideIndex(0);
          if (result.slideSize) {
            setSlideAspectRatio(result.slideSize);
          }
          if (result.slides[0]?.fontFamily) {
            setFontFamily(result.slides[0].fontFamily);
          }
          if (result.slides[0]?.titleFontSize) {
            setTitleFontSize(result.slides[0].titleFontSize);
          }
          showSaveToastNotification(`Đã mở và nạp thành công ${result.slides.length} slide (${result.slideSize || '16:9'}) từ tệp: ${file.name}!`);
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } else {
          alert('Không tìm thấy nội dung slide hợp lệ trong tệp PowerPoint này.');
        }
      } catch (err) {
        console.error('Lỗi phân tích cú pháp PowerPoint:', err);
        alert('Không thể mở tệp PowerPoint này. Vui lòng đảm bảo tệp .pptx hợp lệ!');
      }
      return;
    }

    // Trường hợp 2: Tệp .ppt phiên bản cũ
    if (fileName.endsWith('.ppt')) {
      alert('Tệp bạn chọn là định dạng .ppt cũ. Để hiển thị đầy đủ hình ảnh và từng slide, vui lòng mở tệp trên PowerPoint và Lưu dưới dạng (.pptx) rồi tải lên lại nhé!');
      return;
    }

    // Trường hợp 3: Tải lên ảnh (.png, .jpg, .webp) -> Tạo thành slide mới với ảnh này
    if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.webp')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const imgUrl = evt.target.result;
        const newSlide = {
          phase: `Slide tải lên ${slides.length + 1}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          subtitle: 'Tác phẩm / Tranh mẫu tải lên từ máy tính',
          teacherLecture: `${pronoun} mời các con quan sát bức tranh mẫu được tải lên từ máy tính!`,
          bullets: [
            'Quan sát chi tiết đường nét và hình khối trong tác phẩm',
            'Tìm hiểu các gam màu chính được sử dụng',
            'Chia sẻ cảm nhận cá nhân với Thầy Cô và bạn bè'
          ],
          visualArt: {
            title: file.name.replace(/\.[^/.]+$/, ""),
            imageUrl: imgUrl
          }
        };
        setSlides(prev => [...prev, newSlide]);
        setCurrentSlideIndex(slides.length);
        showSaveToastNotification(`Đã tải lên và tạo slide mới từ ảnh: ${file.name}`);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Trường hợp 4: Tệp JSON bài giảng
    if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed);
            setCurrentSlideIndex(0);
            showSaveToastNotification(`Đã nạp thành công ${parsed.length} slide từ tệp JSON!`);
          } else if (parsed.powerpointSlides) {
            setSlides(parsed.powerpointSlides);
            setCurrentSlideIndex(0);
            showSaveToastNotification(`Đã nạp thành công bài giảng từ tệp!`);
          }
        } catch (err) {
          alert('Tệp JSON không đúng định dạng bài giảng.');
        }
      };
      reader.readAsText(file);
      return;
    }

    alert('Vui lòng chọn tệp PowerPoint (.pptx), tệp ảnh (.png, .jpg) hoặc tệp JSON bài giảng!');
  };

  // 2. TẢI ẢNH MẪU TỪ MÁY TÍNH LÊN SLIDE HIỆN TẠI
  const handleUploadImageForCurrentSlide = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const imgUrl = evt.target.result;
      setSlides(prev => {
        const next = [...prev];
        const s = { ...next[currentSlideIndex] };
        s.visualArt = {
          ...s.visualArt,
          title: file.name.replace(/\.[^/.]+$/, ""),
          imageUrl: imgUrl
        };
        next[currentSlideIndex] = s;
        return next;
      });
      showSaveToastNotification(`Đã thay thế ảnh mẫu từ máy tính: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

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

  // Update bullet point
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

  const addBulletPoint = () => {
    setSlides(prev => {
      const next = [...prev];
      const slide = { ...next[currentSlideIndex] };
      slide.bullets = [...(slide.bullets || []), 'Nội dung thực hành mới...'];
      next[currentSlideIndex] = slide;
      return next;
    });
  };

  const deleteBulletPoint = (bulletIndex) => {
    setSlides(prev => {
      const next = [...prev];
      const slide = { ...next[currentSlideIndex] };
      slide.bullets = slide.bullets.filter((_, idx) => idx !== bulletIndex);
      next[currentSlideIndex] = slide;
      return next;
    });
  };

  // Slide Deck Operations: Add, Duplicate, Delete, Reorder
  const handleAddNewSlide = () => {
    const newSlide = {
      phase: `Hoạt động ${slides.length + 1}`,
      title: 'Tiêu đề hoạt động sáng tạo',
      subtitle: 'Mục tiêu & Hướng dẫn thực hành mĩ thuật',
      teacherLecture: `${pronoun} chào các con! Chúng ta cùng bước vào hoạt động sáng tạo tiếp theo nhé!`,
      bullets: [
        'Học sinh chuẩn bị đầy đủ dụng cụ vẽ và màu sắc',
        'Quan sát hình mẫu và dựng khung hình học',
        'Hoàn thiện nét vẽ và hòa sắc biểu cảm'
      ],
      visualArt: {
        title: selectedUnit?.title || 'Tác phẩm mĩ thuật',
        imageUrl: './teacher.jpg'
      }
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

  const moveSlideUp = (idx) => {
    if (idx <= 0) return;
    setSlides(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return next;
    });
    setCurrentSlideIndex(idx - 1);
  };

  const moveSlideDown = (idx) => {
    if (idx >= slides.length - 1) return;
    setSlides(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return next;
    });
    setCurrentSlideIndex(idx + 1);
  };

  // Reset to original curriculum slides
  const handleResetSlides = () => {
    if (confirm('Khôi phục bài giảng về mẫu gốc chuẩn SGK Kết nối tri thức? Mọi chỉnh sửa của bạn sẽ được đặt lại.')) {
      if (selectedUnit?.powerpointSlides) {
        setSlides(JSON.parse(JSON.stringify(selectedUnit.powerpointSlides)));
        setCurrentSlideIndex(0);
        showSaveToastNotification('Đã khôi phục slide về mẫu gốc SGK!');
      }
    }
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
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          const endMsg = `Tuyệt vời! ${pronoun} chúc mừng cả lớp đã hoàn thành toàn bộ bài học "${selectedUnit?.title || ''}"! Bây giờ các con cùng thực hành vẽ tranh nhé!`;
          ttsService.speak(endMsg, null, null, selectedVoice);
          stopAutoLecture();
        }
      },
      selectedVoice
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
    const text = s?.teacherLecture || `${pronoun} chào các con! Chúng mình đang học bài ${selectedUnit?.title || s?.title}`;
    ttsService.speak(text, () => setIsSpeaking(true), () => setIsSpeaking(false), selectedVoice);
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

      // Ctrl + S: Save
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        showSaveToastNotification();
      }
      // Ctrl + O: Upload / Open
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        fileInputRef.current?.click();
      }
      // F5: Start Slide Show
      else if (e.key === 'F5' && !e.shiftKey) {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideShowMode, currentSlideIndex, slides.length]);

  return (
    <div className="w-full flex flex-col rounded-3xl overflow-hidden shadow-2xl border-4 border-[#C43E1C] bg-[#f3f4f6]">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadPresentation}
        accept=".pptx,.ppt,.json,.png,.jpg,.jpeg,.webp"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleUploadImageForCurrentSlide}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={handleUploadAudioForCurrentSlide}
        accept="audio/*"
        className="hidden"
      />

      {/* 1. AUTHENTIC MICROSOFT POWERPOINT TITLE BAR */}
      <div className="bg-[#C43E1C] text-white px-3 py-1.5 flex items-center justify-between border-b border-[#A73315] shadow-xs select-none">
        {/* Left: Quick Access Toolbar & App Icon */}
        <div className="flex items-center gap-2">
          {/* PowerPoint Brand Icon */}
          <div className="w-6 h-6 rounded-md bg-[#A73315] border border-white/20 flex items-center justify-center font-black text-white text-xs shadow-inner">
            P
          </div>

          {/* Quick Access Action Icons */}
          <div className="flex items-center gap-1 text-white/90 border-r border-white/20 pr-2">
            <button
              onClick={() => showSaveToastNotification('Đã lưu bài giảng!')}
              className="p-1 hover:bg-black/20 rounded transition"
              title="Lưu (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:bg-black/20 rounded transition"
              title="Mở tệp PowerPoint (.pptx / ảnh / json)"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsSlideShowMode(true);
                setCurrentSlideIndex(0);
              }}
              className="p-1 hover:bg-black/20 rounded transition"
              title="Bắt đầu Trình Chiếu từ Đầu (F5)"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
            </button>
          </div>

          {/* Document / Presentation Title */}
          <input
            type="text"
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
            className="bg-transparent hover:bg-black/10 focus:bg-black/20 px-2 py-0.5 rounded text-xs sm:text-sm font-bold text-white outline-none max-w-sm sm:max-w-md md:max-w-xl truncate transition"
            title="Tên tệp bài giảng PowerPoint"
          />
        </div>

        {/* Right: User Profile 'Đỗ Tiến Sỹ', Share & Window Controls */}
        <div className="flex items-center gap-2.5">
          {/* User Account Capsule like sample photo */}
          <div className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full cursor-pointer transition text-xs font-semibold">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-5 h-5 rounded-full object-cover border border-white/40 shadow-xs"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = './teacher.jpg'; }}
            />
            <span className="font-bold text-white tracking-tight">Đỗ Tiến Sỹ</span>
            <span className="text-[10px] opacity-70">▼</span>
          </div>

          {/* Share Button [Chia sẻ] */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: presentationTitle, url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                showSaveToastNotification('Đã sao chép liên kết bài giảng để chia sẻ!');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-bold transition shadow-xs"
            title="Chia sẻ bài giảng này"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Chia sẻ</span>
          </button>

          {/* Window Control Buttons */}
          <div className="flex items-center gap-1 text-white/80 pl-1 border-l border-white/20">
            <button className="p-1 hover:bg-black/20 rounded text-xs transition" title="Thu nhỏ">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsSlideShowMode(prev => !prev)}
              className="p-1 hover:bg-black/20 rounded text-xs transition" 
              title="Phóng to cửa sổ"
            >
              <Square className="w-3 h-3" />
            </button>
            <button 
              onClick={() => {
                if (confirm('Bạn có muốn đóng trình xem PowerPoint?')) {
                  window.history.back();
                }
              }}
              className="p-1 hover:bg-rose-700 rounded text-xs transition" 
              title="Đóng"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. AUTHENTIC OFFICE NOTIFICATION BAR (Chuẩn hệt như ảnh mẫu) */}
      <div className="bg-[#FDE8E4] border-b border-[#FCA5A5] px-4 py-1.5 flex items-center justify-between text-xs text-[#991B1B] flex-wrap gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#C43E1C] text-white flex items-center justify-center font-black text-[10px] shrink-0">
            !
          </span>
          <span className="font-bold text-[11px] sm:text-xs">
            <b>THÔNG BÁO:</b> Hệ thống tích hợp đầy đủ công cụ PowerPoint, Trợ lý AI Giảng bài tự động & Mẫu Slide Mục tiêu học tập chuẩn GDPT 2018.
          </span>
        </div>

        {/* Quick Notification Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              // Nhảy ngay tới Slide Mục Tiêu Học Tập (Slide 12 như ảnh mẫu)
              let targetIdx = slides.findIndex(s => s.layout === 'infographic-goals');
              if (targetIdx === -1) {
                setSlides(prev => [...prev, JSON.parse(JSON.stringify(SAMPLE_GOAL_SLIDE))]);
                targetIdx = slides.length;
              }
              setCurrentSlideIndex(targetIdx);
              setSlideLayout('infographic-goals');
              showSaveToastNotification('Đã mở Slide 12 Mục tiêu học tập (Chuẩn ảnh mẫu)!');
            }}
            className="px-2.5 py-1 bg-white hover:bg-rose-50 text-[#C43E1C] border border-[#FCA5A5] rounded-md font-black text-[11px] shadow-2xs transition hover:scale-105"
            title="Mở ngay Slide 12 Mục tiêu ngắn hạn & dài hạn như ảnh mẫu"
          >
            🎯 Slide 12 Mục Tiêu (Như Ảnh Mẫu)
          </button>

          <button
            onClick={() => {
              setIsSlideShowMode(true);
              setCurrentSlideIndex(0);
            }}
            className="px-2.5 py-1 bg-[#C43E1C] hover:bg-[#A73315] text-white rounded-md font-bold text-[11px] shadow-2xs transition"
          >
            ▶ Trình Chiếu (F5)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-md font-bold text-[11px] shadow-2xs transition"
          >
            📁 Tải Lên (.pptx)
          </button>

          <button
            onClick={handleExportPptx}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md font-bold text-[11px] shadow-2xs transition"
          >
            📥 Xuất SMAS
          </button>
        </div>
      </div>

      {/* 3. MICROSOFT POWERPOINT OFFICE RIBBON TABS */}
      <div className="bg-[#FAF9F8] border-b border-gray-300 px-3 pt-1 flex items-center justify-between overflow-x-auto shadow-2xs">
        <div className="flex items-center gap-0.5">
          {[
            { id: 'file', label: 'Tệp' },
            { id: 'home', label: 'Trang đầu' },
            { id: 'insert', label: 'Chèn' },
            { id: 'design', label: 'Thiết kế' },
            { id: 'transitions', label: 'Chuyển tiếp' },
            { id: 'animations', label: 'Hoạt hình' },
            { id: 'slideshow', label: 'Trình Chiếu' },
            { id: 'record', label: 'Ghi' },
            { id: 'review', label: 'Xem lại' },
            { id: 'view', label: 'Xem' },
            { id: 'help', label: 'Trợ giúp' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveRibbonTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-all ${
                activeRibbonTab === tab.id
                  ? 'bg-white text-[#C43E1C] border-t-2 border-x border-[#C43E1C] font-black shadow-2xs'
                  : 'text-gray-700 hover:bg-gray-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Assistant: 'Cho tôi biết bạn muốn làm gì' */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-400 w-56 shadow-inner">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <input
            type="text"
            placeholder="Cho tôi biết bạn muốn làm gì..."
            className="w-full bg-transparent outline-none text-gray-700 text-xs"
          />
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

            {/* Layout & Aspect Ratio */}
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
              <span className="text-[11px] font-bold text-gray-400">Bố Cục:</span>
              <select
                value={slideLayout}
                onChange={(e) => {
                  const val = e.target.value;
                  setSlideLayout(val);
                  updateCurrentSlide('layout', val);
                }}
                className="p-1.5 rounded-lg border border-gray-300 font-black text-xs bg-gray-50 outline-none"
              >
                <option value="infographic-goals">🎯 Mục Tiêu Học Tập (Như Ảnh Mẫu)</option>
                <option value="standard">Tiêu chuẩn GDPT (2 Cột)</option>
                <option value="large-image">Tranh Tiêu Điểm Lớn</option>
                <option value="title-only">Bìa / Tiêu Đề</option>
              </select>

              {/* Tỷ Lệ Màn Hình Slide (16:9 vs 4:3) */}
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border">
                <button
                  onClick={() => {
                    setSlideAspectRatio('16:9');
                    updateCurrentSlide('slideSize', '16:9');
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-black transition ${
                    slideAspectRatio === '16:9' ? 'bg-[#D24726] text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Tỷ lệ 16:9 (Màn hình rộng, TV & máy chiếu hiện đại)"
                >
                  16:9
                </button>
                <button
                  onClick={() => {
                    setSlideAspectRatio('4:3');
                    updateCurrentSlide('slideSize', '4:3');
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-black transition ${
                    slideAspectRatio === '4:3' ? 'bg-[#D24726] text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Tỷ lệ 4:3 (Màn hình chuẩn cổ điển)"
                >
                  4:3
                </button>
              </div>
            </div>

            {/* Font & Typography Settings */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200">
              {/* Chọn Phông Chữ Slide */}
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  updateCurrentSlide('fontFamily', e.target.value);
                }}
                className="p-1.5 rounded-lg border border-gray-300 font-black text-xs bg-white outline-none"
                title="Phông chữ của bài giảng"
              >
                <option value="Arial">Arial (Chuẩn)</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Calibri">Calibri (Office 365)</option>
                <option value="Segoe UI">Segoe UI</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Roboto">Roboto</option>
                <option value="Be Vietnam Pro">Be Vietnam Pro</option>
                <option value="Comic Sans MS">Comic Sans MS (Học sinh)</option>
              </select>

              {/* Chọn Cỡ Chữ Tiêu Đề */}
              <select
                value={titleFontSize}
                onChange={(e) => {
                  const sz = Number(e.target.value);
                  setTitleFontSize(sz);
                  updateCurrentSlide('titleFontSize', sz);
                }}
                className="p-1.5 rounded-lg border border-gray-300 font-bold text-xs bg-white outline-none"
                title="Cỡ chữ tiêu đề"
              >
                <option value={20}>20pt</option>
                <option value={24}>24pt</option>
                <option value={28}>28pt</option>
                <option value={32}>32pt</option>
                <option value={36}>36pt</option>
                <option value={42}>42pt</option>
              </select>

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

            {/* Group: Thêm Văn Bản & Khóa Giọng Giảng Bài AI */}
            <div className="flex items-center gap-2">
              <button
                onClick={addBulletPoint}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs transition"
              >
                <Type className="w-3.5 h-3.5" />
                <span>+ Thêm Dòng</span>
              </button>

              {/* NÚT CHUYỂN ĐỔI GIỌNG NÓI RÕ RÀNG */}
              <button
                onClick={() => handleSwitchVoice()}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black border transition shadow-xs ${
                  selectedVoice === 'female'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                    : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                }`}
                title="Bấm để chuyển đổi giữa Giọng Thầy Cọ Nhí (Nam) và Cô Hoài My (Nữ) - Khóa giọng 100%"
              >
                <span>{selectedVoice === 'female' ? '👩‍🏫' : '👨‍🏫'}</span>
                <span className="hidden sm:inline">{selectedVoice === 'female' ? 'Cô Hoài My (Nữ)' : 'Thầy Cọ Nhí (Nam)'}</span>
                <span className="text-[10px] opacity-60">⇄</span>
              </button>

              {/* Nút Giảng Bài Slide Này */}
              <button
                onClick={speakCurrentSlideOnly}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition ${
                  isSpeaking ? 'bg-rose-600 text-white animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Nghe Thầy/Cô AI đọc bài giảng slide này"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? 'Dừng Đọc' : 'Đọc Slide'}</span>
              </button>

              {/* Nút Nhạc Nền Mĩ Thuật */}
              <button
                onClick={toggleAmbientMusic}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-xs transition ${
                  ambientMusicEnabled ? 'bg-amber-400 text-amber-950 animate-pulse' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Bật/Tắt nhạc nền sáng tạo mĩ thuật êm dịu"
              >
                <Music className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{ambientMusicEnabled ? 'Nhạc: BẬT 🎵' : 'Nhạc Nền'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: CHÈN (INSERT) */}
        {activeRibbonTab === 'insert' && (
          <div className="flex items-center gap-3 flex-wrap w-full">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-black text-xs transition shadow-xs"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>📷 Tải Thêm Ảnh Mẫu Lên Slide</span>
            </button>
            <button
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-black text-xs transition shadow-xs"
            >
              <Music className="w-3.5 h-3.5 text-amber-600" />
              <span>🎵 Chèn Âm Thanh / Bài Hát (.mp3, .wav)</span>
            </button>
            <button
              onClick={addBulletPoint}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xs"
            >
              <Type className="w-3.5 h-3.5 text-blue-600" />
              <span>Chèn Đoạn Văn Bản / Hướng Dẫn</span>
            </button>
            <button
              onClick={() => onStartDrawingOnCanvas && onStartDrawingOnCanvas()}
              className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-bold text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chèn Tranh Tự Vẽ Từ Bảng Vẽ</span>
            </button>
          </div>
        )}

        {/* TAB: THIẾT KẾ (DESIGN) */}
        {activeRibbonTab === 'design' && (
          <div className="flex items-center gap-4 flex-wrap w-full">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-700">Tỷ lệ Slide:</span>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border">
                <button
                  onClick={() => {
                    setSlideAspectRatio('16:9');
                    updateCurrentSlide('slideSize', '16:9');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                    slideAspectRatio === '16:9' ? 'bg-[#D24726] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📐 16:9 (Màn Hình Rộng)
                </button>
                <button
                  onClick={() => {
                    setSlideAspectRatio('4:3');
                    updateCurrentSlide('slideSize', '4:3');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                    slideAspectRatio === '4:3' ? 'bg-[#D24726] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📐 4:3 (Màn Hình Chuẩn)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-[#D24726]" />
                <span>Màu Nền:</span>
              </span>
              {[
                { id: 'white', label: 'Trắng Sáng', color: '#FFFFFF' },
                { id: 'cream', label: 'Vàng Kem (SGK)', color: '#FFFBEB' },
                { id: 'blue', label: 'Xanh GDPT', color: '#EFF6FF' },
                { id: 'peach', label: 'Cam Phấn', color: '#FFF7ED' },
                { id: 'dark', label: 'Tối Trình Chiếu', color: '#1E293B' }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSlideTheme(theme.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold transition ${
                    slideTheme === theme.id ? 'ring-2 ring-[#D24726] shadow-sm' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: theme.color }} />
                  <span>{theme.label}</span>
                </button>
              ))}
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
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs shadow"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Mở / Tải Lên Tệp (.pptx, ảnh, json)</span>
            </button>
            <button
              onClick={handleExportPptx}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Đang tạo...' : 'Xuất Tệp PowerPoint (.pptx) SMAS'}</span>
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
        {/* LEFT SLIDE THUMBNAIL STRIP (Đúng chuẩn cột dọc số trang chiếu như ảnh mẫu) */}
        <div className="w-44 sm:w-52 bg-[#F0EEEA] border-r border-gray-300 p-2 overflow-y-auto flex flex-col gap-2 shrink-0 select-none">
          <div className="text-[11px] font-black uppercase text-gray-500 px-1 mb-1 flex items-center justify-between">
            <span>Trang Chiếu</span>
            <span className="bg-white px-1.5 py-0.2 rounded text-[10px] text-gray-700 font-bold border">
              {slides.length}
            </span>
          </div>

          {slides.map((s, idx) => {
            const isCurrent = currentSlideIndex === idx;
            const isGoalSlide = s.layout === 'infographic-goals';
            const displaySlideNum = isGoalSlide ? (s.slideNumber || 12) : (idx + 1);

            return (
              <div
                key={idx}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  if (s.layout) setSlideLayout(s.layout);
                }}
                className="flex items-start gap-1.5 cursor-pointer group"
              >
                {/* Slide Number & Star Effect Icon on the Left Column (như ảnh mẫu) */}
                <div className="flex flex-col items-center justify-center w-5 pt-1 shrink-0 select-none">
                  <span className={`text-xs font-black transition ${
                    isCurrent ? 'text-[#C43E1C]' : 'text-gray-500 group-hover:text-gray-800'
                  }`}>
                    {displaySlideNum}
                  </span>
                  <span className="text-[10px] text-amber-500">★</span>
                </div>

                {/* Thumbnail Card with Real WYSIWYG Mini Preview */}
                <div className={`flex-1 aspect-video rounded-md overflow-hidden transition-all relative border-2 ${
                  isCurrent
                    ? 'border-[#C43E1C] ring-2 ring-[#C43E1C]/50 shadow-md scale-[1.02] bg-white'
                    : 'border-gray-300 hover:border-gray-400 bg-white shadow-2xs'
                }`}>
                  {/* Thumbnail Content */}
                  {isGoalSlide ? (
                    <div className="w-full h-full bg-gradient-to-b from-sky-50 to-emerald-50/40 p-1 flex flex-col justify-between border border-dashed border-sky-400 rounded text-[6px] select-none overflow-hidden">
                      {/* Mini Header Cloud */}
                      <div className="flex items-center justify-between gap-0.5">
                        <span className="text-[7px]">👧</span>
                        <div className="bg-white/90 px-1 py-0.2 rounded border border-rose-300 text-[5px] font-black text-rose-600 truncate max-w-[85px]">
                          {s.title || 'Mục tiêu ngắn hạn & dài hạn'}
                        </div>
                        <span className="text-[7px]">🎓</span>
                      </div>
                      {/* Mini 2 Cards */}
                      <div className="grid grid-cols-2 gap-0.5 my-0.5">
                        <div className="bg-emerald-100/90 border border-emerald-400 rounded p-0.5 text-[4px] font-bold text-emerald-900 truncate">
                          🎯 NGẮN HẠN
                        </div>
                        <div className="bg-sky-100/90 border border-sky-400 rounded p-0.5 text-[4px] font-bold text-sky-900 truncate">
                          ⏳ DÀI HẠN
                        </div>
                      </div>
                      {/* Mini Bottom Quote */}
                      <div className="bg-rose-100/90 border border-rose-300 rounded text-[4.5px] font-black text-rose-700 text-center truncate">
                        Có mục tiêu – Có kết quả! 🏆
                      </div>
                    </div>
                  ) : (s.visualArt?.imageUrl && s.visualArt?.imageUrl !== './teacher.jpg') || (s.images?.[0]?.url) ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={s.visualArt?.imageUrl || s.images?.[0]?.url}
                        alt="Slide thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full p-1 flex flex-col justify-between overflow-hidden text-[7px] select-none"
                      style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
                    >
                      <p className="font-extrabold truncate leading-tight" style={{ color: activeTheme.accent }}>
                        {s.title}
                      </p>
                      <div className="space-y-0.5">
                        <div className="w-3/4 h-0.5 bg-gray-300 rounded-full" />
                        <div className="w-1/2 h-0.5 bg-gray-200 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Quick Add Slide & Upload Slide in Strip */}
          <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-gray-300/80">
            <button
              onClick={handleAddNewSlide}
              className="w-full py-1.5 bg-white hover:bg-amber-50 border border-dashed border-gray-300 hover:border-[#C43E1C] rounded-lg text-gray-700 hover:text-[#C43E1C] font-bold text-[11px] flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Bản Chiếu</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-800 font-bold text-[11px] flex items-center justify-center gap-1 transition"
            >
              <Upload className="w-3 h-3" />
              <span>Tải Lên .pptx</span>
            </button>
          </div>
        </div>

        {/* CENTER SLIDE STAGE */}
        <div className="flex-1 p-3 sm:p-6 flex flex-col items-center justify-between overflow-y-auto">
          {/* Real Slide Canvas with Dynamic Aspect Ratio & Fonts */}
          <div 
            ref={slideContainerRef}
            className={`w-full ${slideAspectRatio === '4:3' ? 'max-w-3xl aspect-[4/3]' : 'max-w-4xl aspect-video'} rounded-2xl shadow-xl border border-gray-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all`}
            style={{
              backgroundColor: activeTheme.bg,
              color: activeTheme.text,
              fontFamily: `${fontFamily}, sans-serif`
            }}
          >
            {/* Hidden HTML5 Audio Player for Slide Audio */}
            {currentSlide.audio && (
              <audio
                ref={slideAudioRef}
                src={currentSlide.audio.url}
                onPlay={() => setIsPlayingSlideAudio(true)}
                onPause={() => setIsPlayingSlideAudio(false)}
                onEnded={() => setIsPlayingSlideAudio(false)}
                className="hidden"
              />
            )}

            {/* CHẾ ĐỘ 1: BỐ CỤC INFOGRAPHIC MỤC TIÊU HỌC TẬP (CHUẨN HỆT NHƯ ẢNH MẪU NGƯỜI DÙNG GỬI) */}
            {(currentSlide.layout === 'infographic-goals' || slideLayout === 'infographic-goals') ? (
              <div className="relative w-full h-full flex flex-col justify-between p-2 sm:p-3.5 bg-gradient-to-b from-sky-50 via-emerald-50/30 to-amber-50/40 rounded-2xl border-4 border-dashed border-sky-400 overflow-hidden shadow-inner select-text">
                {/* Decorative floating sparkles */}
                <div className="absolute top-2 left-3 text-amber-400 text-base select-none animate-pulse">✨</div>
                <div className="absolute top-2 right-4 text-amber-400 text-base select-none animate-pulse">⭐</div>
                
                {/* 1. Header Cloud with Characters */}
                <div className="flex items-center justify-between gap-2 sm:gap-3 relative z-10">
                  {/* Left Character: Cute girl with magnifying glass */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-pink-100 border-2 border-pink-400 flex items-center justify-center text-xl sm:text-2xl shadow-xs transform hover:scale-105 transition">
                      👧
                    </div>
                    <span className="text-[9px] font-black text-pink-700 bg-white/95 px-1.5 py-0.5 rounded-full mt-0.5 border border-pink-200 shadow-2xs">
                      Quan sát 🔍
                    </span>
                  </div>

                  {/* Center Cloud Title */}
                  <div className="flex-1 bg-white/95 rounded-2xl sm:rounded-3xl p-2 sm:p-3 border-2 border-rose-300 shadow-sm text-center max-w-lg mx-auto">
                    <input
                      type="text"
                      value={currentSlide.title || 'Em hãy nêu hai mục tiêu: ngắn hạn và dài hạn đối với môn học đó'}
                      onChange={(e) => updateCurrentSlide('title', e.target.value)}
                      className="w-full text-center font-black text-rose-600 outline-none bg-transparent leading-snug text-xs sm:text-sm md:text-base"
                      placeholder="Nhập câu hỏi gợi mở / tiêu đề slide..."
                    />
                  </div>

                  {/* Right Character: Cute boy with graduation cap */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-sky-100 border-2 border-sky-400 flex items-center justify-center text-xl sm:text-2xl shadow-xs transform hover:scale-105 transition">
                      🎓
                    </div>
                    <span className="text-[9px] font-black text-sky-700 bg-white/95 px-1.5 py-0.5 rounded-full mt-0.5 border border-sky-200 shadow-2xs">
                      Mục tiêu 🎯
                    </span>
                  </div>
                </div>

                {/* 2. Main Body: 2 Columns (NGẮN HẠN vs DÀI HẠN) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5 my-1.5 relative z-10 items-stretch">
                  {/* Left Column: MỤC TIÊU NGẮN HẠN */}
                  <div className="flex flex-col gap-1.5 bg-white/95 rounded-xl p-2.5 border-2 border-emerald-400 shadow-xs">
                    {/* Pill Tag */}
                    <div className="inline-flex items-center gap-1 bg-emerald-500 text-white font-black text-[11px] sm:text-xs px-3 py-0.5 rounded-full shadow-2xs self-start">
                      <span>🎯</span>
                      <span>NGẮN HẠN</span>
                    </div>

                    {/* Definition */}
                    <div className="flex items-start gap-1.5 bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200">
                      <span className="text-emerald-700 text-xs mt-0.5">📌</span>
                      <textarea
                        rows={2}
                        value={currentSlide.goalShortTermDesc || 'Là những mục tiêu liên quan đến những kế hoạch và dự định của bạn trong thời gian gần đây nhất.'}
                        onChange={(e) => updateCurrentSlide('goalShortTermDesc', e.target.value)}
                        className="w-full text-[11px] font-bold text-gray-800 bg-transparent outline-none resize-none leading-relaxed"
                        placeholder="Nội dung mục tiêu ngắn hạn..."
                      />
                    </div>

                    {/* Example Card */}
                    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-emerald-300 shadow-2xs">
                      <span className="bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shrink-0">
                        VÍ DỤ
                      </span>
                      <input
                        type="text"
                        value={currentSlide.goalShortTermEx || 'Cải thiện điểm kiểm tra trong tháng.'}
                        onChange={(e) => updateCurrentSlide('goalShortTermEx', e.target.value)}
                        className="w-full text-[11px] font-black text-emerald-950 bg-transparent outline-none"
                        placeholder="Ví dụ cụ thể..."
                      />
                      <span className="text-emerald-500 text-sm">✅</span>
                    </div>
                  </div>

                  {/* Right Column: MỤC TIÊU DÀI HẠN */}
                  <div className="flex flex-col gap-1.5 bg-white/95 rounded-xl p-2.5 border-2 border-sky-400 shadow-xs">
                    {/* Pill Tag */}
                    <div className="inline-flex items-center gap-1 bg-sky-500 text-white font-black text-[11px] sm:text-xs px-3 py-0.5 rounded-full shadow-2xs self-start">
                      <span>⏳</span>
                      <span>DÀI HẠN</span>
                    </div>

                    {/* Definition */}
                    <div className="flex items-start gap-1.5 bg-sky-50/80 p-1.5 rounded-lg border border-sky-200">
                      <span className="text-sky-700 text-xs mt-0.5">⌛</span>
                      <textarea
                        rows={2}
                        value={currentSlide.goalLongTermDesc || 'Là những mục tiêu liên quan đến những kế hoạch trong một khoảng thời gian rất dài sau này của bạn.'}
                        onChange={(e) => updateCurrentSlide('goalLongTermDesc', e.target.value)}
                        className="w-full text-[11px] font-bold text-gray-800 bg-transparent outline-none resize-none leading-relaxed"
                        placeholder="Nội dung mục tiêu dài hạn..."
                      />
                    </div>

                    {/* Example Card */}
                    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-sky-300 shadow-2xs">
                      <span className="bg-sky-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shrink-0">
                        VÍ DỤ
                      </span>
                      <input
                        type="text"
                        value={currentSlide.goalLongTermEx || 'Cải thiện điểm thi học kì và tích lũy kĩ năng thẩm mỹ.'}
                        onChange={(e) => updateCurrentSlide('goalLongTermEx', e.target.value)}
                        className="w-full text-[11px] font-black text-sky-950 bg-transparent outline-none"
                        placeholder="Ví dụ cụ thể..."
                      />
                      <span className="text-amber-500 text-sm">💡</span>
                    </div>
                  </div>
                </div>

                {/* 3. Center Badge & Bottom Motivational Banner */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-sky-200/80 relative z-10 flex-wrap">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg shadow-2xs">
                    <span>🌱</span>
                    <span>Nuôi dưỡng đam mê</span>
                  </div>

                  <div className="bg-sky-600 text-white font-black text-[11px] px-3.5 py-0.5 rounded-full shadow-xs uppercase tracking-wide flex items-center gap-1">
                    <span>📖</span>
                    <span>MỤC TIÊU HỌC TẬP</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-100/90 px-2.5 py-0.5 rounded-lg border border-rose-300 shadow-2xs">
                    <span>✨</span>
                    <span>Có mục tiêu – Có động lực – Có kết quả!</span>
                    <span>🏆</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Slide Header: Phase & Editable Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <input
                      type="text"
                      value={currentSlide.phase || ''}
                      onChange={(e) => updateCurrentSlide('phase', e.target.value)}
                      className="text-xs sm:text-sm font-black uppercase tracking-wider bg-transparent border-b border-transparent hover:border-gray-400 focus:border-[#D24726] outline-none transition w-1/2"
                      style={{ color: activeTheme.accent }}
                      placeholder="Nhập giai đoạn hoạt động..."
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold opacity-60">
                        Slide {currentSlideIndex + 1} / {slides.length} ({slideAspectRatio})
                      </span>
                    </div>
                  </div>

                  {/* Editable Slide Title */}
                  <input
                    type="text"
                    value={currentSlide.title || ''}
                    onChange={(e) => updateCurrentSlide('title', e.target.value)}
                    className="w-full font-black bg-transparent border-b border-transparent hover:border-gray-400 focus:border-[#D24726] outline-none transition pb-1"
                    placeholder="Nhập tiêu đề hoạt động..."
                    style={{
                      color: activeTheme.text,
                      fontSize: `${titleFontSize}px`,
                      fontWeight: isBold ? '900' : '700',
                      fontStyle: isItalic ? 'italic' : 'normal',
                      textAlign: textAlign,
                      lineHeight: '1.2'
                    }}
                  />

                  {/* Editable Subtitle */}
                  {slideLayout !== 'title-only' && (
                    <input
                      type="text"
                      value={currentSlide.subtitle || ''}
                      onChange={(e) => updateCurrentSlide('subtitle', e.target.value)}
                      className="w-full font-bold bg-transparent border-b border-transparent hover:border-gray-400 outline-none transition mt-1 opacity-80"
                      style={{ 
                        color: activeTheme.accent,
                        fontSize: `${bodyFontSize}px`
                      }}
                      placeholder="Nhập mục tiêu hoạt động..."
                    />
                  )}

                  {/* EMBEDDED SLIDE AUDIO / MUSIC WIDGET */}
                  {currentSlide.audio && (
                    <div className="my-2 p-2 px-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-xl shadow-md flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={togglePlaySlideAudio}
                          className="w-7 h-7 rounded-full bg-white text-[#D24726] font-black flex items-center justify-center shadow hover:scale-105 active:scale-95 transition shrink-0"
                          title={isPlayingSlideAudio ? 'Tạm dừng' : 'Phát âm thanh slide'}
                        >
                          {isPlayingSlideAudio ? '⏸' : '▶'}
                        </button>
                        <div className="min-w-0">
                          <span className="font-extrabold block truncate max-w-[280px]">
                            🎵 {currentSlide.audio.name || 'Bản nhạc slide mĩ thuật'}
                          </span>
                          <span className="text-[10px] text-white/80 font-medium">
                            {isPlayingSlideAudio ? 'Đang phát âm nhạc slide ılıılı' : 'Bấm để phát bài hát / âm thanh'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            if (slideAudioRef.current) slideAudioRef.current.pause();
                            updateCurrentSlide('audio', null);
                          }}
                          className="p-1 hover:bg-white/20 rounded text-white/80 hover:text-white transition"
                          title="Gỡ âm thanh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slide Content by Layout */}
                {slideLayout === 'standard' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-auto items-center">
                    {/* Left Column: Bullet points list */}
                    <div className="md:col-span-7 space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider opacity-90" style={{ color: activeTheme.accent }}>
                        Nội dung trọng tâm & Bước thực hiện:
                      </span>
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {(currentSlide.bullets || []).map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2 group">
                            <span className="font-black mt-0.5" style={{ color: activeTheme.accent }}>•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => updateBulletPoint(bIdx, e.target.value)}
                              className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-[#D24726] rounded-lg p-1 outline-none resize-none transition"
                              style={{ 
                                color: activeTheme.text,
                                fontSize: `${bodyFontSize}px`
                              }}
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

                    {/* Right Column: Visual Artwork Card with Multi-Image Support */}
                    <div 
                      className="md:col-span-5 p-3 rounded-2xl border-2 shadow-sm flex flex-col justify-between"
                      style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-black uppercase" style={{ color: activeTheme.accent }}>
                          🎨 Tranh Thị Phạm {currentSlide.images?.length > 1 ? `(${currentSlide.images.length} ảnh)` : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => imageInputRef.current?.click()}
                            className="px-2 py-0.5 bg-white/80 hover:bg-white text-gray-800 text-[10px] font-bold rounded-lg border border-gray-300 transition flex items-center gap-1"
                            title="Tải ảnh mẫu mới từ máy tính lên"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Đổi Ảnh</span>
                          </button>
                          <button
                            onClick={() => {
                              setZoomedImageSrc(currentSlide.visualArt?.imageUrl || currentSlide.images?.[0]?.url || selectedUnit?.visualArt?.imageUrl);
                              setZoomArtworkModal(true);
                            }}
                            className="p-1 hover:bg-white rounded-lg transition"
                            title="Phóng to tranh"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Multi-image Gallery */}
                      {currentSlide.images && currentSlide.images.length > 1 ? (
                        <div className="space-y-1.5">
                          <div className="w-full aspect-[4/3] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center p-1.5 relative group">
                            <img
                              src={currentSlide.visualArt?.imageUrl || currentSlide.images[0]?.url || './teacher.jpg'}
                              alt="Tranh mẫu chính"
                              className="max-h-full max-w-full object-contain rounded-lg"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                            {currentSlide.images.map((img, imgIdx) => (
                              <button
                                key={img.id || imgIdx}
                                onClick={() => {
                                  updateCurrentSlide('visualArt', { title: img.name, imageUrl: img.url });
                                }}
                                className={`w-12 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                                  (currentSlide.visualArt?.imageUrl === img.url || (!currentSlide.visualArt?.imageUrl && imgIdx === 0))
                                    ? 'border-[#D24726] ring-2 ring-[#D24726]/40 scale-105'
                                    : 'border-gray-300 hover:border-gray-400 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-[4/3] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center p-2">
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
                      )}

                      <p className="text-[11px] font-bold text-center mt-1.5 truncate opacity-90">
                        {currentSlide.visualArt?.title || selectedUnit?.visualArt?.title || selectedUnit?.title}
                      </p>
                    </div>
                  </div>
                )}

                {slideLayout === 'large-image' && (
                  <div className="flex flex-col items-center justify-center my-auto w-full gap-2">
                    <div className="relative w-full max-w-lg aspect-video bg-white rounded-2xl overflow-hidden border border-gray-300 shadow-md p-2 flex items-center justify-center">
                      <img
                        src={currentSlide.visualArt?.imageUrl || selectedUnit?.visualArt?.imageUrl || './teacher.jpg'}
                        alt="Tranh mẫu tiêu điểm"
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="absolute top-3 right-3 px-3 py-1 bg-black/60 hover:bg-black/80 text-white text-xs font-bold rounded-xl backdrop-blur flex items-center gap-1 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Đổi Ảnh Từ Máy</span>
                      </button>
                    </div>
                    <p className="text-xs font-bold text-center opacity-80">
                      {currentSlide.visualArt?.title || selectedUnit?.visualArt?.title}
                    </p>
                  </div>
                )}

                {slideLayout === 'title-only' && (
                  <div className="flex flex-col items-center justify-center my-auto text-center space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-black" style={{ color: activeTheme.accent }}>
                      {currentSlide.title}
                    </h1>
                    <p className="text-base sm:text-lg font-bold opacity-80 max-w-xl">
                      {currentSlide.subtitle || selectedUnit?.summary}
                    </p>
                    <div className="pt-4 flex items-center gap-2">
                      <span className="px-4 py-1.5 rounded-full bg-white/60 font-bold text-xs border">
                        Giáo viên: {teacherName}
                      </span>
                      <span className="px-4 py-1.5 rounded-full bg-white/60 font-bold text-xs border">
                        Lớp {selectedGrade} • GDPT 2018
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Slide Footer: Bottom Meta */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-300/40 text-[10px] opacity-60 font-bold">
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

      {/* 6. AUTHENTIC MICROSOFT POWERPOINT BOTTOM STATUS BAR (Khớp 100% Ảnh Mẫu) */}
      <div className="bg-[#FAF9F8] border-t border-[#E1DFDD] px-3 py-1 flex items-center justify-between text-[11px] text-[#323130] font-medium select-none shrink-0 z-10">
        {/* Left Side: Slide Number, Language, Accessibility */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold hover:bg-black/5 px-1.5 py-0.5 rounded cursor-pointer transition">
            <span>Trang chiếu {currentSlideIndex + 1} / {slides.length}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="p-1 hover:bg-black/10 disabled:opacity-30 rounded transition"
              title="Slide trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1 hover:bg-black/10 disabled:opacity-30 rounded transition"
              title="Slide kế tiếp"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-3.5 w-px bg-gray-300 mx-0.5 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1 hover:bg-black/5 px-1.5 py-0.5 rounded cursor-pointer transition">
            <BookOpen className="w-3.5 h-3.5 opacity-70" />
            <span>Tiếng Việt (Việt Nam)</span>
          </div>

          <div className="h-3.5 w-px bg-gray-300 mx-0.5 hidden md:block" />

          <div className="hidden md:flex items-center gap-1 text-gray-600 hover:bg-black/5 px-1.5 py-0.5 rounded cursor-pointer transition">
            <User className="w-3.5 h-3.5 opacity-70 text-emerald-600" />
            <span>Khả năng truy cập: Sẵn sàng</span>
          </div>
        </div>

        {/* Right Side: Ghi chú, Chú thích, View Modes, Zoom Slider (82%) */}
        <div className="flex items-center gap-2">
          {/* Ghi chú */}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition ${
              showNotesDrawer ? 'bg-amber-100 text-amber-800' : 'hover:bg-black/5 text-[#323130]'
            }`}
            title="Mở ngăn ghi chú / lời giảng của giáo viên"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ghi chú</span>
          </button>

          {/* Chú thích */}
          <button
            onClick={() => alert('Chức năng bình luận & góp ý giáo án mĩ thuật')}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-black/5 text-[#323130] text-[11px] font-bold transition"
            title="Thêm chú thích bài giảng"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chú thích</span>
          </button>

          <div className="h-3.5 w-px bg-gray-300 mx-1 hidden sm:block" />

          {/* Chế độ xem: Normal, Slide Sorter, Reading, Slide Show */}
          <div className="hidden sm:flex items-center gap-0.5">
            <button 
              className="p-1 hover:bg-black/10 rounded transition text-gray-700 bg-black/5" 
              title="Chế độ xem bình thường"
            >
              <Layout className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => alert('Chế độ sắp xếp slide')}
              className="p-1 hover:bg-black/10 rounded transition text-gray-700" 
              title="Bộ sắp xếp trang chiếu"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => alert('Chế độ xem đọc bài giảng')}
              className="p-1 hover:bg-black/10 rounded transition text-gray-700" 
              title="Chế độ xem đọc"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setIsSlideShowMode(true)}
              className="p-1 hover:bg-[#C43E1C] hover:text-white rounded transition text-[#C43E1C]" 
              title="Trình chiếu Slide (F5)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-3.5 w-px bg-gray-300 mx-1" />

          {/* Zoom Slider (Mặc định 82% hệt ảnh mẫu) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 5))}
              className="p-0.5 hover:bg-black/10 rounded transition"
              title="Thu nhỏ"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="range"
              min="50"
              max="150"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-16 sm:w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#C43E1C]"
              title={`Thu phóng: ${zoomLevel}%`}
            />
            <button
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 5))}
              className="p-0.5 hover:bg-black/10 rounded transition"
              title="Phóng to"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel(82)}
              className="w-8 text-right font-bold hover:underline cursor-pointer"
              title="Khôi phục 82% chuẩn như ảnh mẫu"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-0.5 hover:bg-black/10 rounded transition text-gray-600"
              title="Vừa khít cửa sổ hiện tại"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
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
          <div 
            className={`w-full ${slideAspectRatio === '4:3' ? 'max-w-4xl aspect-[4/3]' : 'max-w-5xl aspect-video'} rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden`}
            style={{ 
              backgroundColor: currentSlide.layout === 'infographic-goals' ? '#F0FDF4' : activeTheme.bg, 
              color: currentSlide.layout === 'infographic-goals' ? '#1E293B' : activeTheme.text,
              fontFamily: `${fontFamily}, sans-serif`
            }}
          >
            {currentSlide.layout === 'infographic-goals' ? (
              /* Infographic Goals Layout in Fullscreen Mode (Ảnh mẫu Slide 12) */
              <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-[#F0FDF4] rounded-2xl border-4 border-dashed border-sky-400 text-slate-800 relative overflow-hidden">
                {/* Background stars */}
                <div className="absolute top-2 left-4 text-2xl select-none opacity-60">⭐</div>
                <div className="absolute top-2 right-6 text-2xl select-none opacity-60">✨</div>

                {/* 1. Header Cloud with Cartoon Girl & Boy */}
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-sm">
                      👧🔍
                    </div>
                  </div>

                  <div className="flex-1 bg-white/95 px-6 py-2.5 rounded-2xl border-2 border-sky-300 shadow-sm text-center">
                    <p className="text-lg sm:text-2xl font-black text-rose-600 tracking-tight leading-tight">
                      {currentSlide.title || "Em hãy nêu hai mục tiêu: ngắn hạn và dài hạn đối với môn học đó"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-14 h-14 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-3xl shadow-sm">
                      👦🎓
                    </div>
                  </div>
                </div>

                {/* 2. Two Columns: Ngắn Hạn & Dài Hạn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto relative z-10">
                  {/* Left Column: NGẮN HẠN */}
                  <div className="bg-emerald-50/90 p-4 sm:p-5 rounded-2xl border-2 border-emerald-400 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="bg-emerald-600 text-white font-black text-sm px-4 py-1 rounded-full shadow-xs uppercase tracking-wide flex items-center gap-1.5">
                        <span>🎯</span>
                        <span>{currentSlide.goalShortTermLabel || "NGẮN HẠN"}</span>
                      </div>
                      <span className="text-xl">🎯</span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-emerald-950 leading-relaxed">
                      {currentSlide.goalShortTermDesc || "Là những mục tiêu liên quan đến những kế hoạch và dự định của bạn trong thời gian gần đây nhất."}
                    </p>

                    <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs">
                      <span className="bg-emerald-600 text-white font-black text-xs px-2 py-0.5 rounded shrink-0">
                        VÍ DỤ
                      </span>
                      <p className="text-sm font-black text-emerald-900 leading-snug">
                        {currentSlide.goalShortTermEx || "Cải thiện điểm kiểm tra trong tháng."}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: DÀI HẠN */}
                  <div className="bg-sky-50/90 p-4 sm:p-5 rounded-2xl border-2 border-sky-400 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="bg-sky-600 text-white font-black text-sm px-4 py-1 rounded-full shadow-xs uppercase tracking-wide flex items-center gap-1.5">
                        <span>⏳</span>
                        <span>{currentSlide.goalLongTermLabel || "DÀI HẠN"}</span>
                      </div>
                      <span className="text-xl">⏳</span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-sky-950 leading-relaxed">
                      {currentSlide.goalLongTermDesc || "Là những mục tiêu liên quan đến những kế hoạch trong một khoảng thời gian rất dài sau này của bạn."}
                    </p>

                    <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-sky-300 shadow-2xs">
                      <span className="bg-sky-600 text-white font-black text-xs px-2 py-0.5 rounded shrink-0">
                        VÍ DỤ
                      </span>
                      <p className="text-sm font-black text-sky-900 leading-snug">
                        {currentSlide.goalLongTermEx || "Cải thiện điểm thi học kì và điểm tổng kết môn học, quyết tâm trang bị thêm nhiều kiến thức và kĩ năng liên quan đến môn học này."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Center Badge & Motivational Quote Banner */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-sky-200 relative z-10 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl shadow-xs">
                    <span>🌱</span>
                    <span>Nuôi dưỡng đam mê</span>
                  </div>

                  <div className="bg-sky-600 text-white font-black text-sm px-5 py-1 rounded-full shadow-sm uppercase tracking-wide flex items-center gap-1.5">
                    <span>📖</span>
                    <span>MỤC TIÊU HỌC TẬP</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-xl border border-rose-300 shadow-xs">
                    <span>✨</span>
                    <span>{currentSlide.quote || "Có mục tiêu – Có động lực – Có kết quả!"}</span>
                    <span>🏆</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Regular Slide Presentation */
              <>
                <div>
                  <p className="text-xs sm:text-sm font-black uppercase tracking-wider mb-1" style={{ color: activeTheme.accent }}>
                    {currentSlide.phase} ({slideAspectRatio})
                  </p>
                  <h2 className="font-black" style={{ fontSize: `${Math.max(24, titleFontSize + 4)}px`, lineHeight: '1.2' }}>
                    {currentSlide.title}
                  </h2>
                  <p className="font-bold mt-2 opacity-80" style={{ fontSize: `${Math.max(14, bodyFontSize + 2)}px` }}>
                    {currentSlide.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-center">
                  <div className="md:col-span-7 space-y-3">
                    {(currentSlide.bullets || []).map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-lg font-bold">
                        <span className="font-black text-xl" style={{ color: activeTheme.accent }}>•</span>
                        <span style={{ fontSize: `${Math.max(14, bodyFontSize + 2)}px` }}>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-5 p-4 rounded-2xl border" style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                    <img
                      src={currentSlide.visualArt?.imageUrl || currentSlide.images?.[0]?.url || selectedUnit?.visualArt?.imageUrl || './teacher.jpg'}
                      alt="Tranh mẫu"
                      className="w-full aspect-[4/3] object-contain rounded-xl bg-white p-2 shadow-sm"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = './teacher.jpg'; }}
                    />
                    <p className="text-xs font-black text-center mt-2 truncate opacity-90">
                      {currentSlide.visualArt?.title || selectedUnit?.visualArt?.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs opacity-60 border-t border-gray-300/40 pt-3">
                  <span>Giáo án Mĩ thuật GDPT 2018</span>
                  <span>Slide {currentSlideIndex + 1} / {slides.length}</span>
                </div>
              </>
            )}
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
            
            {/* Nút phát nhạc slide trong trình chiếu */}
            {currentSlide.audio && (
              <button
                onClick={togglePlaySlideAudio}
                className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                title="Bật/Tắt âm nhạc chèn trong slide"
              >
                <Music className="w-4 h-4" />
                <span>{isPlayingSlideAudio ? 'Tạm Dừng Nhạc' : 'Phát Nhạc Slide 🎵'}</span>
              </button>
            )}

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

      {/* Zoom Artwork Modal */}
      {zoomArtworkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg text-gray-900">
                {currentSlide.visualArt?.title || selectedUnit?.visualArt?.title}
              </h3>
              <button
                onClick={() => {
                  setZoomArtworkModal(false);
                  setZoomedImageSrc(null);
                }}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                ✕
              </button>
            </div>
            <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-gray-200">
              <img
                src={zoomedImageSrc || currentSlide.visualArt?.imageUrl || currentSlide.images?.[0]?.url || selectedUnit?.visualArt?.imageUrl || './teacher.jpg'}
                alt="Phóng to tranh"
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>
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
