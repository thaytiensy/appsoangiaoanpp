Write-Host "=== [1/4] Kiem tra dinh kieu TypeScript ===" -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "Typecheck that bai! Rollback ma nguon..." -ForegroundColor Red
    git reset --hard HEAD
    exit 1
}

Write-Host "=== [2/4] Kiem tra gioi han dong (Toi da 200 dong/file) ===" -ForegroundColor Cyan
$oversized = Get-ChildItem -Recurse -Include *.ts,*.tsx src | Where-Object { (Get-Content $_.FullName).Count -gt 200 }
if ($oversized) {
    Write-Host "Phat hien file vuot qua 200 dong:" -ForegroundColor Red
    $oversized | ForEach-Object { Write-Host "$($_.FullName): $((Get-Content $_.FullName).Count) lines" }
    git reset --hard HEAD
    exit 1
}

Write-Host "=== [3/4] Kiem tra Build ung dung ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build that bai! Rollback de chong rac ma nguon..." -ForegroundColor Red
    git reset --hard HEAD
    exit 1
}

Write-Host "=== [4/4] Tao Checkpoint an toan ===" -ForegroundColor Cyan
git add .
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
git commit -m "checkpoint: build passed at $timestamp"
Write-Host "HOAN TAT: Ma nguon an toan, da tao checkpoint thanh cong!" -ForegroundColor Green
