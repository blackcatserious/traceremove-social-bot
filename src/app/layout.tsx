import React from 'react';
import ChatWidget from '@/components/ChatWidget';
import AdminNavigation from '@/components/AdminNavigation';
import './globals.css';

export const metadata = {
  title: 'TraceRemove Management Center',
  description: 'AI-powered domain management and social media automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <AdminNavigation />
        <main className="relative">
          {children}
        </main>
        <ChatWidget />
      </body>
    </html>
  );
}
