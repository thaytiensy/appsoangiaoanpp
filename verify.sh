#!/usr/bin/env bash
set -e

echo "=== [1/4] Kiểm tra định kiểu TypeScript ==="
npx tsc --noEmit || { echo "❌ Typecheck thất bại! Rollback mã nguồn..."; git reset --hard HEAD; exit 1; }

echo "=== [2/4] Kiểm tra giới hạn dòng (Tối đa 200 dòng/file) ==="
OVERSIZED_FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + | awk '$1 > 200 && $2 != "total" {print $2 " (" $1 " lines)"}')
if [ -n "$OVERSIZED_FILES" ]; then
  echo "❌ Phát hiện file vượt quá 200 dòng:"
  echo "$OVERSIZED_FILES"
  echo "Đang rollback để bảo đảm kiến trúc tinh gọn..."
  git reset --hard HEAD
  exit 1
fi

echo "=== [3/4] Kiểm tra Build ứng dụng ==="
npm run build || {
  echo "❌ Build thất bại! Rollback để chống rác mã nguồn..."
  git reset --hard HEAD
  exit 1
}

echo "=== [4/4] Tạo Checkpoint an toàn ==="
git add .
git commit -m "checkpoint: build passed at $(date +'%Y-%m-%d %H:%M:%S')" || true
echo "✅ HOÀN TẤT: Mã nguồn an toàn, đã tạo checkpoint thành công!"
