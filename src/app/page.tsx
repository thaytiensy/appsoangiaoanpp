'use client';

import React, { useState } from 'react';
import { Sparkles, Save, CheckCircle, Presentation } from 'lucide-react';
import { LessonPlanProject, SlideItem } from '@/types/lesson-plan';
import { INITIAL_LESSON_PLAN } from '@/lib/initial-data';
import { generateSlidesFromPlan } from '@/lib/slide-generator';
import { saveLessonPlanAction } from '@/lib/actions';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { ObjectivesEditor } from '@/components/editor/ObjectivesEditor';
import { PedagogicalActivitiesEditor } from '@/components/editor/PedagogicalActivitiesEditor';
import { AIAutoGenerateBar } from '@/components/editor/AIAutoGenerateBar';
import { Slide16x9Canvas } from '@/components/preview/Slide16x9Canvas';
import { SlideDeckNavigation } from '@/components/preview/SlideDeckNavigation';
import { TeacherNotesPanel } from '@/components/preview/TeacherNotesPanel';
import { ExportPptxButton } from '@/components/preview/ExportPptxButton';

export default function LessonPlannerPage() {
  const [project, setProject] = useState<LessonPlanProject>(INITIAL_LESSON_PLAN);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const activeSlide = project.slides[currentSlideIndex] || project.slides[0];

  const handleUpdateProject = (partial: Partial<LessonPlanProject>) => {
    setProject((prev) => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }));
  };

  const handleSyncSlides = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const generated = generateSlidesFromPlan(project);
      setProject((prev) => ({ ...prev, slides: generated, updatedAt: new Date().toISOString() }));
      setCurrentSlideIndex(0);
      setIsSyncing(false);
    }, 400);
  };

  const handleUpdateCurrentSlide = (updated: Partial<SlideItem>) => {
    const newSlides = [...project.slides];
    newSlides[currentSlideIndex] = { ...newSlides[currentSlideIndex], ...updated };
    handleUpdateProject({ slides: newSlides });
  };

  const handleAddSlide = () => {
    const nextNum = project.slides.length + 1;
    const newSlide: SlideItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `slide-${Date.now()}`,
      slideNumber: nextNum,
      layout: 'CONCEPT_BREAKDOWN',
      title: `Slide ${nextNum}: Tiêu Đề Mới`,
      bullets: ['Nội dung trọng tâm 1', 'Nội dung trọng tâm 2'],
      teacherScript: 'Giáo viên phân tích chi tiết điểm này cho học sinh.',
      visualSuggestion: 'Bố cục 2 khối thông tin trực quan.',
    };
    handleUpdateProject({ slides: [...project.slides, newSlide] });
    setCurrentSlideIndex(project.slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (project.slides.length <= 4) return;
    const filtered = project.slides
      .filter((_, i) => i !== index)
      .map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    handleUpdateProject({ slides: filtered });
    setCurrentSlideIndex(Math.max(0, index - 1));
  };

  const handleSaveToDb = async () => {
    setSaveStatus('saving');
    const res = await saveLessonPlanAction(project);
    if (res.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                AI PowerPoint Lesson Planner Pro
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  2026 EDITION
                </span>
              </h1>
              <p className="text-xs text-slate-500">Soạn giáo án 4 bước & Trực tiếp xuất Slide 16:9</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToDb}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              {saveStatus === 'saved' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Đã Lưu SQLite</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>Lưu Giáo Án</span>
                </>
              )}
            </button>
            <ExportPptxButton project={project} />
          </div>
        </div>
      </header>

      {/* Main Split-Pane Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Pedagogical Form Editor (55%) */}
          <div className="xl:col-span-7 space-y-4">
            <EditorHeader plan={project} onChange={handleUpdateProject} />
            <ObjectivesEditor objectives={project.objectives} onChange={(objs) => handleUpdateProject({ objectives: objs })} />
            <PedagogicalActivitiesEditor activities={project.activities} onChange={(acts) => handleUpdateProject({ activities: acts })} />
            <AIAutoGenerateBar onGenerate={handleSyncSlides} isGenerating={isSyncing} />
          </div>

          {/* Right Column: Live 16:9 Slide Preview Engine (45%) */}
          <div className="xl:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4 xl:sticky xl:top-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800">Live Preview 16:9 HD</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {project.slides.length} Slides Sẵn Sàng
                </span>
              </div>

              {activeSlide && <Slide16x9Canvas slide={activeSlide} totalSlides={project.slides.length} />}

              <SlideDeckNavigation
                slides={project.slides}
                currentIndex={currentSlideIndex}
                onSelect={setCurrentSlideIndex}
                onAddSlide={handleAddSlide}
                onDeleteSlide={handleDeleteSlide}
              />

              {activeSlide && (
                <TeacherNotesPanel slide={activeSlide} onChange={handleUpdateCurrentSlide} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
