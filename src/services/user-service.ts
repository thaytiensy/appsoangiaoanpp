import type { User, UserRole } from '../contracts/user.schema';

const USERS_STORAGE_KEY = 'lesson_planner_users_list';
const CURRENT_USER_KEY = 'lesson_planner_current_user';

export const INITIAL_USERS: readonly User[] = [
  {
    id: 'user_admin',
    name: 'admin',
    email: 'chuotbachchise@gmail.com',
    avatar: '🛡️',
    school: 'Hệ thống Quản trị Giáo dục Toàn quốc',
    subject: 'Quản trị viên',
    role: 'admin',
    lessonPlansCreated: 52,
    lastActive: 'Vừa xong',
  },
  {
    id: 'user_2',
    name: 'Cô Nguyễn Thị Mai',
    email: 'mainguyen.edu@gmail.com',
    avatar: '👩‍🏫',
    school: 'Trường THCS Lê Quý Đôn',
    subject: 'Ngữ văn',
    role: 'teacher',
    lessonPlansCreated: 24,
    lastActive: 'Hôm nay 14:20',
  },
  {
    id: 'user_3',
    name: 'Thầy Trần Văn Nam',
    email: 'namtran.khtn@gmail.com',
    avatar: '👨‍🔬',
    school: 'Trường Tiểu học Võ Thị Sáu',
    subject: 'Khoa học tự nhiên',
    role: 'teacher',
    lessonPlansCreated: 19,
    lastActive: 'Hôm qua 09:15',
  },
  {
    id: 'user_4',
    name: 'Cô Lê Thu Trang',
    email: 'trangle.tienganh@gmail.com',
    avatar: '👩‍💼',
    school: 'Trường THPT Chuyên Hà Nội - Amsterdam',
    subject: 'Tiếng Anh',
    role: 'teacher',
    lessonPlansCreated: 31,
    lastActive: '15/10/2026',
  },
];

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [...INITIAL_USERS];
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return [...INITIAL_USERS];
    }
    const parsed = JSON.parse(data) as User[];
    // Đảm bảo admin chuotbachchise@gmail.com luôn có mặt
    const hasAdmin = parsed.some((u) => u.email.toLowerCase() === 'chuotbachchise@gmail.com');
    if (!hasAdmin) {
      const merged = [INITIAL_USERS[0], ...parsed];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return [...INITIAL_USERS];
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return INITIAL_USERS[0];
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) {
      const u = JSON.parse(data) as User;
      if (u.email.toLowerCase() === 'chuotbachchise@gmail.com') {
        return { ...u, name: 'admin', role: 'admin' };
      }
      return u;
    }
    // Mặc định đăng nhập tài khoản admin: chuotbachchise@gmail.com
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
    return INITIAL_USERS[0];
  } catch {
    return INITIAL_USERS[0];
  }
}

export function loginWithGmail(email: string, name: string, role: UserRole = 'teacher'): User {
  const users = getUsers();
  const lowerEmail = email.trim().toLowerCase();
  const isAdminEmail = lowerEmail === 'chuotbachchise@gmail.com';
  const effectiveRole: UserRole = isAdminEmail ? 'admin' : role;
  const effectiveName = isAdminEmail ? 'admin' : (name.trim() || 'Giáo viên');

  const existing = users.find((u) => u.email.toLowerCase() === lowerEmail);

  if (existing) {
    const updated: User = {
      ...existing,
      name: effectiveName,
      role: effectiveRole,
      lastActive: 'Vừa xong',
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    return updated;
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    name: effectiveName,
    email: lowerEmail,
    avatar: effectiveRole === 'admin' ? '🛡️' : '👨‍🏫',
    school: effectiveRole === 'admin' ? 'Hệ thống Quản trị Giáo dục Toàn quốc' : 'Trường Tiểu học & THCS',
    subject: effectiveRole === 'admin' ? 'Quản trị viên' : 'Giáo viên bộ môn',
    role: effectiveRole,
    lessonPlansCreated: 1,
    lastActive: 'Vừa xong',
  };

  const updatedList = [newUser, ...users];
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  } catch {
    // Bỏ qua lỗi localStorage
  }

  return newUser;
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch {
    // Bỏ qua lỗi
  }
}
