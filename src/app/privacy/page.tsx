import { buildMetadata } from '@/utils/seo';

export const metadata = buildMetadata({
  title: 'Privacy Policy | Trade Careers Automotive Restyling Careers',
  description:
    'Learn what data Trade Careers collects, how it is used, cookie practices, retention, CCPA rights, and how to contact us.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-surface p-8 md:p-10">
      <h1 className="mb-2 text-4xl font-bold">Privacy Policy</h1>
      <p className="mb-8 text-text-secondary">
        Effective date: February 25, 2026. This policy explains how Trade Careers collects, uses, and
        protects your information.
      </p>

      <div className="space-y-6 text-text-secondary">
        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">1. Data We Collect</h2>
          <p>
            We collect personal and profile information you provide, including name, email, phone,
            location, and job or installer profile details (such as specialties, experience, and bio).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">2. How We Use Data</h2>
          <p>
            We use your information to operate the platform, display job listings and profiles,
            process applications, improve service quality, communicate with users, and protect against
            abuse and fraud.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">3. Cookies and Similar Technologies</h2>
          <p>
            We use cookies and similar technologies for session handling, security, analytics, and
            user experience improvements. You can manage cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">4. Third-Party Services</h2>
          <p>
            We use third-party providers to run the platform, including Supabase for database and
            storage services. We may integrate Stripe in the future for paid features.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">5. Data Retention</h2>
          <p>
            We retain information as long as needed to provide services, comply with legal
            obligations, resolve disputes, and enforce agreements. You may request deletion where
            legally permitted.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">6. Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your data, subject to legal and
            operational limitations. You may also request that we limit certain data uses.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">7. California Privacy Rights (CCPA)</h2>
          <p>
            California residents may request disclosure of categories of personal information
            collected, request deletion of eligible data, and request correction of inaccurate
            personal information. Trade Careers does not sell personal information.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold text-white">8. Contact</h2>
          <p>
            For privacy questions or requests, contact
            {' '}
            <a className="text-primary hover:underline" href="mailto:support@tradecareers.com">
              support@tradecareers.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
