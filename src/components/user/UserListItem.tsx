'use client';

import React from 'react';
import { Phone, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { User } from '@/types/user';

interface UserListItemProps {
  user: User;
  isSelected: boolean;
  canDelete: boolean;
  onSelect: (user: User) => void;
  onDelete: (id: string) => void;
}

export function UserListItem({ user, isSelected, canDelete, onSelect, onDelete }: UserListItemProps) {
  const isAdmin = user.role === 'ADMIN';

  return (
    <div
      className={`p-3 rounded-xl border flex items-center justify-between transition ${
        isSelected ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500' : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
          isAdmin ? 'bg-amber-600 shadow-xs' : 'bg-indigo-600'
        }`}>
          {isAdmin ? '★' : user.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
            <span>{user.name}</span>
            {isAdmin && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-extrabold">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                ADMIN
              </span>
            )}
            {isSelected && (
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                Đang dùng
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">{user.subject} • {user.school}</p>
          {isAdmin ? (
            <p className="text-[10px] text-indigo-600 flex items-center gap-1 font-semibold">
              <Phone className="w-3 h-3" /> SĐT/ZL Admin: {user.phone}
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 flex items-center gap-1 italic">
              <Lock className="w-2.5 h-2.5" /> SĐT bảo mật riêng tư
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!isSelected && (
          <button
            type="button"
            onClick={() => onSelect(user)}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition"
          >
            Chọn
          </button>
        )}
        {canDelete && !isAdmin && (
          <button
            type="button"
            onClick={() => onDelete(user.id)}
            className="p-1 text-slate-400 hover:text-rose-600 transition"
            title="Xóa giáo viên"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
