'use client';

import React, { useState, useEffect } from 'react';
import { Users, X, Plus, Phone } from 'lucide-react';
import { User } from '@/types/user';
import { getUsersAction, saveUserAction, deleteUserAction } from '@/lib/user-actions';
import { UserListItem } from './UserListItem';
import { UserFormAdd } from './UserFormAdd';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export function UserManagerModal({ isOpen, onClose, currentUser, onSelectUser }: UserManagerModalProps) {
  const [userList, setUserList] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getUsersAction().then((data) => {
        if (data.length > 0) setUserList(data);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async (newUser: User) => {
    await saveUserAction(newUser);
    setUserList((prev) => [...prev, newUser]);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (userList.length <= 1) return;
    await deleteUserAction(id);
    setUserList((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Quản Lý Hồ Sơ Giáo Viên</h3>
              <p className="text-xs text-slate-500">Phân quyền, tổ chuyên môn & thông tin tài khoản</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {userList.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              isSelected={user.id === currentUser.id}
              canDelete={userList.length > 1}
              onSelect={onSelectUser}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {isAdding ? (
          <UserFormAdd onCancel={() => setIsAdding(false)} onSubmit={handleCreate} />
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-2 text-xs font-semibold text-indigo-600 border border-dashed border-indigo-300 rounded-xl hover:bg-indigo-50/50 flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Thêm Giáo Viên Mới
          </button>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            Hỗ trợ kỹ thuật SĐT/Zalo: <strong className="text-slate-800">0353205414</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
