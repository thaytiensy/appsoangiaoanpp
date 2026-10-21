import { NextResponse } from 'next/server';
import { LessonInputSchema } from '@/contracts/app.schema';
import { generateWithSelectedAI } from '@/services/ai-router';
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

    const clientKeyHeader = req.headers.get('x-gemini-api-key') || req.headers.get('x-ai-api-key') || '';
    const plan = await generateWithSelectedAI(input, clientKeyHeader);

    return NextResponse.json(plan);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Dữ liệu không hợp lệ: ${message}` }, { status: 400 });
  }
}
