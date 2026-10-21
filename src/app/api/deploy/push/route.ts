import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface DeployResponse {
  readonly success: boolean;
  readonly message: string;
  readonly commitHash?: string;
  readonly remoteUrl?: string;
}

export async function POST(): Promise<NextResponse<DeployResponse>> {
  try {
    // 1. Kiểm tra trạng thái Git
    const { stdout: statusOut } = await execAsync('git status --porcelain');
    
    // Nếu có file chưa commit, tự động commit an toàn
    if (statusOut.trim().length > 0) {
      await execAsync('git add .');
      await execAsync('git commit -m "feat: auto sync to github and vercel"');
    }

    // 2. Lấy hash commit hiện tại
    const { stdout: hashOut } = await execAsync('git rev-parse --short HEAD');
    const commitHash = hashOut.trim();

    // 3. Push lên GitHub (origin master)
    const { stdout: pushOut, stderr: pushErr } = await execAsync('git push origin master');
    const logOutput = pushOut || pushErr || 'Đã đồng bộ thành công lên GitHub.';

    return NextResponse.json({
      success: true,
      message: `Đồng bộ GitHub thành công! Vercel đang tự động triển khai mã nguồn mới (${commitHash}). Chi tiết: ${logOutput.slice(0, 150)}`,
      commitHash,
      remoteUrl: 'https://github.com/thaytiensy/appsoangiaoanpp',
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        message: `Lỗi khi đồng bộ GitHub: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}
