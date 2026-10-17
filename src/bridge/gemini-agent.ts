import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { GeminiResponseSchema, type GeminiResponse } from '../contracts/bridge.schema';

dotenv.config();

export interface AgentContext {
  task: string;
  projectState: string;
  handoffReport: string;
  recentErrors?: string[];
  lastFailedFiles?: Record<string, string>;
}

export async function askGeminiAgent(context: AgentContext): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Thiếu biến môi trường GEMINI_API_KEY trong .env');
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({
    model: 'gemini-3.8-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const prompt = `
Bạn là AI Kỹ sư trưởng trong Vòng lặp Tự động hóa Khép kín (Gemini ⇄ Antigravity Autonomous Loop).

QUY TẮC CỐT LÕI (BẮT BUỘC):
1. Tuyệt đối KHÔNG sử dụng kiểu tự do (cấm hoàn toàn từ khóa any) trong TypeScript. Định kiểu chặt chẽ bằng Zod schema hoặc interface.
2. Mỗi file mã nguồn (.ts, .tsx) tuyệt đối KHÔNG vượt quá 200 dòng. Hãy tách nhỏ module nếu dài.
3. Chỉ sử dụng các thư viện đã phê duyệt: @google/generative-ai, zod, @playwright/test, lucide-react, dotenv, tsx.
4. Trả về đúng JSON theo định dạng GeminiResponseSchema:
   {
     "explanation": "Mô tả giải pháp",
     "files": [
       { "path": "đường dẫn tương đối", "content": "toàn bộ mã nguồn", "action": "create" | "update" | "delete" }
     ],
     "next_step": "Gợi ý bước kế tiếp"
   }

BỐI CẢNH DỰ ÁN:
- YÊU CẦU: ${context.task}
- PROJECT_STATE.md:
${context.projectState}
- TRẠNG THÁI GẦN NHẤT (HANDOFF.json):
${context.handoffReport}

${
  context.recentErrors && context.recentErrors.length > 0
    ? `LỖI VỪA PHÁT SINH TRONG BƯỚC TRƯỚC (CẦN TỰ SỬA):\n${context.recentErrors.join('\n')}`
    : ''
}

${
  context.lastFailedFiles && Object.keys(context.lastFailedFiles).length > 0
    ? `NỘI DUNG CODE GÂY LỖI TRƯỚC ĐÓ:\n${JSON.stringify(context.lastFailedFiles, null, 2)}`
    : ''
}
`.trim();

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleanedText = rawText.replace(/```json\n?|```/g, '').trim();

  try {
    const parsedJson: unknown = JSON.parse(cleanedText);
    return GeminiResponseSchema.parse(parsedJson);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Dữ liệu từ Gemini không khớp schema: ${errorMsg}\nNội dung raw: ${cleanedText}`);
  }
}
