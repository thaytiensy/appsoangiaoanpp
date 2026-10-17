'use client';

import { useState } from 'react';
import { Users, X, Shield, BookOpen, Sparkles, Search, FileSpreadsheet } from 'lucide-react';
import type { User } from '../../contracts/user.schema';
import { getUsers } from '../../services/user-service';

interface AdminDashboardModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function AdminDashboardModal({ isOpen, onClose }: AdminDashboardModalProps): React.JSX.Element | null {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const users = getUsers();

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPlans = users.reduce((sum, u) => sum + u.lessonPlansCreated, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Bảng Điều Khiển Quản Trị Hệ Thống & Tổng Hợp Người Dùng
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full uppercase">Admin</span>
              </h2>
              <p className="text-xs text-slate-300">
                Theo dõi toàn bộ giáo viên và các kế hoạch bài dạy đã tạo trong hệ thống
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung thống kê */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* 4 Thẻ chỉ số tổng quan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="text-[11px] font-semibold text-blue-700">Tổng số Giáo viên</div>
              <div className="text-xl font-bold text-blue-900 mt-0.5">{users.length} Thầy/Cô</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-[11px] font-semibold text-emerald-700">Tổng Giáo án & Slide</div>
              <div className="text-xl font-bold text-emerald-900 mt-0.5">{totalPlans} Bài dạy</div>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
              <div className="text-[11px] font-semibold text-purple-700">Bộ Sách Áp Dụng</div>
              <div className="text-sm font-bold text-purple-900 mt-1 truncate">Kết nối tri thức (100%)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="text-[11px] font-semibold text-amber-700">Trạng Thái Hệ Thống</div>
              <div className="text-sm font-bold text-amber-900 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Hoạt động bình thường
              </div>
            </div>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm theo tên giáo viên, email, trường hoặc môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500">Hiển thị {filteredUsers.length} tài khoản</span>
          </div>

          {/* Bảng danh sách người dùng */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Giáo viên</th>
                  <th className="p-3">Email Gmail</th>
                  <th className="p-3">Đơn vị công tác</th>
                  <th className="p-3">Môn phụ trách</th>
                  <th className="p-3 text-center">Giáo án đã soạn</th>
                  <th className="p-3 text-center">Vai trò</th>
                  <th className="p-3">Hoạt động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="text-base">{user.avatar}</span>
                      <span>{user.name}</span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">{user.email}</td>
                    <td className="p-3">{user.school}</td>
                    <td className="p-3 font-medium text-blue-700">{user.subject}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{user.lessonPlansCreated}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{user.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
          >
            Đóng bảng quản trị
          </button>
        </div>
      </div>
    </div>
  );
}
