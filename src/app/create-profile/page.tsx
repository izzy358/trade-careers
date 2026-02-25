import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { buildMetadata } from '@/utils/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Create Installer Profile Redirect | WrapCareers',
  description: 'Redirecting to installer profile registration on WrapCareers.',
  path: '/create-profile',
});

export default function CreateProfileRedirectPage() {
  redirect('/installers/register');
}
