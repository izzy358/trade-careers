import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'WrapCareers connects automotive trade installers and employers in one specialized hiring marketplace.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-4xl font-bold">About WrapCareers</h1>
      <p className="text-text-secondary">
        WrapCareers is a focused job board for automotive finishing trades including vinyl wrap,
        window tint, paint protection film, detailing, and coatings.
      </p>
      <p className="text-text-secondary">
        We help employers reach qualified installers and help installers showcase their specialty work.
      </p>
    </div>
  );
}
