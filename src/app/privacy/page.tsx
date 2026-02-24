import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy policy for WrapCareers.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-4xl font-bold">Privacy</h1>
      <p className="text-text-secondary">
        WrapCareers stores contact and listing details needed to operate the platform and process applications.
      </p>
      <p className="text-text-secondary">
        We do not sell personal information. Data may be shared with employers and applicants as part of hiring workflows.
      </p>
    </div>
  );
}
