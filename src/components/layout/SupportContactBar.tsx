'use client';

import React from 'react';
import { Phone, MessageCircle, ShieldCheck } from 'lucide-react';

export function SupportContactBar() {
  return (
    <div className="bg-emerald-700 text-white text-xs py-1.5 px-4 flex items-center justify-between shadow-xs">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Hệ thống Soạn Giáo Án & Xuất Slide Chuẩn GDPT 2026
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-200 hidden md:inline">Hotline hỗ trợ kỹ thuật giáo viên:</span>
          <a
            href="tel:0353205414"
            className="inline-flex items-center gap-1.5 font-bold text-white hover:text-amber-200 transition"
          >
            <Phone className="w-3.5 h-3.5 text-amber-300" />
            <span>SĐT: 0353205414</span>
          </a>
          <a
            href="https://zalo.me/0353205414"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-emerald-800 hover:bg-emerald-900 border border-emerald-500 text-white transition text-[11px]"
          >
            <MessageCircle className="w-3.5 h-3.5 text-cyan-300" />
            <span>Zalo: 0353205414</span>
          </a>
        </div>
      </div>
    </div>
  );
}
