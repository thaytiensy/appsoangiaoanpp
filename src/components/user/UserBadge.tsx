'use client';

import React from 'react';
import { User as UserIcon, Phone, ChevronDown } from 'lucide-react';
import { User } from '@/types/user';

interface UserBadgeProps {
  currentUser: User;
  onClick: () => void;
}

export function UserBadge({ currentUser, onClick }: UserBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition text-left cursor-pointer"
      title="Bấm để quản lý người dùng và hồ sơ giáo viên"
    >
      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
        {currentUser.name.slice(0, 1).toUpperCase()}
      </div>
      <div className="hidden sm:block">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
          {currentUser.name}
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
        <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
          {currentUser.subject}
        </div>
      </div>
    </button>
  );
}
