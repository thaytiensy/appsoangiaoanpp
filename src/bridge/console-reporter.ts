import { HandoffReport } from '../contracts/bridge.schema';

export function logStart(task: string): void {
  console.log(`\n🚀 [BẮT ĐẦU] Nhiệm vụ: ${task}`);
}

export function logStep(attempt: number, maxAttempts: number, message: string): void {
  console.log(`⏳ [Vòng ${attempt}/${maxAttempts}] ${message}`);
}

export function logAutoHeal(attempt: number, errorSummary: string): void {
  console.log(
    `⚠️ [TỰ HÀN GẮN] ${errorSummary} ở vòng ${attempt}. Đang tự động gửi log lỗi cho Gemini vá lại...`
  );
}

export function logSuccess(report: HandoffReport, maxAttempts: number = 5): void {
  const divider = '='.repeat(60);
  const subDivider = '-'.repeat(60);
  const filesList = report.files_modified.length > 0 ? report.files_modified.join(', ') : '(Không có file nào)';
  const previewPath = '.preview/desktop-latest.png | .preview/mobile-latest.png';

  console.log(`\n${divider}`);
  console.log(`✅ HOÀN TẤT TÁC VỤ TỰ ĐỘNG (Đạt chuẩn tại vòng ${report.attempt}/${maxAttempts})`);
  console.log(subDivider);
  console.log(`📌 Công việc   : ${report.task}`);
  console.log(`📂 File đã sửa : ${filesList}`);
  console.log(`🖼️ Ảnh giao diện: ${previewPath}`);
  console.log(`👉 Tiếp theo   : ${report.next_step}`);
  console.log(`${divider}\n`);
}

export function logBlocker(report: HandoffReport, maxAttempts: number = 5): void {
  const divider = '='.repeat(60);
  const subDivider = '-'.repeat(60);

  console.error(`\n${divider}`);
  console.error(`🚨 [BLOCKER] Không thể giải quyết tác vụ sau ${maxAttempts} vòng lặp tự động!`);
  console.error(subDivider);
  console.error(`📌 Công việc   : ${report.task}`);
  console.error(`❌ Tổng số lỗi : ${report.errors.length}`);
  report.errors.forEach((err, idx) => {
    console.error(`   [${idx + 1}] ${err.trim().split('\n')[0]}`);
  });
  console.error(subDivider);
  console.error('📋 Vui lòng sao chép nội dung HANDOFF.json bên dưới để kiểm tra:');
  console.error(JSON.stringify(report, null, 2));
  console.error(`${divider}\n`);
}
