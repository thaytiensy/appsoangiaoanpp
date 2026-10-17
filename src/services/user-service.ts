import type { User, UserRole } from '../contracts/user.schema';

const USERS_STORAGE_KEY = 'lesson_planner_users_list';
const CURRENT_USER_KEY = 'lesson_planner_current_user';

export const INITIAL_USERS: readonly User[] = [
  {
    id: 'user_1',
    name: 'Thầy Đỗ Tiến Sỹ',
    email: 'tiensy.edu@gmail.com',
    avatar: '👨‍🏫',
    school: 'Trường THCS & THPT Chu Văn An',
    subject: 'Toán học',
    role: 'admin',
    lessonPlansCreated: 38,
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
  {
    id: 'user_5',
    name: 'Thầy Phạm Quốc Hưng',
    email: 'hungpham.su@gmail.com',
    avatar: '👨‍🏫',
    school: 'Trường THCS Trưng Vương',
    subject: 'Lịch sử và Địa lí',
    role: 'teacher',
    lessonPlansCreated: 15,
    lastActive: '12/10/2026',
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
    return JSON.parse(data) as User[];
  } catch {
    return [...INITIAL_USERS];
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return INITIAL_USERS[0];
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) return JSON.parse(data) as User;
    // Mặc định đăng nhập với tài khoản Admin Thầy Đỗ Tiến Sỹ
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
    return INITIAL_USERS[0];
  } catch {
    return INITIAL_USERS[0];
  }
}

export function loginWithGmail(email: string, name: string, role: UserRole = 'teacher'): User {
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    const updated = { ...existing, lastActive: 'Vừa xong' };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    return updated;
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    name,
    email,
    avatar: role === 'admin' ? '👨‍💼' : '👨‍🏫',
    school: 'Trường THCS & THPT Chu Văn An',
    subject: 'Toán học',
    role,
    lessonPlansCreated: 1,
    lastActive: 'Vừa xong',
  };

  const updatedList = [newUser, ...users];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}
