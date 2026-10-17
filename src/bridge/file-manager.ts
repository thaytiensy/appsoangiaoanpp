import fs from 'node:fs';
import path from 'node:path';
import type { FileAction } from '../contracts/bridge.schema';

export const PROTECTED_PATHS: readonly string[] = [
  'verify.sh',
  'src/bridge/',
  'src/contracts/bridge.schema.ts',
  'src/contracts/app.schema.ts',
  'package.json',
  'tsconfig.json',
  '.env',
];

export function isPathProtected(targetPath: string): boolean {
  const normalized = targetPath.replace(/\\/g, '/');
  return PROTECTED_PATHS.some((protectedPath) =>
    normalized.startsWith(protectedPath) || normalized === protectedPath
  );
}

export function readFileSafe(filePath: string): string {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    return '';
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

export function applyFileAction(action: FileAction): void {
  if (isPathProtected(action.path)) {
    console.warn(`[File Manager] Bỏ qua file thuộc danh mục bảo vệ: ${action.path}`);
    return;
  }

  const fullPath = path.resolve(process.cwd(), action.path);

  if (action.action === 'delete') {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`[File Manager] Đã xóa file: ${action.path}`);
    }
    return;
  }

  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, action.content, 'utf-8');
  console.log(`[File Manager] Đã ghi file (${action.action}): ${action.path}`);
}

export function applyFiles(files: FileAction[]): void {
  for (const file of files) {
    applyFileAction(file);
  }
}
