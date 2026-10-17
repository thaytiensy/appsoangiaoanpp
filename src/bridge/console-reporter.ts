import type { HandoffReport } from '../contracts/bridge.schema';

export function logStep(attempt: number, maxAttempts: number, message: string): void {
  console.log(`\n⏳ [Vòng ${attempt}/${maxAttempts}] ${message}`);
}

export function logAutoHeal(attempt: number, errorSummary: string): void {
  console.log(`\n⚠️  [TỰ HÀN GẮN] Bắt được lỗi tại vòng ${attempt}:`);
  console.log(`   ${errorSummary}`);
  console.log('   -> Đang chuyển log lỗi cho Gemini Agent để tự động phân tích và sinh bản vá...');
}

export function logSuccess(report: HandoffReport): void {
  console.log('\n============================================================');
  console.log(`✅ HOÀN TẤT TÁC VỤ TỰ ĐỘNG (Đạt chuẩn tại vòng ${report.attempt})`);
  console.log('------------------------------------------------------------');
  console.log(`📌 Công việc    : ${report.task}`);
  console.log(`📂 File đã xử lý : ${report.files_modified.join(', ') || 'Không có file mới'}`);
  console.log('🖼️  Ảnh giao diện: .preview/desktop-latest.png | .preview/mobile-latest.png');
  console.log(`👉 Tiếp theo    : ${report.next_step}`);
  console.log('============================================================\n');
}

export function logBlocker(report: HandoffReport): void {
  console.error('\n🛑 =========================================================');
  console.error(`❌ TÁC VỤ BỊ CHẶN (BLOCKER) - Quá ${report.attempt} vòng tự sửa thất bại`);
  console.error('------------------------------------------------------------');
  console.error(`📌 Công việc    : ${report.task}`);
  console.error('⚠️  Các lỗi gặp phải:');
  report.errors.forEach((err, idx) => {
    console.error(`   ${idx + 1}. ${err}`);
  });
  console.error('\n📋 NỘI DUNG BIÊN BẢN BÀN GIAO (HANDOFF.json):');
  console.error(JSON.stringify(report, null, 2));
  console.error('============================================================\n');
}
