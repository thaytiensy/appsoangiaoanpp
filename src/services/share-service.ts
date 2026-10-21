import type { SharedUser } from '../contracts/share.schema';

const STORAGE_KEY_PREFIX = 'edu_shared_users_';

export function getSharedUsers(lessonId: string): SharedUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${lessonId}`);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SharedUser[]) : [];
  } catch {
    return [];
  }
}

export function saveSharedUser(user: Omit<SharedUser, 'id' | 'sharedAt'>): SharedUser[] {
  if (typeof window === 'undefined') return [];
  const current = getSharedUsers(user.lessonId);
  const exists = current.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (exists) return current;

  const newUser: SharedUser = {
    ...user,
    id: `share_${Date.now()}`,
    sharedAt: new Date().toLocaleDateString('vi-VN'),
  };

  const updated = [newUser, ...current];
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${user.lessonId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn('Lỗi lưu danh sách chia sẻ:', err);
  }
  return updated;
}

export function removeSharedUser(lessonId: string, email: string): SharedUser[] {
  if (typeof window === 'undefined') return [];
  const current = getSharedUsers(lessonId);
  const updated = current.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${lessonId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn('Lỗi cập nhật danh sách chia sẻ:', err);
  }
  return updated;
}

export function generateGmailShareUrl(recipientEmail: string, lessonTitle: string): string {
  const subject = encodeURIComponent(`[Chia sẻ giáo án & Slide miễn phí] ${lessonTitle}`);
  const bodyText = `Kính gửi Thầy/Cô,

Tôi xin trân trọng chia sẻ miễn phí kế hoạch bài dạy và bộ slide trình chiếu PowerPoint 16:9 chuẩn Bộ GD&ĐT cho bài học: "${lessonTitle}".

Thầy/Cô có thể xem trực tiếp, trình chiếu và tải file .pptx hoàn toàn miễn phí tại Hệ thống AI Soạn Giáo Án:
${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}

Trân trọng gửi tặng đồng nghiệp!`;

  const body = encodeURIComponent(bodyText);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${subject}&body=${body}`;
}
