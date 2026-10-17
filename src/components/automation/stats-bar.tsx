"use client";

import React from "react";
import { TaskMetrics } from "@/types/automation";
import { PlayCircle, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

interface StatsBarProps {
  metrics: TaskMetrics;
}

export const StatsBar: React.FC<StatsBarProps> = ({ metrics }) => {
  const statCards = [
    {
      label: "Tổng số tác vụ",
      value: metrics.totalTasks,
      icon: Layers,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      label: "Đang hoạt động",
      value: metrics.runningTasks,
      icon: PlayCircle,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      label: "Tỷ lệ thành công",
      value: `${metrics.successRateAvg}%`,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Lỗi gần đây",
      value: metrics.failedToday,
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className={`rounded-xl border p-3 ${card.color}`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {card.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
