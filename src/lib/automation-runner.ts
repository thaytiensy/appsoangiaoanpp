import fs from "node:fs";
import path from "node:path";
import { chromium, Browser, Page, Response } from "@playwright/test";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrapedData, E2EReport } from "@/types/automation";

export async function launchPlaywrightBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({ channel: "msedge", headless: true });
  } catch {
    return await chromium.launch({ headless: true });
  }
}

export async function captureScreenshotAction(page: Page, taskId: string): Promise<string> {
  const capturesDir = path.resolve(process.cwd(), "public/captures");
  if (!fs.existsSync(capturesDir)) {
    fs.mkdirSync(capturesDir, { recursive: true });
  }
  const filePath = path.join(capturesDir, `${taskId}.png`);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: filePath, fullPage: false });
  return `/captures/${taskId}.png`;
}

export async function summarizeWithGemini(title: string, desc: string, headings: string[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    return "Gemini API Key chưa cấu hình để sinh tóm tắt.";
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    const prompt = `Bạn là trợ lý AI tóm tắt nội dung web. Hãy phân tích ngắn gọn trong 2-3 câu các thông tin sau:\nTiêu đề: ${title}\nMô tả: ${desc}\nCác mục chính: ${headings.slice(0, 6).join(" | ")}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    return `Không thể tạo tóm tắt Gemini: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function scrapePageAction(page: Page): Promise<ScrapedData> {
  const title = (await page.title()) || "Không có tiêu đề";
  const descEl = await page.$('meta[name="description"]');
  const description = descEl ? ((await descEl.getAttribute("content")) || "") : "";

  const rawHeadings = await page.locator("h1, h2, h3").allInnerTexts();
  const headings = rawHeadings
    .map((h) => h.trim())
    .filter((h) => h.length > 0)
    .slice(0, 8);

  const summary = await summarizeWithGemini(title, description, headings);
  return { title, description, headings, summary };
}

export async function runE2ETestAction(
  page: Page,
  response: Response | null,
  loadTimeMs: number
): Promise<E2EReport> {
  const statusCode = response ? response.status() : 200;
  const pageTitle = (await page.title()) || "N/A";
  const buttonCount = await page.locator("button, input[type='submit']").count();
  const inputCount = await page.locator("input, textarea, select").count();
  const passed = statusCode >= 200 && statusCode < 400;

  return {
    statusCode,
    pageTitle,
    loadTimeMs,
    buttonCount,
    inputCount,
    passed,
    details: `Tải trang hoàn tất (${loadTimeMs}ms). Phát hiện ${buttonCount} nút bấm và ${inputCount} trường nhập dữ liệu.`,
  };
}
