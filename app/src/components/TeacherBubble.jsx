import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, MessageSquare, X, Sparkles, ChevronUp, ChevronDown, Tv, HelpCircle } from 'lucide-react';
import { ttsService } from '../services/tts';

export default function TeacherBubble({ 
  teacher = { name: 'Thầy Cọ Nhí', pronoun: 'Thầy', title: 'Thầy giáo', avatarUrl: './teacher.jpg', gender: 'male' },
  activeTab, 
  onOpenChat, 
  onGoToCritique, 
  currentUnit, 
  currentSlideIndex = 0,
  isTvMode = false,
  onToggleTvMode,
  onOpenAiHelp
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  const pronoun = teacher?.pronoun || 'Thầy';
  const teacherTitle = teacher?.title || 'Thầy giáo';
  const teacherName = teacher?.name || 'Thầy Cọ Nhí';
  const avatarUrl = teacher?.avatarUrl || './teacher.jpg';

  // Context-aware speech line from teacher depending on what tab and lesson the student is viewing
  useEffect(() => {
    let msg = '';
    if (isTvMode) {
      msg = `📺 ${pronoun} đang trình chiếu ở chế độ Màn hình Smart TV cho cả lớp! Con hoặc Thầy Cô có thể bấm phím mũi tên trên remote để chuyển slide và phím cách để nghe ${pronoun} giảng bài nhé!`;
    } else {
      switch (activeTab) {
        case 'thematicChat':
          if (currentUnit) {
            const currentSlide = currentUnit.powerpointSlides?.[currentSlideIndex];
            msg = `${pronoun} chào con! Hôm nay chúng mình học "${currentUnit.title}" (${currentUnit.unitNumber} - ${currentUnit.gradeLabel}). ${currentSlide?.teacherLecture || currentUnit.summary}`;
          } else {
            msg = `${pronoun} chào con! ${pronoun} đã chuẩn bị sẵn sàng các bài học Mĩ thuật chuẩn SGK Kết nối tri thức cho con rồi đấy!`;
          }
          break;
        case 'canvas':
          msg = currentUnit 
            ? `Bảng vẽ thực hành bài "${currentUnit.title}" đây rồi! Con hãy áp dụng bí quyết của ${pronoun} để vẽ thật tự tin nhé!`
            : `Bảng vẽ của con đây rồi! Hãy tự do phối màu và vẽ theo cảm xúc nhé. Vẽ xong con nhớ bấm "Nhờ ${pronoun} Nhận Xét Tranh" để ${pronoun} chấm điểm nha!`;
          break;
        case 'critique':
          msg = currentUnit
            ? `${pronoun} đang ngắm bài vẽ chủ đề "${currentUnit.title}" của con! ${pronoun} sẽ đánh giá theo 4 tiêu chí Rubric GDPT 2018 nhé!`
            : `${pronoun} đang quan sát bức tranh của con đây! Mỗi nét vẽ đều chứa đựng sự sáng tạo tuyệt vời của con.`;
          break;
        case 'stepbystep':
          msg = `Học vẽ từng bước sẽ giúp con nắm chắc hình khối cơ bản và luật viễn cận. Đặc biệt ${pronoun} có bài vẽ phong cảnh Lớp 4 và con vật rất đẹp đấy!`;
          break;
        case 'inspiration':
          msg = `Chào mừng con đến với Xưởng Ý Tưởng! Con thích vẽ gì cứ nhập vào, ${pronoun} và AI sẽ tạo ngay tranh mẫu cho con ngắm nha!`;
          break;
        default:
          msg = `${pronoun} luôn ở đây đồng hành cùng con sáng tạo mĩ thuật!`;
      }
    }

    setCurrentMessage(msg);
  }, [activeTab, currentUnit, currentSlideIndex, isTvMode, teacher]);

  const speakCurrentMessage = () => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      const currentVoice = teacher?.gender || (teacher?.id === 'female' ? 'female' : 'male');
      ttsService.speak(
        currentMessage,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        currentVoice
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto select-none">
      {/* Speech Bubble Box */}
      {isOpen && (
        <div className="max-w-[320px] sm:max-w-sm bg-white p-4 rounded-3xl shadow-2xl border-4 border-amber-300 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Close / Minimize button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-2 -right-2 w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center shadow-md transition"
            title="Thu nhỏ bóng thoại"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Teacher Badge */}
          <div className="flex items-center justify-between border-b border-amber-100 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-amber-800">
                {isTvMode ? '📺 Chế Độ Smart TV:' : `${teacherTitle} Mĩ Thuật Đang Giảng:`}
              </span>
            </div>

            <button
              onClick={speakCurrentMessage}
              className={`p-1.5 rounded-xl transition flex items-center gap-1 text-[11px] font-black ${
                isSpeaking 
                  ? 'bg-rose-500 text-white animate-pulse shadow-sm'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
              title={`Nghe ${pronoun} nói`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Dừng' : `Nghe ${pronoun}`}</span>
            </button>
          </div>

          {/* Message Content */}
          <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed">
            "{currentMessage}"
          </p>

          {/* Quick Action Links */}
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            {onOpenAiHelp && (
              <button
                onClick={onOpenAiHelp}
                className="text-[11px] font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 transition bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Hỏi Trợ Lý AI</span>
              </button>
            )}

            {activeTab !== 'thematicChat' ? (
              <button
                onClick={onOpenChat}
                className="text-[11px] font-black text-rose-600 hover:text-rose-700 flex items-center gap-1 transition ml-auto"
              >
                <span>Hỏi về bài học</span>
                <span>💬 →</span>
              </button>
            ) : (
              onToggleTvMode && (
                <button
                  onClick={onToggleTvMode}
                  className="text-[11px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition ml-auto"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>{isTvMode ? 'Thoát TV' : 'Bật TV'}</span>
                </button>
              )
            )}
          </div>

          {/* Little triangle arrow pointing to avatar */}
          <div className="absolute -bottom-2.5 right-8 w-5 h-5 bg-white border-b-4 border-r-4 border-amber-300 transform rotate-45" />
        </div>
      )}

      {/* Floating Teacher Avatar Head */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-2xl shadow-lg border-2 border-amber-300 text-xs font-black text-amber-900 hover:scale-105 active:scale-95 transition flex items-center gap-1"
          >
            <span>💬 {pronoun} đang dặn dò</span>
          </button>
        )}

        <div
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
            } else {
              speakCurrentMessage();
            }
          }}
          className="relative group cursor-pointer"
          title={`Bấm vào ${pronoun} để nghe dặn dò hoặc đóng/mở bóng thoại`}
        >
          {/* Animated Glow Halo */}
          <div className={`absolute -inset-1 bg-gradient-to-r from-amber-400 via-rose-400 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 ${isSpeaking ? 'animate-spin' : 'animate-pulse'}`} />

          {/* Avatar Image */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center">
            <img
              src={avatarUrl}
              alt={teacherName}
              className="w-full h-full object-cover transform group-hover:scale-110 transition duration-300"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/teacher.jpg';
              }}
            />
          </div>

          {/* Live Online Badge */}
          <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-black shadow">
            ✓
          </span>
        </div>
      </div>
    </div>
  );
}
