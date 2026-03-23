import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MartorQA — NL to Test Automation',
  description: 'Convert natural language to Playwright test code instantly',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}