import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/AppLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SITE_NAME, buildMetadata } from '@/utils/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://frolicking-pastelito-510617.netlify.app'),
  ...buildMetadata({
    title: 'Trade Careers — Jobs & Installers for Automotive Restyling',
    description:
      'Automotive restyling hiring platform for PPF, vinyl wrap, window tint, ceramic coating, paint correction, and detailing jobs.',
    path: '/',
  }),
  openGraph: {
    title: 'Trade Careers',
    description:
      'Automotive restyling hiring platform for PPF, vinyl wrap, window tint, ceramic coating, paint correction, and detailing jobs.',
    url: 'https://frolicking-pastelito-510617.netlify.app',
    siteName: 'Trade Careers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  applicationName: SITE_NAME,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
