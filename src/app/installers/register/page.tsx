import { redirect } from 'next/navigation';
import { getSessionContext } from '@/utils/auth';
import { InstallerRegistrationForm } from '@/components/InstallerRegistrationForm';

export default async function InstallerRegistrationPage() {
  const session = await getSessionContext();

  if (!session) {
    redirect('/login?redirect=/installers/register');
  }

  if (session.accountType !== 'installer') {
    redirect('/dashboard');
  }

  return <InstallerRegistrationForm />;
}
