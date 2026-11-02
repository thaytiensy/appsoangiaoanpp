import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import { 
  exportSmasExcel, 
  generateDefaultSmasStudents, 
  SMAS_COMMENT_BANK 
} from '../services/smasExport';

export default function SmasExcelView({ 
  selectedGrade = 1, 
  selectedUnit, 
  teacher = { name: 'Thầy Cọ Nhí', title: 'Thầy giáo' },
  isTvMode = false 
}) {
  const [grade, setGrade] = useState(selectedGrade);
  const [className, setClassName] = useState(`${selectedGrade}A`);
  const [semester, setSemester] = useState('Cuối Học kỳ 1');
  const [schoolName, setSchoolName] = useState('Trường Tiểu Học Tân Phong');
  const [teacherName, setTeacherName] = useState(teacher.name || 'Thầy Cọ Nhí');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all'); // 'all' | 'T' | 'H' | 'C'
  const [toastMsg, setToastMsg] = useState(null);

  const excelInputRef = useRef(null);

  // Danh sách học sinh theo lớp
  const [students, setStudents] = useState(() => {
    return generateDefaultSmasStudents(selectedGrade, `${selectedGrade}A`);
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Cập nhật khi đổi khối lớp từ bên ngoài
  useEffect(() => {
    setGrade(selectedGrade);
    const newClass = `${selectedGrade}A`;
    setClassName(newClass);
    setStudents(generateDefaultSmasStudents(selectedGrade, newClass));
  }, [selectedGrade]);

  // Thống kê nhanh theo Thông tư 27
  const countT = students.filter(s => s.level === 'T').length;
  const countH = students.filter(s => s.level === 'H').length;
  const countC = students.filter(s => s.level === 'C').length;
  const total = students.length || 1;

  // Lọc học sinh theo tìm kiếm và mức đạt
  const filteredStudents = students.filter((s) => {
    const matchesSearch = (s.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.studentCode || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || s.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  // TẢI LÊN FILE EXCEL (.xlsx / .xls / .csv) THỰC TẾ TỪ CỔNG SMAS
  const handleUploadExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const parsedStudents = [];
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 2) continue;

          const col0 = String(row[0] || '').trim();
          const col1 = String(row[1] || '').trim();
          const col2 = String(row[2] || '').trim();

          const sttNum = parseInt(col0, 10);
          if (!isNaN(sttNum) && (col1.length > 2 || col2.length > 2)) {
            const hasSmasCode = col1.toUpperCase().startsWith('SMAS') || col1.toUpperCase().startsWith('HS');
            const studentCode = hasSmasCode ? col1 : `SMAS26${grade}${String(parsedStudents.length + 1).padStart(3, '0')}`;
            const fullName = hasSmasCode ? col2 : col1;
            const birthDate = String(row[3] || '15/09/2018');
            const gender = String(row[4] || (parsedStudents.length % 2 === 0 ? 'Nam' : 'Nữ'));
            const rawLvl = String(row[5] || '').toUpperCase();
            const level = ['T', 'H', 'C'].includes(rawLvl) ? rawLvl : 'H';
            const commentsPool = SMAS_COMMENT_BANK[level] || SMAS_COMMENT_BANK.H;
            const comment = String(row[6] || commentsPool[parsedStudents.length % commentsPool.length]);

            parsedStudents.push({
              stt: parsedStudents.length + 1,
              studentCode,
              fullName,
              birthDate,
              gender,
              level,
              comment,
              aestheticCapacity: level === 'C' ? 'CĐ' : (level === 'T' ? 'T' : 'Đ'),
              creativeCapacity: level === 'C' ? 'CĐ' : (level === 'T' ? 'T' : 'Đ'),
              qualities: level === 'C' ? 'Đ' : 'T'
            });
          }
        }

        if (parsedStudents.length > 0) {
          setStudents(parsedStudents);
          showToast(`Đã tải lên & nạp thành công ${parsedStudents.length} học sinh từ file: ${file.name}!`);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } else {
          alert('Không tìm thấy danh sách học sinh hợp lệ. Vui lòng đảm bảo file Excel có cột STT và Họ tên!');
        }
      } catch (err) {
        console.error('Lỗi phân tích Excel:', err);
        alert('Không thể đọc file Excel. Vui lòng dùng định dạng chuẩn SMAS (.xlsx).');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Thêm học sinh mới thủ công
  const handleAddNewStudent = () => {
    const nextStt = students.length + 1;
    const newStudent = {
      stt: nextStt,
      studentCode: `SMAS26${grade}${String(nextStt).padStart(3, '0')}`,
      fullName: 'Học sinh mới',
      birthDate: '01/01/2018',
      gender: nextStt % 2 === 0 ? 'Nam' : 'Nữ',
      level: 'H',
      comment: SMAS_COMMENT_BANK.H[0],
      aestheticCapacity: 'Đ',
      creativeCapacity: 'Đ',
      qualities: 'T'
    };
    setStudents(prev => [...prev, newStudent]);
    showToast('Đã thêm 1 học sinh mới vào danh sách lớp!');
  };

  // Xóa học sinh
  const handleDeleteStudent = (stt) => {
    setStudents(prev => prev.filter(s => s.stt !== stt).map((s, idx) => ({ ...s, stt: idx + 1 })));
  };

  // Cập nhật tên hoặc mã học sinh
  const handleUpdateStudentInfo = (idx, field, value) => {
    setStudents(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  // Thay đổi mức đánh giá của 1 học sinh
  const handleLevelChange = (idx, newLevel) => {
    setStudents(prev => {
      const updated = [...prev];
      const comments = SMAS_COMMENT_BANK[newLevel];
      const newComment = comments[idx % comments.length];
      updated[idx] = {
        ...updated[idx],
        level: newLevel,
        comment: newComment,
        aestheticCapacity: newLevel === 'C' ? 'CĐ' : (newLevel === 'T' ? 'T' : 'Đ'),
        creativeCapacity: newLevel === 'C' ? 'CĐ' : (newLevel === 'T' ? 'T' : 'Đ'),
        qualities: newLevel === 'C' ? 'Đ' : 'T'
      };
      return updated;
    });
  };

  // Thay đổi nội dung nhận xét trực tiếp
  const handleCommentChange = (idx, newComment) => {
    setStudents(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], comment: newComment };
      return updated;
    });
  };

  // AI tự động sinh nhận xét phong phú toàn bộ lớp
  const handleAiGenerateAllComments = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setStudents(prev => {
      return prev.map((s, idx) => {
        const pool = SMAS_COMMENT_BANK[s.level] || SMAS_COMMENT_BANK.H;
        const randomComment = pool[(idx + Math.floor(Math.random() * pool.length)) % pool.length];
        return {
          ...s,
          comment: randomComment
        };
      });
    });
    showToast('AI đã tạo nhận xét cá nhân hóa cho toàn bộ lớp!');
  };

  // Xuất file Excel (.xlsx) chuẩn SMAS Viettel
  const handleExportExcel = () => {
    exportSmasExcel({
      grade,
      className,
      semester,
      schoolName,
      teacherName,
      unitTitle: selectedUnit?.title || 'Mĩ thuật trong nhà trường',
      students
    });

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.5 }
    });
    showToast('Đã xuất file Excel (.xlsx) chuẩn import SMAS Viettel!');
  };

  // Tải file mẫu trắng (Template) SMAS Viettel
  const handleExportTemplate = () => {
    const emptyStudents = students.map(s => ({
      ...s,
      level: '',
      comment: '',
      aestheticCapacity: '',
      creativeCapacity: '',
      qualities: ''
    }));

    exportSmasExcel({
      grade,
      className,
      semester,
      schoolName,
      teacherName,
      unitTitle: selectedUnit?.title || 'Mẫu nhập điểm trắng',
      students: emptyStudents
    });
    showToast('Đã tải mẫu Excel trắng SMAS!');
  };

  return (
    <div className={`flex flex-col gap-4 max-w-7xl mx-auto p-3 sm:p-6 bg-white rounded-3xl shadow-xl border-4 border-[#107C41] ${isTvMode ? 'text-base' : ''}`}>
      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={excelInputRef}
        onChange={handleUploadExcel}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* 1. MICROSOFT 365 EXCEL TOP BAR */}
      <div className="bg-[#107C41] text-white px-4 py-2 rounded-2xl flex items-center justify-between border-b border-[#0b5e31] shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0b5e31] px-2.5 py-1 rounded-xl text-xs font-black shadow-inner">
            <span className="w-5 h-5 rounded-lg bg-white text-[#107C41] font-black flex items-center justify-center text-xs shadow-xs">
              X
            </span>
            <span>Excel</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white/95">
              So_Danh_Gia_Mi_Thuat_Lop_{grade}_{className}.xlsx - Excel (SMAS Viettel)
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-white/80 bg-white/15 px-2 py-0.5 rounded-md font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Chuẩn Thông tư 27/2020/TT-BGDĐT
            </span>
          </div>
        </div>

        {/* Quick Top Actions: Upload Excel, Export Template, Export Excel */}
        <div className="flex items-center gap-2">
          {/* NÚT TẢI LÊN EXCEL TỪ MÁY TÍNH */}
          <button
            onClick={() => excelInputRef.current?.click()}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-black text-xs rounded-xl border border-white/30 transition flex items-center gap-1.5 hover:scale-105"
            title="Tải lên file Excel (.xlsx / .xls) danh sách học sinh từ máy tính hoặc cổng SMAS"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải Lên Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportTemplate}
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
            title="Tải biểu mẫu Excel trắng chuẩn SMAS để điền thủ công"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mẫu Trắng</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-md hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
            title="Xuất file Excel (.xlsx) chuẩn cấu trúc import của SMAS Viettel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel (.xlsx) SMAS</span>
          </button>
        </div>
      </div>

      {/* 2. Header Banner Chuẩn SMAS Viettel */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-5 rounded-2xl text-white shadow-md flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 sm:w-14 sm:h-14 bg-white/10 rounded-2xl border-2 border-emerald-300 flex items-center justify-center text-3xl shadow-inner backdrop-blur-md shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-[11px] tracking-wide uppercase">
                Hệ Thống Quản Lý Nhà Trường SMAS Viettel (smas.edu.vn)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] shadow-sm">
                Chuẩn Thông Tư 27/2020/TT-BGDĐT 🎒
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
              Sổ Đánh Giá & Xuất Excel Mĩ Thuật Chuẩn SMAS Viettel
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-emerald-100 mt-0.5">
              Tải lên file danh sách lớp từ máy tính hoặc bấm AI tự động điền nhận xét sư phạm để xuất file import 1 click vào cổng SMAS.
            </p>
          </div>
        </div>

        {/* Action: AI Điền Nhận Xét */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAiGenerateAllComments}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-2"
            title="Sử dụng AI sinh ngẫu nhiên nhận xét chuẩn Thông tư 27 không trùng lặp cho cả lớp"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Tự Động Điền Nhận Xét</span>
          </button>
        </div>
      </div>

      {/* 3. Bộ Lọc Điều Khiển & Cấu Hình Thông Tin SMAS */}
      <div className="bg-emerald-50/70 p-4 rounded-2xl border-2 border-emerald-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Chọn Khối Lớp */}
        <div>
          <label className="font-black text-emerald-900 block mb-1">
            🏫 Khối Lớp Học:
          </label>
          <select
            value={grade}
            onChange={(e) => {
              const g = parseInt(e.target.value, 10);
              setGrade(g);
              const newClass = `${g}A`;
              setClassName(newClass);
              setStudents(generateDefaultSmasStudents(g, newClass));
            }}
            className="w-full p-2 rounded-xl border-2 border-emerald-300 font-bold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {[1, 2, 3, 4, 5].map(g => (
              <option key={g} value={g}>Lớp {g} (GDPT 2018)</option>
            ))}
          </select>
        </div>

        {/* Chọn Tên Lớp */}
        <div>
          <label className="font-black text-emerald-900 block mb-1">
            🏷️ Lớp Học Cụ Thể:
          </label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full p-2 rounded-xl border-2 border-emerald-300 font-bold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {['A', 'B', 'C', 'D', 'E'].map(sub => (
              <option key={sub} value={`${grade}${sub}`}>Lớp {grade}{sub}</option>
            ))}
          </select>
        </div>

        {/* Chọn Kỳ Đánh Giá */}
        <div>
          <label className="font-black text-emerald-900 block mb-1">
            ⏱️ Kỳ Đánh Giá SMAS:
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full p-2 rounded-xl border-2 border-emerald-300 font-bold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="Giữa Học kỳ 1">Giữa Học kỳ 1 (Giữa HK1)</option>
            <option value="Cuối Học kỳ 1">Cuối Học kỳ 1 (Cuối HK1)</option>
            <option value="Giữa Học kỳ 2">Giữa Học kỳ 2 (Giữa HK2)</option>
            <option value="Cuối Học kỳ 2 (Cả năm)">Cuối Học kỳ 2 (Cả năm)</option>
          </select>
        </div>

        {/* Tên Trường */}
        <div>
          <label className="font-black text-emerald-900 block mb-1">
            🏛️ Tên Trường Tiểu Học:
          </label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full p-2 rounded-xl border-2 border-emerald-300 font-bold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Nhập tên trường..."
          />
        </div>

        {/* Giáo Viên Giảng Dạy */}
        <div>
          <label className="font-black text-emerald-900 block mb-1">
            👨‍🏫 Giáo Viên Đánh Giá:
          </label>
          <input
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="w-full p-2 rounded-xl border-2 border-emerald-300 font-bold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Tên giáo viên..."
          />
        </div>
      </div>

      {/* 4. Thống Kê Nhanh Tỉ Lệ T / H / C */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <span className="text-gray-500 font-bold block">Tổng Số Học Sinh</span>
          <span className="text-xl font-black text-slate-800">{students.length} em</span>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
          <span className="text-emerald-700 font-bold block">Hoàn thành Tốt (T)</span>
          <span className="text-xl font-black text-emerald-800">{countT} em ({Math.round(countT / total * 100)}%)</span>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
          <span className="text-blue-700 font-bold block">Hoàn thành (H)</span>
          <span className="text-xl font-black text-blue-800">{countH} em ({Math.round(countH / total * 100)}%)</span>
        </div>
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
          <span className="text-amber-700 font-bold block">Chưa hoàn thành (C)</span>
          <span className="text-xl font-black text-amber-800">{countC} em ({Math.round(countC / total * 100)}%)</span>
        </div>
      </div>

      {/* 5. Toolbar Bảng: Tìm kiếm, Lọc, Thêm học sinh */}
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, mã số..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 font-medium outline-none focus:border-emerald-500 w-60 bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {['all', 'T', 'H', 'C'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg font-black transition ${
                  filterLevel === lvl ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lvl === 'all' ? 'Tất cả' : lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Thêm Học Sinh Mới */}
          <button
            onClick={handleAddNewStudent}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Học Sinh</span>
          </button>
        </div>
      </div>

      {/* 6. Bảng Nhập Điểm & Nhận Xét Chi Tiết Chuẩn SMAS Viettel */}
      <div className="overflow-x-auto rounded-2xl border-2 border-emerald-300 shadow-sm max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white font-black">
            <tr>
              <th className="p-3 border border-emerald-600 text-center w-12">STT</th>
              <th className="p-3 border border-emerald-600 w-28">Mã Học Sinh</th>
              <th className="p-3 border border-emerald-600 w-48">Họ và Tên</th>
              <th className="p-3 border border-emerald-600 text-center w-20">Giới Tính</th>
              <th className="p-3 border border-emerald-600 text-center w-32">Mức Đạt (T / H / C)</th>
              <th className="p-3 border border-emerald-600 min-w-[320px]">
                Nội Dung Nhận Xét Sư Phạm (Chuẩn TT 27 & SMAS Viettel)
              </th>
              <th className="p-3 border border-emerald-600 text-center w-20">NL Thẩm Mĩ</th>
              <th className="p-3 border border-emerald-600 text-center w-20">NL Sáng Tạo</th>
              <th className="p-3 border border-emerald-600 text-center w-20">Phẩm Chất</th>
              <th className="p-3 border border-emerald-600 text-center w-12">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white font-sans">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s, idx) => (
                <tr key={s.stt} className={idx % 2 === 0 ? 'bg-white hover:bg-emerald-50/40' : 'bg-gray-50/70 hover:bg-emerald-50/40'}>
                  <td className="p-2.5 border border-gray-200 text-center font-bold text-gray-500">
                    {s.stt}
                  </td>
                  <td className="p-2.5 border border-gray-200">
                    <input
                      type="text"
                      value={s.studentCode}
                      onChange={(e) => handleUpdateStudentInfo(s.stt - 1, 'studentCode', e.target.value)}
                      className="font-mono text-[11px] font-bold text-indigo-900 bg-transparent outline-none w-full border-b border-transparent hover:border-gray-300"
                    />
                  </td>
                  <td className="p-2.5 border border-gray-200">
                    <input
                      type="text"
                      value={s.fullName}
                      onChange={(e) => handleUpdateStudentInfo(s.stt - 1, 'fullName', e.target.value)}
                      className="font-black text-gray-900 bg-transparent outline-none w-full border-b border-transparent hover:border-gray-300"
                    />
                    <span className="block text-[10px] text-gray-400">{s.birthDate}</span>
                  </td>
                  <td className="p-2.5 border border-gray-200 text-center font-bold text-gray-600">
                    {s.gender}
                  </td>
                  <td className="p-2.5 border border-gray-200 text-center">
                    <div className="inline-flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-300">
                      {['T', 'H', 'C'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => handleLevelChange(s.stt - 1, lvl)}
                          className={`w-7 h-7 rounded-lg font-black text-xs transition ${
                            s.level === lvl
                              ? lvl === 'T'
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : lvl === 'H'
                                ? 'bg-blue-500 text-white shadow-xs'
                                : 'bg-amber-500 text-white shadow-xs'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-2.5 border border-gray-200">
                    <textarea
                      rows={2}
                      value={s.comment}
                      onChange={(e) => handleCommentChange(s.stt - 1, e.target.value)}
                      className="w-full p-2 bg-gray-50/70 hover:bg-white focus:bg-white border border-gray-200 focus:border-emerald-500 rounded-xl outline-none transition text-xs leading-relaxed"
                    />
                  </td>
                  <td className="p-2.5 border border-gray-200 text-center font-black">
                    <span className={`px-2 py-0.5 rounded-lg text-xs ${s.aestheticCapacity === 'T' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {s.aestheticCapacity}
                    </span>
                  </td>
                  <td className="p-2.5 border border-gray-200 text-center font-black">
                    <span className={`px-2 py-0.5 rounded-lg text-xs ${s.creativeCapacity === 'T' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {s.creativeCapacity}
                    </span>
                  </td>
                  <td className="p-2.5 border border-gray-200 text-center font-black">
                    <span className="px-2 py-0.5 rounded-lg text-xs bg-purple-100 text-purple-800">
                      {s.qualities}
                    </span>
                  </td>
                  <td className="p-2.5 border border-gray-200 text-center">
                    <button
                      onClick={() => handleDeleteStudent(s.stt)}
                      className="p-1 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded transition"
                      title="Xóa học sinh này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-8 text-center text-gray-400 font-bold">
                  Không tìm thấy học sinh nào phù hợp với từ khóa tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Save / Upload Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2 text-xs font-black animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
