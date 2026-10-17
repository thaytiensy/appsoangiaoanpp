import fs from 'node:fs';
import path from 'node:path';
import { FileAction } from '../contracts/bridge.schema';

export const PROTECTED_PATHS: readonly string[] = [
  'verify.sh',
  'src/bridge/',
  'src/contracts/bridge.schema.ts',
];

export function normalizeRelPath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

export function isProtectedPath(filePath: string): boolean {
  const normalized = normalizeRelPath(filePath);
  return PROTECTED_PATHS.some((p) => {
    const cleanP = normalizeRelPath(p);
    return normalized === cleanP || normalized.startsWith(cleanP);
  });
}

export function safeReadFile(filePath: string): string | null {
  try {
    const resolved = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) return null;
    return fs.readFileSync(resolved, 'utf-8');
  } catch {
    return null;
  }
}

export function safeWriteFile(filePath: string, content: string): void {
  if (isProtectedPath(filePath)) {
    throw new Error(`[SECURITY] Thao tác bị từ chối: Đường dẫn được bảo vệ: ${filePath}`);
  }
  const resolved = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolved, content, 'utf-8');
}

export function safeDeleteFile(filePath: string): void {
  if (isProtectedPath(filePath)) {
    throw new Error(`[SECURITY] Thao tác bị từ chối: Không thể xóa đường dẫn bảo vệ: ${filePath}`);
  }
  const resolved = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(resolved)) {
    fs.unlinkSync(resolved);
  }
}

export function applyFileActions(actions: FileAction[]): string[] {
  const modifiedFiles: string[] = [];

  for (const action of actions) {
    if (isProtectedPath(action.path)) {
      console.warn(`⚠️ [CẢNH BÁO] Bỏ qua file nằm trong danh sách bảo vệ: ${action.path}`);
      continue;
    }

    if (action.action === 'create' || action.action === 'update') {
      safeWriteFile(action.path, action.content);
      modifiedFiles.push(action.path);
    } else if (action.action === 'delete') {
      safeDeleteFile(action.path);
      modifiedFiles.push(action.path);
    }
  }

  return modifiedFiles;
}
