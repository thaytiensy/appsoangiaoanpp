import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Award, 
  Layers, 
  Search, 
  SlidersHorizontal,
  Info,
  Building,
  School,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
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

  // Danh sách học sinh theo lớp
  const [students, setStudents] = useState(() => {
    return generateDefaultSmasStudents(selectedGrade, `${selectedGrade}A`);
  });

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
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.studentCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || s.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

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
        // Xáo trộn ngẫu nhiên nhận xét sư phạm
        const randomComment = pool[(idx + Math.floor(Math.random() * pool.length)) % pool.length];
        return {
          ...s,
          comment: randomComment
        };
      });
    });
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
  };

  return (
    <div className={`flex flex-col gap-4 max-w-7xl mx-auto p-3 sm:p-6 bg-white rounded-3xl shadow-xl border-4 border-[#107C41] ${isTvMode ? 'text-base' : ''}`}>
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTemplate}
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
            title="Tải biểu mẫu Excel trắng chuẩn SMAS để điền thủ công"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mẫu Trắng SMAS</span>
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
              Tự động hóa nhận xét sư phạm, chuẩn hóa định dạng bảng tính để import trực tiếp 1 click vào cổng SMAS Viettel.
            </p>
          </div>
        </div>

        {/* Quick Action: AI Tự Động Sinh Nhận Xét */}
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

      {/* 2. Bộ Lọc Điều Khiển & Cấu Hình Thông Tin SMAS */}
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

        {/* Giáo Viên Phụ Trách */}
        <div>
          <label className="font-black text-emerald-900 block mb-1">
            👨‍🏫 Giáo Viên Bộ Môn:
          </label>
          <input
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="w-full p-2 rounded-xl border-2 border-emerald-300 font-bold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Tên Thầy / Cô..."
          />
        </div>
      </div>

      {/* 3. Thẻ Thống Kê Nhanh Tỷ Lệ Đạt Được (Chuẩn Thông tư 27) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border-2 border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black text-gray-500 uppercase block">Tổng Số Học Sinh</span>
            <span className="text-2xl font-black text-gray-900">{students.length}</span>
            <span className="text-[11px] font-bold text-gray-400 block">Sĩ số lớp {className}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">👥</div>
        </div>

        <div className="bg-emerald-50 p-3.5 rounded-2xl border-2 border-emerald-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black text-emerald-700 uppercase block">Hoàn Thành Tốt (T)</span>
            <span className="text-2xl font-black text-emerald-900">{countT}</span>
            <span className="text-[11px] font-bold text-emerald-600 block">Tỷ lệ: {Math.round((countT / total) * 100)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center font-black text-base shadow-inner">T</div>
        </div>

        <div className="bg-blue-50 p-3.5 rounded-2xl border-2 border-blue-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black text-blue-700 uppercase block">Hoàn Thành (H)</span>
            <span className="text-2xl font-black text-blue-900">{countH}</span>
            <span className="text-[11px] font-bold text-blue-600 block">Tỷ lệ: {Math.round((countH / total) * 100)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-200 text-blue-900 flex items-center justify-center font-black text-base shadow-inner">H</div>
        </div>

        <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black text-amber-700 uppercase block">Chưa Hoàn Thành (C)</span>
            <span className="text-2xl font-black text-amber-900">{countC}</span>
            <span className="text-[11px] font-bold text-amber-600 block">Tỷ lệ: {Math.round((countC / total) * 100)}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-black text-base shadow-inner">C</div>
        </div>
      </div>

      {/* 4. Thanh Tìm Kiếm & AI Tự Động Sinh Nhận Xét */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh hoặc mã SMAS..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {['all', 'T', 'H', 'C'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                  filterLevel === lvl
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lvl === 'all' ? 'Tất cả' : lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAiGenerateAllComments}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow transition hover:scale-102 active:scale-98"
            title="Sử dụng AI sinh ngẫu nhiên nhận xét chuẩn Thông tư 27 không trùng lặp cho cả lớp"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Tự Động Tạo Nhận Xét Cả Lớp</span>
          </button>
        </div>
      </div>

      {/* 5. Bảng Nhập Điểm & Nhận Xét Chi Tiết Chuẩn SMAS Viettel */}
      <div className="overflow-x-auto rounded-2xl border-2 border-emerald-300 shadow-sm max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white font-black">
            <tr>
              <th className="p-3 border border-emerald-600 text-center w-12">STT</th>
              <th className="p-3 border border-emerald-600 w-28">Mã Học Sinh</th>
              <th className="p-3 border border-emerald-600 w-44">Họ và Tên</th>
              <th className="p-3 border border-emerald-600 text-center w-20">Giới Tính</th>
              <th className="p-3 border border-emerald-600 text-center w-32">Mức Đạt (T / H / C)</th>
              <th className="p-3 border border-emerald-600 min-w-[320px]">
                Nội Dung Nhận Xét Sư Phạm (Chuẩn TT 27 & SMAS Viettel)
              </th>
              <th className="p-3 border border-emerald-600 text-center w-24">NL Thẩm Mĩ</th>
              <th className="p-3 border border-emerald-600 text-center w-24">NL Sáng Tạo</th>
              <th className="p-3 border border-emerald-600 text-center w-24">Phẩm Chất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white font-sans">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s, idx) => (
                <tr key={s.studentCode} className={idx % 2 === 0 ? 'bg-white hover:bg-emerald-50/40' : 'bg-gray-50/70 hover:bg-emerald-50/40'}>
                  <td className="p-2.5 border border-gray-200 text-center font-bold text-gray-500">
                    {s.stt}
                  </td>
                  <td className="p-2.5 border border-gray-200 font-mono text-[11px] font-bold text-indigo-900">
                    {s.studentCode}
                  </td>
                  <td className="p-2.5 border border-gray-200 font-black text-gray-900">
                    {s.fullName}
                    <span className="block text-[10px] font-normal text-gray-400">{s.dob}</span>
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
                          title={`Chọn mức ${lvl === 'T' ? 'Hoàn thành Tốt' : lvl === 'H' ? 'Hoàn thành' : 'Chưa hoàn thành'}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-2 border border-gray-200">
                    <textarea
                      rows={2}
                      value={s.comment}
                      onChange={(e) => handleCommentChange(s.stt - 1, e.target.value)}
                      className="w-full p-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                      placeholder="Nhập lời nhận xét sư phạm..."
                    />
                  </td>
                  <td className="p-2.5 border border-gray-200 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md font-black text-[11px] ${
                      s.aestheticCapacity === 'T' ? 'bg-emerald-100 text-emerald-800' : s.aestheticCapacity === 'Đ' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.aestheticCapacity}
                    </span>
                  </td>
                  <td className="p-2.5 border border-gray-200 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md font-black text-[11px] ${
                      s.creativeCapacity === 'T' ? 'bg-emerald-100 text-emerald-800' : s.creativeCapacity === 'Đ' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.creativeCapacity}
                    </span>
                  </td>
                  <td className="p-2.5 border border-gray-200 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md font-black text-[11px] ${
                      s.qualities === 'T' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {s.qualities}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-8 text-center text-gray-500 font-bold">
                  Không tìm thấy học sinh nào phù hợp với từ khóa "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 6. Ghi Chú Hướng Dẫn Kỹ Thuật Nộp Lên Cổng SMAS Viettel */}
      <div className="p-4 bg-amber-50/80 rounded-2xl border-2 border-amber-200 flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-black text-amber-900">
            📌 Hướng Dẫn Đồng Bộ Dữ Liệu Lên Hệ Thống Quản Lý Nhà Trường SMAS Viettel:
          </p>
          <p>
            1. Bấm nút <b>"Xuất File Excel (.xlsx) SMAS Viettel"</b> để tải bảng điểm và nhận xét về máy tính.
          </p>
          <p>
            2. Đăng nhập vào tài khoản giáo viên tại trang web: <a href="https://smas.edu.vn" target="_blank" rel="noreferrer" className="font-bold text-blue-600 underline">smas.edu.vn</a>.
          </p>
          <p>
            3. Vào mục <b>"Quản trị học tập" ➔ "Đánh giá định kỳ môn học" ➔ Chọn môn "Mĩ thuật" ➔ Bấm "Nhập từ Excel"</b> và tải file vừa xuất lên. Hệ thống sẽ tự động đồng bộ 100% không cần gõ lại.
          </p>
        </div>
      </div>
    </div>
  );
}
