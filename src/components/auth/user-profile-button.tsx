'use client';

import { useState } from 'react';
import { ShieldCheck, LogIn, LogOut, Users, Check } from 'lucide-react';
import type { User } from '../../contracts/user.schema';
import { loginWithGmail, logoutUser } from '../../services/user-service';

interface UserProfileButtonProps {
  readonly currentUser: User | null;
  readonly onUserChange: (user: User | null) => void;
  readonly onOpenAdminDashboard: () => void;
}

export function UserProfileButton({
  currentUser,
  onUserChange,
  onOpenAdminDashboard,
}: UserProfileButtonProps): React.JSX.Element {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('tiensy.edu@gmail.com');
  const [nameInput, setNameInput] = useState<string>('Thầy Đỗ Tiến Sỹ');

  const handleQuickLogin = (email: string, name: string, isAdmin: boolean): void => {
    const user = loginWithGmail(email, name, isAdmin ? 'admin' : 'teacher');
    onUserChange(user);
    setShowLoginModal(false);
  };

  const handleCustomLogin = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!emailInput.includes('@')) return;
    const isAdmin = emailInput.toLowerCase().includes('tiensy') || emailInput.toLowerCase().includes('admin');
    const user = loginWithGmail(emailInput, nameInput || 'Giáo viên', isAdmin ? 'admin' : 'teacher');
    onUserChange(user);
    setShowLoginModal(false);
  };

  const handleLogout = (): void => {
    logoutUser();
    onUserChange(null);
  };

  if (!currentUser) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowLoginModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <LogIn className="w-3.5 h-3.5 text-blue-600" />
          <span>Đăng nhập Gmail</span>
        </button>

        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-1">Đăng nhập tài khoản Google / Gmail</h3>
              <p className="text-xs text-slate-500 mb-4">Chọn nhanh tài khoản để truy cập hệ thống:</p>

              <div className="space-y-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tiensy.edu@gmail.com', 'Thầy Đỗ Tiến Sỹ', true)}
                  className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-left flex items-center gap-2.5 transition"
                >
                  <span className="text-lg">👨‍🏫</span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                      Thầy Đỗ Tiến Sỹ <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[10px] rounded-full">Admin</span>
                    </div>
                    <div className="text-[11px] text-blue-700 truncate">tiensy.edu@gmail.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('mainguyen.edu@gmail.com', 'Cô Nguyễn Thị Mai', false)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left flex items-center gap-2.5 transition"
                >
                  <span className="text-lg">👩‍🏫</span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-800">Cô Nguyễn Thị Mai (Giáo viên)</div>
                    <div className="text-[11px] text-slate-500 truncate">mainguyen.edu@gmail.com</div>
                  </div>
                </button>
              </div>

              <form onSubmit={handleCustomLogin} className="space-y-2.5 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Họ và tên giáo viên"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Địa chỉ email @gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                  >
                    Đăng nhập
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {currentUser.role === 'admin' && (
        <button
          type="button"
          onClick={onOpenAdminDashboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Quản Trị Người Dùng</span>
        </button>
      )}

      <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-sm">
        <span className="text-base">{currentUser.avatar || '👨‍🏫'}</span>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <span>{currentUser.name}</span>
            {currentUser.role === 'admin' && (
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
          <div className="text-[10px] text-slate-500">{currentUser.email}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Đăng xuất"
          title="Đăng xuất"
          className="p-1 text-slate-400 hover:text-red-500 rounded-md transition ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
