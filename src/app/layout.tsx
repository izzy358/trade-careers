
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/AppLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WrapCareers - Automotive Finishing Trades Job Board',
  description: 'Find your next job in vinyl wrap, window tint, PPF, ceramic coating, paint correction, and auto detailing.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
