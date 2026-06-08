import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <span className="text-base font-bold text-gray-900">UrbanFlow</span>
        <Link
          href="/"
          className="text-sm font-medium text-gray-900 border border-gray-400 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </nav>
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
