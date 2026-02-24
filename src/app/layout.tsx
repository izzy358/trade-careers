import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/AppLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://frolicking-pastelito-510617.netlify.app'),
  title: {
    default: 'WrapCareers | Automotive Trades Job Board',
    template: '%s | WrapCareers',
  },
  description:
    'Find jobs and installer profiles in vinyl wrap, window tint, PPF, ceramic coating, paint correction, and detailing.',
  openGraph: {
    title: 'WrapCareers | Automotive Trades Job Board',
    description:
      'Find jobs and installer profiles in vinyl wrap, window tint, PPF, ceramic coating, paint correction, and detailing.',
    url: 'https://frolicking-pastelito-510617.netlify.app',
    siteName: 'WrapCareers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WrapCareers | Automotive Trades Job Board',
    description:
      'Find jobs and installer profiles in vinyl wrap, window tint, PPF, ceramic coating, paint correction, and detailing.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
