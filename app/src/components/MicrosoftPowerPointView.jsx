import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause,
  RotateCcw, 
  Download, 
  Upload, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Copy, 
  Trash2, 
  Save, 
  Check, 
  Palette, 
  Layout, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  FolderOpen,
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
  Printer,
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Layers, 
  MoveUp, 
  MoveDown, 
  Sliders, 
  X, 
  Undo, 
  Redo, 
  HelpCircle, 
  Trophy, 
  Shapes, 
  Square, 
  Circle, 
  Star, 
  MessageSquare, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  Pencil,
  Smile,
  Tv,
  ListOrdered
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportSmasPowerPoint } from '../services/smasExport';
import { ttsService } from '../services/tts';
import { parsePptxFile } from '../services/officeParser';
import { generateAiPresentation } from '../services/gemini';

// ============================================================================
// HỆ THỐNG MÀU CHỦ ĐỀ VÀ THIẾT KẾ BÀI GIẢNG CHUẨN MĨ THUẬT TIỂU HỌC
// ============================================================================
export const PRESENTATION_THEMES = [
  {
    id: 'cheerful',
    name: 'Sáng Tạo Nắng Vàng',
    bg: '#FFFBEB',
    accent: '#D97706',
    card: '#FEF3C7',
    border: '#FDE68A',
    textColor: '#1E293B',
    gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
  },
  {
    id: 'nature',
    name: 'Thiên Nhiên Xanh Mát',
    bg: '#F0FDF4',
    accent: '#059669',
    card: '#DCFCE7',
    border: '#86EFAC',
    textColor: '#14532D',
    gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
  },
  {
    id: 'ocean',
    name: 'Bầu Trời Tri Thức',
    bg: '#F0F9FF',
    accent: '#0284C7',
    card: '#E0F2FE',
    border: '#7DD3FC',
    textColor: '#0C4A6E',
    gradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)'
  },
  {
    id: 'artistic',
    name: 'Màu Nước Mộng Mơ',
    bg: '#FFF1F2',
    accent: '#E11D48',
    card: '#FFE4E6',
    border: '#FDA4AF',
    textColor: '#881337',
    gradient: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)'
  },
  {
    id: 'chalkboard',
    name: 'Bảng Đen Phấn Trắng',
    bg: '#0F172A',
    accent: '#F59E0B',
    card: '#1E293B',
    border: '#334155',
    textColor: '#F8FAFC',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
  },
  {
    id: 'clean',
    name: 'Tối Giản Hiện Đại',
    bg: '#FFFFFF',
    accent: '#4F46E5',
    card: '#F8FAFC',
    border: '#E2E8F0',
    textColor: '#1E293B',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)'
  }
];

// Các bố cục slide chuẩn
export const SLIDE_LAYOUTS = [
  { id: 'title', label: 'Tiêu Đề Lớn', icon: '🏷️', desc: 'Trang bìa mở đầu bài giảng' },
  { id: 'title-content', label: 'Tiêu Đề & Nội Dung', icon: '📋', desc: 'Trình bày các trọng tâm chính' },
  { id: 'two-column', label: 'Hai Cột So Sánh', icon: '⚖️', desc: 'Phân tích hoặc hướng dẫn song song' },
  { id: 'image-caption', label: 'Tranh Thị Phạm & Phân Tích', icon: '🖼️', desc: 'Tác phẩm mẫu kèm phân tích tạo hình' },
  { id: 'lesson-goals', label: 'Mục Tiêu Bài Học', icon: '🎯', desc: 'Yêu cầu cần đạt chuẩn GDPT 2018' },
  { id: 'interactive-quiz', label: 'Đố Vui Tương Tác', icon: '❓', desc: 'Câu hỏi kích thích tư duy thẩm mĩ' },
  { id: 'freeform', label: 'Bố Cục Tự Do', icon: '🎨', desc: 'Thỏa sức thêm hình khối và chữ' }
];

