import { NextRequest, NextResponse } from "next/server";
import { Browser } from "@playwright/test";
import { ExecuteTaskRequestSchema, TaskExecutionResult } from "@/types/automation";
import {
  launchPlaywrightBrowser,
  captureScreenshotAction,
  scrapePageAction,
  runE2ETestAction,
} from "@/lib/automation-runner";

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  let browser: Browser | null = null;

  try {
    const rawBody: unknown = await req.json();
    const parsed = ExecuteTaskRequestSchema.parse(rawBody);
    const { taskId, type, targetUrl } = parsed;

    browser = await launchPlaywrightBrowser();
    const page = await browser.newPage();

    const response = await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 25000,
    });
    const loadTimeMs = Math.round(performance.now() - startTime);

    let screenshotUrl: string | undefined;
    let scrapedData;
    let e2eReport;

    if (type === "SCREENSHOT") {
      screenshotUrl = await captureScreenshotAction(page, taskId);
    } else if (type === "SCRAPE") {
      scrapedData = await scrapePageAction(page);
    } else if (type === "E2E_TEST") {
      e2eReport = await runE2ETestAction(page, response, loadTimeMs);
    } else {
      // FORM_FILL or other
      screenshotUrl = await captureScreenshotAction(page, taskId);
    }

    await browser.close();
    browser = null;

    const durationMs = Math.round(performance.now() - startTime);
    const result: TaskExecutionResult = {
      taskId,
      type,
      success: true,
      durationMs,
      screenshotUrl,
      scrapedData,
      e2eReport,
      executedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {});
    }

    const durationMs = Math.round(performance.now() - startTime);
    const errMsg = error instanceof Error ? error.message : String(error);

    const failResult: TaskExecutionResult = {
      taskId: "unknown",
      type: "ERROR",
      success: false,
      durationMs,
      error: errMsg,
      executedAt: new Date().toISOString(),
    };

    return NextResponse.json(failResult, { status: 500 });
  }
}
