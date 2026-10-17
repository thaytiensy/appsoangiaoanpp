"use client";

import React from "react";
import { AutomationTask } from "@/types/automation";
import { Play, Trash2, Globe, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface TaskCardProps {
  task: AutomationTask;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onRun, onDelete }) => {
  const statusConfig = {
    idle: { label: "Sẵn sàng", badge: "bg-slate-100 text-slate-700 border-slate-200" },
    running: { label: "Đang chạy", badge: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse" },
    completed: { label: "Hoàn thành", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    failed: { label: "Thất bại", badge: "bg-rose-100 text-rose-800 border-rose-300" },
    paused: { label: "Tạm dừng", badge: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  };

  const isRunning = task.status === "running";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig[task.status].badge}`}>
              {statusConfig[task.status].label}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 uppercase">
              {task.actionType}
            </span>
          </div>
          <h4 className="text-base font-semibold text-slate-900">{task.name}</h4>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onRun(task.id)}
            disabled={isRunning}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isRunning ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            <span>{isRunning ? "Đang chạy..." : "Kích hoạt"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            title="Xóa tác vụ"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 truncate">
        <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <a href={task.targetUrl} target="_blank" rel="noreferrer" className="truncate hover:underline text-indigo-600">
          {task.targetUrl}
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Thời gian: {task.durationMs > 0 ? `${(task.durationMs / 1000).toFixed(1)}s` : "-"}</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          {task.successRate >= 90 ? (
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
          )}
          <span className="font-medium text-slate-700">Độ tin cậy: {task.successRate}%</span>
        </div>
      </div>
    </div>
  );
};
