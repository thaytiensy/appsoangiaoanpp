import { useState } from 'react';
import { LessonPlanProject, SlideItem, PedagogicalActivity } from '@/types/lesson-plan';
import { User } from '@/types/user';
import { INITIAL_LESSON_PLAN } from '@/lib/initial-data';
import { generatePedagogicalLessonPlan, LessonGeneratorParams } from '@/lib/ai-lesson-generator';
import { saveLessonPlanAction } from '@/lib/actions';
import { ParsedTemplateResult } from '@/lib/pptx-parser';
import { sanitizePptxText, sanitizePptxList } from '@/utils/sanitizePptxText';

export const DEFAULT_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Thầy Đỗ Tiến Sỹ',
  email: 'dotiensy.admin@gmail.com',
  phone: '0353205414',
  role: 'ADMIN',
  school: 'THPT Chuyên Lê Hồng Phong',
  subject: 'Toán học & Tin học',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export function useLessonPlanner() {
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

  const handleApplyTemplate = (parsed: ParsedTemplateResult) => {
    setProject((prev) => {
      const sanitizedIncomingSlides = (parsed.slides || []).map((s) => ({
        ...s,
        title: sanitizePptxText(s.title) || `Slide ${s.slideNumber}`,
        bullets: sanitizePptxList(s.bullets).length > 0
          ? sanitizePptxList(s.bullets)
          : ['Nội dung bài giảng PowerPoint tích hợp'],
        teacherScript: sanitizePptxText(s.teacherScript),
      }));

      const newSlides = sanitizedIncomingSlides.length > 0 ? sanitizedIncomingSlides : prev.slides;
      const newLessonName = sanitizePptxText(parsed.lessonTitle) || prev.lessonName;
      return {
        ...prev,
        lessonName: newLessonName,
        customBackgroundUrl: parsed.backgroundUrl ?? prev.customBackgroundUrl,
        slides: newSlides,
        updatedAt: new Date().toISOString(),
      };
    });
    setCurrentSlideIndex(0);
  };

  const handleSelectTheme = (themeId: string) => {
    setProject((prev) => ({ ...prev, themeId, updatedAt: new Date().toISOString() }));
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

  const handleDuplicateSlide = (index: number) => {
    const target = project.slides[index];
    if (!target) return;
    const cloned: SlideItem = {
      ...target,
      id: crypto.randomUUID ? crypto.randomUUID() : `slide-${Date.now()}`,
      slideNumber: index + 2,
      title: `${target.title} (Bản sao)`,
      bullets: [...target.bullets],
    };
    const newSlides = [...project.slides];
    newSlides.splice(index + 1, 0, cloned);
    const renumbered = newSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    setProject((prev) => ({ ...prev, slides: renumbered, updatedAt: new Date().toISOString() }));
    setCurrentSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (project.slides.length <= 4) return;
    const filtered = project.slides.filter((_, i) => i !== index).map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    setProject((prev) => ({ ...prev, slides: filtered, updatedAt: new Date().toISOString() }));
    setCurrentSlideIndex(Math.max(0, index - 1));
  };

  const handleUpdateObjective = (index: number, description: string) => {
    setProject((prev) => {
      const newObjs = [...prev.objectives];
      if (newObjs[index]) {
        newObjs[index] = { ...newObjs[index], description };
      }
      return { ...prev, objectives: newObjs, updatedAt: new Date().toISOString() };
    });
  };

  const handleUpdateActivity = (index: number, updated: Partial<PedagogicalActivity>) => {
    setProject((prev) => {
      const newActs = [...prev.activities] as [PedagogicalActivity, PedagogicalActivity, PedagogicalActivity, PedagogicalActivity];
      if (newActs[index]) {
        newActs[index] = { ...newActs[index], ...updated };
      }
      return { ...prev, activities: newActs, updatedAt: new Date().toISOString() };
    });
  };

  const handleSaveToDb = async () => {
    setSaveStatus('saving');
    const res = await saveLessonPlanAction(project);
    setSaveStatus(res.success ? 'saved' : 'error');
    if (res.success) setTimeout(() => setSaveStatus(null), 3000);
  };

  return {
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
  };
}
