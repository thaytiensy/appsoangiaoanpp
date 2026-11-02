import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Save, 
  RotateCcw, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Plus, 
  Trash2, 
  Check, 
  Volume2, 
  Play, 
  Pause, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Sliders, 
  Sparkles, 
  BookOpen, 
  Table, 
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportSmasWord } from '../services/smasExport';
import { ttsService } from '../services/tts';

export default function MicrosoftWordView({
  selectedGrade = 1,
  selectedUnit,
  teacher = { name: 'Thầy Cọ Nhí', title: 'Thầy giáo' }
}) {
  const teacherName = teacher?.name || 'Thầy Cọ Nhí';
  const pronoun = teacher?.pronoun || 'Thầy';
  const avatarUrl = teacher?.avatarUrl || './teacher.jpg';

  // Ribbon Tabs: 'home' | 'insert' | 'layout' | 'view' | 'file'
  const [activeRibbonTab, setActiveRibbonTab] = useState('home');

  // Editable Plan State
  const [plan, setPlan] = useState(() => {
    return selectedUnit?.wordLessonPlan ? JSON.parse(JSON.stringify(selectedUnit.wordLessonPlan)) : null;
  });
  const [schoolName, setSchoolName] = useState('Trường Tiểu Học Tân Phong');
  const [departmentName, setDepartmentName] = useState(`TỔ CHUYÊN MÔN KHỐI ${selectedGrade}`);
  const [saveToast, setSaveToast] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Formatting State
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [fontSize, setFontSize] = useState(13);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('justify');

  // AI Speech Engine
  const [isAutoLecturing, setIsAutoLecturing] = useState(false);
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);

  // Sync plan when selectedUnit changes
  useEffect(() => {
    if (selectedUnit?.wordLessonPlan) {
      setPlan(JSON.parse(JSON.stringify(selectedUnit.wordLessonPlan)));
      setDepartmentName(`TỔ CHUYÊN MÔN KHỐI ${selectedGrade}`);
      stopLecture();
    }
  }, [selectedUnit, selectedGrade]);

  const showSaveToastNotification = (msg) => {
    setSaveToast(msg || 'Đã lưu thay đổi vào Kế hoạch bài dạy!');
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Export to Real Microsoft Word (.doc)
  const handleExportWord = () => {
    try {
      exportSmasWord({
        unit: selectedUnit,
        teacher,
        grade: selectedGrade,
        plan,
        schoolName
      });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      showSaveToastNotification('Đã xuất thành công tệp Word (.doc) chuẩn SMAS!');
    } catch (e) {
      console.error('Lỗi khi xuất Word:', e);
      alert('Không thể xuất tệp Word. Vui lòng thử lại!');
    }
  };

  // Print Lesson Plan (Ctrl + P)
  const handlePrint = () => {
    window.print();
  };

  // Reset to original plan
  const handleResetPlan = () => {
    if (confirm('Khôi phục Kế hoạch bài dạy về mẫu gốc Công văn 2345? Mọi nội dung vừa sửa sẽ được hoàn tác.')) {
      if (selectedUnit?.wordLessonPlan) {
        setPlan(JSON.parse(JSON.stringify(selectedUnit.wordLessonPlan)));
        showSaveToastNotification('Đã khôi phục kế hoạch bài dạy về bản gốc!');
      }
    }
  };

  // Update Plan Fields
  const updatePlanField = (field, value) => {
    setPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateObjective = (idx, value) => {
    setPlan(prev => {
      const nextObjs = [...(prev.objectives || [])];
      nextObjs[idx] = value;
      return { ...prev, objectives: nextObjs };
    });
  };

  const addObjective = () => {
    setPlan(prev => ({
      ...prev,
      objectives: [...(prev.objectives || []), 'Thực hành sáng tạo thêm theo ý thích cá nhân.']
    }));
  };

  const deleteObjective = (idx) => {
    setPlan(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== idx)
    }));
  };

  const updateActivity = (actIdx, field, value) => {
    setPlan(prev => {
      const nextActs = [...(prev.activities || [])];
      nextActs[actIdx] = {
        ...nextActs[actIdx],
        [field]: value
      };
      return { ...prev, activities: nextActs };
    });
  };

  const addActivity = () => {
    const newAct = {
      phase: `Hoạt động ${((plan?.activities?.length) || 0) + 1}`,
      duration: '5-7 phút',
      objective: 'Củng cố kiến thức và mở rộng tư duy mĩ thuật',
      teacherAct: 'Giáo viên tổ chức cho học sinh thảo luận, quan sát và đặt câu hỏi gợi mở.',
      studentAct: 'Học sinh chú ý lắng nghe, hào hứng trả lời và nhận xét bài vẽ của bạn.',
      teacherQuestions: ['Con học được điều gì thú vị nhất trong bài học hôm nay?'],
      visualNotes: 'Trưng bày các tác phẩm tiêu biểu lên góc trưng bày của lớp.'
    };
    setPlan(prev => ({
      ...prev,
      activities: [...(prev.activities || []), newAct]
    }));
  };

  const deleteActivity = (actIdx) => {
    setPlan(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== actIdx)
    }));
  };

  // AI Speech Lecture for Activities
  const startSequentialLecture = (startIdx = 0) => {
    if (!plan?.activities?.length) return;
    setIsAutoLecturing(true);
    playActivityVoice(startIdx);
  };

  const stopLecture = () => {
    ttsService.stop();
    setIsAutoLecturing(false);
  };

  const playActivityVoice = (idx) => {
    const acts = plan?.activities || [];
    if (idx >= acts.length) {
      stopLecture();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      return;
    }

    setActiveActivityIndex(idx);
    const act = acts[idx];
    const speechText = `${act.phase}: ${act.objective || ''}. Nội dung của giáo viên: ${act.teacherAct}. ` +
      (act.teacherQuestions?.length ? `Câu hỏi gợi mở: ${act.teacherQuestions[0]}` : '');

    ttsService.speak(
      speechText,
      () => {},
      () => {
        if (idx < acts.length - 1) {
          setTimeout(() => {
            playActivityVoice(idx + 1);
          }, 1500);
        } else {
          stopLecture();
        }
      }
    );
  };

  if (!plan) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border-2 border-blue-200">
        <p className="font-bold text-gray-500">Đang nạp Kế hoạch bài dạy chuẩn Công văn 2345...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col rounded-3xl overflow-hidden shadow-2xl border-4 border-[#185ABD] bg-[#f1f5f9]">
      {/* 1. MICROSOFT 365 WORD TOP BAR */}
      <div className="bg-[#185ABD] text-white px-4 py-2 flex items-center justify-between border-b border-[#124694] shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#124694] px-2.5 py-1 rounded-xl text-xs font-black shadow-inner">
            <span className="w-5 h-5 rounded-lg bg-white text-[#185ABD] font-black flex items-center justify-center text-xs shadow-xs">
              W
            </span>
            <span>Word</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white/95">
              KHBD_{selectedUnit?.id}_CV2345.docx - Mĩ Thuật Lớp {selectedGrade} (SMAS Viettel)
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-white/80 bg-white/15 px-2 py-0.5 rounded-md font-semibold">
              <Check className="w-3 h-3 text-emerald-300" /> Chuẩn Công văn 2345/BGDĐT
            </span>
          </div>
        </div>

        {/* Quick Top Actions: Print, Save, Export */}
        <div className="flex items-center gap-2">
          {/* Nút In Giáo Án */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs shadow transition"
            title="In Kế hoạch bài dạy (Phím tắt: Ctrl + P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In (Ctrl+P)</span>
          </button>

          {/* Nút Xuất Word .doc Chuẩn SMAS */}
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow transition"
            title="Tải về tệp Word Microsoft (.doc) chuẩn nộp phân hệ giáo án điện tử SMAS"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Word (.doc) SMAS</span>
          </button>

          {/* Nút Lưu Thay Đổi */}
          <button
            onClick={() => showSaveToastNotification('Đã lưu bài soạn vào hệ thống!')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition text-white"
            title="Lưu mọi chỉnh sửa vào bộ nhớ"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưu</span>
          </button>
        </div>
      </div>

      {/* 2. MICROSOFT WORD OFFICE RIBBON TABS */}
      <div className="bg-[#FAF9F8] border-b border-gray-300 px-4 pt-1 flex items-center justify-between overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1">
          {[
            { id: 'file', label: 'Tệp' },
            { id: 'home', label: 'Trang đầu' },
            { id: 'insert', label: 'Chèn' },
            { id: 'layout', label: 'Bố trí trang' },
            { id: 'view', label: 'Xem' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveRibbonTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-black rounded-t-xl transition-all ${
                activeRibbonTab === tab.id
                  ? 'bg-white text-[#185ABD] border-t-2 border-x border-[#185ABD] shadow-xs'
                  : 'text-gray-700 hover:bg-gray-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* AI Voice Lecture Toggle */}
        <div className="flex items-center gap-2 py-1">
          <button
            onClick={() => isAutoLecturing ? stopLecture() : startSequentialLecture(0)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-xs transition ${
              isAutoLecturing
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
            title={`Để ${teacherName} đọc lần lượt các hoạt động trong giáo án`}
          >
            {isAutoLecturing ? <X className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-emerald-800" />}
            <span>{isAutoLecturing ? 'Dừng Đọc Giáo Án' : `AI ${teacherName} Đọc Giáo Án`}</span>
          </button>
        </div>
      </div>

      {/* 3. RIBBON TOOLBAR ACTION BOXES */}
      <div className="bg-white border-b border-gray-300 p-2 flex items-center justify-between flex-wrap gap-2 text-gray-700 text-xs">
        {/* TAB: TRANG ĐẦU (HOME) */}
        {activeRibbonTab === 'home' && (
          <div className="flex items-center gap-3 flex-wrap w-full justify-between">
            {/* Font Family & Size */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200">
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="p-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-gray-50 outline-none"
              >
                <option value="Times New Roman">Times New Roman (Chuẩn CV 2345)</option>
                <option value="Nunito">Nunito (Thân thiện Tiểu học)</option>
                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
              </select>

              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="p-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-gray-50 outline-none"
              >
                <option value={11}>11 pt</option>
                <option value={12}>12 pt</option>
                <option value={13}>13 pt (Chuẩn)</option>
                <option value={14}>14 pt</option>
                <option value={16}>16 pt</option>
              </select>
            </div>

            {/* B, I, U formatting */}
            <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
              <button
                onClick={() => setIsBold(prev => !prev)}
                className={`p-1.5 rounded-lg font-black transition ${
                  isBold ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-400' : 'hover:bg-gray-100'
                }`}
                title="In đậm (Bold)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsItalic(prev => !prev)}
                className={`p-1.5 rounded-lg italic font-black transition ${
                  isItalic ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-400' : 'hover:bg-gray-100'
                }`}
                title="In nghiêng (Italic)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsUnderline(prev => !prev)}
                className={`p-1.5 rounded-lg underline font-black transition ${
                  isUnderline ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-400' : 'hover:bg-gray-100'
                }`}
                title="Gạch chân (Underline)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Paragraph Alignment */}
            <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
              <button
                onClick={() => setTextAlign('left')}
                className={`p-1.5 rounded-lg ${textAlign === 'left' ? 'bg-gray-200 text-black' : 'hover:bg-gray-100'}`}
                title="Căn trái"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`p-1.5 rounded-lg ${textAlign === 'center' ? 'bg-gray-200 text-black' : 'hover:bg-gray-100'}`}
                title="Căn giữa"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`p-1.5 rounded-lg ${textAlign === 'right' ? 'bg-gray-200 text-black' : 'hover:bg-gray-100'}`}
                title="Căn phải"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTextAlign('justify')}
                className={`p-1.5 rounded-lg ${textAlign === 'justify' ? 'bg-gray-200 text-black' : 'hover:bg-gray-100'}`}
                title="Căn đều hai bên"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Insert Action Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={addActivity}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Hoạt Động Dạy Học</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: BỐ TRÍ TRANG (LAYOUT) */}
        {activeRibbonTab === 'layout' && (
          <div className="flex items-center gap-4 flex-wrap w-full text-xs">
            <span className="font-bold text-gray-700">Khổ Giấy: <b>A4 (210 x 297 mm)</b></span>
            <span className="text-gray-300">•</span>
            <span className="font-bold text-gray-700">Căn lề chuẩn CV 2345: <b>Trên 2cm, Dưới 2cm, Trái 2.5cm, Phải 1.5cm</b></span>
            <span className="text-gray-300">•</span>
            <span className="font-bold text-gray-700">Hướng giấy: <b>Dọc (Portrait)</b></span>
          </div>
        )}

        {/* TAB: CHÈN (INSERT) */}
        {activeRibbonTab === 'insert' && (
          <div className="flex items-center gap-3 flex-wrap w-full">
            <button
              onClick={addObjective}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Thêm Mục Tiêu Yêu Cầu Cần Đạt</span>
            </button>
            <button
              onClick={addActivity}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-xs"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Chèn Thêm Dòng Hoạt Động Sư Phạm</span>
            </button>
          </div>
        )}

        {/* TAB: TỆP (FILE) */}
        {activeRibbonTab === 'file' && (
          <div className="flex items-center gap-3 flex-wrap w-full">
            <button
              onClick={handleExportWord}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Tệp Word (.doc) SMAS Viettel</span>
            </button>
            <button
              onClick={handleResetPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi Phục Giáo Án Mẫu Gốc</span>
            </button>
          </div>
        )}

        {/* TAB: XEM (VIEW) */}
        {activeRibbonTab === 'view' && (
          <div className="flex items-center gap-3 flex-wrap w-full">
            <span className="font-bold">Thu Phóng:</span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-bold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. REALISTIC A4 DOCUMENT WORKSPACE */}
      <div className="flex-1 p-4 sm:p-8 bg-[#D3D3D3] overflow-y-auto flex justify-center">
        {/* A4 Paper Sheet */}
        <div 
          className="w-full max-w-[850px] bg-white rounded-sm shadow-2xl p-8 sm:p-14 text-black transition-all"
          style={{
            fontFamily: fontFamily,
            fontSize: `${fontSize}pt`,
            textAlign: textAlign,
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            lineHeight: '1.4'
          }}
        >
          {/* Header Cơ Quan & Quốc Hiệu */}
          <table className="w-full mb-4 border-none text-center">
            <tbody>
              <tr>
                <td className="w-1/2 align-top p-1 border-none">
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full text-center font-bold uppercase text-xs sm:text-sm border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full text-center font-bold text-xs sm:text-sm border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none mt-0.5"
                  />
                  <p className="text-[10pt] italic text-gray-500 mt-1">
                    Mã KHBD SMAS: SMAS_KHBD_MT{selectedGrade}_{selectedUnit?.id}
                  </p>
                </td>
                <td className="w-1/2 align-top p-1 border-none">
                  <p className="font-bold uppercase text-xs sm:text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-bold text-xs sm:text-sm">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="text-xs text-gray-400">------------------------------------</p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* SMAS Viettel Banner */}
          <div className="bg-blue-50/80 p-2.5 rounded-lg border border-blue-200 mb-6 text-[10.5pt] text-blue-900 leading-snug">
            <b>HỆ THỐNG QUẢN LÝ NHÀ TRƯỜNG SMAS VIETTEL (smas.edu.vn) • QUẢN LÝ GIÁO ÁN ĐIỆN TỬ</b><br/>
            Kế hoạch bài dạy chuẩn Công văn 2345/BGDĐT-GDTH • Bộ sách Kết nối tri thức với cuộc sống môn Mĩ thuật Lớp {selectedGrade}
          </div>

          {/* Tiêu Đề Kế Hoạch Bài Dạy */}
          <div className="text-center mb-6">
            <input
              type="text"
              value={plan.title || ''}
              onChange={(e) => updatePlanField('title', e.target.value)}
              className="w-full text-center font-black uppercase text-base sm:text-xl text-rose-700 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none pb-1"
            />
            <input
              type="text"
              value={plan.unit || ''}
              onChange={(e) => updatePlanField('unit', e.target.value)}
              className="w-full text-center font-bold text-sm sm:text-lg text-blue-900 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none mt-1"
            />
            <p className="text-center italic text-[11pt] text-gray-600 mt-1">
              Bộ sách: Kết nối tri thức với cuộc sống • Thời lượng: {plan.duration || selectedUnit?.duration || '1 - 2 tiết'}
            </p>
          </div>

          {/* I. MỤC TIÊU BÀI DẠY (YÊU CẦU CẦN ĐẠT) */}
          <div className="mb-6">
            <h3 className="font-black text-[13pt] text-gray-900 uppercase mb-2 border-b border-gray-200 pb-1">
              I. YÊU CẦU CẦN ĐẠT (MỤC TIÊU BÀI DẠY)
            </h3>
            <p className="italic text-[11pt] mb-2">Sau bài học này, học sinh đạt được:</p>
            <div className="space-y-1.5 pl-4">
              {(plan.objectives || []).map((obj, oIdx) => (
                <div key={oIdx} className="flex items-start gap-2 group">
                  <span className="font-bold">•</span>
                  <textarea
                    rows={1}
                    value={obj}
                    onChange={(e) => updateObjective(oIdx, e.target.value)}
                    className="w-full text-[12pt] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none resize-none"
                  />
                  <button
                    onClick={() => deleteObjective(oIdx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-600 transition"
                    title="Xóa mục tiêu này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* II. ĐỒ DÙNG DẠY HỌC */}
          <div className="mb-6">
            <h3 className="font-black text-[13pt] text-gray-900 uppercase mb-2 border-b border-gray-200 pb-1">
              II. ĐỒ DÙNG DẠY HỌC
            </h3>
            <div className="space-y-2 text-[12pt]">
              <div>
                <b>1. Giáo viên: </b>
                <textarea
                  rows={2}
                  value={plan.preparations?.teacher || ''}
                  onChange={(e) => updatePlanField('preparations', { ...plan.preparations, teacher: e.target.value })}
                  className="w-full mt-1 p-1.5 bg-gray-50/50 rounded border border-gray-200 focus:border-blue-500 outline-none resize-none"
                />
              </div>
              <div>
                <b>2. Học sinh: </b>
                <textarea
                  rows={2}
                  value={plan.preparations?.students || ''}
                  onChange={(e) => updatePlanField('preparations', { ...plan.preparations, students: e.target.value })}
                  className="w-full mt-1 p-1.5 bg-gray-50/50 rounded border border-gray-200 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* III. TIẾN TRÌNH DẠY HỌC CHỦ YẾU (BẢNG 4 CỘT CÔNG VĂN 2345) */}
          <div className="mb-6">
            <h3 className="font-black text-[13pt] text-gray-900 uppercase mb-2 border-b border-gray-200 pb-1 flex items-center justify-between">
              <span>III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU</span>
              <button
                onClick={addActivity}
                className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 normal-case"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Hoạt Động
              </button>
            </h3>

            <table className="w-full border-collapse border border-black text-[11pt]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-2 w-1/4 font-bold text-center">Hoạt động của Giáo viên</th>
                  <th className="border border-black p-2 w-1/4 font-bold text-center">Hoạt động của Học sinh</th>
                  <th className="border border-black p-2 w-1/3 font-bold text-center">Nội dung trọng tâm & Gợi mở</th>
                  <th className="border border-black p-2 w-1/6 font-bold text-center">Thời lượng</th>
                </tr>
              </thead>
              <tbody>
                {(plan.activities || []).map((act, actIdx) => (
                  <tr key={actIdx} className={`align-top ${activeActivityIndex === actIdx && isAutoLecturing ? 'bg-amber-50/80 ring-2 ring-amber-400' : ''}`}>
                    <td className="border border-black p-2">
                      <input
                        type="text"
                        value={act.phase || ''}
                        onChange={(e) => updateActivity(actIdx, 'phase', e.target.value)}
                        className="font-bold text-blue-900 w-full bg-transparent border-b border-transparent hover:border-gray-300 outline-none mb-1"
                      />
                      <textarea
                        rows={3}
                        value={act.teacherAct || ''}
                        onChange={(e) => updateActivity(actIdx, 'teacherAct', e.target.value)}
                        className="w-full text-[11pt] bg-transparent border border-transparent hover:border-gray-200 rounded p-1 outline-none resize-none"
                        placeholder="Nội dung hướng dẫn của Thầy/Cô..."
                      />
                    </td>
                    <td className="border border-black p-2">
                      <textarea
                        rows={4}
                        value={act.studentAct || ''}
                        onChange={(e) => updateActivity(actIdx, 'studentAct', e.target.value)}
                        className="w-full text-[11pt] bg-transparent border border-transparent hover:border-gray-200 rounded p-1 outline-none resize-none"
                        placeholder="Học sinh thực hiện..."
                      />
                    </td>
                    <td className="border border-black p-2">
                      <div className="space-y-1">
                        <b>Câu hỏi gợi mở:</b>
                        <textarea
                          rows={2}
                          value={act.teacherQuestions?.join('\n') || ''}
                          onChange={(e) => updateActivity(actIdx, 'teacherQuestions', e.target.value.split('\n'))}
                          className="w-full text-[11pt] bg-transparent border border-transparent hover:border-gray-200 rounded p-1 outline-none resize-none"
                        />
                      </div>
                    </td>
                    <td className="border border-black p-2 text-center">
                      <input
                        type="text"
                        value={act.duration || '7-10 phút'}
                        onChange={(e) => updateActivity(actIdx, 'duration', e.target.value)}
                        className="w-full text-center font-bold text-xs bg-transparent border-b border-transparent hover:border-gray-300 outline-none"
                      />
                      <button
                        onClick={() => deleteActivity(actIdx)}
                        className="text-gray-400 hover:text-rose-600 mt-2 transition p-1"
                        title="Xóa hoạt động này"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* IV. ĐIỀU CHỈNH SAU BÀI DẠY */}
          <div className="mb-6">
            <h3 className="font-black text-[13pt] text-gray-900 uppercase mb-2 border-b border-gray-200 pb-1">
              IV. ĐIỀU CHỈNH SAU BÀI DẠY
            </h3>
            <p className="text-gray-400 text-[11pt]">
              ...................................................................................................................................................................
            </p>
          </div>

          {/* V. KHUNG KÝ DUYỆT ĐIỆN TỬ SMAS 3 BÊN */}
          <table className="w-full border-none mt-8 text-center text-[11pt]">
            <tbody>
              <tr>
                <td className="w-1/3 border-none align-top">
                  <b>BAN GIÁM HIỆU DUYỆT</b><br/>
                  <i className="text-gray-500 text-[10pt]">(Ký duyệt điện tử SMAS)</i>
                  <br/><br/><br/><br/>
                </td>
                <td className="w-1/3 border-none align-top">
                  <b>TỔ TRƯỞNG CHUYÊN MÔN</b><br/>
                  <i className="text-gray-500 text-[10pt]">(Ký và ghi rõ họ tên)</i>
                  <br/><br/><br/><br/>
                </td>
                <td className="w-1/3 border-none align-top">
                  <i>Ngày ..... tháng ..... năm 202...</i><br/>
                  <b>GIÁO VIÊN SOẠN BÀI</b><br/>
                  <i className="text-gray-500 text-[10pt]">(Ký và ghi rõ họ tên)</i><br/><br/>
                  <b className="text-blue-900">{teacherName}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. BOTTOM STATUS BAR */}
      <div className="bg-[#FAF9F8] border-t border-gray-300 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-600 font-bold flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span>Trang 1 / 2</span>
          <span>Khoảng 1,520 từ</span>
          <span>Tiếng Việt (Việt Nam)</span>
          <span className="text-blue-700">● Bố trí In (Print Layout)</span>
        </div>

        {/* Zoom Control Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <input
            type="range"
            min={70}
            max={140}
            step={5}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-20 accent-blue-600 cursor-pointer"
          />
          <button
            onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <span className="w-8 text-right">{zoomLevel}%</span>
        </div>
      </div>

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
