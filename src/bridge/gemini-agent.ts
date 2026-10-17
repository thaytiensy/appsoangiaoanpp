import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse, GeminiResponseSchema } from '../contracts/bridge.schema';

dotenv.config();

export interface GeminiAgentInput {
  task: string;
  attempt: number;
  errorSummary?: string;
  lastFailedFiles?: Record<string, string>;
  projectStateContent?: string;
  handoffContent?: string;
}

export function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

export async function requestGeminiSolution(input: GeminiAgentInput): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('GEMINI_API_KEY chưa được cấu hình hợp lệ trong file .env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const promptParts: string[] = [
    '=== NHIỆM VỤ TỰ ĐỘNG HÓA MÃ NGUỒN (GEMINI AUTONOMOUS LOOP V2.1) ===',
    `Yêu cầu người dùng: ${input.task}`,
    `Vòng lặp hiện tại: Vòng ${input.attempt}/5`,
    '',
    '=== QUY TẮC CỐT LÕI (BẮT BUỘC TUÂN THỦ) ===',
    '1. Tuyệt đối không dùng kiểu any trong TypeScript. Bắt buộc định nghĩa kiểu chặt chẽ bằng interface hoặc Zod schema.',
    '2. Mỗi file mã nguồn (.ts, .tsx) tuyệt đối KHÔNG vượt quá 200 dòng. Nếu dài hơn, phải tách module con.',
    '3. Chỉ sử dụng thư viện đã được phê duyệt.',
    '4. Chỉ trả về JSON tuân thủ chuẩn GeminiResponseSchema: { explanation, files: [{ path, content, action }], next_step }.',
  ];

  if (input.projectStateContent) {
    promptParts.push('\n=== TRẠNG THÁI HIỆN TẠI (PROJECT_STATE.md) ===');
    promptParts.push(input.projectStateContent);
  }

  if (input.handoffContent) {
    promptParts.push('\n=== BIÊN BẢN BÀN GIAO TRƯỚC ĐÓ (HANDOFF.json) ===');
    promptParts.push(input.handoffContent);
  }

  if (input.errorSummary) {
    promptParts.push('\n=== LỖI PHÁT HIỆN TẠI VÒNG TRƯỚC (CẦN VÁ) ===');
    promptParts.push(input.errorSummary);
  }

  if (input.lastFailedFiles && Object.keys(input.lastFailedFiles).length > 0) {
    promptParts.push('\n=== NỘI DUNG MÃ NGUỒN GÂY LỖI CẦN SỬA ===');
    for (const [filePath, content] of Object.entries(input.lastFailedFiles)) {
      promptParts.push(`\n--- [FILE: ${filePath}] ---\n${content}`);
    }
  }

  const result = await model.generateContent(promptParts.join('\n'));
  const responseText = result.response.text();
  const cleanedText = cleanJsonText(responseText);

  const rawJson: unknown = JSON.parse(cleanedText);
  return GeminiResponseSchema.parse(rawJson);
}
