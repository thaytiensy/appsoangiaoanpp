'use client';

import React, { useState } from 'react';
import { Wand2, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { ALL_GDPT_SUBJECTS, ALL_GRADES } from '@/lib/pedagogical-knowledge';
import { SlideThemeSelector } from './SlideThemeSelector';
import { TeacherSchoolFields } from './TeacherSchoolFields';
import { LessonGeneratorParams } from '@/lib/ai-lesson-generator';

interface LessonInputPanelProps {
  onGenerate: (params: LessonGeneratorParams) => void;
  isGenerating?: boolean;
  defaultTeacherName: string;
  defaultSchoolName: string;
  defaultSubject: string;
}

export function LessonInputPanel({
  onGenerate,
  isGenerating = false,
  defaultTeacherName,
  defaultSchoolName,
  defaultSubject,
}: LessonInputPanelProps) {
  const [topic, setTopic] = useState('Phương trình bậc hai và Ứng dụng thực tế');
  const [subject, setSubject] = useState(defaultSubject || 'Toán học');
  const [grade, setGrade] = useState('Lớp 10');
  const [teacherName, setTeacherName] = useState(defaultTeacherName || 'Thầy Đỗ Tiến Sỹ');
  const [schoolName, setSchoolName] = useState(defaultSchoolName || 'THPT Chuyên Lê Hồng Phong');
  const [departmentName, setDepartmentName] = useState('Tổ Toán học');
  const [themeId, setThemeId] = useState('TECH_DARK');
  const [customBgUrl, setCustomBgUrl] = useState<string | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({
      topic,
      subject,
      grade,
      teacherName,
      schoolName,
      departmentName,
      themeId,
      customBackgroundUrl: customBgUrl,
      duration: 45,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Thông Tin Bài Dạy Chuẩn GDPT</h2>
            <p className="text-xs text-slate-500">Chỉ cần nhập thông tin cơ bản, AI tự động hoàn thiện toàn bộ giáo án</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          AI Generator 2026
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chủ đề bài học */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Chủ Đề / Tên Bài Dạy
          </label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            placeholder="Ví dụ: Định luật bảo toàn cơ năng, Nghệ thuật miêu tả tâm trạng..."
          />
        </div>

        {/* Môn học & Lớp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              Môn Học (18 Môn GDPT)
            </label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setDepartmentName(`Tổ ${e.target.value}`);
              }}
              className="w-full text-xs font-medium px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {ALL_GDPT_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              Khối Lớp
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full text-xs font-medium px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tên giáo viên, Trường, Tổ chuyên môn */}
        <TeacherSchoolFields
          teacherName={teacherName}
          onChangeTeacherName={setTeacherName}
          schoolName={schoolName}
          onChangeSchoolName={setSchoolName}
          departmentName={departmentName}
          onChangeDepartmentName={setDepartmentName}
        />

        {/* Mẫu Slide & Tải lên */}
        <SlideThemeSelector
          selectedThemeId={themeId}
          onSelectTheme={setThemeId}
          onUploadCustomTheme={(_name, dataUrl) => {
            setCustomBgUrl(dataUrl);
            setThemeId('MINIMAL_SLATE');
          }}
        />

        {/* Nút Tạo Giáo Án AI */}
        <button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white font-bold text-sm shadow-md hover:from-indigo-500 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isGenerating ? 'Đang Khởi Tạo Giáo Án Chuẩn...' : '⚡ AI TẠO GIÁO ÁN & DÀN SLIDE 16:9 NGAY'}</span>
        </button>
      </form>
    </div>
  );
}
