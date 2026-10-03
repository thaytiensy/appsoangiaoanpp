import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI PowerPoint Lesson Planner Pro (2026)',
  description: 'Soạn giáo án chuẩn GDPT và xuất slide PowerPoint tương tác chuẩn sư phạm',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
