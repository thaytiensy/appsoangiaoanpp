import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LessonInputSchema, LessonPlanOutputSchema, type LessonPlanOutput } from '@/contracts/app.schema';
import { generatePedagogicalPlan } from '@/services/pedagogical-generator';
import { getSlideImageUrl } from '@/services/slide-image-service';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await req.json();
    const input = LessonInputSchema.parse(rawBody);

    const clientKey = req.headers.get('x-gemini-api-key')?.trim();
    const envKey = process.env.GEMINI_API_KEY?.trim();
    const apiKey = clientKey || (envKey && envKey !== 'your_api_key_here' ? envKey : '');

    // Nếu có API Key hợp lệ, thử gọi Gemini API trước
    if (apiKey) {
      try {
        const standardDoc = input.grade <= 5 ? 'Công văn 2345/BGDĐT-GDTH' : 'Công văn 5512/BGDĐT-GDTrH';
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const prompt = `
Bạn là chuyên gia sư phạm hàng đầu Việt Nam. Hãy soạn Kế hoạch bài dạy (Giáo án) theo chuẩn ${standardDoc} và Cấu trúc Slide PowerPoint 16:9 cho bài học sau:
- Môn học: ${input.subject} - Lớp: ${input.grade}
- Bộ sách giáo khoa: ${input.textbook}
- Tên bài học / Chủ đề: ${input.topic}
- Thời lượng: ${input.durationMinutes} phút (${input.periodNumber})
- Đơn vị: ${input.schoolName} - Tổ: ${input.facultyName} - GV: ${input.teacherName}
- Ghi chú sư phạm: ${input.additionalNotes || 'Không có'}

Trả về đúng JSON gồm: id, metadata, objectives (knowledge, coreCompetencies, specificCompetencies, qualities), materials (teacherPreparation, studentPreparation), activities (4 hoạt động: Mở đầu, Hình thành kiến thức, Luyện tập, Vận dụng, mỗi hoạt động có stepName, duration, objective, content, product, implementation: { transferTask, performTask, reportDiscuss, concludeJudge }), slides (mảng slide 16:9 với slideNumber, title, bulletPoints, visualNote, speakerNotes), createdAt.
`.trim();

        const result = await model.generateContent(prompt);
        const rawText = result.response.text();
        const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
        const parsedData: unknown = JSON.parse(cleanJson);
        const validated: LessonPlanOutput = LessonPlanOutputSchema.parse(parsedData);

        const enrichedWithImages: LessonPlanOutput = {
          ...validated,
          slides: validated.slides.map((s) => ({
            ...s,
            imageUrl: s.imageUrl || getSlideImageUrl({
              subject: input.subject,
              topic: input.topic,
              slideTitle: s.title,
              slideNumber: s.slideNumber,
            }),
          })),
        };

        return NextResponse.json(enrichedWithImages);
      } catch (geminiError) {
        console.warn('[Gemini API Fallback] Chuyển tiếp sang Engine AI Sư Phạm Tích Hợp:', geminiError);
      }
    }

    // Bỏ qua khóa API / Fallback an toàn: Dùng Engine Sư phạm chuẩn Bộ GD
    const fallbackPlan = generatePedagogicalPlan(input);
    return NextResponse.json(fallbackPlan);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Lỗi xử lý sinh giáo án: ${message}` }, { status: 400 });
  }
}
