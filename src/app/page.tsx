'use client';

import React from 'react';
import { useLessonPlanner } from '@/hooks/useLessonPlanner';
import { LessonInputPanel } from '@/components/editor/LessonInputPanel';
import { LessonPlanSummaryCard } from '@/components/editor/LessonPlanSummaryCard';
import { Slide16x9Canvas } from '@/components/preview/Slide16x9Canvas';
import { SlideDeckNavigation } from '@/components/preview/SlideDeckNavigation';
import { TeacherNotesPanel } from '@/components/preview/TeacherNotesPanel';
import { UserManagerModal } from '@/components/user/UserManagerModal';
import { SupportContactBar } from '@/components/layout/SupportContactBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';

export default function LessonPlannerPage() {
  const {
    project,
    setProject,
    currentUser,
    setCurrentUser,
    currentSlideIndex,
    setCurrentSlideIndex,
    isGenerating,
    saveStatus,
    isUserModalOpen,
    setIsUserModalOpen,
    activeSlide,
    handleGenerateLesson,
    handleApplyTemplate,
    handleSelectTheme,
    handleUpdateCurrentSlide,
    handleAddSlide,
    handleDuplicateSlide,
    handleDeleteSlide,
    handleUpdateObjective,
    handleUpdateActivity,
    handleSaveToDb,
  } = useLessonPlanner();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <SupportContactBar />
      <AppHeader
        currentUser={currentUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        saveStatus={saveStatus}
        onSaveToDb={handleSaveToDb}
        project={project}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7 space-y-4">
            <LessonInputPanel
              onGenerate={handleGenerateLesson}
              isGenerating={isGenerating}
              defaultTeacherName={currentUser.name}
              defaultSchoolName={currentUser.school}
              defaultSubject={currentUser.subject}
              currentThemeId={project.themeId}
              onSelectTheme={handleSelectTheme}
              onApplyTemplate={handleApplyTemplate}
            />
            <LessonPlanSummaryCard
              plan={project}
              onUpdateObjective={handleUpdateObjective}
              onUpdateActivity={handleUpdateActivity}
            />
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
                onDuplicateSlide={handleDuplicateSlide}
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
