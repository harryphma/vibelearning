'use client';

import PublicHeader from '../../components/PublicHeader';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      {children}
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} CogniFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 