import { GoogleGenerativeAI } from '@google/generative-ai';
import { LessonPlanOutputSchema, type LessonInput, type LessonPlanOutput } from '../contracts/app.schema';
import { generatePedagogicalPlan } from './pedagogical-generator';
import { getSlideImageUrl } from './slide-image-service';
import { normalizeNfc } from './text-normalizer';
import { getAIModelByProvider } from '../constants/ai-models';

function buildPedagogyPrompt(input: LessonInput): string {
  const standardDoc = input.grade <= 5 ? 'Công văn 2345/BGDĐT-GDTH' : 'Công văn 5512/BGDĐT-GDTrH';
  return `
Bạn là chuyên gia sư phạm hàng đầu Việt Nam. Hãy soạn Kế hoạch bài dạy theo chuẩn ${standardDoc} và Dàn ý Slide 16:9 cho bài học sau:
- Môn học: ${input.subject} - Lớp: ${input.grade}
- Bộ sách giáo khoa: ${input.textbook}
- Tên bài dạy / Chủ đề: ${input.topic}
- Thời lượng: ${input.durationMinutes} phút (${input.periodNumber})
- Đơn vị: ${input.schoolName || 'Nhà trường'} - Tổ: ${input.facultyName || 'Tổ bộ môn'} - GV: ${input.teacherName || 'Giáo viên bộ môn'}
- Ghi chú: ${input.additionalNotes || 'Không có'}

LƯU Ý BẮT BUỘC:
1. Trả về tiếng Việt chuẩn Unicode dựng sẵn (NFC), tuyệt đối không để dấu bị tách rời.
2. Dàn ý Slide 16:9 gồm 8 slide: Slide 1 Lời chào mừng quý Thầy Cô & học sinh; Slide 2 Mục tiêu; Slide 3 Khởi động; Slide 4 Khám phá; Slide 5 Ví dụ mẫu; Slide 6 Luyện tập; Slide 7 Vận dụng; Slide 8 Cảm ơn chân thành quý Thầy Cô và dặn dò.
Trả về duy nhất định dạng JSON thuần theo schema: id, metadata, objectives, materials, activities, slides, createdAt.
`.trim();
}

async function callGemini(input: LessonInput, apiKey: string): Promise<LessonPlanOutput | null> {
  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: input.aiModel.includes('flash') ? 'gemini-2.5-flash' : 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    });
    const result = await model.generateContent(buildPedagogyPrompt(input));
    const cleanJson = result.response.text().replace(/```json\n?|```/g, '').trim();
    const parsed: unknown = JSON.parse(cleanJson);
    return LessonPlanOutputSchema.parse({ ...(parsed as object), generatedBy: 'Google Gemini 2.5 Flash' });
  } catch {
    return null;
  }
}

async function callOpenAICompatible(
  input: LessonInput,
  endpoint: string,
  modelName: string,
  apiKey: string,
  providerLabel: string
): Promise<LessonPlanOutput | null> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: 'Bạn là chuyên gia sư phạm Việt Nam. Luôn trả lời bằng định dạng JSON thuần không bọc markdown.' },
          { role: 'user', content: buildPedagogyPrompt(input) },
        ],
        temperature: 0.1,
      }),
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const data = json as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content || '';
    const cleanJson = content.replace(/```json\n?|```/g, '').trim();
    const parsed: unknown = JSON.parse(cleanJson);
    return LessonPlanOutputSchema.parse({ ...(parsed as object), generatedBy: providerLabel });
  } catch {
    return null;
  }
}

export async function generateWithSelectedAI(input: LessonInput, clientKeyHeader = ''): Promise<LessonPlanOutput> {
  const modelMeta = getAIModelByProvider(input.aiProvider);
  const userKey = (input.apiKey || clientKeyHeader || '').trim();

  if (input.aiProvider === 'gemini') {
    const envKey = (process.env.GEMINI_API_KEY || '').trim();
    const key = userKey || (envKey !== 'your_api_key_here' ? envKey : '');
    if (key) {
      const plan = await callGemini(input, key);
      if (plan) return enrichPlan(plan, input);
    }
  }

  if (input.aiProvider === 'openai') {
    const key = userKey || (process.env.OPENAI_API_KEY || '').trim();
    if (key) {
      const plan = await callOpenAICompatible(input, 'https://api.openai.com/v1/chat/completions', 'gpt-4o', key, 'OpenAI ChatGPT (GPT-4o)');
      if (plan) return enrichPlan(plan, input);
    }
  }

  if (input.aiProvider === 'deepseek') {
    const key = userKey || (process.env.DEEPSEEK_API_KEY || '').trim();
    if (key) {
      const plan = await callOpenAICompatible(input, 'https://api.deepseek.com/chat/completions', 'deepseek-chat', key, 'DeepSeek V3 / R1');
      if (plan) return enrichPlan(plan, input);
    }
  }

  // Fallback an toàn 100% sang Engine Sư Phạm Tích Hợp
  return generatePedagogicalPlan(input, `${modelMeta.name} [Động Cơ Sư Phạm Tích Hợp]`);
}

function enrichPlan(plan: LessonPlanOutput, input: LessonInput): LessonPlanOutput {
  return {
    ...plan,
    objectives: {
      knowledge: normalizeNfc(plan.objectives.knowledge),
      coreCompetencies: normalizeNfc(plan.objectives.coreCompetencies),
      specificCompetencies: normalizeNfc(plan.objectives.specificCompetencies),
      qualities: normalizeNfc(plan.objectives.qualities),
    },
    activities: plan.activities.map((act) => ({
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
    slides: plan.slides.map((s) => ({
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
}
