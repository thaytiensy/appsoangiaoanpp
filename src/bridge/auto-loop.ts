import { spawnSync } from 'node:child_process';
import { HandoffReport } from '../contracts/bridge.schema';
import { applyFileActions, safeReadFile, safeWriteFile } from './file-manager';
import { requestGeminiSolution } from './gemini-agent';
import { logStart, logStep, logAutoHeal, logSuccess, logBlocker } from './console-reporter';

const MAX_ATTEMPTS = 5;

function updateProjectStateWithSuccess(task: string, files: string[]): void {
  const current = safeReadFile('PROJECT_STATE.md') || '';
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const entry = `- [x] [${timestamp}] ${task} (${files.join(', ') || 'verified'})\n`;

  let updated = current;
  if (updated.includes('## 4. Completed Modules')) {
    updated = updated.replace(
      '## 4. Completed Modules\n',
      `## 4. Completed Modules\n${entry}`
    );
  } else {
    updated += `\n## 4. Completed Modules\n${entry}`;
  }
  safeWriteFile('PROJECT_STATE.md', updated);
}

export async function runAutoLoop(task: string): Promise<void> {
  logStart(task);

  let lastFailedFiles: Record<string, string> = {};
  let lastErrors: string[] = [];
  const allModifiedFiles = new Set<string>();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const stepMsg =
      attempt === 1
        ? 'Gemini đang thiết kế giải pháp & sinh mã nguồn...'
        : 'Đang áp dụng bản vá từ Gemini và chạy verify.sh...';
    logStep(attempt, MAX_ATTEMPTS, stepMsg);

    const projectStateContent = safeReadFile('PROJECT_STATE.md') || undefined;
    const handoffContent = safeReadFile('HANDOFF.json') || undefined;

    let geminiResponse;
    try {
      geminiResponse = await requestGeminiSolution({
        task,
        attempt,
        errorSummary: lastErrors.length > 0 ? lastErrors.join('\n') : undefined,
        lastFailedFiles,
        projectStateContent,
        handoffContent,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`❌ [LỖI KẾT NỐI GEMINI] ${errorMsg}`);
      const blockerReport: HandoffReport = {
        status: 'failed',
        task,
        attempt,
        files_modified: Array.from(allModifiedFiles),
        errors: [`Lỗi gọi Gemini API: ${errorMsg}`],
        next_step: 'Kiểm tra lại GEMINI_API_KEY trong file .env',
      };
      safeWriteFile('HANDOFF.json', JSON.stringify(blockerReport, null, 2));
      logBlocker(blockerReport, MAX_ATTEMPTS);
      process.exit(1);
    }

    // Lưu các file draft vào RAM trước khi ghi xuống đĩa & chạy verify
    const currentAttemptFiles: Record<string, string> = {};
    for (const f of geminiResponse.files) {
      currentAttemptFiles[f.path] = f.content;
    }

    // Áp dụng file xuống ổ đĩa
    const modified = applyFileActions(geminiResponse.files);
    modified.forEach((m) => allModifiedFiles.add(m));

    // Thực thi rào chắn verify.sh
    const verifyResult = spawnSync('bash', ['verify.sh'], {
      encoding: 'utf-8',
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (verifyResult.status === 0) {
      // Vượt qua toàn bộ kiểm tra thành công!
      const filesArray = Array.from(allModifiedFiles);
      updateProjectStateWithSuccess(task, filesArray);

      const successReport: HandoffReport = {
        status: 'success',
        task,
        attempt,
        files_modified: filesArray,
        errors: [],
        next_step: geminiResponse.next_step || 'Sẵn sàng triển khai',
      };
      safeWriteFile('HANDOFF.json', JSON.stringify(successReport, null, 2));
      logSuccess(successReport, MAX_ATTEMPTS);
      return;
    }

    // verify.sh thất bại và đã tự động rollback mã nguồn về HEAD
    const stdout = verifyResult.stdout || '';
    const stderr = verifyResult.stderr || '';
    const combinedLog = `${stderr}\n${stdout}`.trim();

    lastErrors = [combinedLog];
    lastFailedFiles = currentAttemptFiles;

    const errorSummaryLine =
      stderr.split('\n').filter((l) => l.includes('❌') || l.includes('Error'))[0] ||
      combinedLog.split('\n')[0] ||
      'Lỗi kiểm thử chất lượng mã nguồn';

    logAutoHeal(attempt, errorSummaryLine);

    const pendingReport: HandoffReport = {
      status: attempt === MAX_ATTEMPTS ? 'failed' : 'pending_review',
      task,
      attempt,
      files_modified: Array.from(allModifiedFiles),
      errors: [combinedLog],
      next_step:
        attempt === MAX_ATTEMPTS
          ? 'Cần người dùng can thiệp thủ công'
          : `Tự động gửi log cho Gemini vá ở vòng ${attempt + 1}`,
    };
    safeWriteFile('HANDOFF.json', JSON.stringify(pendingReport, null, 2));

    if (attempt === MAX_ATTEMPTS) {
      logBlocker(pendingReport, MAX_ATTEMPTS);
      process.exit(1);
    }
  }
}

const userTask = process.argv.slice(2).join(' ').trim();
if (!userTask) {
  console.log('Cách dùng: npm run auto "<Yêu cầu công việc>"');
} else {
  runAutoLoop(userTask).catch((err) => {
    console.error('Lỗi ngoại lệ không xử lý được:', err);
    process.exit(1);
  });
}
