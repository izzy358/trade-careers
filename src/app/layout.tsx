import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/AppLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SITE_NAME, SITE_URL, buildMetadata } from '@/utils/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({
    title: 'Trade Careers — Jobs & Installers for Automotive Restyling',
    description:
      'Automotive restyling hiring platform for PPF, vinyl wrap, window tint, ceramic coating, paint correction, and detailing jobs.',
    path: '/',
  }),
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
