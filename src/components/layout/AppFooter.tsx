'use client';

import React from 'react';
import { Phone, MessageCircle, Heart } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span>AI PowerPoint Lesson Planner Pro © 2026</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            Đồng hành cùng giáo viên Việt Nam <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">Liên hệ trực tiếp:</span>
          <a
            href="tel:0353205414"
            className="flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-bold transition"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            0353205414
          </a>
          <a
            href="https://zalo.me/0353205414"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-bold transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-cyan-600" />
            Zalo: 0353205414
          </a>
        </div>
      </div>
    </footer>
  );
}
