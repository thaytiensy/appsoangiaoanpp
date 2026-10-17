#!/usr/bin/env bash
set -e

# Đảm bảo PATH có Node và Git trên môi trường Windows / Linux
export PATH="/usr/bin:/c/Users/win 10 pro/AppData/Local/Microsoft/WinGet/Packages/OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe/node-v24.19.0-win-x64:/c/Users/win 10 pro/AppData/Local/Programs/Git/cmd:$PATH"

# ========================================================
# TẦNG 0: Git Baseline
# ========================================================
echo "=== [0/4] Tầng 0: Kiểm tra Git Baseline ==="
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Chưa có Git repo. Đang khởi tạo git init..."
  git init
  git add .
  git commit -m "chore: initial baseline"
elif ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "Chưa có commit gốc HEAD. Đang tạo commit ban đầu..."
  git add .
  git commit -m "chore: initial baseline"
else
  echo "✅ Git repo & commit HEAD hợp lệ."
fi

# ========================================================
# TẦNG 1: Guardrail Check (Negative Constraints)
# ========================================================
echo "=== [1/4] Tầng 1: Guardrail Check (<= 200 dòng, 0 any) ==="

# 1.1 Kiểm tra giới hạn tối đa 200 dòng/file
OVERSIZED_FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + | awk '$1 > 200 && $2 != "total" {print $2 " (" $1 " lines)"}')
if [ -n "$OVERSIZED_FILES" ]; then
  echo "❌ [TẦNG 1 THẤT BẠI] Phát hiện file vượt quá 200 dòng trong src/:" >&2
  echo "$OVERSIZED_FILES" >&2
  echo "Đang rollback để bảo đảm kiến trúc tinh gọn..." >&2
  git reset --hard HEAD
  exit 1
fi

# 1.2 Kiểm tra sử dụng kiểu any (: any, as any, <any>)
ANY_VIOLATIONS=$(grep -rnE ':\s*any\b|as\s+any\b|<any>' src/ --include="*.ts" --include="*.tsx" || true)
if [ -n "$ANY_VIOLATIONS" ]; then
  echo "❌ [TẦNG 1 THẤT BẠI] Phát hiện sử dụng kiểu any trong mã nguồn TypeScript:" >&2
  echo "$ANY_VIOLATIONS" >&2
  echo "Đang rollback mã nguồn vi phạm quy tắc Negative Constraints..." >&2
  git reset --hard HEAD
  exit 1
fi
echo "✅ Tầng 1 ĐẠT CHUẨN: Toàn bộ file src/ <= 200 dòng và 0 any."

# ========================================================
# TẦNG 2: Typecheck, Lint & Build
# ========================================================
echo "=== [2/4] Tầng 2: Kiểm tra Typecheck, Lint & Build ==="

echo "--> Đang chạy npm run typecheck..."
npm run typecheck || {
  echo "❌ [TẦNG 2 THẤT BẠI] Typecheck phát hiện lỗi! Rollback mã nguồn..." >&2
  git reset --hard HEAD
  exit 1
}

echo "--> Đang chạy npm run lint..."
npm run lint || {
  echo "❌ [TẦNG 2 THẤT BẠI] Linter phát hiện lỗi! Rollback mã nguồn..." >&2
  git reset --hard HEAD
  exit 1
}

echo "--> Đang chạy BUILD_MODE=verify npm run build..."
BUILD_MODE=verify npm run build || {
  echo "❌ [TẦNG 2 THẤT BẠI] Build Next.js thất bại! Rollback mã nguồn..." >&2
  rm -rf .next-verify
  git reset --hard HEAD
  exit 1
}
rm -rf .next-verify
echo "✅ Tầng 2 ĐẠT CHUẨN: Typecheck, Lint và Build thành công 100% (Đã dọn dẹp .next-verify)."

# ========================================================
# TẦNG 3: Safety Checkpoint
# ========================================================
echo "=== [3/4] Tầng 3: Tạo Checkpoint An Toàn ==="
git add .
git commit -m "checkpoint: verified build at $(date +'%Y-%m-%d %H:%M:%S')" || true
echo "✅ HOÀN TẤT: Toàn bộ 4 tầng kiểm tra thành công! Đã chốt checkpoint an toàn."
