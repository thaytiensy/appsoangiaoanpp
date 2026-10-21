'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Copy, Check, Trash2, X, Users, Sparkles, AlertCircle } from 'lucide-react';
import type { SharedUser } from '../../contracts/share.schema';
import { getSharedUsers, saveSharedUser, removeSharedUser, generateGmailShareUrl } from '../../services/share-service';

interface ShareModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly lessonId: string;
  readonly lessonTitle: string;
}

export function ShareModal({ isOpen, onClose, lessonId, lessonTitle }: ShareModalProps): React.JSX.Element | null {
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [sharedList, setSharedList] = useState<SharedUser[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && lessonId) {
      setSharedList(getSharedUsers(lessonId));
    }
  }, [isOpen, lessonId]);

  if (!isOpen) return null;

  const handleShare = (openGmailDirectly: boolean): void => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.endsWith('gmail.com')) {
      setError('Vui lòng nhập đúng địa chỉ email định dạng @gmail.com');
      return;
    }

    const updated = saveSharedUser({
      email: trimmed,
      role,
      lessonId,
      lessonTitle,
    });
    setSharedList(updated);

    if (openGmailDirectly) {
      const url = generateGmailShareUrl(trimmed, lessonTitle);
      window.open(url, '_blank');
    }

    setEmail('');
  };

  const handleCopyLink = async (): Promise<void> => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = (userEmail: string): void => {
    const updated = removeSharedUser(lessonId, userEmail);
    setSharedList(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Chia Sẻ Giáo Án & Slide Qua Gmail</h2>
              <p className="text-xs text-slate-500">Miễn phí 100% dành cho quý Thầy Cô và đồng nghiệp</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Người nhận có thể xem trực tuyến và tải trọn bộ Slide PowerPoint hoàn toàn miễn phí.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nhập địa chỉ Gmail đồng nghiệp
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dongnghiep@gmail.com"
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
                className="px-2.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium"
              >
                <option value="viewer">Chỉ xem & tải</option>
                <option value="editor">Được chỉnh sửa</option>
              </select>
            </div>
            {error && (
              <div className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleShare(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi qua Gmail ngay</span>
            </button>
            <button
              type="button"
              onClick={() => handleShare(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <span>Lưu quyền truy cập</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép link'}</span>
            </button>
          </div>

          {/* Danh sách người dùng đã được chia sẻ */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Đồng nghiệp đã chia sẻ ({sharedList.length})</span>
              </span>
            </div>

            {sharedList.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 text-center">Chưa có người dùng nào được thêm vào danh sách.</p>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {sharedList.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{user.email}</p>
                      <p className="text-[10px] text-slate-400">
                        {user.role === 'editor' ? 'Quyền chỉnh sửa' : 'Quyền xem & tải'} • Ngày chia sẻ: {user.sharedAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(user.email)}
                      aria-label="Xóa quyền chia sẻ"
                      className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
