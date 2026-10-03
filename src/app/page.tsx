'use client';

import React, { useState } from 'react';
import { Save, CheckCircle, Presentation } from 'lucide-react';
import { LessonPlanProject, SlideItem } from '@/types/lesson-plan';
import { User } from '@/types/user';
import { INITIAL_LESSON_PLAN } from '@/lib/initial-data';
import { generatePedagogicalLessonPlan, LessonGeneratorParams } from '@/lib/ai-lesson-generator';
import { saveLessonPlanAction } from '@/lib/actions';
import { LessonInputPanel } from '@/components/editor/LessonInputPanel';
import { LessonPlanSummaryCard } from '@/components/editor/LessonPlanSummaryCard';
import { Slide16x9Canvas } from '@/components/preview/Slide16x9Canvas';
import { SlideDeckNavigation } from '@/components/preview/SlideDeckNavigation';
import { TeacherNotesPanel } from '@/components/preview/TeacherNotesPanel';
import { ExportPptxButton } from '@/components/preview/ExportPptxButton';
import { UserManagerModal } from '@/components/user/UserManagerModal';
import { UserBadge } from '@/components/user/UserBadge';
import { SupportContactBar } from '@/components/layout/SupportContactBar';
import { AppFooter } from '@/components/layout/AppFooter';

const DEFAULT_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Thầy Đỗ Tiến Sỹ',
  email: 'dotiensy.admin@gmail.com',
  phone: '0353205414',
  role: 'ADMIN',
  school: 'THPT Chuyên Lê Hồng Phong',
  subject: 'Toán học & Tin học',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export default function LessonPlannerPage() {
  const [project, setProject] = useState<LessonPlanProject>({
    ...INITIAL_LESSON_PLAN,
    teacherName: 'Thầy Đỗ Tiến Sỹ',
    schoolName: 'THPT Chuyên Lê Hồng Phong',
    departmentName: 'Tổ Toán - Tin',
  });
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const activeSlide = project.slides[currentSlideIndex] || project.slides[0];

  const handleGenerateLesson = (params: LessonGeneratorParams) => {
    setIsGenerating(true);
    setTimeout(() => {
      const newPlan = generatePedagogicalLessonPlan(params);
      setProject(newPlan);
      setCurrentSlideIndex(0);
      setIsGenerating(false);
    }, 400);
  };

  const handleUpdateCurrentSlide = (updated: Partial<SlideItem>) => {
    const newSlides = [...project.slides];
    newSlides[currentSlideIndex] = { ...newSlides[currentSlideIndex], ...updated };
    setProject((prev) => ({ ...prev, slides: newSlides, updatedAt: new Date().toISOString() }));
  };

  const handleAddSlide = () => {
    const nextNum = project.slides.length + 1;
    const newSlide: SlideItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `slide-${Date.now()}`,
      slideNumber: nextNum,
      layout: 'CONCEPT_BREAKDOWN',
      title: `Slide ${nextNum}: Tiêu Đề Mới`,
      bullets: ['Nội dung trọng tâm 1 (bấm để sửa)', 'Nội dung trọng tâm 2 (bấm để sửa)'],
      teacherScript: 'Giáo viên phân tích chi tiết điểm này cho học sinh.',
      visualSuggestion: 'Bố cục 2 khối thông tin trực quan.',
    };
    setProject((prev) => ({ ...prev, slides: [...prev.slides, newSlide], updatedAt: new Date().toISOString() }));
    setCurrentSlideIndex(project.slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (project.slides.length <= 4) return;
    const filtered = project.slides.filter((_, i) => i !== index).map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    setProject((prev) => ({ ...prev, slides: filtered, updatedAt: new Date().toISOString() }));
    setCurrentSlideIndex(Math.max(0, index - 1));
  };

  const handleSaveToDb = async () => {
    setSaveStatus('saving');
    const res = await saveLessonPlanAction(project);
    setSaveStatus(res.success ? 'saved' : 'error');
    if (res.success) setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <SupportContactBar />
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                AI PowerPoint Lesson Planner Pro
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">2026</span>
              </h1>
              <p className="text-xs text-slate-500">Chuẩn GDPT 4 bước • SĐT/Zalo: <strong>0353205414</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <UserBadge currentUser={currentUser} onClick={() => setIsUserModalOpen(true)} />
            <button
              type="button"
              onClick={handleSaveToDb}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              {saveStatus === 'saved' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4 text-slate-500" />}
              <span>{saveStatus === 'saved' ? 'Đã Lưu' : 'Lưu'}</span>
            </button>
            <ExportPptxButton project={project} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7 space-y-4">
            <LessonInputPanel
              onGenerate={handleGenerateLesson}
              isGenerating={isGenerating}
              defaultTeacherName={currentUser.name}
              defaultSchoolName={currentUser.school}
              defaultSubject={currentUser.subject}
            />
            <LessonPlanSummaryCard plan={project} />
          </div>

          <div className="xl:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4 xl:sticky xl:top-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-800">Live Preview 16:9 HD</span>
                <span className="text-xs font-semibold text-slate-500">{project.slides.length} Slides</span>
              </div>
              {activeSlide && (
                <Slide16x9Canvas
                  slide={activeSlide}
                  totalSlides={project.slides.length}
                  themeId={project.themeId}
                  customBackgroundUrl={project.customBackgroundUrl}
                  onUpdateSlide={handleUpdateCurrentSlide}
                />
              )}
              <SlideDeckNavigation
                slides={project.slides}
                currentIndex={currentSlideIndex}
                onSelect={setCurrentSlideIndex}
                onAddSlide={handleAddSlide}
                onDeleteSlide={handleDeleteSlide}
              />
              {activeSlide && <TeacherNotesPanel slide={activeSlide} onChange={handleUpdateCurrentSlide} />}
            </div>
          </div>
        </div>
      </main>

      <AppFooter />

      <UserManagerModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          setProject((prev) => ({
            ...prev,
            teacherName: u.name,
            schoolName: u.school,
            departmentName: `Tổ ${u.subject}`,
          }));
        }}
      />
    </div>
  );
}
