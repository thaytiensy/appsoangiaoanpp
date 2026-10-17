import { create } from "zustand";
import { AutomationTask, TaskMetrics, TaskExecutionResult } from "@/types/automation";

interface AutomationState {
  tasks: AutomationTask[];
  filter: "all" | "running" | "completed" | "failed";
  searchQuery: string;
  activeResult: TaskExecutionResult | null;
  setActiveResult: (result: TaskExecutionResult | null) => void;
  setFilter: (filter: "all" | "running" | "completed" | "failed") => void;
  setSearchQuery: (query: string) => void;
  addTask: (task: Omit<AutomationTask, "id" | "createdAt" | "lastRunAt" | "successRate" | "durationMs" | "status" | "lastResult">) => void;
  runTask: (id: string) => Promise<TaskExecutionResult>;
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
    lastRunAt: "2026-10-17T08:00:00Z",
    successRate: 98.5,
    durationMs: 4250,
    createdAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "task-02",
    name: "Kiểm thử E2E Đăng ký giáo viên & Khóa học",
    targetUrl: "http://localhost:3000/automation",
    actionType: "e2e_test",
    status: "idle",
    scheduleCron: "*/30 * * * *",
    lastRunAt: "2026-10-17T10:30:00Z",
    successRate: 94.2,
    durationMs: 1800,
    createdAt: "2026-10-16T00:00:00Z",
  },
  {
    id: "task-03",
    name: "Chụp ảnh giao diện Live Preview 16:9",
    targetUrl: "http://localhost:3000",
    actionType: "screenshot",
    status: "idle",
    scheduleCron: "0 0 * * *",
    lastRunAt: null,
    successRate: 90.0,
    durationMs: 0,
    createdAt: "2026-10-17T00:00:00Z",
  },
];

export const useAutomationStore = create<AutomationState>((set, get) => ({
  tasks: initialTasks,
  filter: "all",
  searchQuery: "",
  activeResult: null,
  setActiveResult: (activeResult) => set({ activeResult }),
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
  runTask: async (id: string): Promise<TaskExecutionResult> => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error(`Task ${id} không tồn tại`);
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "running" } : t
      ),
    }));

    try {
      const typeMapping: Record<string, "SCREENSHOT" | "SCRAPE" | "E2E_TEST" | "FORM_FILL"> = {
        scrape: "SCRAPE",
        screenshot: "SCREENSHOT",
        e2e_test: "E2E_TEST",
        form_fill: "FORM_FILL",
      };
      const apiType = typeMapping[task.actionType] || "SCREENSHOT";

      const res = await fetch("/api/automation/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          type: apiType,
          targetUrl: task.targetUrl,
        }),
      });

      const result: TaskExecutionResult = await res.json();

      set((state) => ({
        activeResult: result,
        tasks: state.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: result.success ? "completed" : "failed",
                durationMs: result.durationMs,
                lastRunAt: result.executedAt,
                lastResult: result,
                successRate: result.success
                  ? Math.min(100, t.successRate + 2)
                  : Math.max(0, t.successRate - 15),
              }
            : t
        ),
      }));

      return result;
    } catch (err) {
      const errorResult: TaskExecutionResult = {
        taskId: task.id,
        type: task.actionType.toUpperCase(),
        success: false,
        durationMs: 0,
        error: err instanceof Error ? err.message : String(err),
        executedAt: new Date().toISOString(),
      };

      set((state) => ({
        activeResult: errorResult,
        tasks: state.tasks.map((t) =>
          t.id === id
            ? { ...t, status: "failed", lastResult: errorResult }
            : t
        ),
      }));

      return errorResult;
    }
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
