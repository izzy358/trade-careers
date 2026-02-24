import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of use for WrapCareers.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-4xl font-bold">Terms</h1>
      <p className="text-text-secondary">
        By using WrapCareers, you agree to provide accurate listings and profile information.
      </p>
      <p className="text-text-secondary">
        WrapCareers may remove listings or profiles that are fraudulent, abusive, or violate applicable law.
      </p>
    </div>
  );
}
