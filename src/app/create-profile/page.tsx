import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Create Profile',
  description: 'Redirecting to installer profile registration.',
};

export default function CreateProfileRedirectPage() {
  redirect('/installers/register');
}
