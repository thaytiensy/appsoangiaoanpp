import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Camera, 
  BookOpen, 
  Sparkles, 
  Key, 
  Heart,
  MessageCircle,
  Tv,
  Maximize2,
  Minimize2,
  HelpCircle,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DrawingCanvas from './components/DrawingCanvas';
import CritiqueView from './components/CritiqueView';
import StepByStepView from './components/StepByStepView';
import InspirationView from './components/InspirationView';
import ThematicTeacherChat from './components/ThematicTeacherChat';
import ApiKeyModal from './components/ApiKeyModal';
import TeacherBubble from './components/TeacherBubble';
import { KET_NOI_TRI_THUC_DATA } from './data/ketNoiTriThucCurriculum';
import { getContextAwareGuidance, SMART_TV_HOTKEYS, APP_SECTIONS } from './services/aiContextEngine';
import { ttsService } from './services/tts';

export const TEACHERS = {
  male: {
    id: 'male',
    name: 'Thầy Cọ Nhí',
    pronoun: 'Thầy',
    title: 'Thầy giáo',
    avatarUrl: './teacher.jpg',
    fallbackEmoji: '👨‍🏫',
    gender: 'male',
    voiceName: 'vi-VN-NamMinhNeural',
    label: 'Thầy Cọ Nhí (Giọng Nam)',
    badge: '👨‍🏫 Thầy Cọ Nhí'
  },
  female: {
    id: 'female',
    name: 'Cô Hoài My',
    pronoun: 'Cô',
    title: 'Cô giáo',
    avatarUrl: './teacher_female.jpg',
    fallbackEmoji: '👩‍🏫',
    gender: 'female',
    voiceName: 'vi-VN-HoaiMyNeural',
    label: 'Cô Hoài My (Giọng Nữ)',
    badge: '👩‍🏫 Cô Hoài My'
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('thematicChat');
  const [apiKey, setApiKey] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [critiqueImage, setCritiqueImage] = useState(null);
  const [canvasTemplate, setCanvasTemplate] = useState(null);
  const [currentUnit, setCurrentUnit] = useState(KET_NOI_TRI_THUC_DATA[0]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Smart TV & AI Intelligence Context State
  const [isTvMode, setIsTvMode] = useState(() => {
    return localStorage.getItem('ARTED_SMART_TV_MODE') === 'true';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAiHelpOpen, setIsAiHelpOpen] = useState(false);
  const [aiHelpQuery, setAiHelpQuery] = useState('');
  const [aiHelpResponse, setAiHelpResponse] = useState(null);

  // Dual Teacher Model: Thầy Cọ Nhí (Nam) & Cô Hoài My (Nữ)
  const [selectedTeacherId, setSelectedTeacherId] = useState(() => {
    return localStorage.getItem('ARTED_SELECTED_TEACHER') || 'male';
  });

  const teacher = TEACHERS[selectedTeacherId] || TEACHERS.male;

  const handleSelectTeacher = (teacherId) => {
    const nextId = teacherId === 'female' ? 'female' : 'male';
    setSelectedTeacherId(nextId);
    localStorage.setItem('ARTED_SELECTED_TEACHER', nextId);
    ttsService.setVoice(nextId);
  };

  useEffect(() => {
    ttsService.setVoice(teacher.gender);
  }, [teacher]);

  // Load API Key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('ARTED_GEMINI_API_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('ARTED_GEMINI_API_KEY', newKey);
  };

  const handleToggleTvMode = () => {
    setIsTvMode(prev => {
      const next = !prev;
      localStorage.setItem('ARTED_SMART_TV_MODE', String(next));
      return next;
    });
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Global Keyboard Shortcuts (Remote TV, Clicker, Desktop)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // 'T' / 't': Toggle Smart TV Mode
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleToggleTvMode();
      }
      // 'F' / 'f': Toggle Fullscreen
      else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      }
      // 'H' / 'h': Toggle AI Help
      else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsAiHelpOpen(prev => !prev);
      }
      // '1' to '5': Tab Switcher
      else if (e.key === '1') {
        setActiveTab('thematicChat');
      } else if (e.key === '2') {
        setActiveTab('canvas');
      } else if (e.key === '3') {
        setActiveTab('critique');
      } else if (e.key === '4') {
        setActiveTab('stepbystep');
      } else if (e.key === '5') {
        setActiveTab('inspiration');
      }
      // 'M' / 'm': Stop Speech
      else if (e.key === 'm' || e.key === 'M') {
        ttsService.stop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAskTeacherFromCanvas = (canvasBase64) => {
    setCritiqueImage(canvasBase64);
    setActiveTab('critique');
  };

  const handleSelectToDraw = (template = null) => {
    if (template) setCanvasTemplate(template);
    setActiveTab('canvas');
  };

  // AI Context Helper Query
  const handleAskAiHelp = (customQuestion = null) => {
    const q = customQuestion || aiHelpQuery;
    const response = getContextAwareGuidance({
      activeTab,
      currentUnit,
      currentSlideIndex,
      isTvMode,
      userQuery: q,
      teacher
    });
    setAiHelpResponse(response);
  };

  return (
    <div className={`flex flex-col min-h-screen ${isTvMode ? 'bg-gradient-to-b from-amber-50/50 to-orange-50/30' : ''}`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 shadow-sm transition-all px-3 sm:px-6 py-3 ${
        isTvMode ? 'border-amber-400 bg-amber-50/95 py-4 shadow-md' : 'border-pink-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          {/* Logo & Teacher Portrait */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('thematicChat')}>
            <div className="relative">
              {teacher.avatarUrl ? (
                <img
                  src={teacher.avatarUrl}
                  alt={teacher.name}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-lg ring-2 ring-pink-300"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/teacher.jpg';
                  }}
                />
              ) : (
                <div className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white">
                  {teacher.fallbackEmoji}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 tracking-tight">
                  ART AI
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-extrabold text-[11px] shadow-sm">
                  Tiểu Học Lớp 1 - 5 🎒
                </span>
                {isTvMode && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] shadow-sm flex items-center gap-1 animate-pulse">
                    <Tv className="w-3 h-3" />
                    <span>Smart TV</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[11px] sm:text-xs font-bold text-gray-500 flex items-center gap-1">
                  <span>{teacher.name} Dạy Mĩ Thuật</span>
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                </p>

                {/* Chọn Thầy / Cô Trực Quan */}
                <div className="flex items-center gap-1 bg-amber-100/70 p-0.5 rounded-xl border border-amber-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTeacher('male');
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition ${
                      teacher.id === 'male'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-amber-200/60'
                    }`}
                    title="Chọn Thầy Cọ Nhí (Giọng Nam vi-VN-NamMinhNeural)"
                  >
                    <span>👨‍🏫 Thầy</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTeacher('female');
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition ${
                      teacher.id === 'female'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-rose-200/60'
                    }`}
                    title="Chọn Cô Hoài My (Giọng Nữ vi-VN-HoaiMyNeural)"
                  >
                    <span>👩‍🏫 Cô</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Support Numbers 1 - 5) */}
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-pink-50/80 p-1.5 rounded-2xl border border-pink-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('thematicChat')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'thematicChat'
                  ? 'bg-rose-500 text-white shadow-md scale-105'
                  : 'text-gray-600 hover:text-rose-600 hover:bg-rose-100/50'
              }`}
              title="Phím tắt: 1"
            >
              <MessageCircle className="w-4 h-4" />
              <span>💬 Lớp Học Chủ Đề</span>
            </button>

            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'canvas'
                  ? 'bg-pink-500 text-white shadow-md scale-105'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-100/50'
              }`}
              title="Phím tắt: 2"
            >
              <Palette className="w-4 h-4" />
              <span>🎨 Bảng Vẽ</span>
            </button>

            <button
              onClick={() => setActiveTab('critique')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'critique'
                  ? 'bg-amber-500 text-white shadow-md scale-105'
                  : 'text-gray-600 hover:text-amber-600 hover:bg-amber-100/50'
              }`}
              title="Phím tắt: 3"
            >
              <Camera className="w-4 h-4" />
              <span>📸 Mắt Thần Chấm Tranh</span>
            </button>

            <button
              onClick={() => setActiveTab('stepbystep')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'stepbystep'
                  ? 'bg-emerald-500 text-white shadow-md scale-105'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-100/50'
              }`}
              title="Phím tắt: 4 (Có bài Phong Cảnh Lớp 4)"
            >
              <BookOpen className="w-4 h-4" />
              <span>🐾 Vẽ Từng Bước</span>
            </button>

            <button
              onClick={() => setActiveTab('inspiration')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'inspiration'
                  ? 'bg-purple-500 text-white shadow-md scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-100/50'
              }`}
              title="Phím tắt: 5"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Xưởng Ý Tưởng</span>
            </button>
          </nav>

          {/* Action Bar: Smart TV Toggle, AI Help & API Key */}
          <div className="flex items-center gap-2">
            {/* Smart TV Mode Toggle Button */}
            <button
              onClick={handleToggleTvMode}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shadow-sm transition border ${
                isTvMode
                  ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-300'
                  : 'bg-white hover:bg-amber-50 text-gray-700 border-gray-200'
              }`}
              title="Bật/Tắt Chế Độ Smart TV & Màn Hình Lớn (Phím T)"
            >
              <Tv className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">
                {isTvMode ? 'Smart TV Đang Bật' : 'Smart TV'}
              </span>
            </button>

            {/* AI Help & Context Guide Button */}
            <button
              onClick={() => {
                handleAskAiHelp();
                setIsAiHelpOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 shadow-sm transition"
              title="Hỏi Thầy về cách sử dụng app và bài học (Phím H)"
            >
              <HelpCircle className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Trợ Lý AI</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl text-xs font-black bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm transition"
              title="Toàn Màn Hình (Phím F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shadow-sm transition border ${
                apiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
              }`}
              title="Cài đặt khóa Google Gemini hoặc Hugging Face"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {apiKey ? (apiKey.startsWith('hf_') ? 'Hugging Face' : 'Gemini') : 'Cài Key'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-4 sm:py-6">
        {activeTab === 'thematicChat' && (
          <ThematicTeacherChat
            apiKey={apiKey}
            teacher={teacher}
            onStartDrawingOnCanvas={handleSelectToDraw}
            onGoToCritique={() => setActiveTab('critique')}
            onUnitChange={(u) => setCurrentUnit(u)}
            onSlideChange={(idx) => setCurrentSlideIndex(idx)}
            isTvMode={isTvMode}
            onToggleTvMode={handleToggleTvMode}
          />
        )}

        {activeTab === 'canvas' && (
          <DrawingCanvas 
            onAskTeacher={handleAskTeacherFromCanvas} 
            teacher={teacher}
            templateImage={canvasTemplate}
            onClearTemplate={() => setCanvasTemplate(null)}
            isTvMode={isTvMode}
          />
        )}

        {activeTab === 'critique' && (
          <CritiqueView
            initialImage={critiqueImage}
            apiKey={apiKey}
            teacher={teacher}
            onBackToCanvas={() => setActiveTab('canvas')}
            isTvMode={isTvMode}
          />
        )}

        {activeTab === 'stepbystep' && (
          <StepByStepView 
            teacher={teacher}
            onSelectToDraw={handleSelectToDraw}
            isTvMode={isTvMode}
          />
        )}

        {activeTab === 'inspiration' && (
          <InspirationView
            teacher={teacher}
            onSendToCanvas={(imgUrl) => {
              setCanvasTemplate(imgUrl);
              setActiveTab('canvas');
            }}
            isTvMode={isTvMode}
          />
        )}
      </main>

      {/* Floating Smart TV Quick Remote Bar (Only visible when Smart TV is Active) */}
      {isTvMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-gray-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl border-2 border-amber-400 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 border-r border-gray-700 pr-3">
            <Tv className="w-4 h-4" />
            <span>TV Remote:</span>
          </div>

          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
            }}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-xs font-bold transition flex items-center gap-1 text-gray-200"
            title="Slide trước (←)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trước [←]</span>
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            }}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-lg text-xs transition flex items-center gap-1.5 shadow"
            title="Phát/Dừng giọng Thầy (Space)"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Nghe Thầy [Space]</span>
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            }}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-xs font-bold transition flex items-center gap-1 text-gray-200"
            title="Slide tiếp (→)"
          >
            <span className="hidden sm:inline">Tiếp [→]</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className="px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-lg text-xs transition hidden md:flex items-center gap-1"
            title="Vào Bảng Vẽ (Phím 2)"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Bảng Vẽ</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-xs transition text-gray-300"
            title="Toàn màn hình (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleToggleTvMode}
            className="p-1.5 hover:bg-rose-900/60 rounded-lg text-xs text-rose-300 font-bold transition"
            title="Tắt chế độ TV (T)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Teacher Lecture Bubble with Context Engine */}
      <TeacherBubble
        teacher={teacher}
        activeTab={activeTab}
        currentUnit={currentUnit}
        currentSlideIndex={currentSlideIndex}
        onOpenChat={() => setActiveTab('thematicChat')}
        onGoToCritique={() => setActiveTab('critique')}
        isTvMode={isTvMode}
        onToggleTvMode={handleToggleTvMode}
        onOpenAiHelp={() => {
          handleAskAiHelp();
          setIsAiHelpOpen(true);
        }}
      />

      {/* Footer */}
      <footer className="mt-auto bg-white/70 backdrop-blur border-t border-pink-100 py-4 px-4 text-center text-xs font-bold text-gray-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🎨 ART AI • {teacher.title} Mĩ Thuật Dạy Học Tiếng Việt ({teacher.label})</span>
          <span className="text-gray-400">Chuẩn GDPT 2018 Lớp 1 - 5 • Microsoft Edge Neural TTS {teacher.voiceName}</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      {/* Context Intelligence Assistant Modal */}
      {isAiHelpOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsAiHelpOpen(false)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 shadow bg-white">
                  <img
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/teacher.jpg';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">
                    Trợ Lý AI {teacher.name}
                  </h3>
                  <p className="text-xs font-bold text-amber-700">
                    Hiểu mọi chức năng của app, chuẩn GDPT 2018 & hỗ trợ Smart TV
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiHelpOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Question Suggestions */}
            <div>
              <span className="text-xs font-black text-gray-600 block mb-2">
                Bé hoặc Thầy Cô hãy chọn câu hỏi nhanh:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Chủ đề 1 Lớp 3 học những gì?',
                  'Cách vẽ tranh phong cảnh Lớp 4?',
                  'Điều khiển trên Smart TV thế nào?',
                  'Mắt thần chấm tranh theo những tiêu chí nào?',
                  'Tổng quan 5 phân hệ mĩ thuật của app'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiHelpQuery(q);
                      handleAskAiHelp(q);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-black text-amber-900 transition active:scale-95 text-left"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập câu hỏi bất kì về app hoặc bài học..."
                value={aiHelpQuery}
                onChange={(e) => setAiHelpQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskAiHelp();
                }}
                className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-amber-300 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-200"
              />
              <button
                onClick={() => handleAskAiHelp()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-2xl shadow transition"
              >
                Hỏi Thầy
              </button>
            </div>

            {/* AI Response Display */}
            {aiHelpResponse && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-sm flex flex-col gap-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl shrink-0">👨‍🏫</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 whitespace-pre-line leading-relaxed">
                      {aiHelpResponse.text}
                    </p>
                  </div>
                </div>

                {/* Quick Action Button if present */}
                {aiHelpResponse.quickAction && (
                  <div className="pt-2 border-t border-amber-200 flex justify-end">
                    <button
                      onClick={() => {
                        const act = aiHelpResponse.quickAction.type;
                        setIsAiHelpOpen(false);
                        if (act === 'toggle_tv') handleToggleTvMode();
                        else if (act === 'go_g3_cd1') {
                          const g3u1 = KET_NOI_TRI_THUC_DATA.find(u => u.id === 'kntt_g3_cd1');
                          if (g3u1) setCurrentUnit(g3u1);
                          setActiveTab('thematicChat');
                        } else if (act === 'go_step_landscape') {
                          setActiveTab('stepbystep');
                        } else if (act === 'go_critique') {
                          setActiveTab('critique');
                        }
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow transition"
                    >
                      {aiHelpResponse.quickAction.label} →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Smart TV Remote Cheat-Sheet */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 flex flex-col gap-1.5">
              <span className="font-black text-gray-800 flex items-center gap-1">
                <Tv className="w-3.5 h-3.5 text-blue-600" />
                <span>Bảng Phím Tắt Điều Khiển TV & Bàn Phím:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-bold">
                {SMART_TV_HOTKEYS.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-amber-600 shrink-0">•</span>
                    <span className="text-gray-900 font-black">{h.key}:</span>
                    <span className="text-gray-600">{h.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
