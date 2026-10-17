import Link from 'next/link';
import type { ReactElement } from 'react';

export default function NotFound(): ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">404 - Không tìm thấy trang</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Trang bạn yêu cầu không tồn tại hoặc đã được di chuyển.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
