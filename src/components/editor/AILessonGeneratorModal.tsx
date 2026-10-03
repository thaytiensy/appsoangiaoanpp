'use client';

import React, { useState } from 'react';
import { Sparkles, X, Wand2, BookOpen, Clock, Lightbulb } from 'lucide-react';
import { LessonPlanProject } from '@/types/lesson-plan';
import { generatePedagogicalLessonPlan } from '@/lib/ai-lesson-generator';
import { SUBJECT_PRESETS } from '@/lib/pedagogical-knowledge';

interface AILessonGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (plan: LessonPlanProject) => void;
}

export function AILessonGeneratorModal({ isOpen, onClose, onGenerated }: AILessonGeneratorModalProps) {
  const [subject, setSubject] = useState('Tin học');
  const [topic, setTopic] = useState('Trí tuệ nhân tạo và Đạo đức số');
  const [grade, setGrade] = useState('Lớp 10');
  const [duration, setDuration] = useState(45);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentPreset = SUBJECT_PRESETS[subject];

  const handleGenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      const fullSubject = currentPreset?.subject || subject;
      const newPlan = generatePedagogicalLessonPlan(topic, fullSubject, grade, duration);
      onGenerated(newPlan);
      setIsLoading(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white rounded-xl shadow-xs">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Trợ Lý AI Soạn Giáo Án Chuẩn GDPT</h3>
              <p className="text-xs text-slate-500">Tự động sinh 4 bước sư phạm, thang Bloom & Slide 16:9</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Môn Học</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {Object.keys(SUBJECT_PRESETS).map((subKey) => (
                <button
                  key={subKey}
                  type="button"
                  onClick={() => {
                    setSubject(subKey);
                    setTopic(SUBJECT_PRESETS[subKey].defaultTopics[0]);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    subject === subKey
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {subKey}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên Bài Học / Chủ Đề Giảng Dạy</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Ví dụ: Định luật bảo toàn năng lượng, Bài thơ Tây Tiến..."
            />
          </div>

          {currentPreset && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Gợi ý chủ đề nhanh:
              </span>
              <div className="flex flex-wrap gap-1">
                {currentPreset.defaultTopics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-600 transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khối Lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                {['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thời Lượng (Phút)</label>
              <input
                type="number"
                min={30}
                max={90}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 45)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Đang soạn bài học...' : 'Khởi Tạo Giáo Án Chuẩn'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
