"use client";

import React, { useState } from "react";
import { useAutomationStore } from "@/stores/automation-store";
import { StatsBar } from "@/components/automation/stats-bar";
import { TaskCard } from "@/components/automation/task-card";
import { CreateTaskModal } from "@/components/automation/create-task-modal";
import { TaskResultModal } from "@/components/automation/task-result-modal";
import { Plus, Search, Filter } from "lucide-react";

export default function AutomationDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    tasks,
    filter,
    searchQuery,
    activeResult,
    setActiveResult,
    setFilter,
    setSearchQuery,
    addTask,
    runTask,
    deleteTask,
    getMetrics,
  } = useAutomationStore();

  const metrics = getMetrics();

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "all" ? true : task.status === filter;
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.targetUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 select-none">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Dashboard Tự động hóa Web
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Điều khiển và giám sát các tác vụ Playwright Chromium, E2E Testing & Gemini Scraper thật
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo tác vụ mới</span>
          </button>
        </div>

        <StatsBar metrics={metrics} />

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tác vụ hoặc URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <div className="flex rounded-lg bg-slate-100 p-1">
              {(['all', 'running', 'completed', 'failed'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilter(mode)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                    filter === mode
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {mode === 'all' ? 'Tất cả' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 text-sm">
            Không tìm thấy tác vụ tự động hóa nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onRun={runTask}
                onDelete={deleteTask}
                onViewResult={(res) => setActiveResult(res)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addTask}
      />

      <TaskResultModal
        result={activeResult}
        onClose={() => setActiveResult(null)}
      />
    </div>
  );
}
