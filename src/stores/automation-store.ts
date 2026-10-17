import { create } from "zustand";
import { AutomationTask, TaskMetrics } from "@/types/automation";

interface AutomationState {
  tasks: AutomationTask[];
  filter: "all" | "running" | "completed" | "failed";
  searchQuery: string;
  setFilter: (filter: "all" | "running" | "completed" | "failed") => void;
  setSearchQuery: (query: string) => void;
  addTask: (task: Omit<AutomationTask, "id" | "createdAt" | "lastRunAt" | "successRate" | "durationMs" | "status">) => void;
  runTask: (id: string) => void;
  deleteTask: (id: string) => void;
  getMetrics: () => TaskMetrics;
}

const initialTasks: AutomationTask[] = [
  {
    id: "task-01",
    name: "Thu thập dữ liệu phân tích thị trường GDPT",
    targetUrl: "https://news.ycombinator.com",
    actionType: "scrape",
    status: "completed",
    scheduleCron: "0 8 * * *",
    lastRunAt: "2025-02-23T08:00:00Z",
    successRate: 98.5,
    durationMs: 4250,
    createdAt: "2025-02-15T00:00:00Z",
  },
  {
    id: "task-02",
    name: "Kiểm thử E2E Đăng ký giáo viên & Khóa học",
    targetUrl: "https://app.antigravity.edu.vn/auth/signup",
    actionType: "e2e_test",
    status: "running",
    scheduleCron: "*/30 * * * *",
    lastRunAt: "2025-02-23T10:30:00Z",
    successRate: 94.2,
    durationMs: 12800,
    createdAt: "2025-02-18T00:00:00Z",
  },
  {
    id: "task-03",
    name: "Chụp ảnh giao diện Live Preview 16:9",
    targetUrl: "https://app.antigravity.edu.vn/lesson-planner",
    actionType: "screenshot",
    status: "failed",
    scheduleCron: "0 0 * * *",
    lastRunAt: "2025-02-23T00:00:00Z",
    successRate: 75.0,
    durationMs: 3100,
    createdAt: "2025-02-20T00:00:00Z",
  },
];

export const useAutomationStore = create<AutomationState>((set, get) => ({
  tasks: initialTasks,
  filter: "all",
  searchQuery: "",
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  addTask: (data) => {
    const newTask: AutomationTask = {
      ...data,
      id: `task-${Date.now()}`,
      status: "idle",
      lastRunAt: null,
      successRate: 100,
      durationMs: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },
  runTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, status: "running", lastRunAt: new Date().toISOString() }
          : t
      ),
    }));
    setTimeout(() => {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? { ...t, status: "completed", durationMs: Math.floor(Math.random() * 5000) + 1500 }
            : t
        ),
      }));
    }, 2500);
  },
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  getMetrics: () => {
    const tasks = get().tasks;
    const running = tasks.filter((t) => t.status === "running").length;
    const failed = tasks.filter((t) => t.status === "failed").length;
    const avgSuccess =
      tasks.length > 0
        ? tasks.reduce((acc, curr) => acc + curr.successRate, 0) / tasks.length
        : 0;
    return {
      totalTasks: tasks.length,
      runningTasks: running,
      successRateAvg: Math.round(avgSuccess * 10) / 10,
      failedToday: failed,
    };
  },
}));
