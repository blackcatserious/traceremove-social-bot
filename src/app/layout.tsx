import React from 'react';
import ChatWidget from '@/components/ChatWidget';
import './globals.css';

export const metadata = {
  title: 'TraceRemove Social Bot',
  description: 'AI-powered social media bot with domain-specific personas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
