import type { Metadata } from 'next';
import { buildMetadata } from '@/utils/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Create Installer Profile | Get Discovered by Shops | WrapCareers',
  description:
    'Build your automotive restyling installer profile to showcase specialties, experience, and contact details for employers.',
  path: '/installers/register',
});

export default function InstallerRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
