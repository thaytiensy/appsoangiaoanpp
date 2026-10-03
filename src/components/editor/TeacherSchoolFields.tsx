'use client';

import React from 'react';
import { User, School, Briefcase } from 'lucide-react';

interface TeacherSchoolFieldsProps {
  teacherName: string;
  onChangeTeacherName: (val: string) => void;
  schoolName: string;
  onChangeSchoolName: (val: string) => void;
  departmentName: string;
  onChangeDepartmentName: (val: string) => void;
}

export function TeacherSchoolFields({
  teacherName,
  onChangeTeacherName,
  schoolName,
  onChangeSchoolName,
  departmentName,
  onChangeDepartmentName,
}: TeacherSchoolFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-500" />
          Tên Giáo Viên
        </label>
        <input
          type="text"
          value={teacherName}
          onChange={(e) => onChangeTeacherName(e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <School className="w-3.5 h-3.5 text-purple-500" />
          Tên Trường
        </label>
        <input
          type="text"
          value={schoolName}
          onChange={(e) => onChangeSchoolName(e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-amber-500" />
          Tổ Chuyên Môn
        </label>
        <input
          type="text"
          value={departmentName}
          onChange={(e) => onChangeDepartmentName(e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
        />
      </div>
    </div>
  );
}
