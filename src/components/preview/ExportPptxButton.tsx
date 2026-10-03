'use client';

import React, { useState } from 'react';
import { Download, CheckCircle, Loader2, Presentation } from 'lucide-react';
import { LessonPlanProject } from '@/types/lesson-plan';
import { exportLessonToPptx } from '@/lib/pptx-export';

interface ExportPptxButtonProps {
  project: LessonPlanProject;
}

export function ExportPptxButton({ project }: ExportPptxButtonProps) {
  const [status, setStatus] = useState<'idle' | 'exporting' | 'success'>('idle');

  const handleExport = async () => {
    try {
      setStatus('exporting');
      await exportLessonToPptx(project);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
      setStatus('idle');
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={status === 'exporting'}
      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
      title="Xuất file .pptx thực tế chuẩn 16:9 kèm Speaker Notes"
    >
      {status === 'exporting' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang tạo .pptx...</span>
        </>
      ) : status === 'success' ? (
        <>
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>Đã Tải File .pptx!</span>
        </>
      ) : (
        <>
          <Presentation className="w-4 h-4" />
          <Download className="w-3.5 h-3.5" />
          <span>Xuất PPTX Chuẩn</span>
        </>
      )}
    </button>
  );
}