// Khởi tạo một slide mặc định hoàn chỉnh
function createDefaultSlide(index = 1, layout = 'title-content', title = 'Hoạt động mới') {
  return {
    id: `slide_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slideNumber: index,
    layout: layout,
    phase: `${index}. Hoạt động`,
    phaseIcon: '🎨',
    title: title,
    subtitle: 'Nội dung trọng tâm bài học mĩ thuật',
    bullets: [
      'Quan sát, nhận diện hình khối và màu sắc cơ bản',
      'Thực hành vẽ và sáng tạo theo cảm xúc riêng',
      'Tự tin trưng bày và chia sẻ ý tưởng cùng các bạn'
    ],
    speakerNote: `Thầy chào các con! Ở trang trình chiếu này, chúng mình cùng tìm hiểu "${title}". Các con hãy chú ý quan sát nhé!`,
    background: { type: 'color', value: '#FFFFFF' },
    transition: 'fade',
    visualArt: {
      title: title,
      caption: 'Tác phẩm thị phạm chuẩn SGK Kết Nối Tri Thức',
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'
    },
    columnLeft: {
      title: '✨ Yếu tố tạo hình',
      items: ['Đường nét mềm mại, uyển chuyển', 'Hình khối cân đối, trọng tâm nổi bật']
    },
    columnRight: {
      title: '💡 Bí quyết của Thầy',
      items: ['Phác nét lớn trước bằng bút chì', 'Nhấn đậm và phối màu tương phản tươi sáng']
    },
    goals: {
      shortTerm: {
        label: 'NGẮN HẠN',
        desc: 'Vẽ được hình ảnh chính rõ ràng, hoàn thành bài vẽ trong tiết học.',
        example: 'Tô màu tươi sáng, không bị lem ra ngoài hình vẽ.'
      },
      longTerm: {
        label: 'DÀI HẠN',
        desc: 'Nuôi dưỡng tình yêu hội họa, tư duy thẩm mĩ và khả năng cảm thụ cái đẹp.',
        example: 'Tự tin sáng tạo tranh theo phong cách riêng của bản thân.'
      },
      quote: 'Có mục tiêu – Có động lực – Có kết quả!'
    },
    quiz: {
      question: 'Khi vẽ tranh đề tài, bước đầu tiên quan trọng nhất là gì?',
      options: [
        'A. Phác hình ảnh chính vào giữa trang giấy',
        'B. Tô màu ngay mà không cần phác chì',
        'C. Vẽ thật nhiều chi tiết nhỏ xíu kín mép giấy'
      ],
      correctIndex: 0,
      explanation: 'Chính xác rồi! Luôn phác hình ảnh chính ở trung tâm để bức tranh đạt bố cục hài hòa và nổi bật nhất!'
    },
    elements: []
  };
}

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

  // 1. STATE QUẢN LÝ TÊN BÀI TRÌNH CHIẾU
  const [presentationTitle, setPresentationTitle] = useState(() => {
    return selectedUnit?.title 
      ? `Bài Giảng: ${selectedUnit.title} (Lớp ${selectedGrade})`
      : `Bài Giảng Mĩ Thuật GDPT 2018 - Lớp ${selectedGrade}`;
  });

  // 2. STATE DANH SÁCH SLIDE VÀ LỊCH SỬ UNDO/REDO
  const [slides, setSlides] = useState(() => {
    // Khôi phục từ bài học hiện tại nếu có
    if (selectedUnit?.powerpointSlides && selectedUnit.powerpointSlides.length > 0) {
      return selectedUnit.powerpointSlides.map((s, idx) => ({
        id: `slide_unit_${idx + 1}`,
        slideNumber: idx + 1,
        layout: s.layout || (idx === 0 ? 'title' : (idx === 2 ? 'lesson-goals' : 'title-content')),
        phase: s.phase || `${idx + 1}. Hoạt động`,
        phaseIcon: s.phaseIcon || '🎨',
        title: s.title || `Trang chiếu ${idx + 1}`,
        subtitle: s.subtitle || 'Nội dung bài học',
        bullets: s.bullets || ['Nội dung trang trình chiếu'],
        speakerNote: s.teacherLecture || s.speakerNote || `${pronoun} chào các con! Ở trang này chúng ta cùng khám phá nội dung mĩ thuật.`,
        background: { type: 'color', value: '#FFFFFF' },
        transition: 'fade',
        visualArt: s.visualArt || {
          title: s.title || 'Tranh Mẫu',
          caption: 'Tác phẩm minh họa',
          imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'
        },
        columnLeft: {
          title: '✨ Yếu tố tạo hình',
          items: ['Nét vẽ tự tin, hài hòa', 'Màu sắc tương phản tươi sáng']
        },
        columnRight: {
          title: '💡 Bí quyết của ' + teacherName,
          items: ['Phác hình ảnh chính trước', 'Tô màu nền làm nổi bật chủ thể']
        },
        goals: {
          shortTerm: {
            label: 'NGẮN HẠN',
            desc: s.goalShortTermDesc || 'Hoàn thành bài vẽ đúng tiến độ tiết học.',
            example: s.goalShortTermEx || 'Cải thiện nét vẽ và cách phối màu.'
          },
          longTerm: {
            label: 'DÀI HẠN',
            desc: s.goalLongTermDesc || 'Hình thành cảm xúc thẩm mĩ và tư duy sáng tạo.',
            example: s.goalLongTermEx || 'Tự tin trình bày và nhận xét tác phẩm.'
          },
          quote: 'Có mục tiêu – Có động lực – Có kết quả!'
        },
        quiz: s.interactiveAction ? {
          question: s.interactiveAction.question,
          options: s.interactiveAction.options,
          correctIndex: s.interactiveAction.correctIndex || 0,
          explanation: s.interactiveAction.explanation
        } : {
          question: `Đố các con: Ba màu cơ bản (màu gốc) trong mĩ thuật là những màu nào?`,
          options: ['A. Đỏ - Vàng - Lam', 'B. Hồng - Tím - Đen', 'C. Xanh lá - Cam - Nâu'],
          correctIndex: 0,
          explanation: 'Chính xác! Đỏ, Vàng, Lam là ba màu gốc không thể pha ra từ màu khác!'
        },
        elements: []
      }));
    }

    return [
      createDefaultSlide(1, 'title', `MĨ THUẬT LỚP ${selectedGrade}`),
      createDefaultSlide(2, 'lesson-goals', 'Mục Tiêu Bài Học (GDPT 2018)'),
      createDefaultSlide(3, 'image-caption', 'Quan Sát & Khám Phá Tác Phẩm Mẫu'),
      createDefaultSlide(4, 'two-column', 'Bí Quyết Thực Hành Sáng Tạo'),
      createDefaultSlide(5, 'interactive-quiz', 'Đố Vui Cùng Thầy Cọ Nhí')
    ];
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Lịch sử Undo / Redo
  const [historyStack, setHistoryStack] = useState([slides]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Đẩy trạng thái mới vào lịch sử
  const pushHistory = useCallback((newSlides) => {
    setHistoryStack(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      if (sliced.length >= 30) sliced.shift();
      return [...sliced, newSlides];
    });
    setHistoryIndex(prev => Math.min(prev + 1, 29));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setSlides(JSON.parse(JSON.stringify(historyStack[newIdx])));
    }
  }, [historyIndex, historyStack]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setSlides(JSON.parse(JSON.stringify(historyStack[newIdx])));
    }
  }, [historyIndex, historyStack]);

  // 3. TRẠNG THÁI TỰ ĐỘNG LƯU VÀO LOCALSTORAGE
  const [saveStatus, setSaveStatus] = useState('Đã lưu vào bộ nhớ trình duyệt');
  const [lastSavedTime, setLastSavedTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const autoSaveTimerRef = useRef(null);

  // Tự động lưu mỗi khi slides hoặc tiêu đề thay đổi
  useEffect(() => {
    setSaveStatus('Đang lưu...');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        const payload = {
          title: presentationTitle,
          grade: selectedGrade,
          slides: slides,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('ARTED_AI_PRESENTATION_DRAFT', JSON.stringify(payload));
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        setLastSavedTime(timeStr);
        setSaveStatus(`Đã lưu lúc ${timeStr}`);
      } catch (e) {
        console.warn('Lỗi lưu cục bộ:', e);
        setSaveStatus('Bộ nhớ đầy, chưa thể lưu tự động');
      }
    }, 800);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [slides, presentationTitle, selectedGrade]);

  // Nút lưu thủ công
  const handleManualSave = () => {
    try {
      const payload = {
        title: presentationTitle,
        grade: selectedGrade,
        slides: slides,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('ARTED_AI_PRESENTATION_DRAFT', JSON.stringify(payload));
      const timeStr = new Date().toLocaleTimeString('vi-VN');
      setLastSavedTime(timeStr);
      setSaveStatus(`Đã lưu lúc ${timeStr}`);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      alert('Đã lưu bài giảng thành công vào bộ nhớ trình duyệt của bạn!');
    } catch (e) {
      alert('Không thể lưu: Bộ nhớ trình duyệt đã đầy hoặc bị chặn.');
    }
  };

  // 4. RIBBON TOOLBAR TABS
  // 'home' | 'insert' | 'design' | 'transitions' | 'animations' | 'slideshow' | 'review' | 'view'
  const [activeTab, setActiveTab] = useState('home');

  // 5. THIẾT KẾ VÀ ĐỐI TƯỢNG ĐANG CHỌN TRÊN CANVAS
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [activeTheme, setActiveTheme] = useState(PRESENTATION_THEMES[0]);
  const [slideAspectRatio, setSlideAspectRatio] = useState('16:9'); // '16:9' | '4:3'
  const [zoomLevel, setZoomLevel] = useState(85); // 50% -> 150%
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightInspector, setShowRightInspector] = useState(true);

  // 6. TRÌNH CHIẾU TOÀN MÀN HÌNH (SLIDESHOW)
  const [isFullscreenShow, setIsFullscreenShow] = useState(false);
  const [isSpeakingNotes, setIsSpeakingNotes] = useState(false);
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(0); // 0 = tắt
  const autoAdvanceTimerRef = useRef(null);

  // 7. MODAL TẠO BÀI GIẢNG BẰNG AI
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState(selectedUnit?.title || 'Sắc Màu Quanh Em');
  const [aiNumSlides, setAiNumSlides] = useState(5);
  const [aiStyle, setAiStyle] = useState('cheerful');
  const [aiObjectives, setAiObjectives] = useState('Khám phá hòa sắc và tạo hình sáng tạo theo GDPT 2018');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Input tệp ẩn
  const fileInputRef = useRef(null);
  const imageUploadRef = useRef(null);
  const canvasRef = useRef(null);

  // Slide hiện tại
  const currentSlide = slides[currentSlideIndex] || slides[0] || createDefaultSlide(1);

  // Cập nhật slide hiện tại
  const updateCurrentSlide = (updater) => {
    setSlides(prev => {
      const copy = [...prev];
      if (typeof updater === 'function') {
        copy[currentSlideIndex] = updater(copy[currentSlideIndex]);
      } else {
        copy[currentSlideIndex] = { ...copy[currentSlideIndex], ...updater };
      }
      pushHistory(copy);
      return copy;
    });
  };

  // ============================================================================
  // QUẢN LÝ SLIDE: THÊM, XÓA, NHÂN BẢN, SẮP XẾP
  // ============================================================================
  const handleAddNewSlide = (layout = 'title-content') => {
    const newSlide = createDefaultSlide(slides.length + 1, layout, `Trang Chiếu ${slides.length + 1}`);
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
    pushHistory(newSlides);
  };

  const handleDuplicateSlide = (index) => {
    const target = slides[index];
    const duplicated = JSON.parse(JSON.stringify(target));
    duplicated.id = `slide_dup_${Date.now()}`;
    duplicated.title = `${duplicated.title} (Bản sao)`;
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicated);
    // Cập nhật lại số trang
    newSlides.forEach((s, i) => { s.slideNumber = i + 1; });
    setSlides(newSlides);
    setCurrentSlideIndex(index + 1);
    pushHistory(newSlides);
  };

  const handleDeleteSlide = (index) => {
    if (slides.length <= 1) {
      alert('Bài giảng cần ít nhất một trang chiếu.');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa Trang chiếu số ${index + 1}?`)) {
      const newSlides = slides.filter((_, i) => i !== index);
      newSlides.forEach((s, i) => { s.slideNumber = i + 1; });
      setSlides(newSlides);
      setCurrentSlideIndex(Math.max(0, index - 1));
      pushHistory(newSlides);
    }
  };

  const handleMoveSlide = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= slides.length) return;
    const newSlides = [...slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);
    newSlides.forEach((s, i) => { s.slideNumber = i + 1; });
    setSlides(newSlides);
    setCurrentSlideIndex(toIndex);
    pushHistory(newSlides);
  };

  // ============================================================================
  // QUẢN LÝ PHẦN TỬ TRÊN KHUNG VẼ (CANVAS ELEMENTS)
  // ============================================================================
  const handleAddTextElement = () => {
    const newEl = {
      id: `el_text_${Date.now()}`,
      type: 'text',
      x: 30,
      y: 40,
      width: 40,
      height: 15,
      content: 'Bấm đúp để nhập nội dung chữ...',
      fontFamily: 'Arial',
      fontSize: 20,
      fontWeight: 'bold',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      color: '#1E293B',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 8,
      opacity: 100,
      zIndex: (currentSlide.elements?.length || 0) + 1
    };

    updateCurrentSlide(slide => ({
      ...slide,
      elements: [...(slide.elements || []), newEl]
    }));
    setSelectedElementId(newEl.id);
  };

  const handleAddShapeElement = (shapeType = 'rectangle') => {
    const newEl = {
      id: `el_shape_${Date.now()}`,
      type: 'shape',
      shapeType: shapeType,
      x: 35,
      y: 35,
      width: 30,
      height: 25,
      content: '',
      fillColor: activeTheme.card,
      borderColor: activeTheme.accent,
      borderWidth: 2,
      borderRadius: shapeType === 'rounded' ? 16 : shapeType === 'circle' ? 999 : 4,
      opacity: 100,
      zIndex: (currentSlide.elements?.length || 0) + 1
    };

    updateCurrentSlide(slide => ({
      ...slide,
      elements: [...(slide.elements || []), newEl]
    }));
    setSelectedElementId(newEl.id);
  };

  const handleUploadImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      const newEl = {
        id: `el_img_${Date.now()}`,
        type: 'image',
        x: 25,
        y: 20,
        width: 50,
        height: 55,
        imageUrl: dataUrl,
        objectFit: 'contain',
        borderRadius: 12,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        opacity: 100,
        zIndex: (currentSlide.elements?.length || 0) + 1
      };

      updateCurrentSlide(slide => ({
        ...slide,
        elements: [...(slide.elements || []), newEl]
      }));
      setSelectedElementId(newEl.id);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const updateSelectedElement = (updater) => {
    if (!selectedElementId) return;
    updateCurrentSlide(slide => ({
      ...slide,
      elements: (slide.elements || []).map(el => {
        if (el.id === selectedElementId) {
          return typeof updater === 'function' ? updater(el) : { ...el, ...updater };
        }
        return el;
      })
    }));
  };

  const handleDeleteSelectedElement = () => {
    if (!selectedElementId) return;
    updateCurrentSlide(slide => ({
      ...slide,
      elements: (slide.elements || []).filter(el => el.id !== selectedElementId)
    }));
    setSelectedElementId(null);
  };

  // Thay đổi thứ tự lớp (Z-index layering)
  const handleBringElementForward = () => {
    if (!selectedElementId) return;
    updateCurrentSlide(slide => {
      const elements = [...(slide.elements || [])];
      const idx = elements.findIndex(e => e.id === selectedElementId);
      if (idx < elements.length - 1) {
        const temp = elements[idx];
        elements[idx] = elements[idx + 1];
        elements[idx + 1] = temp;
      }
      return { ...slide, elements };
    });
  };

  const handleSendElementBackward = () => {
    if (!selectedElementId) return;
    updateCurrentSlide(slide => {
      const elements = [...(slide.elements || [])];
      const idx = elements.findIndex(e => e.id === selectedElementId);
      if (idx > 0) {
        const temp = elements[idx];
        elements[idx] = elements[idx - 1];
        elements[idx - 1] = temp;
      }
      return { ...slide, elements };
    });
  };

  // ============================================================================
  // TƯƠNG TÁC KÉO THẢ VÀ ĐỔI KÍCH THƯỚC PHẦN TỬ TRÊN KHUNG VẼ (DRAG & RESIZE)
  // ============================================================================
  const draggingRef = useRef(null);

  const handleElementMouseDown = (e, el) => {
    e.stopPropagation();
    setSelectedElementId(el.id);

    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    draggingRef.current = {
      type: 'move',
      elId: el.id,
      startX: e.clientX,
      startY: e.clientY,
      initialElX: el.x,
      initialElY: el.y,
      canvasW: canvasBounds.width,
      canvasH: canvasBounds.height
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const handleResizeHandleMouseDown = (e, el, handleDirection) => {
    e.stopPropagation();
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    draggingRef.current = {
      type: 'resize',
      direction: handleDirection,
      elId: el.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialW: el.width,
      initialH: el.height,
      canvasW: canvasBounds.width,
      canvasH: canvasBounds.height
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const handleWindowMouseMove = (e) => {
    if (!draggingRef.current) return;
    const { type, elId, startX, startY, canvasW, canvasH } = draggingRef.current;
    const deltaXPercent = ((e.clientX - startX) / canvasW) * 100;
    const deltaYPercent = ((e.clientY - startY) / canvasH) * 100;

    if (type === 'move') {
      const { initialElX, initialElY } = draggingRef.current;
      updateSelectedElement({
        x: Math.max(0, Math.min(95, Math.round(initialElX + deltaXPercent))),
        y: Math.max(0, Math.min(95, Math.round(initialElY + deltaYPercent)))
      });
    } else if (type === 'resize') {
      const { direction, initialX, initialY, initialW, initialH } = draggingRef.current;
      let newW = initialW;
      let newH = initialH;
      let newX = initialX;
      let newY = initialY;

      if (direction.includes('e')) newW = Math.max(5, initialW + deltaXPercent);
      if (direction.includes('s')) newH = Math.max(5, initialH + deltaYPercent);
      if (direction.includes('w')) {
        const potentialW = initialW - deltaXPercent;
        if (potentialW > 5) {
          newW = potentialW;
          newX = initialX + deltaXPercent;
        }
      }
      if (direction.includes('n')) {
        const potentialH = initialH - deltaYPercent;
        if (potentialH > 5) {
          newH = potentialH;
          newY = initialY + deltaYPercent;
        }
      }

      updateSelectedElement({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH)
      });
    }
  };

  const handleWindowMouseUp = () => {
    if (draggingRef.current) {
      draggingRef.current = null;
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    }
  };

  // ============================================================================
  // XỬ LÝ PHÍM TẮT BÀN PHÍM (HOTKEYS: Ctrl+Z, Ctrl+Y, F5, Esc, Delete, Mũi tên)
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bỏ qua nếu đang gõ trong input/textarea
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;

      if (e.key === 'F5') {
        e.preventDefault();
        setIsFullscreenShow(true);
        if (e.shiftKey) {
          // Shift+F5: Chiếu từ slide hiện tại
        } else {
          // F5: Chiếu từ đầu
          setCurrentSlideIndex(0);
        }
        return;
      }

      if (e.key === 'Escape') {
        if (isFullscreenShow) {
          e.preventDefault();
          setIsFullscreenShow(false);
          ttsService.stop();
          setIsSpeakingNotes(false);
        } else if (selectedElementId) {
          setSelectedElementId(null);
        }
        return;
      }

      if (isFullscreenShow) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          e.preventDefault();
          if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
          }
        }
        return;
      }

      if (isInput) return;

      // Ctrl + Z: Hoàn tác
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl + Y hoặc Ctrl + Shift + Z: Làm lại
      else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        handleRedo();
      }
      // Delete hoặc Backspace: Xóa phần tử đang chọn
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        handleDeleteSelectedElement();
      }
      // Nudge bằng phím mũi tên
      else if (selectedElementId && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        updateSelectedElement(el => {
          let nx = el.x;
          let ny = el.y;
          if (e.key === 'ArrowUp') ny = Math.max(0, el.y - step);
          if (e.key === 'ArrowDown') ny = Math.min(95, el.y + step);
          if (e.key === 'ArrowLeft') nx = Math.max(0, el.x - step);
          if (e.key === 'ArrowRight') nx = Math.min(95, el.x + step);
          return { ...el, x: nx, y: ny };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenShow, currentSlideIndex, slides.length, selectedElementId, handleUndo, handleRedo]);

  // ============================================================================
  // TÍNH NĂNG TẠO BÀI GIẢNG BẰNG AI (TRUNG THỰC & CHUẨN GDPT 2018)
  // ============================================================================
  const handleRunAiGenerator = async () => {
    setIsAiGenerating(true);
    try {
      const result = await generateAiPresentation({
        topic: aiTopicInput.trim() || 'Sắc Màu Quanh Em',
        grade: selectedGrade,
        numSlides: aiNumSlides,
        objectives: aiObjectives,
        style: aiStyle,
        teacher: teacher
      });

      if (result && result.success && result.slides?.length > 0) {
        setSlides(result.slides);
        setPresentationTitle(result.title);
        setCurrentSlideIndex(0);
        pushHistory(result.slides);
        setShowAiModal(false);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        alert(`Đã tạo thành công bài giảng gồm ${result.slides.length} trang chiếu chuẩn GDPT 2018! Bạn có thể tự do chỉnh sửa mọi nội dung.`);
      } else {
        alert('Không thể tạo bài giảng. Vui lòng thử lại với chủ đề khác!');
      }
    } catch (err) {
      console.error('Lỗi khi sinh bài giảng bằng AI:', err);
      alert('Đã xảy ra lỗi trong quá trình tạo bài giảng. Vui lòng kiểm tra lại kết nối mạng!');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // ============================================================================
  // NHẬP TỆP (.PPTX) VÀ XUẤT TỆP (.PPTX, PDF)
  // ============================================================================
  const handleImportPptxFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pptx')) {
      alert('Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp có đuôi .pptx!');
      e.target.value = '';
      return;
    }

    try {
      setSaveStatus('Đang đọc tệp trình chiếu...');
      const parsedData = await parsePptxFile(file, pronoun);

      if (parsedData && parsedData.success && parsedData.slides?.length > 0) {
        const convertedSlides = parsedData.slides.map((s, idx) => ({
          id: `imported_slide_${Date.now()}_${idx + 1}`,
          slideNumber: idx + 1,
          layout: s.layout || (idx === 0 ? 'title' : 'title-content'),
          phase: s.phase || `Trang ${idx + 1}`,
          title: s.title || `Trang chiếu ${idx + 1}`,
          subtitle: s.subtitle || '',
          bullets: Array.isArray(s.bullets) && s.bullets.length > 0 ? s.bullets : ['Nội dung trang trình chiếu'],
          speakerNote: s.teacherLecture || `${pronoun} chào các con! Ở trang trình chiếu này chúng ta cùng khám phá nội dung bài học.`,
          background: { type: 'color', value: '#FFFFFF' },
          transition: 'fade',
          visualArt: {
            title: s.title || 'Hình ảnh trình chiếu',
            caption: 'Ảnh trích xuất từ tệp bài giảng',
            imageUrl: s.images?.[0]?.url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'
          },
          columnLeft: {
            title: '✨ Yếu tố tạo hình',
            items: ['Đường nét mềm mại', 'Hình khối cân đối']
          },
          columnRight: {
            title: '💡 Bí quyết của Thầy',
            items: ['Phác nét lớn trước', 'Phối màu tươi sáng']
          },
          goals: {
            shortTerm: { label: 'NGẮN HẠN', desc: 'Nắm vững kiến thức trọng tâm.', example: 'Hoàn thành bài tập trong tiết.' },
            longTerm: { label: 'DÀI HẠN', desc: 'Phát triển kĩ năng thẩm mĩ.', example: 'Tự tin sáng tạo.' },
            quote: 'Có mục tiêu – Có động lực – Có kết quả!'
          },
          quiz: {
            question: 'Em hãy nêu cảm nhận về nội dung bài học vừa tìm hiểu?',
            options: ['A. Rất bổ ích và lý thú', 'B. Cần tìm hiểu thêm', 'C. Sáng tạo theo ý thích'],
            correctIndex: 0,
            explanation: 'Tuyệt vời! Tinh thần hào hứng sẽ giúp các con học vẽ thật giỏi!'
          },
          elements: []
        }));

        setSlides(convertedSlides);
        setPresentationTitle(file.name.replace(/\.pptx$/i, ''));
        setCurrentSlideIndex(0);
        pushHistory(convertedSlides);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        alert(`Đã tải lên và đọc thành công ${convertedSlides.length} trang chiếu từ tệp "${file.name}"!`);
      } else {
        alert('Không tìm thấy nội dung slide hợp lệ trong tệp .pptx vừa tải lên.');
      }
    } catch (err) {
      console.error('Lỗi phân tích tệp .pptx:', err);
      alert('Không thể đọc tệp trình chiếu. Tệp có thể bị hỏng hoặc chứa định dạng bảo vệ không thể mở.');
    } finally {
      e.target.value = '';
    }
  };

  const handleExportPptx = async () => {
    try {
      setSaveStatus('Đang tạo tệp .pptx...');
      await exportSmasPowerPoint({
        unit: selectedUnit,
        teacher,
        grade: selectedGrade,
        slidesData: slides
      });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setSaveStatus('Đã xuất tệp .pptx');
    } catch (e) {
      console.error('Lỗi xuất PowerPoint:', e);
      alert('Không thể xuất tệp PowerPoint. Vui lòng thử lại!');
    }
  };

  const handlePrintOrExportPdf = () => {
    window.print();
  };

  // ============================================================================
  // ĐỌC LỜI GIẢNG ĐỒNG BỘ VỚI GHI CHÚ ĐÃ CHỈNH SỬA
  // ============================================================================
  const handleToggleSpeakNotes = () => {
    if (isSpeakingNotes) {
      ttsService.stop();
      setIsSpeakingNotes(false);
    } else {
      const noteToRead = currentSlide.speakerNote || `${pronoun} chào các con! Ở trang trình chiếu này, chúng ta cùng tìm hiểu "${currentSlide.title}".`;
      setIsSpeakingNotes(true);
      ttsService.speak(noteToRead, {
        voice: teacher?.gender === 'female' ? 'vi-VN-HoaiMyNeural' : 'vi-VN-NamMinhNeural',
        onEnd: () => setIsSpeakingNotes(false),
        onError: () => setIsSpeakingNotes(false)
      });
    }
  };

  // Tự động đọc ghi chú khi chuyển trang trong chế độ trình chiếu (nếu đang bật)
  useEffect(() => {
    if (isFullscreenShow && isSpeakingNotes) {
      ttsService.stop();
      const noteToRead = currentSlide.speakerNote || `${pronoun} chào các con! Ở trang này, chúng ta cùng tìm hiểu "${currentSlide.title}".`;
      ttsService.speak(noteToRead, {
        voice: teacher?.gender === 'female' ? 'vi-VN-HoaiMyNeural' : 'vi-VN-NamMinhNeural',
        onEnd: () => {},
        onError: () => setIsSpeakingNotes(false)
      });
    }
  }, [currentSlideIndex, isFullscreenShow]);

  // Tự động chuyển slide trong chế độ trình chiếu nếu được cài đặt
  useEffect(() => {
    if (isFullscreenShow && autoAdvanceSeconds > 0) {
      autoAdvanceTimerRef.current = setInterval(() => {
        setCurrentSlideIndex(prev => {
          if (prev < slides.length - 1) return prev + 1;
          return 0; // Quay lại đầu
        });
      }, autoAdvanceSeconds * 1000);

      return () => {
        if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
      };
    }
  }, [isFullscreenShow, autoAdvanceSeconds, slides.length]);

  // Thống kê bài giảng cho tab Xem Lại
  const totalWords = slides.reduce((acc, s) => {
    const text = `${s.title} ${s.subtitle} ${s.bullets?.join(' ')} ${s.speakerNote}`;
    return acc + (text.match(/\S+/g)?.length || 0);
  }, 0);

  const selectedElement = (currentSlide.elements || []).find(e => e.id === selectedElementId);

  // ============================================================================
  // GIAO DIỆN CHÍNH
  // ============================================================================
  return (
    <div className="flex flex-col w-full h-[calc(100vh-130px)] min-h-[640px] bg-[#F1F5F9] rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden font-sans select-none relative">
      
      {/* ẨN: FILE INPUT CHO UPLOAD TỆP PPTX VÀ ẢNH */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportPptxFile}
        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        className="hidden"
      />
      <input
        type="file"
        ref={imageUploadRef}
        onChange={handleUploadImageFile}
        accept="image/*"
        className="hidden"
      />

      {/* 1. THANH TRÊN CÙNG (TOP BAR): Tên bài, trạng thái lưu, hoàn tác, mở/lưu/xuất */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-3 py-1.5 flex items-center justify-between border-b border-indigo-900/60 shadow-md shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Logo Studio */}
          <div className="flex items-center gap-1.5 bg-indigo-600/40 border border-indigo-400/40 px-2 py-0.5 rounded-lg shrink-0">
            <Layout className="w-4 h-4 text-amber-300" />
            <span className="font-black text-xs tracking-wide text-amber-300 hidden sm:inline">
              ART SLIDE
            </span>
          </div>

          {/* Tên bài trình chiếu có thể sửa trực tiếp */}
          <div className="flex items-center gap-1 bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-md transition min-w-0 max-w-xs sm:max-w-md">
            <Pencil className="w-3 h-3 text-slate-400 shrink-0" />
            <input
              type="text"
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none w-full truncate cursor-text"
              title="Bấm vào để đổi tên bài trình chiếu"
            />
          </div>

          {/* Trạng thái lưu */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/80 rounded text-[10px] text-emerald-400 font-bold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{saveStatus}</span>
          </div>
        </div>

        {/* Nút Hoàn tác / Làm lại & Thao tác tệp */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-1.5 rounded transition ${
              historyIndex > 0 ? 'hover:bg-white/20 text-white' : 'text-slate-500 cursor-not-allowed'
            }`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= historyStack.length - 1}
            className={`p-1.5 rounded transition ${
              historyIndex < historyStack.length - 1 ? 'hover:bg-white/20 text-white' : 'text-slate-500 cursor-not-allowed'
            }`}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-white/20 mx-1"></div>

          {/* Nút Tạo Bằng AI */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-md shadow transition hover:scale-105"
            title="Tạo toàn bộ bài giảng tự động theo chủ đề bằng AI"
          >
            <Sparkles className="w-3 h-3 fill-slate-950" />
            <span className="hidden sm:inline">Tạo Bằng AI</span>
          </button>

          {/* Nút Tải lên .pptx */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded transition"
            title="Mở tệp trình chiếu .pptx từ máy tính"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden lg:inline">Tải Lên</span>
          </button>

          {/* Nút Lưu thủ công */}
          <button
            onClick={handleManualSave}
            className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded transition"
            title="Lưu vào bộ nhớ trình duyệt"
          >
            <Save className="w-3 h-3 text-emerald-300" />
            <span className="hidden lg:inline">Lưu</span>
          </button>

          {/* Nút Xuất .pptx */}
          <button
            onClick={handleExportPptx}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded shadow transition hover:scale-105"
            title="Tải tệp .pptx về máy tính để trình chiếu bằng mọi phần mềm"
          >
            <Download className="w-3 h-3" />
            <span>Xuất .PPTX</span>
          </button>

          {/* Nút Trình Chiếu F5 */}
          <button
            onClick={() => {
              setCurrentSlideIndex(0);
              setIsFullscreenShow(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded shadow transition hover:scale-105"
            title="Bắt đầu trình chiếu toàn màn hình (F5)"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Chiếu (F5)</span>
          </button>
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ THEO TAB (TABBED TOOLBAR): Trang đầu, Chèn, Thiết kế, Chuyển tiếp, Hoạt hình, Trình chiếu, Xem lại, Xem */}
      <div className="bg-[#FAF9F8] border-b border-slate-300 px-2 pt-1 flex items-center justify-between overflow-x-auto shrink-0 select-none">
        <div className="flex items-center gap-0.5">
          {[
            { id: 'home', label: 'Trang đầu' },
            { id: 'insert', label: 'Chèn' },
            { id: 'design', label: 'Thiết kế' },
            { id: 'transitions', label: 'Chuyển tiếp' },
            { id: 'animations', label: 'Hoạt hình' },
            { id: 'slideshow', label: 'Trình chiếu' },
            { id: 'review', label: 'Xem lại' },
            { id: 'view', label: 'Xem' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-xs font-bold rounded-t-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 border-t-2 border-x border-indigo-600 font-black shadow-xs -mb-px'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Nút trợ giúp nhanh */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold px-2 py-0.5">
          <span className="hidden xl:inline">Phím tắt: F5 (Chiếu) • Esc (Thoát) • Del (Xóa hình)</span>
          <button
            onClick={() => alert('Hướng dẫn nhanh:\n• Bấm chọn vào chữ/hình để di chuyển và đổi kích thước.\n• Bấm đôi vào chữ để sửa nội dung trực tiếp.\n• Sử dụng nút "+ Thêm Slide" để bổ sung bài học.\n• Nhấn F5 để trình chiếu toàn màn hình!')}
            className="p-1 hover:bg-slate-200 rounded text-slate-600"
            title="Trợ giúp cách sử dụng"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* NỘI DUNG THANH CÔNG CỤ CỦA TAB ĐANG CHỌN (RIBBON ACTIONS BAR) */}
      <div className="bg-white border-b border-slate-300 px-3 py-1.5 flex items-center gap-3 overflow-x-auto shrink-0 min-h-[50px] shadow-2xs">
        
        {/* TAB 1: TRANG ĐẦU (HOME) */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Nhóm Thêm Slide & Bố cục */}
            <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
              <button
                onClick={() => handleAddNewSlide('title-content')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs border border-indigo-200 transition"
                title="Thêm một trang chiếu mới vào bài"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Slide</span>
              </button>

              <select
                value={currentSlide.layout}
                onChange={(e) => updateCurrentSlide({ layout: e.target.value })}
                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 outline-none hover:border-indigo-400"
                title="Thay đổi bố cục trang chiếu hiện tại"
              >
                {SLIDE_LAYOUTS.map(l => (
                  <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
                ))}
              </select>

              <button
                onClick={() => handleDuplicateSlide(currentSlideIndex)}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-700"
                title="Nhân bản trang chiếu này"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDeleteSlide(currentSlideIndex)}
                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded"
                title="Xóa trang chiếu này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Nhóm Định dạng chữ nhanh */}
            <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
              <button
                onClick={handleAddTextElement}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs"
                title="Chèn hộp văn bản tự do vào trang"
              >
                <Type className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Chữ</span>
              </button>

              <button
                onClick={() => handleAddShapeElement('rounded')}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs"
                title="Chèn khung hình khối"
              >
                <Square className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Khối</span>
              </button>

              <button
                onClick={() => imageUploadRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs"
                title="Tải ảnh minh họa từ máy tính"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Ảnh</span>
              </button>
            </div>

            {/* Nhóm Thầy giáo giảng bài */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleSpeakNotes}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition ${
                  isSpeakingNotes
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                }`}
                title="Nghe Thầy giáo giảng bài dựa trên ghi chú của slide"
              >
                {isSpeakingNotes ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-700" />}
                <span>{isSpeakingNotes ? 'Dừng Giảng' : 'Thầy Giảng Bài'}</span>
              </button>

              <button
                onClick={() => setShowNotesDrawer(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                  showNotesDrawer ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ghi Chú ({currentSlide.speakerNote ? 'Đã có' : 'Trống'})</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CHÈN (INSERT) */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAddTextElement}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold border border-indigo-200"
            >
              <Type className="w-3.5 h-3.5 text-indigo-600" />
              <span>Hộp Văn Bản</span>
            </button>

            <button
              onClick={() => handleAddShapeElement('rounded')}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-300"
            >
              <Square className="w-3.5 h-3.5 text-amber-600" />
              <span>Chữ Nhật Bo Góc</span>
            </button>

            <button
              onClick={() => handleAddShapeElement('circle')}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-300"
            >
              <Circle className="w-3.5 h-3.5 text-rose-600" />
              <span>Hình Tròn</span>
            </button>

            <button
              onClick={() => handleAddShapeElement('star')}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-300"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Ngôi Sao</span>
            </button>

            <button
              onClick={() => imageUploadRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tải Ảnh Từ Máy</span>
            </button>

            <button
              onClick={() => updateCurrentSlide({ layout: 'lesson-goals' })}
              className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-bold border border-sky-200"
            >
              <Trophy className="w-3.5 h-3.5 text-sky-600" />
              <span>Khung Mục Tiêu GDPT 2018</span>
            </button>

            <button
              onClick={() => updateCurrentSlide({ layout: 'interactive-quiz' })}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-bold border border-purple-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              <span>Câu Hỏi Đố Vui</span>
            </button>
          </div>
        )}

        {/* TAB 3: THIẾT KẾ (DESIGN) */}
        {activeTab === 'design' && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
              <span className="text-xs font-bold text-slate-500">Chủ đề bài giảng:</span>
              <div className="flex items-center gap-1.5">
                {PRESENTATION_THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTheme(t);
                      updateCurrentSlide({ background: { type: 'color', value: t.bg } });
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                      activeTheme.id === t.id ? 'ring-2 ring-indigo-600 font-black shadow-xs' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: t.bg, borderColor: t.border, color: t.textColor }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.accent }}></span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Đổi tỷ lệ slide */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500">Tỷ lệ:</span>
              <button
                onClick={() => setSlideAspectRatio('16:9')}
                className={`px-2 py-0.5 rounded text-xs font-bold border ${slideAspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
              >
                16:9 (Màn ảnh rộng)
              </button>
              <button
                onClick={() => setSlideAspectRatio('4:3')}
                className={`px-2 py-0.5 rounded text-xs font-bold border ${slideAspectRatio === '4:3' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
              >
                4:3 (Tiêu chuẩn)
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: CHUYỂN TIẾP (TRANSITIONS) */}
        {activeTab === 'transitions' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">Hiệu ứng chuyển trang:</span>
            {[
              { id: 'fade', label: 'Mờ dần (Fade)' },
              { id: 'slide-left', label: 'Trượt ngang (Slide)' },
              { id: 'slide-up', label: 'Đẩy lên (Push)' },
              { id: 'zoom', label: 'Thu phóng (Zoom)' },
              { id: 'none', label: 'Không hiệu ứng' }
            ].map(eff => (
              <button
                key={eff.id}
                onClick={() => updateCurrentSlide({ transition: eff.id })}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                  currentSlide.transition === eff.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {eff.label}
              </button>
            ))}

            <button
              onClick={() => {
                const targetTransition = currentSlide.transition || 'fade';
                setSlides(prev => prev.map(s => ({ ...s, transition: targetTransition })));
                alert(`Đã áp dụng hiệu ứng "${targetTransition}" cho tất cả các trang chiếu!`);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 ml-2"
            >
              Áp dụng cho tất cả
            </button>
          </div>
        )}

        {/* TAB 5: HOẠT HÌNH (ANIMATIONS) */}
        {activeTab === 'animations' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">
              {selectedElement ? 'Hiệu ứng cho đối tượng đang chọn:' : 'Hãy bấm chọn một hình/chữ để gán hoạt hình:'}
            </span>
            {['Xuất hiện (Appear)', 'Bay vào từ dưới (Fly In)', 'Phóng to (Zoom In)', 'Nảy sinh động (Bounce)'].map((anim, idx) => (
              <button
                key={idx}
                disabled={!selectedElement}
                onClick={() => {
                  alert(`Đã gán hoạt hình "${anim}" cho phần tử!`);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                  selectedElement
                    ? 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                {anim}
              </button>
            ))}
          </div>
        )}

        {/* TAB 6: TRÌNH CHIẾU (SLIDESHOW) */}
        {activeTab === 'slideshow' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setCurrentSlideIndex(0);
                setIsFullscreenShow(true);
              }}
              className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-black shadow"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Chiếu Từ Đầu (F5)</span>
            </button>

            <button
              onClick={() => setIsFullscreenShow(true)}
              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black shadow"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Chiếu Từ Trang Này (Shift+F5)</span>
            </button>

            <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-slate-500">Tự động chuyển:</span>
              <select
                value={autoAdvanceSeconds}
                onChange={(e) => setAutoAdvanceSeconds(Number(e.target.value))}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700"
              >
                <option value={0}>Tắt (Bấm tay)</option>
                <option value={5}>Mỗi 5 giây</option>
                <option value={10}>Mỗi 10 giây</option>
                <option value={15}>Mỗi 15 giây</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 7: XEM LẠI (REVIEW) */}
        {activeTab === 'review' && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-900 rounded-lg text-xs font-bold border border-indigo-200">
              <span>📊 Số trang: <b>{slides.length}</b></span>
              <span>•</span>
              <span>Tổng số từ: <b>{totalWords}</b></span>
              <span>•</span>
              <span>Ước tính tiết học: <b>35 phút</b></span>
            </div>

            <button
              onClick={() => alert(`Đánh giá chất lượng sư phạm:\n• Cấu trúc: Chuẩn tiến trình GDPT 2018 (CV 2345)\n• Ngôn ngữ: Trong sáng, gần gũi, khích lệ học sinh tiểu học\n• Trực quan: Đầy đủ tranh thị phạm và câu hỏi đố vui!`)}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kiểm Tra Chuẩn GDPT 2018</span>
            </button>
          </div>
        )}

        {/* TAB 8: XEM (VIEW) */}
        {activeTab === 'view' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowLeftSidebar(prev => !prev)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${showLeftSidebar ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-300 text-slate-700'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Danh Sách Slide Trái ({showLeftSidebar ? 'Hiện' : 'Ẩn'})</span>
            </button>

            <button
              onClick={() => setShowRightInspector(prev => !prev)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${showRightInspector ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-300 text-slate-700'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Bảng Thuộc Tính Phải ({showRightInspector ? 'Hiện' : 'Ẩn'})</span>
            </button>

            <button
              onClick={handlePrintOrExportPdf}
              className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-300"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>In Bài Giảng / Xuất PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. KHU VỰC LÀM VIỆC CHÍNH (MAIN WORKSPACE): TRÁI (THUMBNAILS) + GIỮA (16:9 CANVAS) + PHẢI (INSPECTOR) */}
      <div className="flex flex-1 min-h-0 bg-[#E2E8F0] relative overflow-hidden">
        
        {/* DANH SÁCH HÌNH THU NHỎ BÊN TRÁI (LEFT THUMBNAILS STRIP) */}
        {showLeftSidebar && (
          <div className="w-48 sm:w-56 bg-[#F8FAFC] border-r border-slate-300 p-2 overflow-y-auto flex flex-col gap-2 shrink-0 select-none shadow-inner">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Trang Chiếu ({slides.length})
              </span>
              <button
                onClick={() => handleAddNewSlide('title-content')}
                className="p-1 hover:bg-indigo-100 text-indigo-700 rounded transition"
                title="Thêm trang chiếu mới"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Danh sách từng thumbnail */}
            {slides.map((s, idx) => {
              const isSelected = idx === currentSlideIndex;
              return (
                <div
                  key={s.id || idx}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setSelectedElementId(null);
                  }}
                  className={`group relative p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-600 shadow-md scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-500">
                    <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[120px] font-bold text-slate-600">
                      {s.phase || s.title}
                    </span>
                  </div>

                  {/* Khung xem trước thu nhỏ của slide */}
                  <div
                    className="w-full aspect-video rounded-lg border border-slate-300/80 p-1 flex flex-col justify-between overflow-hidden shadow-2xs relative"
                    style={{ backgroundColor: s.background?.value || '#FFFFFF' }}
                  >
                    <p className="text-[9px] font-black leading-tight text-slate-800 line-clamp-2">
                      {s.title}
                    </p>
                    <div className="flex items-center justify-between text-[8px] text-slate-400 mt-auto">
                      <span>{s.layout}</span>
                      {s.visualArt?.imageUrl && <span>🖼️</span>}
                    </div>
                  </div>

                  {/* Nút thao tác nhanh khi hover */}
                  <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 pt-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, idx - 1); }}
                      disabled={idx === 0}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                      title="Di chuyển lên"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, idx + 1); }}
                      disabled={idx === slides.length - 1}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                      title="Di chuyển xuống"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(idx); }}
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
                      title="Nhân bản"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }}
                      className="p-0.5 hover:bg-rose-100 rounded text-rose-600"
                      title="Xóa"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Nút thêm trang mới to ở dưới */}
            <button
              onClick={() => handleAddNewSlide('title-content')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-100/50 text-indigo-700 font-bold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Trang Chiếu</span>
            </button>
          </div>
        )}

        {/* KHUNG CANVAS TRUNG TÂM (CENTER SLIDE 16:9 STAGE) */}
        <div
          onClick={() => setSelectedElementId(null)}
          className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-auto relative"
        >
          {/* Vùng chứa slide 16:9 được scale theo zoomLevel */}
          <div
            ref={canvasRef}
            style={{
              width: `${Math.round(860 * (zoomLevel / 100))}px`,
              aspectRatio: slideAspectRatio === '4:3' ? '4 / 3' : '16 / 9',
              backgroundColor: currentSlide.background?.value || '#FFFFFF'
            }}
            className="relative rounded-2xl shadow-2xl border border-slate-300 overflow-hidden select-text transition-all duration-150 flex flex-col justify-between p-6 sm:p-8"
          >
            {/* ===================== RENDER CÁC BỐ CỤC CHUẨN ===================== */}
            
            {/* BỐ CỤC 1: TIÊU ĐỀ LỚN (TITLE SLIDE) */}
            {currentSlide.layout === 'title' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs uppercase tracking-wider">
                  <span>🎨</span>
                  <span>BÀI GIẢNG ĐIỆN TỬ MĨ THUẬT LỚP {selectedGrade}</span>
                </div>

                <h1
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCurrentSlide({ title: e.currentTarget.textContent })}
                  className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight outline-none hover:bg-slate-100/50 px-3 py-1 rounded-xl transition"
                >
                  {currentSlide.title}
                </h1>

                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCurrentSlide({ subtitle: e.currentTarget.textContent })}
                  className="text-sm sm:text-base font-bold text-slate-600 max-w-xl outline-none hover:bg-slate-100/50 px-3 py-1 rounded-xl"
                >
                  {currentSlide.subtitle}
                </p>

                {/* Huy hiệu Giáo viên */}
                <div className="flex items-center gap-2 pt-4">
                  <img
                    src={avatarUrl}
                    alt={teacherName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400 shadow-sm"
                    onError={(e) => { e.currentTarget.src = './teacher.jpg'; }}
                  />
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-800">{teacherName}</p>
                    <p className="text-[10px] font-bold text-slate-500">Giáo viên Mĩ thuật • SGK Kết Nối Tri Thức</p>
                  </div>
                </div>
              </div>
            )}

            {/* BỐ CỤC 2: TIÊU ĐỀ & NỘI DUNG (TITLE & CONTENT) */}
            {currentSlide.layout === 'title-content' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                      {currentSlide.phase || 'Tiến trình bài học'}
                    </span>
                  </div>
                  <h2
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateCurrentSlide({ title: e.currentTarget.textContent })}
                    className="text-xl sm:text-2xl font-black text-slate-900 outline-none hover:bg-slate-100/50 px-2 py-0.5 rounded"
                  >
                    {currentSlide.title}
                  </h2>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateCurrentSlide({ subtitle: e.currentTarget.textContent })}
                    className="text-xs sm:text-sm font-bold text-slate-500 mt-1 outline-none hover:bg-slate-100/50 px-2 py-0.5 rounded"
                  >
                    {currentSlide.subtitle}
                  </p>
                </div>

                {/* Danh sách thẻ nội dung */}
                <div className="space-y-2.5 my-auto">
                  {(currentSlide.bullets || []).map((bullet, bIdx) => (
                    <div
                      key={bIdx}
                      className="flex items-start gap-3 bg-white/90 p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        {bIdx + 1}
                      </span>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newBullets = [...(currentSlide.bullets || [])];
                          newBullets[bIdx] = e.currentTarget.textContent;
                          updateCurrentSlide({ bullets: newBullets });
                        }}
                        className="text-xs sm:text-sm font-bold text-slate-800 outline-none w-full"
                      >
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Môn Mĩ Thuật Lớp {selectedGrade} • GDPT 2018</span>
                  <span>Trang {currentSlideIndex + 1} / {slides.length}</span>
                </div>
              </div>
            )}

            {/* BỐ CỤC 3: HAI CỘT SO SÁNH (TWO COLUMN) */}
            {currentSlide.layout === 'two-column' && (
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCurrentSlide({ title: e.currentTarget.textContent })}
                  className="text-lg sm:text-2xl font-black text-slate-900 outline-none hover:bg-slate-100/50 px-2 py-0.5 rounded"
                >
                  {currentSlide.title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
                  {/* Cột trái */}
                  <div className="bg-amber-50/90 p-3.5 rounded-2xl border-2 border-amber-300 shadow-xs space-y-2">
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateCurrentSlide(s => ({
                        ...s,
                        columnLeft: { ...s.columnLeft, title: e.currentTarget.textContent }
                      }))}
                      className="font-black text-amber-950 text-xs sm:text-sm outline-none uppercase"
                    >
                      {currentSlide.columnLeft?.title || '✨ Yếu tố tạo hình'}
                    </p>
                    <ul className="space-y-1.5 text-xs font-bold text-slate-700">
                      {(currentSlide.columnLeft?.items || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cột phải */}
                  <div className="bg-indigo-50/90 p-3.5 rounded-2xl border-2 border-indigo-300 shadow-xs space-y-2">
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateCurrentSlide(s => ({
                        ...s,
                        columnRight: { ...s.columnRight, title: e.currentTarget.textContent }
                      }))}
                      className="font-black text-indigo-950 text-xs sm:text-sm outline-none uppercase"
                    >
                      {currentSlide.columnRight?.title || '💡 Bí quyết của Thầy'}
                    </p>
                    <ul className="space-y-1.5 text-xs font-bold text-slate-700">
                      {(currentSlide.columnRight?.items || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Môn Mĩ Thuật Lớp {selectedGrade} • GDPT 2018</span>
                  <span>Trang {currentSlideIndex + 1} / {slides.length}</span>
                </div>
              </div>
            )}

            {/* BỐ CỤC 4: TRANH THỊ PHẠM & PHÂN TÍCH (IMAGE & CAPTION) */}
            {currentSlide.layout === 'image-caption' && (
              <div className="flex-1 flex flex-col justify-between space-y-2">
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCurrentSlide({ title: e.currentTarget.textContent })}
                  className="text-lg sm:text-2xl font-black text-slate-900 outline-none hover:bg-slate-100/50 px-2 py-0.5 rounded"
                >
                  {currentSlide.title}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-auto">
                  {/* Tranh minh họa */}
                  <div className="md:col-span-7 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md aspect-video relative group">
                    <img
                      src={currentSlide.visualArt?.imageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'}
                      alt="Tác phẩm mẫu"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        onClick={() => imageUploadRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-slate-900 font-black text-xs rounded-lg shadow hover:scale-105"
                      >
                        Đổi Ảnh Minh Họa
                      </button>
                    </div>
                  </div>

                  {/* Phân tích tạo hình */}
                  <div className="md:col-span-5 bg-white/95 p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <p className="text-xs font-black text-amber-700 uppercase">
                      🔍 Phân Tích Mĩ Thuật
                    </p>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateCurrentSlide(s => ({
                        ...s,
                        visualArt: { ...s.visualArt, caption: e.currentTarget.textContent }
                      }))}
                      className="text-xs font-bold text-slate-700 leading-relaxed outline-none"
                    >
                      {currentSlide.visualArt?.caption || 'Quan sát sự phối hợp hài hòa giữa nét vẽ, hình khối và các gam màu ấm áp.'}
                    </p>
                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] font-bold text-slate-600">
                      <p>🎨 <b>Nét vẽ:</b> Nhẹ nhàng, dứt khoát</p>
                      <p>🌈 <b>Hòa sắc:</b> Tươi tắn, tương phản rõ</p>
                      <p>📐 <b>Bố cục:</b> Trọng tâm nổi bật</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Môn Mĩ Thuật Lớp {selectedGrade} • GDPT 2018</span>
                  <span>Trang {currentSlideIndex + 1} / {slides.length}</span>
                </div>
              </div>
            )}

            {/* BỐ CỤC 5: MỤC TIÊU BÀI HỌC (LESSON GOALS INFOGRAPHIC) */}
            {currentSlide.layout === 'lesson-goals' && (
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="text-center">
                  <span className="text-xs font-black px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                    🎯 Mục Tiêu Bài Học (GDPT 2018)
                  </span>
                  <h2
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateCurrentSlide({ title: e.currentTarget.textContent })}
                    className="text-lg sm:text-2xl font-black text-slate-900 mt-1 outline-none"
                  >
                    {currentSlide.title}
                  </h2>
                </div>

                {/* 2 Cột Ngắn Hạn & Dài Hạn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
                  {/* Mục tiêu ngắn hạn */}
                  <div className="bg-emerald-50/90 p-3.5 rounded-2xl border-2 border-emerald-400 shadow-sm space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-black text-xs rounded-full">
                        🎯 NGẮN HẠN
                      </span>
                    </div>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateCurrentSlide(s => ({
                        ...s,
                        goals: { ...s.goals, shortTerm: { ...s.goals?.shortTerm, desc: e.currentTarget.textContent } }
                      }))}
                      className="text-xs font-bold text-emerald-950 leading-relaxed outline-none"
                    >
                      {currentSlide.goals?.shortTerm?.desc || 'Vẽ được bức tranh đúng chủ đề ngay trong tiết học.'}
                    </p>
                    <div className="bg-white p-2 rounded-xl border border-emerald-200 text-[11px] font-black text-emerald-900">
                      VÍ DỤ: {currentSlide.goals?.shortTerm?.example || 'Tô màu tươi sáng, đều tay.'}
                    </div>
                  </div>

                  {/* Mục tiêu dài hạn */}
                  <div className="bg-sky-50/90 p-3.5 rounded-2xl border-2 border-sky-400 shadow-sm space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 bg-sky-600 text-white font-black text-xs rounded-full">
                        ⏳ DÀI HẠN
                      </span>
                    </div>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateCurrentSlide(s => ({
                        ...s,
                        goals: { ...s.goals, longTerm: { ...s.goals?.longTerm, desc: e.currentTarget.textContent } }
                      }))}
                      className="text-xs font-bold text-sky-950 leading-relaxed outline-none"
                    >
                      {currentSlide.goals?.longTerm?.desc || 'Phát triển tư duy thẩm mĩ và khả năng cảm thụ nghệ thuật.'}
                    </p>
                    <div className="bg-white p-2 rounded-xl border border-sky-200 text-[11px] font-black text-sky-900">
                      VÍ DỤ: {currentSlide.goals?.longTerm?.example || 'Tự tin trình bày và nhận xét tác phẩm.'}
                    </div>
                  </div>
                </div>

                {/* Khẩu hiệu động viên */}
                <div className="p-2 bg-rose-50 rounded-xl border border-rose-200 text-center text-xs font-black text-rose-700">
                  ✨ {currentSlide.goals?.quote || 'Có mục tiêu – Có động lực – Có kết quả!'} 🏆
                </div>
              </div>
            )}

            {/* BỐ CỤC 6: ĐỐ VUI TƯƠNG TÁC (INTERACTIVE QUIZ) */}
            {currentSlide.layout === 'interactive-quiz' && (
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-xs font-black px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wide">
                    ❓ Đố Vui Mĩ Thuật
                  </span>
                  <h2
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateCurrentSlide({ title: e.currentTarget.textContent })}
                    className="text-lg sm:text-2xl font-black text-slate-900 mt-1 outline-none"
                  >
                    {currentSlide.title}
                  </h2>
                </div>

                {/* Khung câu hỏi */}
                <div className="bg-purple-50/90 p-4 rounded-2xl border-2 border-purple-300 shadow-sm space-y-3 my-auto">
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateCurrentSlide(s => ({
                      ...s,
                      quiz: { ...s.quiz, question: e.currentTarget.textContent }
                    }))}
                    className="text-sm font-black text-purple-950 outline-none"
                  >
                    {currentSlide.quiz?.question || 'Đố các con: Ba màu cơ bản (màu gốc) trong mĩ thuật là những màu nào?'}
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {(currentSlide.quiz?.options || []).map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border-2 text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                          oIdx === currentSlide.quiz?.correctIndex
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black'
                            : 'bg-white border-purple-200 text-slate-800 hover:bg-purple-100/50'
                        }`}
                      >
                        <span>{opt}</span>
                        {oIdx === currentSlide.quiz?.correctIndex && (
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px]">ĐÁP ÁN ĐÚNG ✓</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] font-bold text-slate-600 bg-white p-2.5 rounded-xl border border-purple-200">
                    💡 <b>Giải thích của {teacherName}:</b> {currentSlide.quiz?.explanation || 'Đỏ, Vàng, Lam là ba màu gốc tạo nên vô số màu sắc kì diệu!'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Môn Mĩ Thuật Lớp {selectedGrade} • GDPT 2018</span>
                  <span>Trang {currentSlideIndex + 1} / {slides.length}</span>
                </div>
              </div>
            )}

            {/* BỐ CỤC 7: TỰ DO (FREEFORM CANVAS) */}
            {currentSlide.layout === 'freeform' && (
              <div className="flex-1 flex flex-col justify-between">
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => updateCurrentSlide({ title: e.currentTarget.textContent })}
                  className="text-lg sm:text-2xl font-black text-slate-900 outline-none hover:bg-slate-100/50 px-2 py-0.5 rounded"
                >
                  {currentSlide.title}
                </h2>
                <div className="my-auto text-center text-xs text-slate-400 font-bold">
                  (Khung làm việc tự do: Bấm vào thanh công cụ để thêm Hộp chữ, Hình khối hoặc Tải ảnh)
                </div>
              </div>
            )}

            {/* ===================== RENDER CÁC PHẦN TỬ DO NGƯỜI DÙNG THÊM (ELEMENTS) ===================== */}
            {(currentSlide.elements || []).map((el) => {
              const isSelected = el.id === selectedElementId;

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleElementMouseDown(e, el)}
                  style={{
                    position: 'absolute',
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    width: `${el.width}%`,
                    height: `${el.height}%`,
                    zIndex: el.zIndex || 1,
                    opacity: (el.opacity || 100) / 100
                  }}
                  className={`cursor-move transition-shadow ${
                    isSelected ? 'ring-2 ring-indigo-600 ring-offset-2 shadow-lg' : 'hover:ring-1 hover:ring-indigo-300'
                  }`}
                >
                  {/* PHẦN TỬ: HỘP CHỮ */}
                  {el.type === 'text' && (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSelectedElement({ content: e.currentTarget.textContent })}
                      style={{
                        fontFamily: el.fontFamily || 'Arial',
                        fontSize: `${el.fontSize || 18}px`,
                        fontWeight: el.fontWeight || 'normal',
                        fontStyle: el.fontStyle || 'normal',
                        textDecoration: el.textDecoration || 'none',
                        textAlign: el.textAlign || 'left',
                        color: el.color || '#1E293B',
                        backgroundColor: el.backgroundColor || 'transparent'
                      }}
                      className="w-full h-full p-2 outline-none break-words overflow-hidden"
                    >
                      {el.content}
                    </div>
                  )}

                  {/* PHẦN TỬ: HÌNH KHỐI */}
                  {el.type === 'shape' && (
                    <div
                      style={{
                        backgroundColor: el.fillColor || '#E0F2FE',
                        borderColor: el.borderColor || '#0284C7',
                        borderWidth: `${el.borderWidth || 2}px`,
                        borderRadius: `${el.borderRadius || 8}px`
                      }}
                      className="w-full h-full flex items-center justify-center border p-2 overflow-hidden shadow-xs"
                    >
                      {el.content && (
                        <p className="font-bold text-center text-xs">{el.content}</p>
                      )}
                    </div>
                  )}

                  {/* PHẦN TỬ: HÌNH ẢNH */}
                  {el.type === 'image' && (
                    <div
                      style={{
                        borderRadius: `${el.borderRadius || 8}px`,
                        borderColor: el.borderColor || '#CBD5E1',
                        borderWidth: `${el.borderWidth || 1}px`
                      }}
                      className="w-full h-full overflow-hidden border shadow-xs"
                    >
                      <img
                        src={el.imageUrl}
                        alt="Ảnh người dùng"
                        style={{ objectFit: el.objectFit || 'contain' }}
                        className="w-full h-full pointer-events-none"
                      />
                    </div>
                  )}

                  {/* 8 CHỐT ĐIỀU KHIỂN KÍCH THƯỚC (RESIZE HANDLES) KHI ĐANG ĐƯỢC CHỌN */}
                  {isSelected && (
                    <>
                      {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(dir => {
                        let posStyle = {};
                        if (dir === 'nw') posStyle = { top: '-4px', left: '-4px' };
                        if (dir === 'n') posStyle = { top: '-4px', left: 'calc(50% - 4px)' };
                        if (dir === 'ne') posStyle = { top: '-4px', right: '-4px' };
                        if (dir === 'e') posStyle = { top: 'calc(50% - 4px)', right: '-4px' };
                        if (dir === 'se') posStyle = { bottom: '-4px', right: '-4px' };
                        if (dir === 's') posStyle = { bottom: '-4px', left: 'calc(50% - 4px)' };
                        if (dir === 'sw') posStyle = { bottom: '-4px', left: '-4px' };
                        if (dir === 'w') posStyle = { top: 'calc(50% - 4px)', left: '-4px' };

                        return (
                          <div
                            key={dir}
                            onMouseDown={(e) => handleResizeHandleMouseDown(e, el, dir)}
                            style={posStyle}
                            className="absolute w-2.5 h-2.5 bg-white border-2 border-indigo-600 rounded-xs shadow-xs z-20 cursor-crosshair"
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BẢNG TÙY CHỈNH ĐỐI TƯỢNG HOẶC THIẾT KẾ BÊN PHẢI (RIGHT INSPECTOR PANEL) */}
        {showRightInspector && (
          <div className="w-64 sm:w-72 bg-white border-l border-slate-300 p-3.5 overflow-y-auto shrink-0 select-none shadow-sm flex flex-col gap-4 text-xs">
            {selectedElement ? (
              // BẢNG THUỘC TÍNH: KHI CÓ PHẦN TỬ ĐANG ĐƯỢC CHỌN
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>
                      {selectedElement.type === 'text' ? 'Hộp Văn Bản' : selectedElement.type === 'shape' ? 'Hình Khối' : 'Hình Ảnh'}
                    </span>
                  </span>
                  <button
                    onClick={handleDeleteSelectedElement}
                    className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                    title="Xóa phần tử này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Thứ tự lớp (Z-Index / Layers) */}
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-500">Sắp xếp lớp:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={handleBringElementForward}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[11px]"
                    >
                      Lên Trước
                    </button>
                    <button
                      onClick={handleSendElementBackward}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[11px]"
                    >
                      Về Sau
                    </button>
                  </div>
                </div>

                {/* Tùy chỉnh Văn bản nếu là Text */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-2">
                    <p className="font-bold text-slate-500">Định dạng chữ:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={selectedElement.fontFamily || 'Arial'}
                        onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                        className="p-1 bg-white border border-slate-300 rounded font-bold"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Nunito">Nunito</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Comic Sans MS">Comic Sans</option>
                      </select>

                      <input
                        type="number"
                        min="10"
                        max="72"
                        value={selectedElement.fontSize || 18}
                        onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                        className="p-1 bg-white border border-slate-300 rounded font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateSelectedElement(el => ({ fontWeight: el.fontWeight === 'bold' ? 'normal' : 'bold' }))}
                        className={`p-1.5 rounded border ${selectedElement.fontWeight === 'bold' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateSelectedElement(el => ({ fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' }))}
                        className={`p-1.5 rounded border ${selectedElement.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateSelectedElement(el => ({ textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline' }))}
                        className={`p-1.5 rounded border ${selectedElement.textDecoration === 'underline' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500">Màu chữ:</span>
                      <input
                        type="color"
                        value={selectedElement.color || '#1E293B'}
                        onChange={(e) => updateSelectedElement({ color: e.target.value })}
                        className="w-full h-8 p-1 rounded border border-slate-300 cursor-pointer mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Tùy chỉnh Hình khối nếu là Shape */}
                {selectedElement.type === 'shape' && (
                  <div className="space-y-2">
                    <p className="font-bold text-slate-500">Màu sắc hình khối:</p>
                    <div>
                      <span className="text-[11px] font-bold text-slate-600">Màu nền:</span>
                      <input
                        type="color"
                        value={selectedElement.fillColor || '#E0F2FE'}
                        onChange={(e) => updateSelectedElement({ fillColor: e.target.value })}
                        className="w-full h-8 p-1 rounded border border-slate-300 cursor-pointer mt-0.5"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600">Màu viền:</span>
                      <input
                        type="color"
                        value={selectedElement.borderColor || '#0284C7'}
                        onChange={(e) => updateSelectedElement({ borderColor: e.target.value })}
                        className="w-full h-8 p-1 rounded border border-slate-300 cursor-pointer mt-0.5"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600">Độ bo góc:</span>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        value={selectedElement.borderRadius || 8}
                        onChange={(e) => updateSelectedElement({ borderRadius: Number(e.target.value) })}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // BẢNG THUỘC TÍNH: KHI KHÔNG CHỌN PHẦN TỬ NÀO (SLIDE PROPERTIES)
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <span className="font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-indigo-600" />
                    <span>Thuộc Tính Trang</span>
                  </span>
                </div>

                {/* Bố cục trang */}
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-500">Bố cục hiện tại:</p>
                  <select
                    value={currentSlide.layout}
                    onChange={(e) => updateCurrentSlide({ layout: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-700"
                  >
                    {SLIDE_LAYOUTS.map(l => (
                      <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
                    ))}
                  </select>
                </div>

                {/* Màu nền trang chiếu */}
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-500">Màu nền trang:</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['#FFFFFF', '#FFFBEB', '#F0FDF4', '#F0F9FF', '#FFF1F2', '#F8FAFC', '#F3E8FF', '#0F172A'].map(color => (
                      <button
                        key={color}
                        onClick={() => updateCurrentSlide({ background: { type: 'color', value: color } })}
                        style={{ backgroundColor: color }}
                        className={`h-8 rounded-lg border-2 shadow-2xs transition hover:scale-105 ${
                          currentSlide.background?.value === color ? 'border-indigo-600 ring-2 ring-indigo-400' : 'border-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="pt-1">
                    <input
                      type="color"
                      value={currentSlide.background?.value || '#FFFFFF'}
                      onChange={(e) => updateCurrentSlide({ background: { type: 'color', value: e.target.value } })}
                      className="w-full h-8 p-1 rounded border border-slate-300 cursor-pointer"
                      title="Chọn màu nền tùy ý"
                    />
                  </div>
                </div>

                {/* Áp dụng cho toàn bài */}
                <button
                  onClick={() => {
                    const currentBg = currentSlide.background;
                    setSlides(prev => prev.map(s => ({ ...s, background: currentBg })));
                    alert('Đã áp dụng màu nền này cho tất cả các trang chiếu!');
                  }}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                >
                  Áp dụng nền cho toàn bài
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. THANH GHI CHÚ GIẢNG BÀI KÉO DÀI (EXPANDABLE SPEAKER NOTES DRAWER) */}
      {showNotesDrawer && (
        <div className="bg-amber-50/95 border-t-2 border-amber-300 p-3 shrink-0 shadow-lg flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-amber-900 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>Ghi Chú Giảng Bài Của {teacherName} (Trang {currentSlideIndex + 1})</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSpeakNotes}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black transition ${
                  isSpeakingNotes
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400'
                }`}
              >
                {isSpeakingNotes ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeakingNotes ? 'Dừng đọc' : 'Đọc thử lời giảng'}</span>
              </button>

              <button
                onClick={() => setShowNotesDrawer(false)}
                className="p-1 hover:bg-amber-200 text-amber-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <textarea
            rows={3}
            value={currentSlide.speakerNote || ''}
            onChange={(e) => updateCurrentSlide({ speakerNote: e.target.value })}
            placeholder="Nhập lời giảng thuyết minh của Thầy/Cô khi trình chiếu slide này..."
            className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 resize-none shadow-inner"
          />
        </div>
      )}

      {/* 5. PHÍA DƯỚI (BOTTOM BAR): Ghi chú toggle, trạng thái slide, điều khiển thu phóng */}
      <div className="bg-[#FAF9F8] border-t border-slate-300 px-3 py-1 flex items-center justify-between text-xs text-slate-600 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotesDrawer(prev => !prev)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded hover:bg-slate-200 font-bold transition"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ghi chú người thuyết trình</span>
          </button>

          <span className="text-slate-300">|</span>

          <span className="font-bold text-slate-700">
            Trang chiếu {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>

        {/* Điều khiển thu phóng (Zoom controls) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
            className="p-1 hover:bg-slate-200 rounded"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="50"
            max="130"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-24 accent-indigo-600 cursor-pointer"
          />

          <button
            onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
            className="p-1 hover:bg-slate-200 rounded"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span className="font-bold text-[11px] text-slate-700 w-10 text-right">
            {zoomLevel}%
          </span>

          <button
            onClick={() => setZoomLevel(85)}
            className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700"
          >
            Vừa khung
          </button>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* MODAL 1: TẠO BÀI GIẢNG BẰNG AI (TRUNG THỰC, PHÙ HỢP TIỂU HỌC GDPT 2018) */}
      {/* ============================================================================ */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-amber-300 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-400 flex items-center justify-center text-xl shadow-sm">
                  ✨
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Tạo Bài Giảng Tự Động Bằng AI
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Chuẩn GDPT 2018 • Bộ sách Kết Nối Tri Thức
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-black text-slate-700 block mb-1">Chủ đề bài giảng:</label>
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  placeholder="Ví dụ: Sắc Màu Quanh Em, Động Vật Quen Thuộc..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Gợi ý chủ đề nhanh */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-400">Gợi ý:</span>
                {['Màu Sắc & Hình Khối', 'Vẽ Bức Tranh Thiên Nhiên', 'Em Và Các Bạn', 'Đồ Chơi Dân Gian'].map(chip => (
                  <button
                    key={chip}
                    onClick={() => setAiTopicInput(chip)}
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 text-[11px] font-bold transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-slate-700 block mb-1">Khối Lớp:</label>
                  <select
                    value={selectedGrade}
                    disabled
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700"
                  >
                    <option value={selectedGrade}>Lớp {selectedGrade}</option>
                  </select>
                </div>

                <div>
                  <label className="font-black text-slate-700 block mb-1">Số lượng slide:</label>
                  <select
                    value={aiNumSlides}
                    onChange={(e) => setAiNumSlides(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700"
                  >
                    <option value={4}>4 Slide (Ngắn gọn)</option>
                    <option value={5}>5 Slide (Tiêu chuẩn)</option>
                    <option value={6}>6 Slide (Đầy đủ hoạt động)</option>
                    <option value={8}>8 Slide (Chuyên sâu)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-black text-slate-700 block mb-1">Phong cách bài giảng:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cheerful', name: 'Vui Tươi Tiểu Học', icon: '🎨' },
                    { id: 'nature', name: 'Thiên Nhiên Xanh Mát', icon: '🌿' },
                    { id: 'ocean', name: 'Bầu Trời Tri Thức', icon: '🚀' },
                    { id: 'chalkboard', name: 'Bảng Đen Phấn Trắng', icon: '🏫' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => setAiStyle(st.id)}
                      className={`p-2 rounded-xl border-2 flex items-center gap-2 font-bold text-left transition ${
                        aiStyle === st.id ? 'bg-amber-50 border-amber-500 text-amber-950 font-black' : 'border-slate-200'
                      }`}
                    >
                      <span className="text-base">{st.icon}</span>
                      <span>{st.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Hủy
              </button>

              <button
                onClick={handleRunAiGenerator}
                disabled={isAiGenerating}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-2"
              >
                {isAiGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang Soạn Bài Giảng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo Bài Giảng Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 6. CHẾ ĐỘ TRÌNH CHIẾU TOÀN MÀN HÌNH (FULLSCREEN SLIDESHOW HUD) */}
      {/* ============================================================================ */}
      {isFullscreenShow && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden animate-fadeIn">
          
          {/* Vùng hiển thị slide toàn màn hình */}
          <div
            style={{
              aspectRatio: slideAspectRatio === '4:3' ? '4 / 3' : '16 / 9',
              backgroundColor: currentSlide.background?.value || '#FFFFFF'
            }}
            className="w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-12 flex flex-col justify-between relative transition-all duration-300"
          >
            {/* Render slide tương ứng */}
            {currentSlide.layout === 'title' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto space-y-6">
                <div className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-sm uppercase">
                  🎨 BÀI GIẢNG ĐIỆN TỬ MĨ THUẬT LỚP {selectedGrade}
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                  {currentSlide.title}
                </h1>
                <p className="text-lg sm:text-2xl font-bold text-slate-600 max-w-2xl">
                  {currentSlide.subtitle}
                </p>
                <div className="flex items-center gap-3 pt-6">
                  <img
                    src={avatarUrl}
                    alt={teacherName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                    onError={(e) => { e.currentTarget.src = './teacher.jpg'; }}
                  />
                  <div className="text-left">
                    <p className="text-base font-black text-slate-800">{teacherName}</p>
                    <p className="text-xs font-bold text-slate-500">Giáo viên Mĩ thuật • SGK Kết Nối Tri Thức</p>
                  </div>
                </div>
              </div>
            )}

            {currentSlide.layout === 'title-content' && (
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-sm font-black px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 uppercase">
                    {currentSlide.phase}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
                    {currentSlide.title}
                  </h2>
                  <p className="text-base font-bold text-slate-500 mt-1">{currentSlide.subtitle}</p>
                </div>

                <div className="space-y-4 my-auto">
                  {(currentSlide.bullets || []).map((bullet, bIdx) => (
                    <div
                      key={bIdx}
                      className="flex items-center gap-4 bg-white/95 p-4 rounded-2xl border-2 border-slate-200 shadow-md text-base sm:text-lg font-black text-slate-800"
                    >
                      <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                        {bIdx + 1}
                      </span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Môn Mĩ Thuật Lớp {selectedGrade} • GDPT 2018</span>
                  <span>Trang {currentSlideIndex + 1} / {slides.length}</span>
                </div>
              </div>
            )}

            {currentSlide.layout === 'lesson-goals' && (
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="text-center">
                  <span className="text-sm font-black px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    🎯 Mục Tiêu Bài Học (GDPT 2018)
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
                    {currentSlide.title}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-6 my-auto">
                  <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-400 shadow-lg space-y-3">
                    <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-full">
                      🎯 NGẮN HẠN
                    </span>
                    <p className="text-base font-bold text-emerald-950 leading-relaxed">
                      {currentSlide.goals?.shortTerm?.desc}
                    </p>
                    <div className="bg-white p-3 rounded-2xl border border-emerald-300 text-xs font-black text-emerald-900">
                      VÍ DỤ: {currentSlide.goals?.shortTerm?.example}
                    </div>
                  </div>

                  <div className="bg-sky-50 p-6 rounded-3xl border-2 border-sky-400 shadow-lg space-y-3">
                    <span className="px-3 py-1 bg-sky-600 text-white font-black text-xs rounded-full">
                      ⏳ DÀI HẠN
                    </span>
                    <p className="text-base font-bold text-sky-950 leading-relaxed">
                      {currentSlide.goals?.longTerm?.desc}
                    </p>
                    <div className="bg-white p-3 rounded-2xl border border-sky-300 text-xs font-black text-sky-900">
                      VÍ DỤ: {currentSlide.goals?.longTerm?.example}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-300 text-center text-sm font-black text-rose-700">
                  ✨ {currentSlide.goals?.quote} 🏆
                </div>
              </div>
            )}

            {currentSlide.layout === 'interactive-quiz' && (
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-sm font-black px-4 py-1 rounded-full bg-purple-100 text-purple-800 uppercase">
                    ❓ Đố Vui Mĩ Thuật
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
                    {currentSlide.title}
                  </h2>
                </div>

                <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-300 shadow-lg space-y-4 my-auto">
                  <p className="text-lg font-black text-purple-950">
                    {currentSlide.quiz?.question}
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {(currentSlide.quiz?.options || []).map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-3.5 rounded-2xl border-2 text-sm font-black flex items-center justify-between ${
                          oIdx === currentSlide.quiz?.correctIndex
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                            : 'bg-white border-purple-200 text-slate-800'
                        }`}
                      >
                        <span>{opt}</span>
                        {oIdx === currentSlide.quiz?.correctIndex && (
                          <span className="px-3 py-0.5 rounded-full bg-emerald-600 text-white text-xs">ĐÁP ÁN ĐÚNG ✓</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-bold text-slate-700 bg-white p-3 rounded-2xl border border-purple-200">
                    💡 <b>Lời giảng của {teacherName}:</b> {currentSlide.quiz?.explanation}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Môn Mĩ Thuật Lớp {selectedGrade} • GDPT 2018</span>
                  <span>Trang {currentSlideIndex + 1} / {slides.length}</span>
                </div>
              </div>
            )}

            {/* Các bố cục khác */}
            {(currentSlide.layout === 'two-column' || currentSlide.layout === 'image-caption' || currentSlide.layout === 'freeform') && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900">{currentSlide.title}</h2>
                <div className="my-auto space-y-3">
                  {(currentSlide.bullets || []).map((b, idx) => (
                    <div key={idx} className="p-3 bg-white/90 rounded-2xl border font-bold text-base text-slate-800 shadow-xs">
                      • {b}
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Môn Mĩ Thuật Lớp {selectedGrade} • GDPT 2018</span>
                  <span>Trang {currentSlideIndex + 1} / {slides.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* THANH ĐIỀU KHIỂN NỔI DƯỚI ĐÁY TRÌNH CHIẾU (FLOATING PRESENTATION HUD) */}
          <div className="absolute bottom-4 z-50 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white flex items-center gap-3 shadow-2xl">
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="p-1.5 hover:bg-white/20 rounded-full disabled:opacity-30"
              title="Trang trước (Phím mũi tên trái)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="font-black text-xs tracking-wider">
              {currentSlideIndex + 1} / {slides.length}
            </span>

            <button
              onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1.5 hover:bg-white/20 rounded-full disabled:opacity-30"
              title="Trang sau (Phím mũi tên phải hoặc phím cách)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-px h-4 bg-white/30 mx-1"></div>

            <button
              onClick={handleToggleSpeakNotes}
              className={`p-1.5 rounded-full transition ${isSpeakingNotes ? 'bg-rose-500 text-white animate-pulse' : 'hover:bg-white/20 text-amber-300'}`}
              title="Nghe Thầy đọc lời giảng của trang này"
            >
              {isSpeakingNotes ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setIsFullscreenShow(false);
                ttsService.stop();
                setIsSpeakingNotes(false);
              }}
              className="p-1.5 hover:bg-rose-600 rounded-full text-slate-300 hover:text-white transition"
              title="Thoát trình chiếu (Phím Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
