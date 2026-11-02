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
  MessageCircle, 
  Table, 
  Bot
} from 'lucide-react';
import { KET_NOI_TRI_THUC_DATA } from '../data/ketNoiTriThucCurriculum';
import { generateTeacherResponse } from '../services/gemini';
import { ttsService } from '../services/tts';
import MicrosoftPowerPointView from './MicrosoftPowerPointView';
import MicrosoftWordView from './MicrosoftWordView';
import SmasExcelView from './SmasExcelView';

export default function ThematicTeacherChat({ 
  apiKey, 
  onStartDrawingOnCanvas, 
  onGoToCritique, 
  teacher = { name: 'Thầy Cọ Nhí', title: 'Thầy giáo' },
  onUnitChange,
  onSlideChange,
  isTvMode = false,
  onToggleTvMode
}) {
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(KET_NOI_TRI_THUC_DATA[0]);
  const [viewMode, setViewMode] = useState('powerpoint'); // 'powerpoint' | 'word' | 'excel' | 'chat'
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const chatBottomRef = useRef(null);
  const topicRibbonRef = useRef(null);

  const teacherName = teacher?.name || 'Thầy Cọ Nhí';
  const pronoun = teacher?.pronoun || 'Thầy';
  const avatarUrl = teacher?.avatarUrl || './teacher.jpg';

  // Units of current grade
  const gradeUnits = KET_NOI_TRI_THUC_DATA.filter(u => u.grade === selectedGrade);

  // Switch Grade
  const handleSelectGrade = (grade) => {
    setSelectedGrade(grade);
    const firstOfGrade = KET_NOI_TRI_THUC_DATA.find(u => u.grade === grade);
    if (firstOfGrade) {
      setSelectedUnit(firstOfGrade);
    }
  };

  // Switch Unit
  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
    ttsService.stop();
    setIsSpeaking(false);
  };

  // Synchronize unit with parent App
  useEffect(() => {
    if (onUnitChange && selectedUnit) {
      onUnitChange(selectedUnit);
    }
  }, [selectedUnit, onUnitChange]);

  // Scroll chat to bottom
  useEffect(() => {
    if (viewMode === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewMode]);

  // Send message in 2-Way Teacher Chat
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
        const teacherVoice = teacher?.gender || (teacher?.id === 'female' ? 'female' : 'male');
        ttsService.speak(
          teacherReply.text,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          teacherVoice
        );
      }
    } catch (err) {
      console.error('Lỗi phản hồi của giáo viên:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 flex flex-col gap-5">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-500 p-5 sm:p-6 rounded-3xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={teacherName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-4 border-amber-300 shadow-2xl ring-4 ring-white/30"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/teacher.jpg'; }}
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-gray-900 font-black">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black">
                {teacherName} • Bộ Phần Mềm Văn Phòng GDPT 2018
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow">
                📚 SGK Kết Nối Tri Thức Với Cuộc Sống
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-blue-100 mt-1">
              Bộ ba phần mềm văn phòng chuyên dụng Microsoft PowerPoint, Word và Excel chuẩn SMAS Viettel (smas.edu.vn).
            </p>
          </div>
        </div>

        {/* Voice Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (!next) ttsService.stop();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs transition shadow-md ${
              voiceEnabled ? 'bg-white text-emerald-800' : 'bg-white/20 text-white'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{voiceEnabled ? 'Giọng Giáo Viên: BẬT' : 'Giọng Giáo Viên: TẮT'}</span>
          </button>
        </div>
      </div>

      {/* 2. TOP CONTROL BAR: Grade Selector + Microsoft Office 365 Mode Switcher */}
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

        {/* Office Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100/90 p-1.5 rounded-2xl border border-gray-200 flex-wrap">
          {/* PowerPoint Tab */}
          <button
            onClick={() => setViewMode('powerpoint')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              viewMode === 'powerpoint'
                ? 'bg-[#D24726] text-white shadow-md scale-102'
                : 'text-gray-600 hover:bg-white hover:text-[#D24726]'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>PowerPoint (Trình Chiếu & Sửa)</span>
          </button>

          {/* Word Tab */}
          <button
            onClick={() => setViewMode('word')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              viewMode === 'word'
                ? 'bg-[#185ABD] text-white shadow-md scale-102'
                : 'text-gray-600 hover:bg-white hover:text-[#185ABD]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Word (Giáo Án CV 2345)</span>
          </button>

          {/* Excel Tab */}
          <button
            onClick={() => setViewMode('excel')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              viewMode === 'excel'
                ? 'bg-[#107C41] text-white shadow-md scale-102'
                : 'text-gray-600 hover:bg-white hover:text-[#107C41]'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Excel (Sổ Đánh Giá SMAS)</span>
          </button>

          {/* 2-Way Chat Tab */}
          <button
            onClick={() => setViewMode('chat')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition ${
              viewMode === 'chat'
                ? 'bg-rose-500 text-white shadow-md scale-102'
                : 'text-gray-600 hover:bg-white hover:text-rose-600'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hỏi Bài {teacherName}</span>
          </button>
        </div>

        {/* Action Button: To Drawing Canvas */}
        <button
          onClick={onStartDrawingOnCanvas}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-amber-500 text-white text-xs font-black rounded-xl shadow hover:scale-105 active:scale-95 transition"
        >
          <Palette className="w-4 h-4" />
          <span>Vào Bảng Vẽ</span>
        </button>
      </div>

      {/* 3. HORIZONTAL TOPIC CAROUSEL RIBBON: All units for current grade */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-blue-50 p-3 rounded-3xl border-2 border-amber-200 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-amber-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Bài Học SGK Kết Nối Tri Thức Lớp {selectedGrade}:</span>
            </span>
            <span className="text-xs font-bold text-gray-500">
              ({gradeUnits.length} chủ đề chuẩn GDPT 2018)
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
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102 ring-2 ring-blue-300'
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

      {/* 4. MAIN OFFICE WORKSPACE: POWERPOINT / WORD / EXCEL / CHAT */}
      <div className="w-full">
        {/* VIEW 1: MICROSOFT POWERPOINT (TRÌNH CHIẾU & CHỈNH SỬA TÁC VỤ VĂN PHÒNG) */}
        {viewMode === 'powerpoint' && (
          <MicrosoftPowerPointView
            selectedGrade={selectedGrade}
            selectedUnit={selectedUnit}
            teacher={teacher}
            isTvMode={isTvMode}
            onToggleTvMode={onToggleTvMode}
            onStartDrawingOnCanvas={onStartDrawingOnCanvas}
          />
        )}

        {/* VIEW 2: MICROSOFT WORD (GIÁO ÁN ĐIỆN TỬ CV 2345 & SMAS VIETTEL) */}
        {viewMode === 'word' && (
          <MicrosoftWordView
            selectedGrade={selectedGrade}
            selectedUnit={selectedUnit}
            teacher={teacher}
          />
        )}

        {/* VIEW 3: MICROSOFT EXCEL (SỔ ĐÁNH GIÁ THÔNG TƯ 27 SMAS VIETTEL) */}
        {viewMode === 'excel' && (
          <SmasExcelView
            selectedGrade={selectedGrade}
            selectedUnit={selectedUnit}
            teacher={teacher}
            isTvMode={isTvMode}
          />
        )}

        {/* VIEW 4: 2-WAY AI TEACHER CHAT */}
        {viewMode === 'chat' && (
          <div className="bg-white rounded-3xl shadow-xl border-4 border-rose-200 overflow-hidden flex flex-col h-[620px]">
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
                  <h4 className="font-black text-sm">Hỏi {teacherName} Về Bài: {selectedUnit.title}</h4>
                  <span className="text-[10px] text-rose-100 font-semibold">
                    {teacherName} đang online giải đáp mọi câu hỏi mĩ thuật cho con
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
                <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-rose-100 max-w-[85%] text-xs sm:text-sm leading-relaxed">
                  <p className="font-bold text-gray-800">
                    Chào con! {pronoun} là <b>{teacherName}</b>. Con đang có thắc mắc gì về bài học <b>"{selectedUnit.title}"</b> (Lớp {selectedGrade}) không? Con có thể hỏi {pronoun} về cách phối màu, dựng hình khối, hoặc nhờ {pronoun} vẽ tranh mẫu nhé! 🎨
                  </p>
                </div>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.sender === 'student' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.sender === 'student' ? (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white flex items-center justify-center text-sm font-black shadow-sm shrink-0 mt-1">
                      👧
                    </div>
                  ) : (
                    <img
                      src={avatarUrl}
                      alt={teacherName}
                      className="w-8 h-8 rounded-xl object-cover border border-amber-300 shadow-sm shrink-0 mt-1"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/teacher.jpg'; }}
                    />
                  )}

                  <div
                    className={`p-3.5 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                      msg.sender === 'student'
                        ? 'bg-rose-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-rose-100 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {msg.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-rose-200">
                        <img
                          src={msg.imageUrl}
                          alt="Tranh mẫu tham khảo"
                          className="w-full max-h-60 object-contain bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-rose-500 font-bold italic animate-pulse">
                  <Bot className="w-4 h-4" />
                  <span>{teacherName} đang suy nghĩ câu trả lời cho con...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-white border-t border-rose-100 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Hỏi ${pronoun}: 'Cách vẽ cây phong cảnh?', 'Vẽ giúp con tranh mẫu'...`}
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

      {/* 5. BOTTOM OVERVIEW SECTION: Grid of all units of current grade */}
      <div className="bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm mt-2">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h4 className="font-black text-gray-800 text-sm sm:text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Chương Trình Mĩ Thuật Lớp {selectedGrade} ({gradeUnits.length} Bài Học - SGK Kết Nối Tri Thức)</span>
          </h4>
          <span className="text-xs font-bold text-gray-500">Bấm bài bất kỳ để nạp vào PowerPoint và Word</span>
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
