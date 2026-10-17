import Link from 'next/link';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">404 - Không tìm thấy trang</h2>
        <p className="text-slate-600 mb-6 text-sm">
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
