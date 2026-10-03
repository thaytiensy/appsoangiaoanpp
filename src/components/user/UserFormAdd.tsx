'use client';

import React, { useState } from 'react';
import { User, UserRole } from '@/types/user';

interface UserFormAddProps {
  onCancel: () => void;
  onSubmit: (user: User) => void;
}

export function UserFormAdd({ onCancel, onSubmit }: UserFormAddProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('0353205414');
  const [role, setRole] = useState<UserRole>('TEACHER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const newUser: User = {
      id: crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '0353205414',
      role,
      school: school.trim() || 'Trường THPT',
      subject: subject.trim() || 'Giáo viên bộ môn',
      createdAt: new Date().toISOString(),
    };
    onSubmit(newUser);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
      <h4 className="text-xs font-bold text-slate-700">Thêm Giáo Viên Mới</h4>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Họ và tên..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
          required
        />
        <input
          type="email"
          placeholder="Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
          required
        />
        <input
          type="text"
          placeholder="Trường / Đơn vị..."
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
        />
        <input
          type="text"
          placeholder="Bộ môn giảng dạy..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
        />
      </div>
      <div className="flex justify-end gap-1.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Lưu Giáo Viên
        </button>
      </div>
    </form>
  );
}
