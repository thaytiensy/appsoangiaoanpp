'use client';

import React from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { User } from '@/types/user';

interface UserBadgeProps {
  currentUser: User;
  onClick: () => void;
}

export function UserBadge({ currentUser, onClick }: UserBadgeProps) {
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition text-left cursor-pointer ${
        isAdmin
          ? 'border-amber-300 bg-amber-50/80 hover:bg-amber-100/80'
          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
      }`}
      title="Bấm để quản lý người dùng và hồ sơ giáo viên"
    >
      <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-2xs ${
        isAdmin ? 'bg-amber-600' : 'bg-indigo-600'
      }`}>
        {isAdmin ? '★' : currentUser.name.slice(0, 1).toUpperCase()}
      </div>
      <div className="hidden sm:block">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
          {currentUser.name}
          {isAdmin && (
            <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-extrabold flex items-center">
              ADMIN
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
        <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
          {currentUser.subject}
        </div>
      </div>
    </button>
  );
}
