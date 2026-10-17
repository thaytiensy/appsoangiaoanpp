import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { HandoffReport } from '../contracts/bridge.schema';
import { logAutoHeal, logBlocker, logStep, logSuccess } from './console-reporter';
import { applyFiles, readFileSafe } from './file-manager';
import { askGeminiAgent } from './gemini-agent';

const MAX_ATTEMPTS = 5;

function writeHandoff(report: HandoffReport): void {
  const filePath = path.resolve(process.cwd(), 'HANDOFF.json');
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
}

function updateProjectStateSuccess(task: string, files: string[]): void {
  const filePath = path.resolve(process.cwd(), 'PROJECT_STATE.md');
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newEntry = `- [x] [${timestamp}] ${task} (${files.join(', ')})`;
  const updated = content.replace(
    '## 4. Completed Modules',
    `## 4. Completed Modules\n${newEntry}`
  );
  fs.writeFileSync(filePath, updated, 'utf-8');
}

export async function runAutoLoop(): Promise<void> {
  const task = process.argv.slice(2).join(' ').trim() || 'Khởi tạo hệ thống AI Soạn Giáo Án Chuẩn';
  console.log(`\n🚀 [BẮT ĐẦU] Nhiệm vụ: ${task}`);

  let attempt = 1;
  const errors: string[] = [];
  const lastDraftFiles: Record<string, string> = {};

  while (attempt <= MAX_ATTEMPTS) {
    logStep(attempt, MAX_ATTEMPTS, 'Gemini đang thiết kế giải pháp & sinh mã nguồn...');

    try {
      const projectState = readFileSafe('PROJECT_STATE.md');
      const handoffReport = readFileSafe('HANDOFF.json');

      const plan = await askGeminiAgent({
        task,
        projectState,
        handoffReport,
        recentErrors: errors.length > 0 ? errors : undefined,
        lastFailedFiles: Object.keys(lastDraftFiles).length > 0 ? lastDraftFiles : undefined,
      });

      console.log(`💡 [Giải pháp]: ${plan.explanation}`);

      for (const file of plan.files) {
        lastDraftFiles[file.path] = file.content;
      }

      applyFiles(plan.files);
      logStep(attempt, MAX_ATTEMPTS, 'Đang thẩm định mã nguồn qua bash verify.sh...');

      try {
        execSync('bash verify.sh', { stdio: 'inherit', encoding: 'utf-8' });

        const modifiedPaths = plan.files.map((f) => f.path);
        const report: HandoffReport = {
          status: 'success',
          task,
          attempt,
          files_modified: modifiedPaths,
          errors: [],
          next_step: plan.next_step || 'Tiếp tục phát triển module kế tiếp theo kiến trúc 4 trụ cột',
        };

        writeHandoff(report);
        updateProjectStateSuccess(task, modifiedPaths);
        logSuccess(report);
        return;
      } catch (verifyError) {
        const errorMsg = verifyError instanceof Error ? verifyError.message : String(verifyError);
        errors.push(`Vòng ${attempt}: ${errorMsg}`);
        logAutoHeal(attempt, errorMsg);

        writeHandoff({
          status: 'failed',
          task,
          attempt,
          files_modified: plan.files.map((f) => f.path),
          errors,
          next_step: `Tự động khắc phục lỗi tại vòng ${attempt + 1}`,
        });
      }
    } catch (agentError) {
      const errorMsg = agentError instanceof Error ? agentError.message : String(agentError);
      errors.push(`Lỗi kết nối Gemini tại vòng ${attempt}: ${errorMsg}`);
      logAutoHeal(attempt, errorMsg);
    }

    attempt++;
  }

  const blockerReport: HandoffReport = {
    status: 'failed',
    task,
    attempt: MAX_ATTEMPTS,
    files_modified: Object.keys(lastDraftFiles),
    errors,
    next_step: 'Cần lập trình viên hỗ trợ can thiệp thủ công',
  };
  writeHandoff(blockerReport);
  logBlocker(blockerReport);
  process.exit(1);
}

if (require.main === module) {
  void runAutoLoop();
}
