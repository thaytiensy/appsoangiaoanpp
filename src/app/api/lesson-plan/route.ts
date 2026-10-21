import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LessonInputSchema, LessonPlanOutputSchema, type LessonPlanOutput } from '@/contracts/app.schema';
import { generatePedagogicalPlan } from '@/services/pedagogical-generator';
import { getSlideImageUrl } from '@/services/slide-image-service';
import { normalizeNfc } from '@/services/text-normalizer';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await req.json();
    const parsedInput = LessonInputSchema.parse(rawBody);

    const input = {
      ...parsedInput,
      topic: normalizeNfc(parsedInput.topic),
      subject: normalizeNfc(parsedInput.subject),
    };

    const clientKey = req.headers.get('x-gemini-api-key')?.trim();
    const envKey = process.env.GEMINI_API_KEY?.trim();
    const apiKey = clientKey || (envKey && envKey !== 'your_api_key_here' ? envKey : '');

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
Bạn là chuyên gia sư phạm hàng đầu Việt Nam. Hãy soạn Kế hoạch bài dạy theo chuẩn ${standardDoc} và Dàn ý Slide 16:9 cho bài học sau:
- Môn học: ${input.subject} - Lớp: ${input.grade}
- Bộ sách giáo khoa: ${input.textbook}
- Tên bài dạy / Chủ đề: ${input.topic}
- Thời lượng: ${input.durationMinutes} phút (${input.periodNumber})
- Đơn vị: ${input.schoolName} - Tổ: ${input.facultyName} - GV: ${input.teacherName}
- Ghi chú: ${input.additionalNotes || 'Không có'}

LƯU Ý QUAN TRỌNG:
1. Trả về tiếng Việt chuẩn có dấu, dùng bảng mã Unicode dựng sẵn (NFC), tuyệt đối không để dấu bị tách rời hoặc chèn dấu nháy đơn vào chữ cái.
2. Với Lớp 1-5 dùng chuẩn Công văn 2345 (Khởi động, Khám phá, Luyện tập, Vận dụng). Với Lớp 6-12 dùng Công văn 5512.
3. Nội dung phải bám sát trực tiếp vào chủ đề "${input.topic}".
Trả về đúng JSON theo cấu trúc LessonPlanOutput: id, metadata, objectives, materials, activities, slides (slideNumber, title, bulletPoints, visualNote, speakerNotes), createdAt.
`.trim();

        const result = await model.generateContent(prompt);
        const rawText = result.response.text();
        const cleanJson = rawText.replace(/```json\n?|```/g, '').trim();
        const parsedData: unknown = JSON.parse(cleanJson);
        const validated: LessonPlanOutput = LessonPlanOutputSchema.parse(parsedData);

        const enriched: LessonPlanOutput = {
          ...validated,
          objectives: {
            knowledge: normalizeNfc(validated.objectives.knowledge),
            coreCompetencies: normalizeNfc(validated.objectives.coreCompetencies),
            specificCompetencies: normalizeNfc(validated.objectives.specificCompetencies),
            qualities: normalizeNfc(validated.objectives.qualities),
          },
          activities: validated.activities.map((act) => ({
            ...act,
            stepName: normalizeNfc(act.stepName),
            objective: normalizeNfc(act.objective),
            content: normalizeNfc(act.content),
            product: normalizeNfc(act.product),
            implementation: {
              transferTask: normalizeNfc(act.implementation.transferTask),
              performTask: normalizeNfc(act.implementation.performTask),
              reportDiscuss: normalizeNfc(act.implementation.reportDiscuss),
              concludeJudge: normalizeNfc(act.implementation.concludeJudge),
            },
          })),
          slides: validated.slides.map((s) => ({
            ...s,
            title: normalizeNfc(s.title),
            bulletPoints: s.bulletPoints.map((bp) => normalizeNfc(bp)),
            visualNote: normalizeNfc(s.visualNote),
            speakerNotes: normalizeNfc(s.speakerNotes),
            imageUrl: s.imageUrl || getSlideImageUrl({
              subject: input.subject,
              topic: input.topic,
              slideTitle: s.title,
              slideNumber: s.slideNumber,
            }),
          })),
        };

        return NextResponse.json(enriched);
      } catch (geminiError) {
        console.warn('[Gemini API Fallback] Chuyển tiếp sang Engine AI Sư Phạm Tích Hợp:', geminiError);
      }
    }

    const fallbackPlan = generatePedagogicalPlan(input);
    return NextResponse.json(fallbackPlan);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Lỗi xử lý sinh giáo án: ${message}` }, { status: 400 });
  }
}
