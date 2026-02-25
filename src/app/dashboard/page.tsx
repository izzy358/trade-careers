import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionContext } from '@/utils/auth';

export default async function DashboardRouterPage() {
  const session = await getSessionContext();

  if (!session) {
    redirect('/login?redirect=/dashboard');
  }

  if (session.accountType === 'installer') {
    redirect('/dashboard/installer');
  }

  if (session.accountType === 'employer') {
    redirect('/dashboard/employer');
  }

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6">
      <h1 className="mb-2 text-2xl font-bold">Finish account setup</h1>
      <p className="mb-4 text-text-secondary">Your account is missing a profile type.</p>
      <div className="flex gap-3">
        <Link href="/signup" className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-orange-700">
          Choose Account Type
        </Link>
      </div>
    </div>
  );
}
