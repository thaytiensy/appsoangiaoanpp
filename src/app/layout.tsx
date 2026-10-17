import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hệ thống AI Soạn Giáo Án & Slide PowerPoint Chuẩn Bộ GD',
  description: 'Nền tảng tự động hóa soạn giáo án và trình chiếu bài giảng theo chuẩn GDPT',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
